# WebIntractMCP - GitHub Copilot Instructions

## Project Overview

WebIntractMCP is an MCP (Model Context Protocol) ecosystem with two tightly integrated components (@web-intract-mcp/client and WebIntractMCPServer) that transform web applications into MCP servers with real-time two-way communication.

## Components

### 📁 `lib/@web-intract-mcp/client` - TypeScript MCP Library
- **Tech**: TypeScript 5.8+, SignalR, Shepherd.js, Jest
- **Purpose**: Framework-agnostic library that transforms web apps into MCP servers
- **Key**: Real-time communication, tool registration, UI automation

### 📁 `server/WebIntractMCPServer` - .NET MCP Server  
- **Tech**: .NET 9, ASP.NET Core, SignalR, ModelContextProtocol.AspNetCore
- **Purpose**: MCP server managing client web applications
- **Key**: MCP protocol implementation, SignalR hub, CORS config

### 📁 `sample/angular-dotnetnet-semantic-kernel` - Sample App
- **Tech**: Angular 20, .NET 9, Semantic Kernel, TypeScript 5.8+
- **Purpose**: Reference implementation demonstrating full MCP integration
- **Key**: MCP client with Semantic Kernel, Angular UI integration

## Critical Integration Rules

**ALWAYS test cross-component compatibility when making changes could affect that:**

1. **@web-intract-mcp/client changes** → Test WebIntractMCPServer + Sample app
2. **WebIntractMCPServer changes** → Test @web-intract-mcp/client + Sample app  
3. **Sample app changes** → Test end-to-end MCP communication

## Documentation Update Requirements

**ALWAYS update `website/content/docs/` when making changes that affect:**

- API signatures, parameters, or return types
- Configuration options or setup procedures
- Installation or deployment steps
- Breaking changes or deprecated features
- New features or tools
- Error handling or troubleshooting

**Guidelines:**
1. **Update First**: Always prefer updating existing documentation over creating new sections
2. **Create New**: Only create new sections when information cannot logically fit in existing content
3. **Be Concise**: Keep documentation straight to the point - users prefer brevity
4. **Use Tables**: Prefer markdown tables for structured data (APIs, configurations, comparisons)
5. **Validate Examples**: Ensure all code examples work with current versions

**Update Priority:**

| Priority | Location | When to Update |
|----------|----------|----------------|
| 1 | Existing relevant section | API changes, configuration updates |
| 2 | Related section expansion | New parameters, options, features |
| 3 | New subsection in existing page | Closely related new functionality |
| 4 | New page | Completely new component or major feature |

## Development Standards

### Angular 20+
- Use standalone components, signals, control flow (`@if`, `@for`, `@switch`)
- Modern Angular patterns, Angular Material
- Follow Angular style guide

### .NET 9+  
- Use minimal APIs, primary constructors, latest C# features
- Dependency injection, nullable reference types
- Follow .NET conventions

### TypeScript 5.8+
- Strict type checking, latest features (satisfies, const assertions)
- Discriminated unions, functional patterns
- Comprehensive type safety

## Development Workflow

```bash
# Setup
npm install
cd lib/@web-intract-mcp/client && npm install
cd sample/angular-dotnetnet-semantic-kernel && npm install

# Start servers
cd sample/angular-dotnetnet-semantic-kernel
npm run start:server    # Web Intract MCP server
npm run start:client    # .NET client backend sample app
npm run start           # Angular frontend sample app

# Testing
cd lib/@web-intract-mcp/client && npm test
cd server/WebIntractMCPServer && dotnet test
cd sample/angular-dotnetnet-semantic-kernel && npm test
```

## Code Standards

### File Organization
```
lib/web-intract-mcp/src/
├── controller.ts           # Main MCP controller
├── signalr.service.ts     # SignalR communication
├── tool-registry.ts       # Tool management
├── types.ts              # TypeScript definitions
└── __tests__/            # Unit tests

server/WebIntractMCPServer/
├── Program.cs            # Main entry point
├── Hubs/                 # SignalR hubs
├── Services/             # Business logic
├── Configuration/        # Config classes
└── Abstractions/         # Interfaces

sample/angular-dotnetnet-semantic-kernel/src/
├── app/                  # Angular components
├── server/               # .NET backend
└── assets/               # Static resources
```

## Testing Requirements
- **Unit**: Jest (TS), xUnit (.NET), Jasmine/Karma (Angular)
- **Integration**: Cross-component communication
- **E2E**: Complete MCP workflows
- **Type Safety**: TypeScript strict mode

## Key Dependencies
- Angular 20+ (latest stable)
- .NET 9+ (latest stable)  
- TypeScript 5.8+ (Angular compatible)
- SignalR (client/server version alignment)

## Common Issues

### SignalR Connection
- Verify CORS in WebIntractMCPServer
- Check hub URL configuration
- Implement proper error handling

### Type Compatibility  
- Run `npm run build` in @web-intract-mcp/client after changes
- Verify type exports in index.ts
- Check Angular imports match library exports

### MCP Protocol
- Validate tool schemas
- Ensure parameter validation
- Test tool execution isolation

## Best Practices

1. **Type Safety**: Use TypeScript strict mode
2. **Error Handling**: Comprehensive logging and validation
3. **Performance**: Lazy loading, tree shaking, efficient bundling
4. **Security**: Input validation, HTTPS, proper CORS
5. **Testing**: High coverage, integration testing
6. **Documentation**: Keep READMEs updated

## Code Review Checklist
- [ ] Type safety across components
- [ ] Integration tests pass
- [ ] Documentation updated in `website/content/docs/`
- [ ] Error handling implemented
- [ ] Performance considered
- [ ] Security reviewed

---
**Remember**: Tightly integrated ecosystem - always test complete workflow for any changes.
