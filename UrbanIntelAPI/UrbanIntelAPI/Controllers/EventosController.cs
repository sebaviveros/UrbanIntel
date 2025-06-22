using Microsoft.AspNetCore.Mvc;
using UrbanIntelDATA.Services;
using UrbanIntelDATA.Models;


namespace UrbanIntelAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventosController : ControllerBase
    {
        private readonly EventoService _eventoService;

        public EventosController(EventoService eventoService)
        {
            _eventoService = eventoService;
        }

        [HttpGet("listar")]
        public async Task<IActionResult> ObtenerEventos([FromQuery] string rutUsuario)
        {
            try
            {
                var eventos = await _eventoService.ObtenerEventosAsync(rutUsuario);
                return Ok(eventos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al obtener eventos: {ex.Message}" });
            }
        }

        [HttpPost("crear")]
        public async Task<IActionResult> CrearEvento([FromBody] Evento evento)
        {
            try
            {
                await _eventoService.CrearEventoAsync(evento);
                return Ok(new { message = "Evento creado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al crear evento: {ex.Message}" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarEvento(int id)
        {
            try
            {
                await _eventoService.EliminarEventoAsync(id);
                return Ok(new { message = "Evento eliminado correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al eliminar evento: {ex.Message}" });
            }
        }
    }
}
