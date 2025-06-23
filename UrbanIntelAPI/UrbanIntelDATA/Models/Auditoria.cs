using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UrbanIntelDATA.Models
{
    public class Auditoria
    {
        public int Id { get; set; }
        public string RutUsuario { get; set; }
        public string AccionNombre { get; set; }
        public string ModuloNombre { get; set; }
        public DateTime Fecha { get; set; }
        public string Descripcion { get; set; }
    }
}
