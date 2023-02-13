using System;
using System.Collections.Generic;
using SS.Api.models.dto.generated;
using SS.Db.models.scheduling.notmapped;

namespace SS.Api.models.dto.generated
{
    public partial class ShiftAvailabilityConflictDto
    {
        public Guid? SheriffId { get; set; }
        public ShiftConflictType Conflict { get; set; }
        public DateTimeOffset Start { get; set; }
        public DateTimeOffset End { get; set; }
        public int? LocationId { get; set; }
        public LocationDto Location { get; set; }
        public int? ShiftId { get; set; }
        public string WorkSection { get; set; }
        public string Timezone { get; set; }
        public double OvertimeHours { get; set; }
        public string SheriffEventType { get; set; }
        public string Comment { get; set; }
        public ICollection<DutySlotDto> DutySlots { get; set; }
    }
}