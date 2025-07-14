# Contributing to Web Intract MCP

Thanks for contributing! Here's how to get started quickly.

## Prerequisites

- Node.js 18+ and npm 9+
- Git

## Quick Setup

```bash
# Fork repo and clone
git clone https://github.com/Vijay-Nirmal/WebIntractMCP.git
cd WebIntractMCP/lib/web-intract-mcp

# Install and test
npm install
npm run build
npm test
```

## Development

### Project Structure
```
src/
├── controller.ts        # Main MCP controller
├── tool-registry.ts     # Tool management  
├── signalr.service.ts   # SignalR communication
├── types.ts            # TypeScript definitions
└── __tests__/          # Tests
```

### Commands
```bash
npm run build           # Build library
npm test               # Run tests
npm run test:watch     # Watch mode
npm run lint           # Check code style
```

## Making Changes

### Branching
- `main` - Production code
- `feature/name` - New features
- `fix/name` - Bug fixes

### Commit Format
Use [Conventional Commits](https://conventionalcommits.org/):
```
feat: add new tool registration method
fix: resolve SignalR timeout issue
docs: update API examples
```

### Testing
- Add tests for new features
- Ensure all tests pass: `npm test`
- Aim for >90% coverage

## Pull Requests

### Checklist
- [ ] Tests added/updated and passing
- [ ] Code follows TypeScript strict mode
- [ ] Documentation updated
- [ ] Builds successfully

### Template
```markdown
## What Changed
Brief description

## Type
- [ ] Bug fix
- [ ] New feature  
- [ ] Breaking change
- [ ] Documentation

## Testing
- [ ] Added tests
- [ ] All tests pass
```

## Code Standards

### TypeScript
- Use strict mode
- Explicit types (avoid `any`)
- JSDoc for public APIs
- Follow existing patterns

### Style
- Prettier formatting: `npm run lint:fix`
- ESLint rules enforced
- Descriptive variable names

## Documentation

Update docs in `website/content/docs/` for:
- API changes
- New features
- Configuration updates
- Breaking changes

Keep it concise - users prefer brevity.

## Help

- **Issues**: Bug reports and feature requests
- **Discussions**: Questions and general topics
- **Reviews**: Code-specific feedback

**Response times**: 1-5 business days

Thanks for contributing!
