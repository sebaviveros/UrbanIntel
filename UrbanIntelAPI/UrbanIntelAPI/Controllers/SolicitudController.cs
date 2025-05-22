using Microsoft.AspNetCore.Mvc;
using UrbanIntelDATA.Services;
using UrbanIntelDATA.Models;

namespace UrbanIntelAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SolicitudController : ControllerBase
    {
        private readonly SolicitudService _solicitudService;

        public SolicitudController(SolicitudService solicitudService)
        {
            _solicitudService = solicitudService;
        }

        // Método para crear una solicitud ciudadana
        [HttpPost("crear")]
        public async Task<IActionResult> CrearSolicitud([FromForm] SolicitudCiudadana solicitud, [FromForm] List<IFormFile> imagenes)
        {
            try
            {
                await _solicitudService.CrearSolicitudCiudadanaAsync(solicitud, imagenes);
                return Ok(new { message = "Solicitud creada exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al crear la solicitud: {ex.Message}" });
            }
        }

        // Método para obtener todas las solicitudes
        [HttpGet("listar")]
        public async Task<IActionResult> ObtenerSolicitudes()
        {
            try
            {
                var solicitudes = await _solicitudService.ObtenerSolicitudesAsync();
                return Ok(solicitudes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al obtener solicitudes: {ex.Message}" });
            }
        }
    }
}
