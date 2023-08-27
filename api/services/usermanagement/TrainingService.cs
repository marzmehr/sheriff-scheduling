using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SS.Api.helpers.extensions;
using SS.Api.infrastructure.exceptions;
using SS.Db.models;
using SS.Db.models.sheriff;

namespace SS.Api.services.usermanagement
{

    public class TrainingService
    {
        private SheriffDbContext Db { get; }

        public TrainingService(SheriffDbContext db)
        {
            Db = db;
        }


        public async Task<List<SheriffTraining>> GetTrainings()
        {                                    
            var sheriffTrainingQuery = Db.SheriffTraining.AsNoTracking()
                .AsSplitQuery()
                .Where(t => t.ExpiryDate == null)
                .Where(t => t.FirstNotice != true)
                .Where(t => t.TrainingType.AdvanceNotice > 0)                
                .Include(t => t.TrainingType)
                .Include(t => t.Sheriff);      

            return await sheriffTrainingQuery.ToListAsync();
        }

        public async Task UpdateTraining(int trainingId)
        {
            var training = await Db.SheriffTraining.FindAsync(trainingId);
            training.ThrowBusinessExceptionIfNull(
                $"{nameof(SheriffTraining)} with the id: {trainingId} could not be found. ");

            if (training.ExpiryDate.HasValue)
                throw new BusinessLayerException($"{nameof(SheriffTraining)} with the id: {trainingId} has been expired");
            
            training.FirstNotice = true;
            await Db.SaveChangesAsync();            
        }        
    }
}