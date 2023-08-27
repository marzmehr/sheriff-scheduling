

using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Quartz;
using SS.Api.services;
using SS.Api.services.usermanagement;
using SS.Db.models.sheriff;

namespace SS.Api.cronjobs
{
    [DisallowConcurrentExecution]    
    public class TrainingNotification: IJob
    {
        private readonly ILogger<TrainingNotification> Logger;
        public IServiceProvider Services { get; }

        public TrainingNotification(ILogger<TrainingNotification> logger, IServiceProvider services, ManageTypesService manageTypesService)
        {
            Logger = logger;
            Services = services;
        }

        public async void ProcessTrainings()
        {
            using var scope = Services.CreateScope();            
            var TrainingService = scope.ServiceProvider.GetRequiredService<TrainingService>();
            var ChesEmailService = scope.ServiceProvider.GetRequiredService<ChesEmailService>();
            
            var trainings = await TrainingService.GetTrainings();
            foreach(var training in  trainings)
            {
                var noticeDate = DateTimeOffset.UtcNow.AddDays(training.TrainingType.AdvanceNotice);
                
                Logger.LogInformation(training.TrainingCertificationExpiry.ToString());
                Logger.LogInformation((training.TrainingCertificationExpiry < noticeDate).ToString());
                Logger.LogInformation(training.Sheriff.Email);
                
                if(training.TrainingCertificationExpiry < noticeDate){
                    var emailBody = GetEmailBody(training);
                    var emailSent = await ChesEmailService.SendEmail(
                        emailBody,
                        "Training Expiry Notice", 
                        training.Sheriff.Email
                    );
                    if(emailSent)
                        await TrainingService.UpdateTraining(training.Id);
                }
            }            
            Logger.LogInformation("CronJob Done");            
        }

        public string GetEmailBody(SheriffTraining training)
        {
            var expiryDate = training.TrainingCertificationExpiry.Value.ToString("MMMM dd, yyyy");
            var emailBody = 
                $"Dear {training.Sheriff.FirstName} {training.Sheriff.LastName}, \n"+
                $"Your \'{training.TrainingType.Code}\' certification will expire on \'{expiryDate}\'. \n"+
                "Please ensure your certification is renewed before this date.";
            
            return emailBody;
        }

        public Task Execute(IJobExecutionContext context)
        {   
            Logger.LogInformation("___Running CronJob___");
            ProcessTrainings();
            return Task.CompletedTask;
        }
    }
}