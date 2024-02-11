

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

                    bool rotatingTraining = TrainingService.IsRotatingTraining(training.TrainingType);
                    var emailBody = rotatingTraining? GetEmailRotatingBody(training) : GetEmailEndOfYearBody(training);
                    var emailTitle = rotatingTraining? "Training Expiry Notice" : "Training Requalification Notice"; 

                    var emailSent = await ChesEmailService.SendEmail(
                        emailBody,
                        emailTitle, 
                        training.Sheriff.Email
                    );
                    if(emailSent)
                        await TrainingService.UpdateTraining(training.Id);
                }
            }            
            Logger.LogInformation("CronJob Done");            
        }

        public string GetEmailRotatingBody(SheriffTraining training)
        {
            var expiryDate = training.TrainingCertificationExpiry.Value.ToString("MMMM dd, yyyy");
            var emailBody = 
                $"Dear {training.Sheriff.FirstName} {training.Sheriff.LastName}, \n\n"+
                $"Your \'{training.TrainingType.Code}\' certification will expire on \'{expiryDate}\'. \n"+
                "Please ensure your certification is renewed before this date.";
            
            return emailBody;
        }

        public string GetEmailEndOfYearBody(SheriffTraining training)
        {            
            var expiryYear = training.TrainingCertificationExpiry.Value.AddDays(-1).AddYears(1).ToString("yyyy");
            var emailBody = 
                $"Dear {training.Sheriff.FirstName} {training.Sheriff.LastName}, \n\n"+
                $"Your \'{training.TrainingType.Code}\' certification will require renewal for the calendar year \'{expiryYear}\'. \n"+
                $"Please ensure you renew your certification between January 1st and December 31, {expiryYear}. \n\n" +
                "It is recommended to schedule training early in the year to ensure end of year compliance.";
            
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