using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UrbanIntelDATA.Dto;
using UrbanIntelDATA.Models;


namespace UrbanIntelDATA.Services
{
    public class AuditoriaService
    {
        private readonly UrbanIntelDBContext _context;

        public AuditoriaService(UrbanIntelDBContext context)
        {
            _context = context;
            
        }
        public async Task<List<GenericItem>> ObtenerAccionAuditoriaAsync()
        {
            var lista = new List<GenericItem>();
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var command = new SqlCommand("sp_obtenerAccionAuditoria", connection);
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

        public async Task<List<GenericItem>> ObtenerModuloAuditoriaAsync()
        {
            var lista = new List<GenericItem>();
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var command = new SqlCommand("sp_obtenerModuloAuditoria", connection);
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

        public async Task<List<Auditoria>> BuscarAuditoriasAsync(AuditoriaFiltroDto filtro)
        {
            var lista = new List<Auditoria>();
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            using var command = new SqlCommand("sp_buscarAuditorias", connection);
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.AddWithValue("@Id", (object?)filtro.Id ?? DBNull.Value);
            command.Parameters.AddWithValue("@RutUsuario", (object?)filtro.RutUsuario ?? DBNull.Value);
            command.Parameters.AddWithValue("@AccionId", (object?)filtro.AccionId ?? DBNull.Value);
            command.Parameters.AddWithValue("@ModuloId", (object?)filtro.ModuloId ?? DBNull.Value);
            command.Parameters.AddWithValue("@FechaInicio", (object?)filtro.FechaInicio ?? DBNull.Value);
            command.Parameters.AddWithValue("@FechaFin", (object?)filtro.FechaFin ?? DBNull.Value);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                lista.Add(new Auditoria
                {
                    Id = reader.GetInt32(0),
                    RutUsuario = reader.GetString(1),
                    AccionNombre = reader.GetString(3),
                    ModuloNombre = reader.GetString(5),
                    Fecha = reader.GetDateTime(6),
                    Descripcion = reader.GetString(7)
                });
            }

            return lista;
        }


    }
}
