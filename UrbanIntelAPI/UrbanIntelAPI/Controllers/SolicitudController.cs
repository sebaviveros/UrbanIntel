using Microsoft.AspNetCore.Mvc;
using UrbanIntelDATA.Services;
using UrbanIntelDATA.Models;
using UrbanIntelDATA.Dto;

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

        [HttpGet("filtrar")]
        public async Task<IActionResult> ObtenerSolicitudPorFiltro(
            [FromQuery] int? id,
            [FromQuery] string? rutUsuario,
            [FromQuery] string? rutCiudadano,
            [FromQuery] DateTime? fechaCreacion,
            [FromQuery] DateTime? fechaAprobacion,
            [FromQuery] DateTime? fechaAsignacion,
            [FromQuery] int? tipoReparacionId,
            [FromQuery] int? prioridadId,
            [FromQuery] int? estadoId,
            [FromQuery] string? comuna
)
        {
            try
            {
                var filtros = new SolicitudFiltroDto
                {
                    Id = id,
                    RutUsuario = rutUsuario,
                    RutCiudadano = rutCiudadano,
                    FechaCreacion = fechaCreacion,
                    FechaAprobacion = fechaAprobacion,
                    FechaAsignacion = fechaAsignacion,
                    TipoReparacionId = tipoReparacionId,
                    PrioridadId = prioridadId,
                    EstadoId = estadoId,
                    Comuna = comuna
                };

                var resultado = await _solicitudService.ObtenerSolicitudesPorFiltroAsync(filtros);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al filtrar solicitudes: {ex.Message}" });
            }
        }

        [HttpGet("{solicitudId}/imagenes")]
        public async Task<IActionResult> ObtenerImagenesPorSolicitud(int solicitudId)
        {
            try
            {
                var imagenes = await _solicitudService.ObtenerImagenesPorSolicitudIdAsync(solicitudId);
                return Ok(imagenes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al obtener imágenes: {ex.Message}" });
            }
        }
    }
}
