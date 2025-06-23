using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UrbanIntelDATA.Models
{
    public class Evento
    {
        public int? Id_evento { get; set; }
        public string Nombre_evento { get; set; }
        public string? Descripcion { get; set; }
        public DateTime Hora_inicio { get; set; }
        public DateTime? Hora_termino { get; set; }
        public Boolean Notificacion { get; set; }
        public string Rut_usuario { get; set; }
    }
}
