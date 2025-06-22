using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UrbanIntelDATA.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace UrbanIntelDATA.Services
{
    public class EventoService
    {
        private readonly UrbanIntelDBContext _context;

        public EventoService(UrbanIntelDBContext context)
        {
            _context = context;
        }

        public async Task<List<Evento>> ObtenerEventosAsync(string rutUsuario)
        {
            var eventos = new List<Evento>();

            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var command = new SqlCommand("sp_obtenerEventos", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@p_rut_usuario", rutUsuario);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                eventos.Add(new Evento
                {
                    Id_evento = reader.GetInt32(reader.GetOrdinal("id_evento")),
                    Nombre_evento = reader.GetString(reader.GetOrdinal("nombre_evento")),
                    Descripcion = reader.GetString(reader.GetOrdinal("descripcion")),
                    Hora_inicio = reader.GetDateTime(reader.GetOrdinal("hora_inicio")),
                    Hora_termino = reader.GetDateTime(reader.GetOrdinal("hora_termino")),
                    Notificacion = reader.GetBoolean(reader.GetOrdinal("notificacion")),
                    Rut_usuario = reader.GetString(reader.GetOrdinal("rut_usuario"))
                });
            }

            return eventos;
        }

        public async Task CrearEventoAsync(Evento evento)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var command = new SqlCommand("sp_crearEvento", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@p_nombre_evento", evento.Nombre_evento);
            command.Parameters.AddWithValue("@p_descripcion", evento.Descripcion ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@p_hora_inicio", evento.Hora_inicio);
            command.Parameters.AddWithValue("@p_hora_termino", evento.Hora_termino ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@p_notificacion", evento.Notificacion);
            command.Parameters.AddWithValue("@p_rut_usuario", evento.Rut_usuario);

            await command.ExecuteNonQueryAsync();
        }

        public async Task EliminarEventoAsync(int idEvento)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var command = new SqlCommand("sp_eliminarEvento", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@p_id_evento", idEvento);
            await command.ExecuteNonQueryAsync();
        }
    }
}
