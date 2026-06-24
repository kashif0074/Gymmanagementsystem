using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace GymManagementSystem.Server.Services;

public static class TokenHelper
{
    private static readonly byte[] SecretKey = Encoding.UTF8.GetBytes("SuperSecretGymManagementSystemKey2026!#348987132"); 

    public record TokenPayload(string Username, string Role, DateTime Expires);

    public static string CreateToken(string username, string role)
    {
        var payload = new TokenPayload(username, role, DateTime.UtcNow.AddDays(7));
        var json = JsonSerializer.Serialize(payload);
        var payloadBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(json));
        
        using var hmac = new HMACSHA256(SecretKey);
        var signatureBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(payloadBase64));
        var signatureBase64 = Convert.ToBase64String(signatureBytes);

        return $"{payloadBase64}.{signatureBase64}";
    }

    public static TokenPayload? VerifyToken(string token)
    {
        try
        {
            var parts = token.Split('.', 2);
            if (parts.Length != 2) return null;

            var payloadBase64 = parts[0];
            var signatureBase64 = parts[1];

            using var hmac = new HMACSHA256(SecretKey);
            var expectedSignatureBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(payloadBase64));
            var expectedSignatureBase64 = Convert.ToBase64String(expectedSignatureBytes);

            if (!CryptographicOperations.FixedTimeEquals(
                Convert.FromBase64String(signatureBase64), 
                Convert.FromBase64String(expectedSignatureBase64)))
            {
                return null;
            }

            var json = Encoding.UTF8.GetString(Convert.FromBase64String(payloadBase64));
            var payload = JsonSerializer.Deserialize<TokenPayload>(json);

            if (payload == null || payload.Expires < DateTime.UtcNow) return null;

            return payload;
        }
        catch
        {
            return null;
        }
    }
}
