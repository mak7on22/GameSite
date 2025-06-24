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
        public Task SendEmailAsync(string email, string subject, string message)
        {
            var mail = "ms.tdlist@mail.ru";
            var pw = "DMcT6Nlf8c6JNppeF0Yd";

            var client = new SmtpClient("smtp.mail.ru", 587)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(mail, pw),
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false
            };
            var mailMessage = new MailMessage(from: mail, to: email, subject, message)
            {
                IsBodyHtml = true,
                BodyEncoding = Encoding.UTF8
            };

            return client.SendMailAsync(mailMessage);
        }
    }
}
