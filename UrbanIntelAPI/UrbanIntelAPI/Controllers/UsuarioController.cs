using Microsoft.AspNetCore.Mvc;
using UrbanIntelDATA.Services;

namespace UrbanIntelAPI.Controllers
{
    [ApiController] // Indica que es un controlador de API,le dice a ASP.NET Core que valide automáticamente el modelo y maneje respuestas como 400 BadRequest si algo está mal.
    [Route("api/[controller]")] // Ruta base: api/usuario (Define la URL base del controlador como api/usuario (por el nombre de la clase).)
    public class UsuarioController : ControllerBase //ControllerBase es una clase base de ASP.NET Core para manejar codigos de estado como 404 not found, 200 ok , etc
    {
        private readonly UsuarioService _usuarioService;

        public UsuarioController(UsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] string? rut)
        {
            var usuarios = await _usuarioService.ObtenerUsuariosAsync(rut);
            return Ok(usuarios);
        }
    }
}
