using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UrbanIntelDATA.Dto
{
    public class CambiarPasswordDto
    {
        public string Email { get; set; }
        public string PasswordActual { get; set; }
        public string NuevaPassword { get; set; }

    }
}
