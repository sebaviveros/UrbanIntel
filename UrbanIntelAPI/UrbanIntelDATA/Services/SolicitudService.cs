using Microsoft.Data.SqlClient;
using System.Data;
using UrbanIntelDATA.Models;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using UrbanIntelDATA.Dto;


namespace UrbanIntelDATA.Services
{
    public class SolicitudService
    {
        private readonly UrbanIntelDBContext _context;
        private readonly AzureBlobService _blobService;

        public SolicitudService(UrbanIntelDBContext context, AzureBlobService blobService)
        {
            _context = context;
            _blobService = blobService;
        }

        // crear una solicitud con imagenes
        public async Task CrearSolicitudCiudadanaAsync(SolicitudCiudadana solicitud, List<IFormFile> imagenes)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            // iniciar transaccion
            using var transaction = (SqlTransaction)await connection.BeginTransactionAsync();

            try
            {
                int solicitudId;

                
                using (var command = new SqlCommand("sp_crearSolicitudCiudadana", connection, transaction))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.AddWithValue("@p_nombre", solicitud.NombreCiudadano);
                    command.Parameters.AddWithValue("@p_apellido", solicitud.ApellidoCiudadano);
                    command.Parameters.AddWithValue("@p_rut", solicitud.RutCiudadano);
                    command.Parameters.AddWithValue("@p_direccion", solicitud.Direccion);
                    command.Parameters.AddWithValue("@p_correo", solicitud.EmailCiudadano);
                    command.Parameters.AddWithValue("@p_celular", solicitud.TelefonoCiudadano);
                    command.Parameters.AddWithValue("@p_descripcion", solicitud.Descripcion);
                    command.Parameters.AddWithValue("@p_comuna", solicitud.Comuna);

                    // ejecutar el comando y obtener el ID de la solicitud creada (en la base de datos es un SET @solicitudId = SCOPE_IDENTITY();)
                    solicitudId = Convert.ToInt32(await command.ExecuteScalarAsync());
                }

                // Subir cada imagen a Azure Blob Storage y guardar la URL
                foreach (var imagen in imagenes)
                {
                    try
                    {
                        var imageUrl = await _blobService.UploadImageAsync(imagen);

                        // Guardar la URL de la imagen en la base de datos
                        using var imgCommand = new SqlCommand("sp_crearImagenSolicitud", connection, transaction);
                        imgCommand.CommandType = CommandType.StoredProcedure;
                        imgCommand.Parameters.AddWithValue("@p_solicitudId", solicitudId);
                        imgCommand.Parameters.AddWithValue("@p_url", imageUrl);

                        await imgCommand.ExecuteNonQueryAsync();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al subir la imagen {imagen.FileName}: {ex.Message}");
                        throw;
                    }
                }

