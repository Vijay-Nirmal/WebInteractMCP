using System.Text.Json;
using System.Text.Json.Serialization;

namespace WebIntractMCPServer
{
    public static class Constants
    {
        public static readonly JsonSerializerOptions JsonSerializerOptions = new JsonSerializerOptions
        {
            UnmappedMemberHandling = JsonUnmappedMemberHandling.Skip,
            PropertyNameCaseInsensitive = true
        };
    }
}
