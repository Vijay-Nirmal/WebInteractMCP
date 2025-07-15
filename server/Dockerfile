# Use the official .NET 9.0 runtime as the base image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base

# Add metadata labels
LABEL org.opencontainers.image.title="WebInteract MCP Server"
LABEL org.opencontainers.image.description="A Model Context Protocol (MCP) server that converts client web applications into MCP servers with robust two-way communication"
LABEL org.opencontainers.image.vendor="WebInteractMCP"
LABEL org.opencontainers.image.source="https://github.com/Vijay-Nirmal/WebInteractMCP"
LABEL org.opencontainers.image.documentation="https://github.com/Vijay-Nirmal/WebInteractMCP/blob/master/README.md"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Use the official .NET 9.0 SDK for building
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy the project file and restore dependencies
COPY ["WebInteractMCPServer/WebInteractMCPServer.csproj", "."]
RUN dotnet restore "WebInteractMCPServer.csproj"

# Copy the entire source code
COPY . .
WORKDIR "/src/WebInteractMCPServer"

# Build the application
RUN dotnet build "WebInteractMCPServer.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Publish the application
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "WebInteractMCPServer.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Create the final runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create a non-root user for security
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080

# Health check using dotnet instead of curl for better reliability
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD dotnet --version > /dev/null && \
        timeout 3s bash -c "</dev/tcp/localhost/8080" || exit 1

ENTRYPOINT ["dotnet", "WebInteractMCPServer.dll"]
