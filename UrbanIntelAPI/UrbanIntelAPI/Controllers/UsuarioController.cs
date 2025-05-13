using Microsoft.AspNetCore.Mvc;
using UrbanIntelDATA.Dto;
using UrbanIntelDATA.Services;
using UrbanIntelDATA.Models;

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

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] UsuarioPwDto usuario)
        {
            try
            {
                var resultado = await _usuarioService.CrearUsuarioAsync(usuario);

                if (resultado == "Usuario creado exitosamente")
                {
                    return Ok(new { success = true, message = resultado });
                }
                else if (resultado.Contains("El usuario con el RUT proporcionado ya existe"))
                {
                    return BadRequest(new { success = false, message = resultado });
                }
                else if (resultado.Contains("Error en la base de datos"))
                {
                    return StatusCode(500, new { success = false, message = resultado });
                }
                else
                {
                    return StatusCode(500, new { success = false, message = "Error desconocido en el servidor" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error del servidor: {ex.Message}" });
            }
        }

        [HttpDelete("{rut}")]
        public async Task<IActionResult> EliminarUsuario(string rut)
        {
            try
            {
                var resultado = await _usuarioService.EliminarUsuarioAsync(rut);

                if (resultado.Contains("exitosamente"))
                    return Ok(new { success = true, message = resultado });

                return BadRequest(new { success = false, message = resultado });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error del servidor: {ex.Message}" });
            }
        }

        [HttpPut("{rut}")]
        public async Task<IActionResult> ModificarUsuario(string rut, [FromBody] Usuario usuario)
        {
            try
            {
                usuario.Rut = rut; // Asegurar que el RUT del body coincida con el de la ruta
                var resultado = await _usuarioService.ModificarUsuarioAsync(usuario);

                if (resultado.Contains("exitosamente"))
                    return Ok(new { success = true, message = resultado });

                return BadRequest(new { success = false, message = resultado });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error del servidor: {ex.Message}" });
            }
        }


    }
}
