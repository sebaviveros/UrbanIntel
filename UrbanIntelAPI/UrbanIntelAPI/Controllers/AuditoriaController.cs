using Microsoft.AspNetCore.Mvc;
using UrbanIntelDATA.Dto;
using UrbanIntelDATA.Services;
using UrbanIntelDATA.Models;

namespace UrbanIntelAPI.Controllers
{
    [ApiController] // Indica que es un controlador de API,le dice a ASP.NET Core que valide automáticamente el modelo y maneje respuestas como 400 BadRequest si algo está mal.
    [Route("api/[controller]")] // Ruta base: api/usuario (Define la URL base del controlador como api/usuario (por el nombre de la clase).)
    public class AuditoriaController : ControllerBase //ControllerBase es una clase base de ASP.NET Core para manejar codigos de estado como 404 not found, 200 ok , etc
    {
        private readonly AuditoriaService _auditoriaService;

        public AuditoriaController(AuditoriaService auditoriaService)
        {
            _auditoriaService = auditoriaService;
        }

        [HttpGet("accion-auditoria")]
        public async Task<IActionResult> ObtenerAccionAuditoria()
        {
            var data = await _auditoriaService.ObtenerAccionAuditoriaAsync();
            return Ok(data);
        }

        [HttpGet("modulo-auditoria")]
        public async Task<IActionResult> ObtenerModuloAuditoria()
        {
            var data = await _auditoriaService.ObtenerModuloAuditoriaAsync();
            return Ok(data);
        }

        [HttpPost("buscar")]
        public async Task<IActionResult> BuscarAuditorias([FromBody] AuditoriaFiltroDto filtro)
        {
            var resultados = await _auditoriaService.BuscarAuditoriasAsync(filtro);
            return Ok(resultados);
        }
    }
}     