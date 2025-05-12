using MySql.Data.MySqlClient;
using System.Data;
using UrbanIntelDATA.Models;

namespace UrbanIntelDATA.Services
{
    public class UsuarioService
    {
        private readonly UrbanIntelDBContext _context;

        // inyectamos el contexto que centraliza la configuración y conexión a la base de datos
        public UsuarioService(UrbanIntelDBContext context)
        {
            _context = context;
        }

        public async Task<List<Usuario>> ObtenerUsuariosAsync(string? rut = null)
        {
            var usuarios = new List<Usuario>();

            // solicitamos una conexión a la base de datos desde UrbanIntelDBContext
            // esto permite centralizar el acceso y evitar que cada clase construya su propia conexión
            using var connection = _context.CreateConnection();

            // abrimos la conexión de forma asíncrona (sin bloquear el hilo actual)
            await connection.OpenAsync();

            // creamos el comando que ejecutará el procedimiento almacenado
            using var command = new MySqlCommand("sp_obtenerUsuarios", connection);
            command.CommandType = CommandType.StoredProcedure;

            // agregamos el parámetro al SP (si no viene un RUT, se pasa un string vacío)
            command.Parameters.AddWithValue("@p_rut", rut ?? "");

            // ejecutamos el SP y leemos los resultados con un DataReader
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {

                usuarios.Add(new Usuario
                {
                    Id = reader.GetInt32("Id"),
                    Rut = reader.GetString("Rut"),
                    Nombre = reader.GetString("Nombre"),
                    Apellido = reader.GetString("Apellido"),
                    Email = reader.GetString("Email"),
                    Telefono = reader.GetString("Telefono"),
                    Direccion = reader.GetString("Direccion"),
                    Rol = reader.GetString("Rol")
                });
            }


            return usuarios;
        }
    }
}
