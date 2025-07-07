using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UrbanIntelDATA.Models;

namespace UrbanIntelDATA.Dto
{
    public class ModificarUsuarioDto
    {
        public string RutUsuarioLogeado { get; set; }
        public Usuario UsuarioModificado { get; set; }
    }
}
