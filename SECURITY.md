# Security Policy

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

### Private Disclosure Process

We take security seriously. If you discover a security vulnerability, please follow these steps:

1. **DO NOT** create a public GitHub issue
2. **DO** email us at security@remotolist.com with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
   - Your contact information

3. We will:
   - Acknowledge receipt within 48 hours
   - Investigate and validate the report
   - Keep you updated on our progress
   - Coordinate public disclosure if needed

### Public Disclosure Process

Once a vulnerability has been validated and fixed:

1. We will create a security advisory on GitHub
2. We will release a patched version
3. We will update the CHANGELOG.md
4. We will credit the reporter (unless they wish to remain anonymous)

## Security Best Practices

### For Users

1. **Keep software updated**: Always use the latest version of remotolist-mcp
2. **Secure API keys**: Never share your API keys or commit them to version control
3. **Review permissions**: Ensure configuration files have proper permissions (600)
4. **Monitor usage**: Regularly check your API key usage in the RemotoList dashboard
5. **Report suspicious activity**: Contact us immediately if you notice anything unusual

### For Developers

1. **Dependency scanning**: We use `npm audit` to check for vulnerable dependencies
2. **Code review**: All changes undergo security review
3. **Automated testing**: Security tests are part of our CI pipeline
4. **Least privilege**: The package only requests necessary permissions

## Security Features

### Built-in Protections

1. **Secure configuration storage**: Configuration files use 600 permissions
2. **API key validation**: Keys are validated server-side before use
3. **HTTPS enforcement**: All connections use HTTPS by default
4. **Input sanitization**: User inputs are validated and sanitized
5. **Error handling**: Sensitive information is not exposed in error messages

### Data Protection

1. **No data storage**: The package does not store candidate data locally
2. **Encrypted transmission**: All data is transmitted over HTTPS
3. **API key hashing**: API keys are hashed before transmission
4. **Minimal permissions**: The package only requires file system access for configuration

## Known Security Considerations

### Configuration Files

- Location: `~/.remotolist/config.json`
- Permissions: 600 (owner read/write only)
- Content: Contains API key - treat as sensitive

### Claude Desktop Integration

- The package modifies Claude Desktop configuration
- Changes are made to: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
- Only MCP server configuration is modified

### Telemetry Data

- Telemetry is opt-in
- No personal data is collected
- No search queries are transmitted
- No API keys are transmitted

## Security Updates

We regularly:

1. Monitor for security vulnerabilities in dependencies
2. Update dependencies with security patches
3. Conduct security reviews of code changes
4. Perform penetration testing (when applicable)

## Contact

- **Security issues**: security@remotolist.com
- **General support**: support@remotolist.com
- **Discord**: https://discord.gg/remotolist

## Acknowledgments

We thank the security researchers and community members who help us keep remotolist-mcp secure.