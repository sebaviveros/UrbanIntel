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
        private readonly SmtpService _smtpService;


        public SolicitudService(UrbanIntelDBContext context, AzureBlobService blobService, SmtpService smtpService)
        {
            _context = context;
            _blobService = blobService;
            _smtpService = smtpService;
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

        public async Task ModificarSolicitudAsync(int id, Solicitud solicitud)
        {
            try
            {
                using var connection = _context.CreateConnection();
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_modificarSolicitud", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                command.Parameters.AddWithValue("@p_id", id);
                command.Parameters.AddWithValue("@p_direccion", solicitud.Direccion ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@p_descripcion", solicitud.Descripcion ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@p_comuna", solicitud.Comuna ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@p_tipo_reparacion_id", solicitud.TipoReparacionId ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@p_prioridad_id", solicitud.PrioridadId ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@p_estado_id", solicitud.EstadoId ?? (object)DBNull.Value);

                await command.ExecuteNonQueryAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en ModificarSolicitudAsync: {ex.Message}");
                throw;
            }
        }


        public async Task ModificarCiudadanoAsync(int id, Solicitud solicitud)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var command = new SqlCommand("sp_modificarCiudadanoSolicitud", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@p_id", id);
            command.Parameters.AddWithValue("@p_rut_ciudadano", solicitud.RutCiudadano ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@p_nombre_ciudadano", solicitud.NombreCiudadano ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@p_apellido_ciudadano", solicitud.ApellidoCiudadano ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@p_telefono_ciudadano", solicitud.TelefonoCiudadano ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@p_email_ciudadano", solicitud.EmailCiudadano ?? (object)DBNull.Value);

            await command.ExecuteNonQueryAsync();
        }

        public async Task EliminarSolicitudAsync(int id)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            // Obtener imágenes ligadas
            var imagenes = await ObtenerImagenesPorSolicitudIdAsync(id);
            foreach (var url in imagenes)
            {
                await _blobService.DeleteImageAsync(url); // Elimina de Azure
            }

            // Eliminar imágenes de BD y solicitud
            using var command = new SqlCommand("sp_eliminarSolicitud", connection)
            {
                CommandType = CommandType.StoredProcedure
            };
            command.Parameters.AddWithValue("@p_id", id);
            await command.ExecuteNonQueryAsync();
        }

        public async Task<List<GenericItem>> ObtenerTiposReparacionAsync()
        {
            var lista = new List<GenericItem>();
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var command = new SqlCommand("sp_obtenerTiposReparacion", connection);
            command.CommandType = CommandType.StoredProcedure;

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                lista.Add(new GenericItem
                {
                    Id = reader.GetInt32(0),
                    Nombre = reader.GetString(1)
                });
            }

            return lista;
        }

        public async Task<List<GenericItem>> ObtenerPrioridadesAsync()
        {
            var lista = new List<GenericItem>();
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var command = new SqlCommand("sp_obtenerPrioridades", connection);
            command.CommandType = CommandType.StoredProcedure;

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                lista.Add(new GenericItem
                {
                    Id = reader.GetInt32(0),
                    Nombre = reader.GetString(1)
                });
            }

            return lista;
        }

        public async Task<List<GenericItem>> ObtenerEstadosAsync()
        {
            var lista = new List<GenericItem>();
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var command = new SqlCommand("sp_obtenerEstados", connection);
            command.CommandType = CommandType.StoredProcedure;

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                lista.Add(new GenericItem
                {
                    Id = reader.GetInt32(0),
                    Nombre = reader.GetString(1)
                });
            }

            return lista;
        }
        public async Task<int> CrearSolicitudInternaAsync(Solicitud solicitud, List<IFormFile> imagenes)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var transaction = (SqlTransaction)await connection.BeginTransactionAsync();
            try
            {
                int nuevaId;

                using (var command = new SqlCommand("sp_crearSolicitud", connection, transaction))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.AddWithValue("@p_rut_usuario", solicitud.RutUsuario ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@p_direccion", solicitud.Direccion ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@p_descripcion", solicitud.Descripcion ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@p_comuna", solicitud.Comuna ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@p_tipo_reparacion_id", solicitud.TipoReparacionId ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@p_prioridad_id", solicitud.PrioridadId ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@p_estado_id", solicitud.EstadoId ?? (object)DBNull.Value);

                    var outputId = new SqlParameter("@p_nueva_id", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    command.Parameters.Add(outputId);

                    await command.ExecuteNonQueryAsync();
                    nuevaId = (int)outputId.Value;
                }

                foreach (var imagen in imagenes)
                {
                    var url = await _blobService.UploadImageAsync(imagen);

                    using var imgCommand = new SqlCommand("sp_crearImagenSolicitud", connection, transaction)
                    {
                        CommandType = CommandType.StoredProcedure
                    };
                    imgCommand.Parameters.AddWithValue("@p_solicitudId", nuevaId);
                    imgCommand.Parameters.AddWithValue("@p_url", url);
                    await imgCommand.ExecuteNonQueryAsync();
                }

                await transaction.CommitAsync();
                return nuevaId;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task AprobarSolicitudAsync(int solicitudId, AprobarSolicitudDto dto)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var transaction = (SqlTransaction)await connection.BeginTransactionAsync();
            try
            {
                // Obtener correo ciudadano
                string correoCiudadano;
                using (var cmdCorreo = new SqlCommand("sp_filtrarSolicitudes", connection, transaction))
                {
                    cmdCorreo.CommandType = CommandType.StoredProcedure;
                    cmdCorreo.Parameters.AddWithValue("@p_id", solicitudId);

                    using var reader = await cmdCorreo.ExecuteReaderAsync();
                    if (!await reader.ReadAsync())
                        throw new Exception("No se encontró el correo del ciudadano.");

                    correoCiudadano = reader.GetString(reader.GetOrdinal("email_ciudadano"));
                }

                // Actualizar solicitud
                using var cmd = new SqlCommand("sp_aprobarSolicitud", connection, transaction)
                {
                    CommandType = CommandType.StoredProcedure
                };

                cmd.Parameters.AddWithValue("@p_id", solicitudId);
                cmd.Parameters.AddWithValue("@p_rut_usuario", dto.RutUsuario);
                cmd.Parameters.AddWithValue("@p_tipo_reparacion_id", dto.TipoReparacionId);
                cmd.Parameters.AddWithValue("@p_prioridad_id", dto.PrioridadId);
                cmd.Parameters.AddWithValue("@p_fecha_aprobacion", DateTime.Now);

                await cmd.ExecuteNonQueryAsync();

                // Enviar correo
                string asunto = "Solicitud Aprobada";
                string cuerpo = $@"
                    <p>Estimado/a ciudadano/a:</p>
                    <p>Su solicitud con ID: <strong>{solicitudId}</strong> ha sido aprobada y se encuentra ahora en estado <strong>En Proceso</strong>.</p>
                    <p>Puedes darle seguimiento con el Id de la solicitud o tu RUT en la web oficial de Urban Intel.</p>
                    <p>Nos pondremos en contacto en caso de requerir más información.</p>
                ";
                await _smtpService.EnviarCorreoAsync(correoCiudadano, asunto, cuerpo);

                // Insertar en auditoría
                var descripcion = $"El usuario: {dto.RutUsuario} aprobó la solicitud con ID: {solicitudId} correspondiente al ciudadano de correo: {correoCiudadano}";

                using var audCmd = new SqlCommand("sp_insertarAuditoria", connection, transaction)
                {
                    CommandType = CommandType.StoredProcedure
                };

                audCmd.Parameters.AddWithValue("@p_rut_usuario", dto.RutUsuario);
                audCmd.Parameters.AddWithValue("@p_accion_id", 4); // Aprobar
                audCmd.Parameters.AddWithValue("@p_modulo_id", 2); // Solicitudes
                audCmd.Parameters.AddWithValue("@p_descripcion", descripcion);

                await audCmd.ExecuteNonQueryAsync();

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task DenegarSolicitudAsync(int solicitudId, string rutUsuario, string motivoRechazo)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var transaction = (SqlTransaction)await connection.BeginTransactionAsync();
            try
            {
                // obtener correo del ciudadano
                string correoCiudadano;
                using (var cmdCorreo = new SqlCommand("sp_filtrarSolicitudes", connection, transaction))
                {
                    cmdCorreo.CommandType = CommandType.StoredProcedure;
                    cmdCorreo.Parameters.AddWithValue("@p_id", solicitudId);

                    using var reader = await cmdCorreo.ExecuteReaderAsync();
                    if (!await reader.ReadAsync())
                        throw new Exception("No se encontró el correo del ciudadano.");

                    correoCiudadano = reader.GetString(reader.GetOrdinal("email_ciudadano"));
                }

                // actualizar a estado rechazada
                using var cmd = new SqlCommand("sp_denegarSolicitud", connection, transaction)
                {
                    CommandType = CommandType.StoredProcedure
                };

                cmd.Parameters.AddWithValue("@p_id", solicitudId);
                cmd.Parameters.AddWithValue("@p_rut_usuario", rutUsuario);
                cmd.Parameters.AddWithValue("@p_fecha_aprobacion", DateTime.Now);

                await cmd.ExecuteNonQueryAsync();

                // enviar correo con motivo rechazo
                string asunto = "Solicitud Rechazada";
                string cuerpo = $@"
                    <p>Estimado/a ciudadano/a:</p>
                    <p>Lamentamos informarle que su solicitud con ID: <strong>{solicitudId}</strong> ha sido <strong>rechazada</strong>.</p>
                    <p><strong>Motivo:</strong> {motivoRechazo}</p>
                    <p>Si considera que esta decisión fue errónea, puede realizar una nueva solicitud o comunicarse con soporte.</p>
                ";
                await _smtpService.EnviarCorreoAsync(correoCiudadano, asunto, cuerpo);

                // insertar en auditoria            
                var descripcion = $"El usuario: {rutUsuario} denegó la solicitud con ID: {solicitudId}, correspondiente al ciudadano de RUT: {rutUsuario} y correo: {correoCiudadano}, por el siguiente motivo: {motivoRechazo}";


                using var audCmd = new SqlCommand("sp_insertarAuditoria", connection, transaction)
                {
                    CommandType = CommandType.StoredProcedure
                };

                audCmd.Parameters.AddWithValue("@p_rut_usuario", rutUsuario);
                audCmd.Parameters.AddWithValue("@p_accion_id", 5); // accion denegar
                audCmd.Parameters.AddWithValue("@p_modulo_id", 2); // modulo solicitudes
                audCmd.Parameters.AddWithValue("@p_descripcion", descripcion);

                await audCmd.ExecuteNonQueryAsync();

                
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }




    }
}