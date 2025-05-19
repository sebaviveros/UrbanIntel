using MySql.Data.MySqlClient;
using System.Data;
using UrbanIntelDATA.Models;
using UrbanIntelDATA;

namespace UrbanIntelAPI.Services
{
    public class SolicitudService
    {
        private readonly UrbanIntelDBContext _context;

        public SolicitudService(UrbanIntelDBContext context)
        {
            _context = context;
        }

        // Método para crear una solicitud con imágenes
        public async Task CrearSolicitudAsync(SolicitudCiudadana solicitud, List<IFormFile> imagenes)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();
            using var transaction = await connection.BeginTransactionAsync();

            try
            {
                using var command = new MySqlCommand("sp_crearSolicitud", connection, transaction);
                command.CommandType = CommandType.StoredProcedure;

                command.Parameters.AddWithValue("@p_nombre", solicitud.NombreCiudadano);
                command.Parameters.AddWithValue("@p_apellido", solicitud.ApellidoCiudadano);
                command.Parameters.AddWithValue("@p_rut", solicitud.RutCiudadano);
                command.Parameters.AddWithValue("@p_direccion", solicitud.Direccion);
                command.Parameters.AddWithValue("@p_correo", solicitud.EmailCiudadano);
                command.Parameters.AddWithValue("@p_celular", solicitud.TelefonoCiudadano);
                command.Parameters.AddWithValue("@p_descripcion", solicitud.Descripcion);

                var solicitudId = Convert.ToInt32(await command.ExecuteScalarAsync());

                var directoryPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
                if (!Directory.Exists(directoryPath))
                {
                    Directory.CreateDirectory(directoryPath);
                }

                foreach (var imagen in imagenes)
                {
                    var fileName = $"{Guid.NewGuid()}_{imagen.FileName}";
                    var filePath = Path.Combine("uploads", fileName);

                    using var fileStream = new FileStream(filePath, FileMode.Create);
                    await imagen.CopyToAsync(fileStream);

                    using var imgCommand = new MySqlCommand("sp_crearImagenSolicitud", connection, transaction);
                    imgCommand.CommandType = CommandType.StoredProcedure;
                    imgCommand.Parameters.AddWithValue("@p_solicitudId", solicitudId);
                    imgCommand.Parameters.AddWithValue("@p_url", fileName);

                    await imgCommand.ExecuteNonQueryAsync();
                }

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // Método para obtener todas las solicitudes
        public async Task<List<SolicitudCiudadana>> ObtenerSolicitudesAsync()
        {
            var solicitudes = new List<SolicitudCiudadana>();

            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var command = new MySqlCommand("sp_obtenerSolicitudes", connection);
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
                    Descripcion = reader.GetString("Descripcion")
                });
            }

            return solicitudes;
        }
    }
}
