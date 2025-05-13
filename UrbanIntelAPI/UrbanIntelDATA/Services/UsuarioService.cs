using MySql.Data.MySqlClient;
using System.Data;
using UrbanIntelDATA.Models;
using UrbanIntelDATA.Dto;

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
        // obetener usuarios por rut o todos 
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
        // crear usuario
        public async Task<string> CrearUsuarioAsync(UsuarioPwDto usuario)
        {
            try
            {
                using var connection = _context.CreateConnection();
                await connection.OpenAsync();

                using var command = new MySqlCommand("sp_crearUsuario", connection);
                command.CommandType = CommandType.StoredProcedure;

                // parametros del SP
                command.Parameters.AddWithValue("@p_rut", usuario.Rut);
                command.Parameters.AddWithValue("@p_nombre", usuario.Nombre);
                command.Parameters.AddWithValue("@p_apellido", usuario.Apellido);
                command.Parameters.AddWithValue("@p_email", usuario.Email);
                command.Parameters.AddWithValue("@p_telefono", usuario.Telefono);
                command.Parameters.AddWithValue("@p_direccion", usuario.Direccion);
                command.Parameters.AddWithValue("@p_rol", usuario.Rol);
                command.Parameters.AddWithValue("@p_password", usuario.Password);

                await command.ExecuteNonQueryAsync();
                return "Usuario creado exitosamente";
            }
            catch (MySqlException ex) when (ex.Number == 1644) // error de existencia (SQLSTATE '45000')
            {
                // usuario ya existe
                return "El usuario con el RUT proporcionado ya existe.";
            }
            catch (MySqlException ex)
            {
                // otro error de MySQL
                return $"Error en la base de datos: {ex.Message}";
            }
            catch (Exception ex)
            {
                // error generico del servidor
                return $"Error del servidor: {ex.Message}";
            }
        }
        // eliminar usuario
        public async Task<string> EliminarUsuarioAsync(string rut)
        {
            try
            {
                using var connection = _context.CreateConnection();
                await connection.OpenAsync();

                using var command = new MySqlCommand("sp_eliminarUsuario", connection);
                command.CommandType = CommandType.StoredProcedure;

                
                command.Parameters.AddWithValue("@p_rut", rut);

                await command.ExecuteNonQueryAsync();
                return "Usuario eliminado exitosamente";
            }
            catch (MySqlException ex) when (ex.Number == 1644) // error lanzado por el SP cuando el usuario no existe
            {
                // usuario no existe
                return "El usuario con el RUT proporcionado no existe.";
            }
            catch (MySqlException ex)
            {
                // otro error de MySQL
                return $"Error en la base de datos: {ex.Message}";
            }
            catch (Exception ex)
            {
                // error genérico del servidor
                return $"Error del servidor: {ex.Message}";
            }
        }

        // modificar usuario
        public async Task<string> ModificarUsuarioAsync(Usuario usuario)
        {
            try
            {
                using var connection = _context.CreateConnection();
                await connection.OpenAsync();

                using var command = new MySqlCommand("sp_modificarUsuario", connection);
                command.CommandType = CommandType.StoredProcedure;

                command.Parameters.AddWithValue("@p_rut", usuario.Rut);
                command.Parameters.AddWithValue("@p_nombre", usuario.Nombre);
                command.Parameters.AddWithValue("@p_apellido", usuario.Apellido);
                command.Parameters.AddWithValue("@p_email", usuario.Email);
                command.Parameters.AddWithValue("@p_telefono", usuario.Telefono);
                command.Parameters.AddWithValue("@p_direccion", usuario.Direccion);
                command.Parameters.AddWithValue("@p_rol", usuario.Rol);

                await command.ExecuteNonQueryAsync();
                return "Usuario modificado exitosamente";
            }
            catch (MySqlException ex) when (ex.Number == 1644) // error lanzado por el SP cuando el usuario no existe
            {
                // usuario no existe
                return "El usuario con el RUT proporcionado no existe.";
            }
            catch (MySqlException ex)
            {
                // otro error de MySQL
                return $"Error en la base de datos: {ex.Message}";
            }
            catch (Exception ex)
            {
                // error genérico del servidor
                return $"Error del servidor: {ex.Message}";
            }
        }

    }
}
