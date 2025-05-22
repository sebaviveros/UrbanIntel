using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UrbanIntelDATA.Dto
{
    public class SolicitudFiltroDto
    {
        public int? Id { get; set; }
        public string? RutUsuario { get; set; }
        public string? RutCiudadano { get; set; }
        public DateTime? FechaCreacion { get; set; }
        public DateTime? FechaAprobacion { get; set; }
        public DateTime? FechaAsignacion { get; set; }
        public int? TipoReparacionId { get; set; }
        public int? PrioridadId { get; set; }
        public int? EstadoId { get; set; }
        public string? Comuna { get; set; }
    }
}
