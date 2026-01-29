# Changelog

All notable changes to the FL SAL Reporting Portal will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2026-01-14

### Added
- **Admin Panel** - New web-based interface for managing report email addresses (`/admin`)
  - Secure password-protected access
  - Update email addresses without editing environment variables
  - Audit trail tracking (who made changes and when)
  - Real-time configuration updates
- **Automatic Service Year Calculation** - Service year now updates automatically on July 1st each year
  - Service year runs from July 1 to June 30
  - Dynamic display eliminates manual updates
- Configuration management system with JSON-based storage
- Migration script to populate config from existing environment variables
- Comprehensive admin setup documentation (ADMIN_SETUP.md)

### Changed
- Upload API route now reads email configuration from config file (with fallback to environment variables)
- Changed upload runtime from 'edge' to 'nodejs' to support file system operations
- Service year display is now dynamically calculated based on current date

### Technical Improvements
- New utility functions: `getServiceYear()`, `getReportEmail()`, `getReportConfig()`
- API endpoints: `/api/admin/config` (GET/POST) for configuration management
- Enhanced security with Bearer token authentication for admin operations
- Backward compatibility maintained with environment variable fallback

## [1.0.3] - 2026-01-14

### Changed
- Updated Next.js from 14.2.28 to 14.2.35 (security patches)
- Updated @next/eslint-plugin-next from 14.2.28 to 14.2.35
- Updated eslint-config-next from 14.2.28 to 14.2.35
- Updated TypeScript from 5.8.3 to 5.9.3
- Updated autoprefixer from 10.4.21 to 10.4.23
- Updated postcss from 8.5.3 to 8.5.6
- Updated @tailwindcss/forms from 0.5.10 to 0.5.11
- Updated nodemailer from 6.10.0 to 6.10.1
- Moved favicon from public/ to app/ directory (Next.js 14 convention)

### Removed
- Removed favicon-generator and favicons packages (154 dependencies removed)
- Manual favicon implementation replaces automated generation

### Security
- Fixed 5 high-severity Next.js vulnerabilities (SSRF, cache confusion, content injection, information exposure, DoS)
- Resolved multiple moderate-severity vulnerabilities in dependencies
- Reduced total vulnerabilities from 21 to 11

## [1.0.2] - 2024-03-19

### Changed
- Updated district number options to only include valid districts (1-17, excluding 10)
- Modified district number display format to show ordinal numbers (e.g., "1st District")
- Changed file naming date format from YYYYMMDD to MMDDYYYY
- Improved error handling and logging in email service
- Enhanced email templates with better formatting

### Fixed
- Resolved issues with email service configuration
- Fixed file attachment handling in email service
- Improved error messages for better user feedback
- Enhanced validation for required fields and file types

### Security
- Implemented proper environment variable handling
- Added validation for email recipients
- Secured file upload process with type and size restrictions

## Report Types
1. National Consolidated Squadron Report (NCSR)
2. Detachment Consolidated Squadron Report (DCSR)
3. Veterans Affairs & Rehabilitation (VA&R)
4. VAVS-VOY
5. AMERICANISM
6. Children & Youth (C&Y)
7. Squadron Internal Report (SIR)
8. Squadron Detachment Report (SDR)
9. Squadron Operations Committee (SOC)
10. Detachment Operations Report (DOR)

## [1.0.1] - 2024-03-21

### Fixed
- Resolved Node.js 'fs' module compatibility issues
  - Removed SendGrid dependency
  - Updated email service to use SMTP2GO API
  - Fixed file handling in Edge Functions

## [1.0.0] - 2024-03-19

### Added
- Initial release of the Florida Sons Reporting Portal
- Support for 10 different report types (NCSR, DCSR, VA&R, VAVS-VOY, AMERICANISM, C&Y, SIR, SDR, SOC, DOR)
- File upload functionality with support for .xlsx, .xls, .docx, .doc, and .pdf files
- Email notifications for report submissions
- User confirmation emails
- Environment variable configuration for email recipients
- File size limit of 10MB
- Automatic file naming convention: SQ{number}-{report type}-Report-{date}.{extension}

### Changed
- Updated email service to use SMTP2GO API
- Improved error handling and logging throughout the application
- Enhanced email templates with better formatting and information presentation
- Streamlined file upload process with proper validation
- Updated report type names to match official designations (e.g., VA&R, C&Y)

### Fixed
- Resolved issues with email service configuration
- Fixed file attachment handling in email service
- Improved error messages for better user feedback
- Enhanced validation for required fields and file types

### Security
- Implemented proper environment variable handling
- Added validation for email recipients
- Secured file upload process with type and size restrictions

[1.0.4]: https://github.com/yourusername/reporting/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/yourusername/reporting/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/yourusername/reporting/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/yourusername/reporting/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/yourusername/reporting/releases/tag/v1.0.0 