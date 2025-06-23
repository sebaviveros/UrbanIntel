using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UrbanIntelDATA.Dto
{
    public class AuditoriaFiltroDto
    {
        public int? Id { get; set; }
        public string? RutUsuario { get; set; }
        public int? AccionId { get; set; }
        public int? ModuloId { get; set; }
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
    }
}
