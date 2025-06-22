using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UrbanIntelDATA.Dto
{
    public class AprobarSolicitudDto
    {
        public int TipoReparacionId { get; set; }
        public int PrioridadId { get; set; }
        public string RutUsuario { get; set; } = string.Empty;
    }
}
