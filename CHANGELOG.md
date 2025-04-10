# Changelog

All notable changes to the FL SAL Reporting Portal will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2024-03-21

### Fixed
- Fixed SMTP2GO email service configuration
  - Updated API request format to use JSON instead of FormData
  - Added proper API key handling
  - Fixed attachment format for SMTP2GO API
- Added version number display to TopBar
- Improved error handling and logging for email service

## [1.0.1] - 2024-03-21

### Fixed
- Resolved Node.js 'fs' module compatibility issues
  - Removed SendGrid dependency
  - Updated email service to use SMTP2GO API
  - Fixed file handling in Edge Functions

## [1.0.0] - 2024-03-21

### Added
- Initial release of FL SAL Reporting Portal
- Core features:
  - File upload system for multiple report types
  - Form validation and sanitization
  - Email notifications for submissions
  - Confirmation emails for users
  - Support for multiple file formats (.xlsx, .xls, .docx, .doc, .pdf)
  - File size limit of 10MB
  - Automatic file naming with squadron number and report type

### Report Types
1. National Consolidated Squadron Report (NCSR)
2. Detachment Consolidated Squadron Report (DCSR)
3. Veterans Affairs & Rehabilitation (VA&R)
4. VAVS Volunteer of the Year
5. Americanism
6. Children & Youth (C&Y)
7. Squadron Information Report (SIR)
8. Annual Squadron Data Report (SDR)
9. Squadron Officer Change (SOC)
10. District Officers Report (DOR)

[1.0.2]: https://github.com/yourusername/reporting/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/yourusername/reporting/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/yourusername/reporting/releases/tag/v1.0.0 