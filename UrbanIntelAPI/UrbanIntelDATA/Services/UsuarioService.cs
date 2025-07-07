using Microsoft.Data.SqlClient;
using System.Data;
using UrbanIntelDATA.Models;
using UrbanIntelDATA.Dto;
using System.Net.Mail;
using System.Net;

namespace UrbanIntelDATA.Services
{
    public class UsuarioService
    {
        private readonly UrbanIntelDBContext _context;
        private readonly SmtpService _smtpService;

        // inyectamos el contexto que centraliza la configuración y conexión a la base de datos
        public UsuarioService(UrbanIntelDBContext context, SmtpService smtpService)
        {
            _context = context;
            _smtpService = smtpService;
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
            using var command = new SqlCommand("sp_obtenerUsuarios", connection);
            command.CommandType = CommandType.StoredProcedure;

            // agregamos el parámetro al SP (si no viene un RUT, se pasa un string vacío)
            command.Parameters.AddWithValue("@p_rut", rut ?? "");

            try
            {
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

                if (usuarios.Count == 0 && rut != null) // Si no hay usuarios y se buscó por RUT
                    throw new Exception("Usuario no encontrado.");
            }
            catch (SqlException ex) when (ex.Number == 50006) // Usuario no encontrado
            {
                throw new Exception("Usuario no encontrado.");
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al obtener usuarios: {ex.Message}");
            }

            return usuarios;
        }
        // crear usuario
        public async Task<string> CrearUsuarioAsync(UsuarioPwDto usuario)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var transaction = (SqlTransaction)await connection.BeginTransactionAsync();

            try
            {
                // 1. Crear usuario
                using (var command = new SqlCommand("sp_crearUsuario", connection, transaction))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.AddWithValue("@p_rut", usuario.Rut);
                    command.Parameters.AddWithValue("@p_nombre", usuario.Nombre);
                    command.Parameters.AddWithValue("@p_apellido", usuario.Apellido);
                    command.Parameters.AddWithValue("@p_email", usuario.Email);
                    command.Parameters.AddWithValue("@p_telefono", usuario.Telefono);
                    command.Parameters.AddWithValue("@p_direccion", usuario.Direccion);
                    command.Parameters.AddWithValue("@p_rol", usuario.Rol);
                    command.Parameters.AddWithValue("@p_password", usuario.Password);

                    await command.ExecuteNonQueryAsync();
                }

                // 2. Registrar en auditoría
                string descripcion = $"El usuario: {usuario.RutUsuarioCreador} creó una nueva cuenta para el usuario RUT: {usuario.Rut}, correo: {usuario.Email}";
                using (var audCmd = new SqlCommand("sp_insertarAuditoria", connection, transaction))
                {
                    audCmd.CommandType = CommandType.StoredProcedure;

                    audCmd.Parameters.AddWithValue("@p_rut_usuario", usuario.RutUsuarioCreador); 
                    audCmd.Parameters.AddWithValue("@p_accion_id", 1); // accion 1 crear
                    audCmd.Parameters.AddWithValue("@p_modulo_id", 1); // modulo 1 usuarios
                    audCmd.Parameters.AddWithValue("@p_descripcion", descripcion);

                    await audCmd.ExecuteNonQueryAsync();
                }

                // 3. Enviar correo al nuevo usuario
                string asunto = "Cuenta creada - Urban Intel";
                string cuerpo = $@"
                    <p>Estimado/a {usuario.Nombre} {usuario.Apellido},</p>
                    <p>Su cuenta ha sido creada exitosamente en el sistema Urban Intel.</p>
                    <p><strong>Correo:</strong> {usuario.Email}</p>
                    <p><strong>Contraseña:</strong> {usuario.Password}</p>
                    <p>Por seguridad, le recomendamos cambiar su contraseña una vez acceda al Login de Urban Intel.</p>
                ";

                await _smtpService.EnviarCorreoAsync(usuario.Email, asunto, cuerpo);

