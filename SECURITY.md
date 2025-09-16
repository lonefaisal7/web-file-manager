# Security Policy

## Supported Versions

We actively support the following versions of Web File Manager Pro:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in Web File Manager Pro, please report it responsibly:

### How to Report

1. **Do NOT create a public GitHub issue for security vulnerabilities**
2. Contact us directly via:
   - **Telegram**: [@lonefaisal](https://t.me/lonefaisal)
   - **GitHub**: Create a private security advisory

### What to Include

Please include the following information in your report:

- **Description**: A clear description of the vulnerability
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Impact**: What could an attacker accomplish with this vulnerability?
- **Proof of Concept**: If possible, provide a PoC (without causing harm)
- **Suggested Fix**: If you have ideas for how to fix the issue

### Response Timeline

We aim to respond to security reports within:

- **24 hours**: Initial acknowledgment
- **72 hours**: Initial assessment and severity classification
- **7 days**: Detailed response with fix timeline
- **30 days**: Public disclosure (after fix is released)

### Severity Levels

We classify vulnerabilities using the following levels:

- **Critical**: Remote code execution, authentication bypass
- **High**: Privilege escalation, significant data exposure
- **Medium**: Limited data exposure, denial of service
- **Low**: Information disclosure, minor security issues

## Security Best Practices

When using Web File Manager Pro:

### For Administrators

1. **Change Default Credentials**: Always change the default username/password
2. **Use Strong Passwords**: Implement complex passwords for all accounts
3. **Network Security**: Only expose the service on trusted networks
4. **Regular Updates**: Keep the system and dependencies updated
5. **HTTPS**: Use HTTPS in production environments
6. **Firewall**: Configure proper firewall rules
7. **Monitoring**: Monitor access logs and system activity

### For Deployment

1. **Isolated Environment**: Run in a containerized or isolated environment
2. **User Permissions**: Run with minimal required permissions
3. **File System**: Limit file system access to necessary directories
4. **Port Security**: Use non-standard ports when possible
5. **Reverse Proxy**: Consider using a reverse proxy with additional security

## Known Security Considerations

### Current Limitations

1. **Full System Access**: The terminal feature provides complete system access
2. **File Permissions**: Respects but doesn't enhance system file permissions
3. **Network Exposure**: Web interface exposes server functionality

### Mitigation Strategies

1. **Network Isolation**: Use VPN or private networks
2. **User Management**: Implement role-based access in future versions
3. **Audit Logging**: Enhanced logging planned for future releases

## Acknowledgments

We thank the security community for helping keep Web File Manager Pro secure. Security researchers who responsibly disclose vulnerabilities will be acknowledged in our release notes (with permission).

## Contact

- **Project**: [Web File Manager Pro](https://github.com/lonefaisal7/web-file-manager)
- **Author**: LONE FAISAL
- **Telegram**: [@lonefaisal](https://t.me/lonefaisal)
- **GitHub**: [@lonefaisal7](https://github.com/lonefaisal7)