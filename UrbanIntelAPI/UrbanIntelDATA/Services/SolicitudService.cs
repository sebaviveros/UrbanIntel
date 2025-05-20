using Microsoft.Data.SqlClient;
using System.Data;
using UrbanIntelDATA.Models;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;


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

        // Método para crear una solicitud con imágenes
        public async Task CrearSolicitudCiudadanaAsync(SolicitudCiudadana solicitud, List<IFormFile> imagenes)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            // Iniciar transacción
            using var transaction = (SqlTransaction)await connection.BeginTransactionAsync();

            try
            {
                int solicitudId;

                // Guardar la solicitud en la base de datos y obtener el ID generado
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

                    // Ejecutar el comando y obtener el ID de la solicitud creada
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
    }
}