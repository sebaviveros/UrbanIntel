using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using UrbanIntelDATA.Models;
using UrbanIntelDATA.Services; 

namespace UrbanIntelAPI.Auth
{
    [ApiController]
    [Route("api/[controller]")] // api/auth
    public class AuthController : ControllerBase
    {
        private readonly LoginService _loginService;
        private readonly IConfiguration _config;

        public AuthController(LoginService loginService, IConfiguration config)
        {
            _loginService = loginService;
            _config = config;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {

            
            // Validar usuario contra base de datos usando LoginService
            var usuario = await _loginService.ValidarUsuarioAsync(dto.Email, dto.Password);

            if (usuario == null)
                return Unauthorized(new { message = "Credenciales inválidas" });

            // Generar JWT
            var token = GenerarToken(usuario);

            return Ok(new { token });
            }
            catch (Exception ex)
            {
                // mensaje al usuario en caso de no conectar con base de datos
                return StatusCode(500, new { message = "Error en el servidor. Inténtelo más tarde." });
            }
        }

        private string GenerarToken(Usuario usuario)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, usuario.Rut),
                new Claim("email", usuario.Email),
                new Claim("rol", usuario.Rol)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
