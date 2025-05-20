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

                await containerClient.CreateIfNotExistsAsync();

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                var blobClient = containerClient.GetBlobClient(fileName);

                using var stream = file.OpenReadStream();
                await blobClient.UploadAsync(stream, overwrite: true);

                // Retorna la URL pública de la imagen
                return blobClient.Uri.ToString();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al subir la imagen a Azure Blob Storage: {ex.Message}");
            }
        }
    }
}
