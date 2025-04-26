//en Program.cs va toda la configuracion globa de servicios y middlewares del sistema

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using UrbanIntelAPI.Services;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddScoped<UsuarioService>();

// Agregar controladores (API)
builder.Services.AddControllers();

// Configurar Swagger para documentaci�n
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// Configurar Autenticaci�n JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)

    // Configuramos el esquema JWT Bearer
    .AddJwtBearer(options =>
    {
        // Definimos las reglas para validar los tokens que recibimos
        options.TokenValidationParameters = new TokenValidationParameters
        {
            
            ValidateIssuer = true, // �Validar qui�n emiti� el token?
            ValidateAudience = true, // �Validar para qui�n fue emitido el token (audiencia)?
            ValidateLifetime = true, // �Validar que el token no est� expirado?
            ValidateIssuerSigningKey = true, // �Validar la firma del token para asegurarnos que no fue alterado?           
            ValidIssuer = "urbanintel", // Qui�n genera el token (tu servidor o aplicaci�n)            
            ValidAudience = "urbanintel", // Para qui�n est� destinado el token (por ejemplo, tu aplicaci�n cliente Angular)

            // Clave secreta usada para firmar y validar el token (debe ser secreta y segura)
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes("CLAVESECRETA12345")) // Convertimos la clave a bytes
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

// Activar Autenticaci�n (verifica tokens JWT)
app.UseAuthentication();

// Activar Autorizaci�n (permite o deniega acceso seg�n roles o claims)
app.UseAuthorization();

// Mapear controladores (rutas)
app.MapControllers();

// Correr la aplicaci�n
app.Run();
