# Changelog

All notable changes to the FL SAL Reporting Portal will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.0.2]: https://github.com/yourusername/reporting/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/yourusername/reporting/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/yourusername/reporting/releases/tag/v1.0.0 