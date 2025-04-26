//en Program.cs va toda la configuracion globa de servicios y middlewares del sistema

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using UrbanIntelAPI.Services;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddScoped<UsuarioService>();

// Agregar controladores (API)
builder.Services.AddControllers();

// Configurar Swagger para documentación
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// Configurar Autenticación JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)

    // Configuramos el esquema JWT Bearer
    .AddJwtBearer(options =>
    {
        // Definimos las reglas para validar los tokens que recibimos
        options.TokenValidationParameters = new TokenValidationParameters
        {
            
            ValidateIssuer = true, // ¿Validar quién emitió el token?
            ValidateAudience = true, // ¿Validar para quién fue emitido el token (audiencia)?
            ValidateLifetime = true, // ¿Validar que el token no esté expirado?
            ValidateIssuerSigningKey = true, // ¿Validar la firma del token para asegurarnos que no fue alterado?           
            ValidIssuer = "urbanintel", // Quién genera el token (tu servidor o aplicación)            
            ValidAudience = "urbanintel", // Para quién está destinado el token (por ejemplo, tu aplicación cliente Angular)

            // Clave secreta usada para firmar y validar el token (debe ser secreta y segura)
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes("CLAVESECRETA12345")) // Convertimos la clave a bytes
        };
    });


var app = builder.Build();

// Configuración del pipeline de middlewares

// Activar Swagger SIEMPRE 
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "UrbanIntel.API v1");
    //c.RoutePrefix = string.Empty; // Swagger será la página principal
});

// Activar Autenticación (verifica tokens JWT)
app.UseAuthentication();

// Activar Autorización (permite o deniega acceso según roles o claims)
app.UseAuthorization();

// Mapear controladores (rutas)
app.MapControllers();

// Correr la aplicación
app.Run();
