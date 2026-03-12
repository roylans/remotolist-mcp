# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial public release preparation

## [1.0.0] - 2025-03-12

### Added
- Complete rewrite with interactive setup wizard
- No environment variables required
- Automatic Claude Desktop configuration
- Optional anonymous telemetry
- Diagnostic tools (`doctor` command)
- One-command installation: `npx remotolist-mcp setup`

### Features
- **Interactive Setup Wizard**: Guided configuration without manual steps
- **Configuration Management**: Secure storage in `~/.remotolist/config.json`
- **Claude Desktop Integration**: Automatic detection and configuration
- **API Key Validation**: Server-side validation during setup
- **Telemetry System**: Anonymous usage tracking (opt-in)
- **CLI Commands**: `setup`, `config`, `test`, `doctor`, `telemetry`, `help`
- **Error Handling**: Comprehensive error messages and recovery

### Security
- Secure configuration file permissions (600)
- API key validation before use
- HTTPS enforcement for all connections
- No sensitive data in error messages

### Documentation
- Complete README with installation instructions
- Troubleshooting guide
- API documentation
- Security best practices

## [0.1.0] - 2025-03-08

### Added
- Initial prototype version
- Basic MCP client functionality
- Environment variable based configuration
- Simple CLI interface

### Deprecated
- Environment variable configuration (replaced by interactive wizard)
- Manual Claude Desktop configuration

## Types of Changes

- **Added** for new features.
- **Changed** for changes in existing functionality.
- **Deprecated** for soon-to-be removed features.
- **Removed** for now removed features.
- **Fixed** for any bug fixes.
- **Security** in case of vulnerabilities.

## Versioning Policy

- **Major version (X.0.0)**: Breaking changes
- **Minor version (0.X.0)**: New features, backwards compatible
- **Patch version (0.0.X)**: Bug fixes, security patches

## Release Process

1. Update version in `package.json`
2. Update this CHANGELOG.md
3. Create git tag: `git tag -a v1.0.0 -m "Release v1.0.0"`
4. Push tag: `git push origin v1.0.0`
5. Create GitHub release with changelog
6. Publish to npm: `npm publish`

## Links

- GitHub Releases: https://github.com/roylans/remotolist-mcp/releases
- npm Package: https://www.npmjs.com/package/remotolist-mcp
- Documentation: https://docs.remotolist.com/mcp