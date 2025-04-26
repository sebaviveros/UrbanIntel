using MySql.Data.MySqlClient;
using UrbanIntelAPI.Models;

namespace UrbanIntelAPI.Services
{
    public class UsuarioService
    {
        private readonly string _connectionString;

        public UsuarioService(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DefaultConnection");
        }

        public UsuarioTest ObtenerUsuarioPorRut(string rut)
        {
            using var conn = new MySqlConnection(_connectionString);
            conn.Open();

            var cmd = new MySqlCommand("CALL ObtenerUsuario(@rut)", conn);
            cmd.Parameters.AddWithValue("@rut", rut);

            using var reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                return new UsuarioTest
                {
                    Rut = reader.GetString(0),
                    Nombre = reader.GetString(1),
                    Correo = reader.GetString(2),
                    Rol = reader.GetString(3)
                };
            }
            return null;
        }
    }
}
