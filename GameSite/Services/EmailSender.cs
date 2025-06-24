using System.Net;
using System.Net.Mail;
using System.Text;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Options;
using GameSite.Models;

namespace GameSite.Services
{
    public class EmailSender : IEmailSender, IEmailService
    {
        private readonly EmailSettings _settings;

        public EmailSender(IOptions<EmailSettings> options)
        {
            _settings = options.Value;
        }

        public Task SendEmailAsync(string email, string subject, string message)
        {
            var client = new SmtpClient(_settings.SmtpServer, _settings.SmtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(_settings.FromEmail, _settings.Password),
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false
            };

            var mailMessage = new MailMessage(_settings.FromEmail, email, subject, message)
            {
                IsBodyHtml = true,
                BodyEncoding = Encoding.UTF8
            };

            return client.SendMailAsync(mailMessage);
        }
    }
}
