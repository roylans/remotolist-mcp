# Contributing to remotolist-mcp

Thank you for considering contributing to remotolist-mcp! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Questions and Help](#questions-and-help)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Git

### Setting Up Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/remotolist-mcp.git
   cd remotolist-mcp
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/roylans/remotolist-mcp.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Build the project**:
   ```bash
   npm run build
   ```

## Development Workflow

### Branch Strategy

- `main` - Stable production code
- `develop` - Development branch (if exists)
- Feature branches: `feature/description`
- Bug fix branches: `fix/issue-description`
- Documentation branches: `docs/topic`

### Creating a Branch

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/amazing-feature
```

### Making Changes

1. Make your changes in the `src/` directory
2. Add tests for new functionality
3. Update documentation as needed
4. Ensure code passes linting and tests

### Committing Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: type(scope): description
git commit -m "feat(cli): add new setup wizard"
git commit -m "fix(config): handle missing config file"
git commit -m "docs(readme): update installation instructions"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi-colons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Pull Request Process

1. **Ensure tests pass**:
   ```bash
   npm test
   npm run lint
   ```

2. **Update documentation** if needed

3. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request** on GitHub:
   - Use the PR template
   - Describe changes clearly
   - Link related issues
   - Request reviews from maintainers

6. **Address review feedback**:
   - Make requested changes
   - Push updates to the same branch
   - The PR will update automatically

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Define types for all function parameters and return values
- Use interfaces for object shapes
- Avoid `any` type - use `unknown` or proper typing

### Code Style

- 2-space indentation
- Use single quotes for strings
- Semicolons at end of statements
- Maximum line length: 100 characters
- Use descriptive variable names

### File Structure

```
src/
├── index.ts              # Main entry point
├── config-manager.ts     # Configuration management
├── claude-config.ts      # Claude Desktop integration
├── wizard.ts             # Interactive setup wizard
├── api-key-validator.ts  # API key validation
├── telemetry.ts          # Anonymous usage tracking
├── commands.ts           # CLI commands
├── bridge.ts             # SSE bridge to RemotoList
└── config.ts             # Legacy config (deprecated)
```

### Error Handling

- Use try/catch for async operations
- Provide meaningful error messages
- Log errors appropriately
- Don't expose sensitive information

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --testPathPattern=config-manager
```

### Writing Tests

- Place tests in `__tests__` directories
- Use descriptive test names
- Test both success and failure cases
- Mock external dependencies
- Keep tests independent

### Test Structure

```typescript
describe('Component', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Documentation

### Updating Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update TypeScript type definitions
- Keep CHANGELOG.md updated

### Documentation Standards

- Use clear, concise language
- Include code examples
- Document edge cases
- Keep documentation up-to-date with code

## Questions and Help

### Getting Help

- Check existing documentation
- Search existing issues
- Ask in GitHub Discussions (if enabled)
- Contact maintainers for critical issues

### Reporting Issues

When reporting issues, include:

1. **Description**: What happened vs what you expected
2. **Steps to Reproduce**: Clear, step-by-step instructions
3. **Environment**: OS, Node.js version, npm version
4. **Error Messages**: Complete error output
5. **Screenshots**: If applicable

### Feature Requests

For feature requests:

1. Check if the feature already exists
2. Describe the use case
3. Explain the expected behavior
4. Suggest implementation approach (optional)

## Thank You!

Your contributions help make remotolist-mcp better for everyone. We appreciate your time and effort!