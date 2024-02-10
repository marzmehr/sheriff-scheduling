using System;


namespace SS.Api.models.dto
{
    public class TrainingReportSearchDto
    {
        public int? regionId { get; set; }
        public int? locationId { get; set; }
        public int? reportSubtypeId { get; set; }
        public DateTimeOffset? startDate { get; set; }
        public DateTimeOffset? endDate { get; set; }        
    }
}