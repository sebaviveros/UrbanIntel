﻿using Microsoft.AspNetCore.Mvc;
using UrbanIntelDATA.Dto;
using UrbanIntelDATA.Services;
using UrbanIntelDATA.Models;

namespace UrbanIntelAPI.Controllers
{
    [ApiController] // Indica que es un controlador de API,le dice a ASP.NET Core que valide automáticamente el modelo y maneje respuestas como 400 BadRequest si algo está mal.
    [Route("api/[controller]")] // Ruta base: api/usuario (Define la URL base del controlador como api/usuario (por el nombre de la clase).)
    public class UsuarioController : ControllerBase //ControllerBase es una clase base de ASP.NET Core para manejar codigos de estado como 404 not found, 200 ok , etc
    {
        private readonly UsuarioService _usuarioService;

        public UsuarioController(UsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] string? rut)
        {
            try
            {
                var usuarios = await _usuarioService.ObtenerUsuariosAsync(rut);

                if (usuarios == null || usuarios.Count == 0)
                    return NotFound(new { success = false, message = "Usuario no encontrado." });

                return Ok(new { success = true, usuarios });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error del servidor: {ex.Message}" });
            }
        }
        
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] UsuarioPwDto usuario)
        {
            try
            {
                var resultado = await _usuarioService.CrearUsuarioAsync(usuario);

                if (resultado == "Usuario creado exitosamente")
                {
                    return Ok(new { success = true, message = resultado });
                }
                else if (resultado.Contains("El usuario con el RUT proporcionado ya existe"))
                {
                    return BadRequest(new { success = false, message = resultado });
                }
                else if (resultado.Contains("Error al crear el usuario"))
                {
                    return StatusCode(500, new { success = false, message = resultado });
                }
                else if (resultado.Contains("Error en la base de datos"))
                {
                    return StatusCode(500, new { success = false, message = resultado });
                }
                else
                {
                    return StatusCode(500, new { success = false, message = "Error desconocido en el servidor" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error del servidor: {ex.Message}" });
            }
        }

        [HttpPost("eliminar")]
        public async Task<IActionResult> EliminarUsuario([FromBody] EliminarUsuarioDto dto)
        {
            try
            {
                var resultado = await _usuarioService.EliminarUsuarioAsync(dto.Rut, dto.RutUsuarioLogeado);

                if (resultado.Contains("exitosamente"))
                    return Ok(new { success = true, message = resultado });

                if (resultado.Contains("no existe"))
                    return NotFound(new { success = false, message = resultado });

                return BadRequest(new { success = false, message = resultado });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error del servidor: {ex.Message}" });
            }
        }


        [HttpPut]
        public async Task<IActionResult> ModificarUsuario([FromBody] ModificarUsuarioDto dto)
        {
            try
            {
                // Validación extra si quieres asegurarte que el RUT del modificado no venga vacío
                if (string.IsNullOrWhiteSpace(dto.UsuarioModificado?.Rut))
                {
                    return BadRequest(new { success = false, message = "El RUT del usuario a modificar no fue proporcionado." });
                }

                var resultado = await _usuarioService.ModificarUsuarioAsync(dto);

                if (resultado.Contains("exitosamente"))
                    return Ok(new { success = true, message = resultado });

                if (resultado.Contains("no existe"))
                    return NotFound(new { success = false, message = resultado });

                if (resultado.Contains("no es válido"))
                    return BadRequest(new { success = false, message = resultado });

                return BadRequest(new { success = false, message = resultado });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error del servidor: {ex.Message}" });
            }
        }

        [HttpPost("recuperar-password")]
        public async Task<IActionResult> RecuperarPassword([FromBody] RecuperarPasswordDto dto)
        {
            try
            {
                var resultado = await _usuarioService.RecuperarPasswordAsync(dto.Correo);

                if (resultado.Contains("fue enviada"))
                    return Ok(new { success = true, message = resultado });

                return BadRequest(new { success = false, message = resultado });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error del servidor: {ex.Message}" });
            }
        }

        [HttpPost("cambiar-password")]
        public async Task<IActionResult> CambiarPassword([FromBody] CambiarPasswordDto dto)
        {
            try
            {
                var resultado = await _usuarioService.CambiarPasswordAsync(dto);

                if (resultado.Contains("actualizada"))
                    return Ok(new { success = true, message = resultado });

                return BadRequest(new { success = false, message = resultado });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error del servidor: {ex.Message}" });
            }
        }

    }
}
