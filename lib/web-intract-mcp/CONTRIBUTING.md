# Contributing to Web Intract MCP

We welcome contributions to the Web Intract MCP library! This guide will help you get started with contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Making Changes](#making-changes)
5. [Testing](#testing)
6. [Submitting Changes](#submitting-changes)
7. [Code Style](#code-style)
8. [Documentation](#documentation)

## Code of Conduct

This project follows a Code of Conduct to ensure a welcoming environment for all contributors. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/web-intract-mcp.git
   cd web-intract-mcp
   ```

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Run tests to ensure everything is working:
   ```bash
   npm test
   ```

4. Start development mode with file watching:
   ```bash
   npm run dev
   ```

### Project Structure

```
src/
├── __tests__/           # Test files
├── controller.ts        # Main controller implementation
├── tool-registry.ts     # Tool management
├── signalr.service.ts   # SignalR communication
├── types.ts            # TypeScript type definitions
├── index.ts            # Main entry point
└── test-setup.ts       # Test configuration
```

## Making Changes

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - Feature branches
- `bugfix/bug-description` - Bug fix branches
- `hotfix/critical-fix` - Critical hotfixes

### Creating a Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add parameter validation for tool configurations
fix: resolve SignalR connection timeout issue
docs: update README with new installation instructions
test: add unit tests for ToolRegistry class
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Place test files in `src/__tests__/` directory
- Use `.test.ts` or `.spec.ts` suffix
- Follow the existing test patterns
- Aim for high test coverage (>90%)

Example test structure:
```typescript
describe('FeatureName', () => {
  beforeEach(() => {
    // Setup code
  });

  afterEach(() => {
    // Cleanup code
  });

  describe('method', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
});
```

### Test Requirements

- All new features must include tests
- Bug fixes should include regression tests
- Tests should be clear and well-documented
- Mock external dependencies appropriately

## Submitting Changes

### Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure all tests pass
4. Update the changelog if appropriate
5. Create a pull request with a clear description

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Changelog updated (if needed)
```

### Review Process

1. All pull requests require review
2. Address reviewer feedback promptly
3. Keep discussions focused and constructive
4. Squash commits before merging if requested

## Code Style

### TypeScript Guidelines

- Use strict TypeScript configuration
- Prefer explicit types over `any`
- Use proper JSDoc comments for public APIs
- Follow existing naming conventions

### Formatting

The project uses Prettier for code formatting:

```bash
# Check formatting
npm run lint

# Fix formatting issues
npm run lint:fix
```

### ESLint Rules

Follow the ESLint configuration:
- No unused variables
- Explicit function return types
- Prefer const over let
- Use optional chaining and nullish coalescing

## Documentation

### Code Documentation

- Use JSDoc for all public APIs
- Include examples in documentation
- Document complex algorithms and business logic
- Keep comments up-to-date with code changes

### README Updates

When adding new features:
- Update installation instructions if needed
- Add usage examples
- Update API reference
- Include troubleshooting information

### API Documentation

```typescript
/**
 * Description of the function
 * @param paramName - Description of parameter
 * @returns Description of return value
 * @throws {ErrorType} Description of when error is thrown
 * @example
 * ```typescript
 * const result = functionName(param);
 * ```
 */
```

## Release Process

### Version Bumping

Follow semantic versioning:
- `MAJOR` - Breaking changes
- `MINOR` - New features (backward compatible)
- `PATCH` - Bug fixes (backward compatible)

### Pre-release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version number bumped
- [ ] Build artifacts generated
- [ ] Security review completed

## Getting Help

### Communication Channels

- GitHub Issues - Bug reports and feature requests
- GitHub Discussions - Questions and general discussion
- Pull Request Reviews - Code-specific discussions

### Issue Templates

Use appropriate issue templates:
- Bug Report
- Feature Request
- Documentation Issue
- Security Vulnerability

### Response Times

We aim to respond to:
- Security issues: Within 24 hours
- Bug reports: Within 3 days
- Feature requests: Within 1 week
- Pull requests: Within 5 days

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Package.json contributors field

Thank you for contributing to Web Intract MCP!
