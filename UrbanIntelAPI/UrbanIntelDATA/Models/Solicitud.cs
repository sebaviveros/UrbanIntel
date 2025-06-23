using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UrbanIntelDATA.Models
{
    public class Solicitud
    {
        public int? Id { get; set; }
        public string? RutUsuario { get; set; }
        public string? Direccion { get; set; }
        public string? Comuna { get; set; }
        public string? Descripcion { get; set; }
        public DateTime? FechaCreacion { get; set; }
        public DateTime? FechaAprobacion { get; set; }
        public DateTime? FechaAsignacion { get; set; }
        public string? RutCiudadano { get; set; }
        public string? NombreCiudadano { get; set; }
        public string? ApellidoCiudadano { get; set; }
        public string? TelefonoCiudadano { get; set; }
        public string? EmailCiudadano { get; set; }
        public string? TipoReparacionNombre { get; set; }
        public int? TipoReparacionId { get; set; }
        public string? PrioridadNombre { get; set; }
        public int? PrioridadId { get; set; }
        public string? EstadoNombre { get; set; }
        public int? EstadoId { get; set; }
        
    }
}
