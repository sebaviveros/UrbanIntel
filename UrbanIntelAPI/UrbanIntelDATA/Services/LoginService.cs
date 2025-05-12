using MySql.Data.MySqlClient;
using System.Data;
using UrbanIntelDATA.Models;

namespace UrbanIntelDATA.Services
{
    public class LoginService
    {
        private readonly UrbanIntelDBContext _context;

        // se inyecta el contexto que administra la conexion a la base de datos
        public LoginService(UrbanIntelDBContext context)
        {
            _context = context;
        }

        public async Task<Usuario?> ValidarUsuarioAsync(string email, string password)
        {
            // se solicita una conexion a la base de datos desde el contexto centralizado
            using var connection = _context.CreateConnection();

            // se abre la conexion de forma asincrona para no bloquear el hilo
            await connection.OpenAsync();

            // se prepara el comando para ejecutar el procedimiento almacenado
            using var command = new MySqlCommand("sp_validarUsuario", connection);
            command.CommandType = CommandType.StoredProcedure;

            // se agregan los parametros necesarios al procedimiento
            command.Parameters.AddWithValue("@p_email", email);
            command.Parameters.AddWithValue("@p_password", password);

            //  se ejecuta el procedimiento y se lee el resultado
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                // si existe un usuario valido, se crea y retorna el objeto usuario
                return new Usuario
                {
                    Id = reader.GetInt32("Id"),
                    Rut = reader.GetString("Rut"),
                    Nombre = reader.GetString("Nombre"),
                    Apellido = reader.GetString("Apellido"),
                    Email = reader.GetString("Email"),
                    Telefono = reader.GetString("Telefono"),
                    Direccion = reader.GetString("Direccion"),
                    Rol = reader.GetString("Rol")
                };
            }

            // si no se encontro un usuario valido, se retorna null
            return null;
        }
    }
}
