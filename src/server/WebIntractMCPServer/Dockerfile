# Use the official .NET 9.0 runtime as the base image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Use the official .NET 9.0 SDK for building
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy the project file and restore dependencies
COPY ["WebIntractMCPServer.csproj", "."]
RUN dotnet restore "WebIntractMCPServer.csproj"

# Copy the entire source code
COPY . .
WORKDIR "/src"

# Build the application
RUN dotnet build "WebIntractMCPServer.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Publish the application
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "WebIntractMCPServer.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Create the final runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create a non-root user for security
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "WebIntractMCPServer.dll"]