                // Confirmar la transacción
                await transaction.CommitAsync();
                Console.WriteLine($"Solicitud creada correctamente con ID: {solicitudId}");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"Error al crear la solicitud: {ex.Message}");
                throw;
            }
        }

        // Método para obtener todas las solicitudes
        public async Task<List<SolicitudCiudadana>> ObtenerSolicitudesAsync()
        {
            var solicitudes = new List<SolicitudCiudadana>();

            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var command = new SqlCommand("sp_obtenerSolicitudes", connection);
            command.CommandType = CommandType.StoredProcedure;

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                solicitudes.Add(new SolicitudCiudadana
                {
                    Id = reader.GetInt32("Id"),
                    NombreCiudadano = reader.GetString("Nombre"),
                    ApellidoCiudadano = reader.GetString("Apellido"),
                    RutCiudadano = reader.GetString("Rut"),
                    Direccion = reader.GetString("Direccion"),
                    EmailCiudadano = reader.GetString("Correo"),
                    TelefonoCiudadano = reader.GetString("Celular"),
                    Descripcion = reader.GetString("Descripcion"),
                    Comuna = reader.GetString("Comuna")
                });
            }

            return solicitudes;
        }

        public async Task<List<Solicitud>> ObtenerSolicitudesPorFiltroAsync(SolicitudFiltroDto solicitudFiltroDto)
        {
            var solicitudes = new List<Solicitud>();

            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var command = new SqlCommand("sp_filtrarSolicitudes", connection);
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.AddWithValue("@p_id", (object?)solicitudFiltroDto.Id ?? DBNull.Value);
            command.Parameters.AddWithValue("@p_rut_usuario", (object?)solicitudFiltroDto.RutUsuario ?? DBNull.Value);
            command.Parameters.AddWithValue("@p_rut_ciudadano", (object?)solicitudFiltroDto.RutCiudadano ?? DBNull.Value);
            command.Parameters.AddWithValue("@p_fecha_creacion", (object?)solicitudFiltroDto.FechaCreacion ?? DBNull.Value);
            command.Parameters.AddWithValue("@p_fecha_aprobacion", (object?)solicitudFiltroDto.FechaAprobacion ?? DBNull.Value);
            command.Parameters.AddWithValue("@p_fecha_asignacion", (object?)solicitudFiltroDto.FechaAsignacion ?? DBNull.Value);
            command.Parameters.AddWithValue("@p_tipo_reparacion_id", (object?)solicitudFiltroDto.TipoReparacionId ?? DBNull.Value);
            command.Parameters.AddWithValue("@p_tipo_prioridad_id", (object?)solicitudFiltroDto.PrioridadId ?? DBNull.Value);
            command.Parameters.AddWithValue("@p_estado_id", (object?)solicitudFiltroDto.EstadoId ?? DBNull.Value);
            command.Parameters.AddWithValue("@p_comuna", (object?)solicitudFiltroDto.Comuna ?? DBNull.Value);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                solicitudes.Add(new Solicitud
                {
                    Id = reader.GetInt32(reader.GetOrdinal("id")),
                    RutUsuario = reader.IsDBNull(reader.GetOrdinal("rut_usuario")) ? null : reader.GetString(reader.GetOrdinal("rut_usuario")),
                    Direccion = reader.GetString(reader.GetOrdinal("direccion")),
                    Comuna = reader.GetString(reader.GetOrdinal("comuna")),
                    Descripcion = reader.GetString(reader.GetOrdinal("descripcion")),
                    FechaCreacion = reader.GetDateTime(reader.GetOrdinal("fecha_creacion")),
                    FechaAprobacion = reader.IsDBNull(reader.GetOrdinal("fecha_aprobacion")) ? null : reader.GetDateTime(reader.GetOrdinal("fecha_aprobacion")),
                    FechaAsignacion = reader.IsDBNull(reader.GetOrdinal("fecha_asignacion")) ? null : reader.GetDateTime(reader.GetOrdinal("fecha_asignacion")),

                    RutCiudadano = reader.IsDBNull(reader.GetOrdinal("rut_ciudadano")) ? null : reader.GetString(reader.GetOrdinal("rut_ciudadano")),
                    NombreCiudadano = reader.IsDBNull(reader.GetOrdinal("nombre_ciudadano")) ? null : reader.GetString(reader.GetOrdinal("nombre_ciudadano")),
                    ApellidoCiudadano = reader.IsDBNull(reader.GetOrdinal("apellido_ciudadano")) ? null : reader.GetString(reader.GetOrdinal("apellido_ciudadano")),
                    TelefonoCiudadano = reader.IsDBNull(reader.GetOrdinal("telefono_ciudadano")) ? null : reader.GetString(reader.GetOrdinal("telefono_ciudadano")),
                    EmailCiudadano = reader.IsDBNull(reader.GetOrdinal("email_ciudadano")) ? null : reader.GetString(reader.GetOrdinal("email_ciudadano")),

                    TipoReparacionId = reader.IsDBNull(reader.GetOrdinal("tipo_reparacion_id")) ? null : reader.GetInt32(reader.GetOrdinal("tipo_reparacion_id")),
                    TipoReparacionNombre = reader.IsDBNull(reader.GetOrdinal("tipo_reparacion_nombre")) ? null : reader.GetString(reader.GetOrdinal("tipo_reparacion_nombre")),

                    PrioridadId = reader.IsDBNull(reader.GetOrdinal("prioridad_id")) ? null : reader.GetInt32(reader.GetOrdinal("prioridad_id")),
                    PrioridadNombre = reader.IsDBNull(reader.GetOrdinal("prioridad_nombre")) ? null : reader.GetString(reader.GetOrdinal("prioridad_nombre")),

                    EstadoId = reader.IsDBNull(reader.GetOrdinal("estado_id")) ? null : reader.GetInt32(reader.GetOrdinal("estado_id")),
                    EstadoNombre = reader.IsDBNull(reader.GetOrdinal("estado")) ? null : reader.GetString(reader.GetOrdinal("estado"))
                });
            }

            return solicitudes;
        }

        public async Task<List<string>> ObtenerImagenesPorSolicitudIdAsync(int solicitudId)
        {
            var imagenes = new List<string>();

            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var command = new SqlCommand("sp_obtenerImagenesSolicitud", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@p_solicitud_id", solicitudId);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                imagenes.Add(reader.GetString(0));
            }

            return imagenes;
        }


    }
}