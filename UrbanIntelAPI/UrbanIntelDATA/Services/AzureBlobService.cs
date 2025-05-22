using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Threading.Tasks;

namespace UrbanIntelDATA.Services
{
    public class AzureBlobService
    {
        private readonly string connectionString;
        private readonly string containerName;

        public AzureBlobService(IConfiguration configuration)
        {
            connectionString = configuration["AzureBlobStorage:ConnectionString"];
            containerName = configuration["AzureBlobStorage:ContainerName"];
        }

        public async Task<string> UploadImageAsync(IFormFile file)
        {
            try
            {
                var blobServiceClient = new BlobServiceClient(connectionString);
                var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

                await containerClient.CreateIfNotExistsAsync(); //si el contenedor no existe lo crea

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}"; //crea un nombre unico para el archivo usando un GUID (para evitar conflictos por nombres repetidos) + el nombre original del archivo
                var blobClient = containerClient.GetBlobClient(fileName); //crea un cliente de blob que apunta al archivo que vas a subir dentro del contenedor.

                using var stream = file.OpenReadStream(); //abre un stream de lectura del archivo enviado desde el frontend. IFormFile permite leerlo como un stream binario.
                await blobClient.UploadAsync(stream, overwrite: true); //sube el archivo al contener en azure de forma asincrona, si existe un archivo con el mismo nombre lo sobreeescribe

                // retorna la URL publica de la imagen
                return blobClient.Uri.ToString();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al subir la imagen a Azure Blob Storage: {ex.Message}");
            }
        }
        public async Task DeleteImageAsync(string imageUrl)
        {
            try
            {
                var blobServiceClient = new BlobServiceClient(connectionString);
                var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

                var blobName = GetBlobNameFromUrl(imageUrl); 
                var blobClient = containerClient.GetBlobClient(blobName);

                await blobClient.DeleteIfExistsAsync(); 
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al eliminar imagen de Azure Blob Storage: {ex.Message}");
            }
        }

        private string GetBlobNameFromUrl(string imageUrl)
        {
            return Path.GetFileName(new Uri(imageUrl).LocalPath); 
        }
    }
}