                // 4. Confirmar todo
                await transaction.CommitAsync();
                return "Usuario creado exitosamente";
            }
            catch (SqlException ex) when (ex.Number == 50002)
            {
                await transaction.RollbackAsync();
                return "El usuario con el RUT proporcionado ya existe.";
            }
            catch (SqlException ex) when (ex.Number == 50003)
            {
                await transaction.RollbackAsync();
                return "Error al crear el usuario en la base de datos.";
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return $"Error del servidor: {ex.Message}";
            }
        }
        // eliminar usuario
        public async Task<string> EliminarUsuarioAsync(string rut, string rutUsuarioLogeado)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var transaction = (SqlTransaction)await connection.BeginTransactionAsync();

            try
            {
                using var command = new SqlCommand("sp_eliminarUsuario", connection, transaction)
                {
                    CommandType = CommandType.StoredProcedure
                };

                command.Parameters.AddWithValue("@p_rut", rut);
                await command.ExecuteNonQueryAsync();

                // Insertar en auditoría solo si eliminación fue exitosa
                string descripcion = $"El usuario con RUT {rutUsuarioLogeado} eliminó la cuenta con RUT {rut}.";

                using var audCmd = new SqlCommand("sp_insertarAuditoria", connection, transaction)
                {
                    CommandType = CommandType.StoredProcedure
                };

                audCmd.Parameters.AddWithValue("@p_rut_usuario", rutUsuarioLogeado);
                audCmd.Parameters.AddWithValue("@p_accion_id", 3); //  3 = Eliminar
                audCmd.Parameters.AddWithValue("@p_modulo_id", 1); //  1 = Gestión de cuentas
                audCmd.Parameters.AddWithValue("@p_descripcion", descripcion);

                await audCmd.ExecuteNonQueryAsync();

                await transaction.CommitAsync();
                return "Usuario eliminado exitosamente";
            }
            catch (SqlException ex) when (ex.Number == 50004)
            {
                await transaction.RollbackAsync();
                return "El usuario con el RUT proporcionado no existe.";
            }
            catch (SqlException ex) when (ex.Number == 50005)
            {
                await transaction.RollbackAsync();
                return "Error al eliminar el usuario en la base de datos.";
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return $"Error del servidor: {ex.Message}";
            }
        }

        // modificar usuario
        public async Task<string> ModificarUsuarioAsync(ModificarUsuarioDto dto)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var transaction = (SqlTransaction)await connection.BeginTransactionAsync();
            try
            {
                // 1. Obtener datos anteriores
                Usuario usuarioAnterior;
                using (var cmd = new SqlCommand("sp_obtenerUsuarios", connection, transaction))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@p_rut", dto.UsuarioModificado.Rut);

                    using var reader = await cmd.ExecuteReaderAsync();
                    if (!await reader.ReadAsync())
                        return "El usuario con el RUT proporcionado no existe.";

                    usuarioAnterior = new Usuario
                    {
                        Rut = reader.GetString(reader.GetOrdinal("Rut")),
                        Nombre = reader.GetString(reader.GetOrdinal("Nombre")),
                        Apellido = reader.GetString(reader.GetOrdinal("Apellido")),
                        Email = reader.GetString(reader.GetOrdinal("Email")),
                        Telefono = reader.GetString(reader.GetOrdinal("Telefono")),
                        Direccion = reader.GetString(reader.GetOrdinal("Direccion")),
                        Rol = reader.GetString(reader.GetOrdinal("Rol"))
                    };
                }

                // 2. Ejecutar modificación
                using (var updateCmd = new SqlCommand("sp_modificarUsuario", connection, transaction))
                {
                    updateCmd.CommandType = CommandType.StoredProcedure;
                    updateCmd.Parameters.AddWithValue("@p_rut", dto.UsuarioModificado.Rut);
                    updateCmd.Parameters.AddWithValue("@p_nombre", dto.UsuarioModificado.Nombre);
                    updateCmd.Parameters.AddWithValue("@p_apellido", dto.UsuarioModificado.Apellido);
                    updateCmd.Parameters.AddWithValue("@p_email", dto.UsuarioModificado.Email);
                    updateCmd.Parameters.AddWithValue("@p_telefono", dto.UsuarioModificado.Telefono);
                    updateCmd.Parameters.AddWithValue("@p_direccion", dto.UsuarioModificado.Direccion);
                    updateCmd.Parameters.AddWithValue("@p_rol", dto.UsuarioModificado.Rol);

                    await updateCmd.ExecuteNonQueryAsync();
                }

                // 3. Construir descripción de cambios
                var cambios = new List<string>();
                if (usuarioAnterior.Nombre != dto.UsuarioModificado.Nombre)
                    cambios.Add($"Nombre: '{usuarioAnterior.Nombre}' a '{dto.UsuarioModificado.Nombre}'");
                if (usuarioAnterior.Apellido != dto.UsuarioModificado.Apellido)
                    cambios.Add($"Apellido: '{usuarioAnterior.Apellido}' a '{dto.UsuarioModificado.Apellido}'");
                if (usuarioAnterior.Email != dto.UsuarioModificado.Email)
                    cambios.Add($"Email: '{usuarioAnterior.Email}' a '{dto.UsuarioModificado.Email}'");
                if (usuarioAnterior.Telefono != dto.UsuarioModificado.Telefono)
                    cambios.Add($"Teléfono: '{usuarioAnterior.Telefono}' a '{dto.UsuarioModificado.Telefono}'");
                if (usuarioAnterior.Direccion != dto.UsuarioModificado.Direccion)
                    cambios.Add($"Dirección: '{usuarioAnterior.Direccion}' a '{dto.UsuarioModificado.Direccion}'");
                if (usuarioAnterior.Rol != dto.UsuarioModificado.Rol)
                    cambios.Add($"Rol: '{usuarioAnterior.Rol}' a '{dto.UsuarioModificado.Rol}'");

                var descripcion = $"El usuario {dto.RutUsuarioLogeado} modificó al usuario {dto.UsuarioModificado.Rut}. Cambios: " +
                                  string.Join("; ", cambios);

                // 4. Insertar auditoría
                using var audCmd = new SqlCommand("sp_insertarAuditoria", connection, transaction)
                {
                    CommandType = CommandType.StoredProcedure
                };
                audCmd.Parameters.AddWithValue("@p_rut_usuario", dto.RutUsuarioLogeado);
                audCmd.Parameters.AddWithValue("@p_accion_id", 2); // ID de acción Modificar
                audCmd.Parameters.AddWithValue("@p_modulo_id", 1); // ID del módulo Usuario
                audCmd.Parameters.AddWithValue("@p_descripcion", descripcion);

                await audCmd.ExecuteNonQueryAsync();

                await transaction.CommitAsync();
                return "Usuario modificado exitosamente";
            }
            catch (SqlException ex) when (ex.Number == 50007) // rol inválido
            {
                await transaction.RollbackAsync();
                return "El rol proporcionado no es válido.";
            }
            catch (SqlException ex) when (ex.Number == 50008) // error al modificar
            {
                await transaction.RollbackAsync();
                return "Error al modificar el usuario en la base de datos.";
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return $"Error del servidor: {ex.Message}";
            }
        }


        public async Task<string> RecuperarPasswordAsync(string correo)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var command = new SqlCommand("sp_recuperarPassword", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@p_email", correo);

            try
            {
                string? password = null;

                using (var reader = await command.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        password = reader.GetString(0); // asumiendo que la contraseña viene en la primera columna
                    }
                }

                if (string.IsNullOrEmpty(password))
                    return "El correo no tiene una contraseña registrada.";

                // enviar la contraseña al correo del usuario
                await _smtpService.EnviarCorreoAsync(correo, "Recuperación de contraseña", $"Has solicitado la recuperación de tu contraseña correctamente, " +
                    $"si no fuiste tú, contacta con un Administrador.<p><strong>Tu contraseña es: {password}</strong></p>");

                return "La contraseña fue enviada a tu correo electrónico.";
            }
            catch (SqlException ex) when (ex.Number == 50010)
            {
                return "El correo no existe en el sistema.";
            }
            catch (Exception ex)
            {
                return $"Error al recuperar la contraseña: {ex.Message}";
            }
        }

        public async Task<string> CambiarPasswordAsync(CambiarPasswordDto dto)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var command = new SqlCommand("sp_cambiarPassword", connection);
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.AddWithValue("@p_email", dto.Email);
            command.Parameters.AddWithValue("@p_password_actual", dto.PasswordActual);
            command.Parameters.AddWithValue("@p_nueva_password", dto.NuevaPassword);

            try
            {
                await command.ExecuteNonQueryAsync();

                // enviar la contraseña al correo del usuario
                await _smtpService.EnviarCorreoAsync(
                 dto.Email,
                 "Contraseña actualizada correctamente",
                 $@"
                    <p>Has solicitado la modificación de tu contraseña correctamente, 
                    si no fuiste tú, contacta con un Administrador.</p>
                    <p><strong>Tu nueva contraseña es: {dto.NuevaPassword}</strong></p>
                ");

                return "Contraseña actualizada correctamente. Revisa tu correo.";
            }
            catch (SqlException ex) when (ex.Number == 50012)
            {
                return "La contraseña actual es incorrecta.";
            }
            catch (SqlException ex) when (ex.Number == 50013)
            {
                return "El usuario no existe.";
            }
            catch (Exception ex)
            {
                return $"Error al cambiar la contraseña: {ex.Message}";
            }
        }



    }
}
