using Microsoft.SemanticKernel;

namespace MCPClientWithSK.Services;

public interface ISessionKernelFactory
{
    Task<Kernel> GetOrCreateKernelAsync(string sessionId);
    Task<bool> RemoveKernelAsync(string sessionId);
    Task ClearAllKernelsAsync();
}
