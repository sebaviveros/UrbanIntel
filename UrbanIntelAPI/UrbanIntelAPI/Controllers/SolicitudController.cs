using Microsoft.AspNetCore.Mvc;
using UrbanIntelAPI.Services;
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

        // Método para recibir la solicitud con imágenes
        [HttpPost("crear")]
        public async Task<IActionResult> CrearSolicitud([FromForm] SolicitudCiudadana solicitud, [FromForm] List<IFormFile> imagenes)
        {
            try
            {
                // Validación de archivos
                if (imagenes == null || imagenes.Count == 0)
                    return BadRequest("No se adjuntaron imágenes.");

                // Guardar la solicitud y las imágenes
                await _solicitudService.CrearSolicitudAsync(solicitud, imagenes);

                return Ok(new { message = "Solicitud creada exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al crear la solicitud: {ex.Message}" });
            }
        }

        // Método para obtener todas las solicitudes
        [HttpGet]
        public async Task<IActionResult> ObtenerSolicitudes()
        {
            var solicitudes = await _solicitudService.ObtenerSolicitudesAsync();
            return Ok(solicitudes);
        }
    }
}

