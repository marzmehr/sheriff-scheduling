﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SS.Api.helpers;
using SS.Api.helpers.extensions;
using SS.Common.helpers.extensions;
using SS.Db.models;
using SS.Db.models.scheduling;
using SS.Db.models.scheduling.notmapped;

namespace SS.Api.services.scheduling
{
    public class DistributeScheduleService
    {
        private SheriffDbContext Db { get; }
        private IConfiguration Configuration { get; }
        private ChesEmailService ChesEmailService { get; }

        public DistributeScheduleService(SheriffDbContext db, IConfiguration configuration, ChesEmailService chesEmailService)
        {
            Configuration = configuration;
            ChesEmailService = chesEmailService;
            Db = db;
        }

        public async Task<List<ShiftAvailability>> GetDistributeSchedule(List<ShiftAvailability> shiftAvailabilities, bool includeWorkSection, DateTimeOffset start, DateTimeOffset end, int locationId)
        {
            var shiftIds = shiftAvailabilities.SelectMany(s => s.Conflicts)
                .Where(c => c.Conflict == ShiftConflictType.Scheduled).SelectDistinctToList(s => s.ShiftId);

            var shifts = await Db.Shift.AsSingleQuery().AsNoTracking()
                .In(shiftIds, s => s.Id)
                .ToListAsync();

            var dutySlots = Db.DutySlot.AsSingleQuery()
                .AsNoTracking()
                .Include(ds => ds.Duty)
                .ThenInclude(d => d.Assignment)
                .ThenInclude(a => a.LookupCode)
                .Where(ds =>
                    ds.LocationId == locationId && ds.ExpiryDate == null && ds.StartDate < end && start < ds.EndDate);

            foreach (var shift in shifts)
                shift.DutySlots = dutySlots.Where(ds =>
                        ds.SheriffId == shift.SheriffId && ds.StartDate < shift.EndDate && shift.StartDate < ds.EndDate)
                    .ToList();

            foreach (var shiftAvailability in shiftAvailabilities)
                shiftAvailability.Conflicts = CombineShiftAvailability(shiftAvailability, shifts, includeWorkSection);

            return shiftAvailabilities;
        }

        private List<ShiftAvailabilityConflict> CombineShiftAvailability(ShiftAvailability shiftAvailability, List<Shift> shifts, bool includeWorkSection)
        {
            var shiftsGroupedByDate =
                shiftAvailability.Conflicts.Where(c => c.Conflict == ShiftConflictType.Scheduled)
                    .GroupBy(s => new
                    {
                        s.Start.ConvertToTimezone(s.Timezone)
                            .Date
                    });

            var newAvailabilityConflict = shiftAvailability.Conflicts.WhereToList(c => c.Conflict != ShiftConflictType.Scheduled);
            foreach (var group in shiftsGroupedByDate)
            {
                var earliestShiftForDate = group.First(s => s.Start == group.Min(s => s.Start));
                earliestShiftForDate.End = group.Max(s => s.End);
                newAvailabilityConflict.Add(earliestShiftForDate);
            }

            if (includeWorkSection)
                newAvailabilityConflict = DetermineWorkSections(newAvailabilityConflict, shifts);

            return newAvailabilityConflict;
        }

        private List<ShiftAvailabilityConflict> DetermineWorkSections(List<ShiftAvailabilityConflict> availabilityConflicts, List<Shift> shifts)
        {
            foreach (var availabilityConflict in availabilityConflicts)
            {
                availabilityConflict.WorkSection =
                    shifts.FirstOrDefault(s => s.Id == availabilityConflict.ShiftId)?.WorkSection;
                availabilityConflict.DutySlots =
                    shifts.FirstOrDefault(s => s.Id == availabilityConflict.ShiftId)?.DutySlots;
            }

            return availabilityConflicts;
        }

        public async Task<Byte[]> PrintService(String html)
        {
            HttpClient HttpClient = new HttpClient();
            var requestMessage = new HttpRequestMessage(HttpMethod.Post, Configuration.GetNonEmptyValue("PdfUrl") + "/pdf?bootstrap=true");
            requestMessage.Content = new StringContent(html, Encoding.UTF8);
            var pdfResponse = await HttpClient.SendAsync(requestMessage);
            var content = await pdfResponse.Content.ReadAsByteArrayAsync();
            return content;
        }

        public async Task EmailService(String senderEmail, String recipientEmails, String emailSubject, String emailContent, byte[] pdfContent)
        {
            await ChesEmailService.SendEmailWithPdfAttachment(emailContent, emailSubject, senderEmail, recipientEmails, pdfContent);
        }
    }
}