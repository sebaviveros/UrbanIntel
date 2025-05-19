using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using UrbanIntelDATA.Models;
using Microsoft.Data.SqlClient;


namespace UrbanIntelDATA
{
    public class UrbanIntelDBContext
    {
        private readonly string _connectionString;

        public UrbanIntelDBContext(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("CntnString");
        }

        public SqlConnection CreateConnection()
        {
            return new SqlConnection(_connectionString);
        }
    }
}