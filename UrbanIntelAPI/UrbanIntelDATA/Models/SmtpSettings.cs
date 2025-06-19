namespace UrbanIntelDATA.Models
{
    public class SmtpSettings
    {
        public string Remitente { get; set; } = string.Empty;
        public string Clave { get; set; } = string.Empty;
        public string Host { get; set; } = string.Empty;
        public int Puerto { get; set; }
    }
}
