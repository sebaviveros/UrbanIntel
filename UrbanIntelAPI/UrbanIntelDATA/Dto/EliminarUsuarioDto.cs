using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UrbanIntelDATA.Dto
{
    public class EliminarUsuarioDto
    {
        public string Rut { get; set; } // Usuario a eliminar
        public string RutUsuarioLogeado { get; set; } // Quien hace la acción
    }

}
