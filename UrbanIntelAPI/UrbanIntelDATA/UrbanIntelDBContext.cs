using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MySql.Data.MySqlClient;
using Microsoft.Extensions.Configuration;
using UrbanIntelDATA.Models;


namespace UrbanIntelDATA
{
    public class UrbanIntelDBContext
    {
        private readonly string _connectionString;

        public UrbanIntelDBContext(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("CntnString");
        }

        public MySqlConnection CreateConnection()
        {
            return new MySqlConnection(_connectionString);
        }
    }
}