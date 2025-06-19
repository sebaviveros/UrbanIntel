using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;
using UrbanIntelDATA.Models;

namespace UrbanIntelDATA.Services
{
    public class SmtpService
    {
        private readonly SmtpSettings _smtp;

        public SmtpService(IOptions<SmtpSettings> smtpSettings)
        {
            _smtp = smtpSettings.Value;
        }

        public async Task EnviarCorreoAsync(string destino, string asunto, string mensajePlano)
        {
            var remitente = _smtp.Remitente;
            var clave = _smtp.Clave;

            var mail = new MailMessage();
            mail.From = new MailAddress(remitente, "Urban Intel");
            mail.To.Add(destino);
            mail.Subject = asunto;
            mail.IsBodyHtml = true;

            var rutaImagen = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "assets", "urbanintelbanner.png");

            string htmlBody = $@"
                <p>{mensajePlano}</p>
                <br/>
                <p>Saludos.</p>
                <p>Urban Intel</p>
                <img src='cid:LogoUrbanIntel' width='300'/>
            ";

            var alternateView = AlternateView.CreateAlternateViewFromString(htmlBody, null, "text/html");

            var logo = new LinkedResource(rutaImagen, "image/png")
            {
                ContentId = "LogoUrbanIntel",
                TransferEncoding = System.Net.Mime.TransferEncoding.Base64,
                ContentType = new System.Net.Mime.ContentType("image/png")
            };

            alternateView.LinkedResources.Add(logo);
            mail.AlternateViews.Add(alternateView);

            using var smtp = new SmtpClient(_smtp.Host, _smtp.Puerto)
            {
                Credentials = new NetworkCredential(remitente, clave),
                EnableSsl = true
            };

            await smtp.SendMailAsync(mail);
        }
    }
}
