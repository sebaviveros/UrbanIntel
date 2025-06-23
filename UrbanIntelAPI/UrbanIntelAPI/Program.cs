// en Program.cs va toda la configuracion global de servicios y middlewares del sistema

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using UrbanIntelDATA;
using UrbanIntelDATA.Models;
using UrbanIntelDATA.Services;

var builder = WebApplication.CreateBuilder(args);

// inyeccion de services
builder.Services.AddScoped<UsuarioService>();
builder.Services.AddScoped<LoginService>();
builder.Services.AddScoped<SolicitudService>();
builder.Services.AddScoped<AzureBlobService>();
builder.Services.AddScoped<AuditoriaService>();
builder.Services.AddScoped<EventoService>();

// Agregar controladores (API) UrbanIntelData
builder.Services.AddControllers();

// Configurar Swagger para documentaci�n
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// inyeccion de db context para ser reconocida en el resto del sistema
builder.Services.AddScoped<UrbanIntelDBContext>();

// Configuraci�n SMTP
builder.Services.Configure<SmtpSettings>(
builder.Configuration.GetSection("Smtp"));
builder.Services.AddTransient<SmtpService>();

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

// Activar Swagger
app.UseSwagger();

app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "UrbanIntel.API v1");
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
