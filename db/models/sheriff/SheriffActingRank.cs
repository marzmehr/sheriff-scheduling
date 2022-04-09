using Mapster;
using SS.Api.Models.DB;

namespace SS.Db.models.sheriff
{
    [AdaptTo("[name]Dto")]
    public class SheriffActingRank : SheriffEvent
    {
        public string Rank { get; set; }
    }
}