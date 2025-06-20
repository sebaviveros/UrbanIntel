using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace UrbanIntelDATA.Dto
{
    public class CambiarPasswordDto
    {
        [JsonPropertyName("email")]
        public string Email { get; set; }

        [JsonPropertyName("passwordActual")]
        public string PasswordActual { get; set; }

        [JsonPropertyName("nuevaPassword")]
        public string NuevaPassword { get; set; }

    }
}
