using Microsoft.AspNetCore.Mvc;
using UrbanIntelDATA.Services;
using UrbanIntelDATA.Models;
using UrbanIntelDATA.Dto;
using Microsoft.AspNetCore.Authorization;

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

        // Metodo para crear solicitud interna
        [HttpPost("crear-interna")]
        public async Task<IActionResult> CrearSolicitudInterna([FromForm] Solicitud solicitud, [FromForm] List<IFormFile> imagenes)
        {
            try
            {
                var nuevaId = await _solicitudService.CrearSolicitudInternaAsync(solicitud, imagenes);
                return Ok(new { message = "Solicitud creada exitosamente", id = nuevaId });
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

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarSolicitud(int id, [FromBody] Solicitud solicitud)
        {
            try
            {
                await _solicitudService.ModificarSolicitudAsync(id, solicitud);
                return Ok(new { message = "Solicitud actualizada correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al actualizar la solicitud: {ex.Message}" });
            }
        }

        [HttpPut("{id}/ciudadano")]
        public async Task<IActionResult> ActualizarCiudadanoSolicitud(int id, [FromBody] Solicitud solicitud)
        {
            try
            {
                await _solicitudService.ModificarCiudadanoAsync(id, solicitud);
                return Ok(new { message = "Datos del ciudadano actualizados" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al actualizar datos del ciudadano: {ex.Message}" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarSolicitud(int id)
        {
            try
            {
                await _solicitudService.EliminarSolicitudAsync(id);
                return Ok(new { message = "Solicitud eliminada correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al eliminar la solicitud: {ex.Message}" });
            }
        }

        [HttpGet("tipos-reparacion")]
        public async Task<IActionResult> ObtenerTiposReparacion()
        {
            var data = await _solicitudService.ObtenerTiposReparacionAsync();
            return Ok(data);
        }

        [HttpGet("prioridades")]
        public async Task<IActionResult> ObtenerPrioridades()
        {
            var data = await _solicitudService.ObtenerPrioridadesAsync();
            return Ok(data);
        }

        [HttpGet("estados")]
        public async Task<IActionResult> ObtenerEstados()
        {
            var data = await _solicitudService.ObtenerEstadosAsync();
            return Ok(data);
        }

        [HttpPost("{solicitudId}/aprobar")]
        public async Task<IActionResult> AprobarSolicitud(int solicitudId, [FromBody] AprobarSolicitudDto dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.RutUsuario) || dto.TipoReparacionId == 0 || dto.PrioridadId == 0)
                    return BadRequest("Faltan datos para aprobar la solicitud.");

                await _solicitudService.AprobarSolicitudAsync(solicitudId, dto);
                return Ok(new { message = "Solicitud aprobada exitosamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al aprobar solicitud: {ex.Message}" });
            }
        }

        [HttpPost("{solicitudId}/denegar")]
        public async Task<IActionResult> DenegarSolicitud(int solicitudId, [FromBody] DenegarSolicitudDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto?.RutUsuario) || string.IsNullOrWhiteSpace(dto.Motivo))
                    return BadRequest("Faltan datos para denegar la solicitud.");

                await _solicitudService.DenegarSolicitudAsync(solicitudId, dto.RutUsuario, dto.Motivo);
                return Ok(new { message = "Solicitud denegada exitosamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al denegar solicitud: {ex.Message}" });
            }
        }

    }
}
