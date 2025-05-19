// en Program.cs va toda la configuracion global de servicios y middlewares del sistema

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using UrbanIntelDATA;
using UrbanIntelDATA.Services;

var builder = WebApplication.CreateBuilder(args);

// inyeccion de services
builder.Services.AddScoped<UsuarioService>();
builder.Services.AddScoped<LoginService>();
builder.Services.AddScoped<SolicitudService>();

// Agregar controladores (API) UrbanIntelData
builder.Services.AddControllers();

// Configurar Swagger para documentación
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

// Configurar Autenticación JWT
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["Key"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(secretKey))
        };
    });

var app = builder.Build();

// Crear la carpeta 'uploads' justo antes de usar el middleware estático
var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
try
{
    if (!Directory.Exists(uploadsPath))
    {
        Directory.CreateDirectory(uploadsPath);
        Console.WriteLine($"Carpeta 'uploads' creada en: {uploadsPath}");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Error al crear la carpeta 'uploads': {ex.Message}");
}

// Activar Swagger
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "UrbanIntel.API v1");
});

// habilitar cors
app.UseCors();

// Configurar la carpeta 'uploads' como pública
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

// Activar Autenticación (verifica tokens JWT)
app.UseAuthentication();

// Activar Autorización (permite o deniega acceso según roles o claims)
app.UseAuthorization();

// Mapear controladores (rutas)
app.MapControllers();

// Correr la aplicación
app.Run();
