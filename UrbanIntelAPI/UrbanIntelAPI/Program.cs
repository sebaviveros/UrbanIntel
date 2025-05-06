//en Program.cs va toda la configuracion globa de servicios y middlewares del sistema

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using UrbanIntelDATA;
using UrbanIntelDATA.Services;


var builder = WebApplication.CreateBuilder(args);

// inyeccion de services
builder.Services.AddScoped<UsuarioService>();
builder.Services.AddScoped<LoginService>();

// Agregar controladores (API)UrbanIntelData
builder.Services.AddControllers();

// Configurar Swagger para documentaci�n
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// inyeccion de db context para ser reconocida en el resto del sistema
builder.Services.AddScoped<UrbanIntelDBContext>();

// configuracion cors
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});



// Configurar Autenticaci�n JWT
// obtenemos la seccion de configuracion jwt desde appsettings.json
var jwtSettings = builder.Configuration.GetSection("Jwt");

// extraemos la clave secreta
var secretKey = jwtSettings["Key"];

// configuramos el esquema de autenticacion jwt bearer
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true, // valida quien emitio el token
            ValidateAudience = true, // valida para quien esta destinado el token
            ValidateLifetime = true, // valida que el token no este expirado
            ValidateIssuerSigningKey = true, // valida que la firma del token sea correcta

            ValidIssuer = jwtSettings["Issuer"], // quien emite el token (definido en appsettings)
            ValidAudience = jwtSettings["Audience"], // quien puede usar el token (cliente angular, etc)

            // clave secreta usada para firmar el token
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(secretKey)) // convertimos la clave a bytes para la firma
        };
    });

var app = builder.Build();

// Configuraci�n del pipeline de middlewares

// Activar Swagger SIEMPRE 
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "UrbanIntel.API v1");
    //c.RoutePrefix = string.Empty; // Swagger ser� la p�gina principal
});

// habilitar cors
app.UseCors();

// Activar Autenticaci�n (verifica tokens JWT)
app.UseAuthentication();

// Activar Autorizaci�n (permite o deniega acceso seg�n roles o claims)
app.UseAuthorization();

// Mapear controladores (rutas)
app.MapControllers();

// Correr la aplicaci�n
app.Run();
