using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UrbanIntelDATA.Models
{
    public class SolicitudCiudadana
    {
        public int Id { get; set; }
        public string Direccion { get; set; }
        public string Descripcion { get; set; }
        public string RutCiudadano { get; set; }
        public string NombreCiudadano { get; set; }
        public string ApellidoCiudadano { get; set; }
        public string TelefonoCiudadano { get; set; }
        public string EmailCiudadano { get; set; }

    }
}
