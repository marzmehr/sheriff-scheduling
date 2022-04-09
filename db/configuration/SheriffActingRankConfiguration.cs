using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SS.DB.Configuration;
using SS.Db.models.sheriff;

namespace SS.Db.configuration
{
    public class SheriffActingRankConfiguration : BaseEntityConfiguration<SheriffActingRank>
    {
        public override void Configure(EntityTypeBuilder<SheriffActingRank> builder)
        {
            builder.HasIndex(b => new { b.StartDate, b.EndDate });

            base.Configure(builder);
        }
    }
}
