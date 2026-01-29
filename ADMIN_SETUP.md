# Admin Panel Setup Guide

## Overview

The admin panel allows you to manage report email addresses through a web interface instead of editing environment variables. This makes it easier to update email addresses for different report types throughout the year.

## Features

1. **Web-Based Configuration**: Update email addresses through a secure admin interface
2. **Automatic Service Year**: The service year (e.g., 2025-2026) automatically updates on July 1st each year
3. **Audit Trail**: Tracks who made changes and when
4. **Fallback Support**: Falls back to environment variables if config file is unavailable

## Initial Setup

### 1. Set Admin Password

Add the following to your `.env.local` file:

```bash
ADMIN_PASSWORD=your_secure_password_here
```

**Important**: Choose a strong password and keep it secure!

### 2. Populate Initial Configuration

Run the migration script to populate the config file with existing email addresses:

```bash
npm install dotenv
node scripts/populate-config.js
```

This will read the current EMAIL_1 through EMAIL_10 environment variables and populate the `app/config/reportEmails.json` file.

### 3. Access the Admin Panel

Visit `https://your-domain.com/admin` and log in with your admin password.

## Using the Admin Panel

### Logging In

1. Navigate to `/admin`
2. Enter your admin password (set in `ADMIN_PASSWORD` environment variable)
3. Click "Login"

### Updating Email Addresses

1. After logging in, you'll see all 10 report types
2. Enter or update the email address for each report
3. Enter your name in the "Your Name" field (required for audit trail)
4. Click "Save Configuration"

### Report Types

The system manages email addresses for these report types:

1. **NCSR** - National Consolidated Squadron Report
2. **DCSR** - Detachment Consolidated Squadron Report
3. **VA&R** - Veterans Affairs & Rehabilitation
4. **VAVS-VOY** - VAVS Volunteer of the Year
5. **AMERICANISM** - Americanism
6. **C&Y** - Children & Youth
7. **SIR** - Squadron Information Report
8. **SDR** - Annual Squadron Data Report
9. **SOC** - Squadron Officer Change
10. **DOR** - District Officers Report

## Service Year Logic

The service year automatically updates based on the following logic:

- **Service Year Period**: July 1 - June 30
- **Before July 1**: Shows previous year to current year (e.g., 2024-2025)
- **On/After July 1**: Shows current year to next year (e.g., 2025-2026)

Example:
- June 30, 2025 → Service Year: 2024-2025
- July 1, 2025 → Service Year: 2025-2026

## Configuration File

The email addresses are stored in `app/config/reportEmails.json`:

```json
{
  "reportEmails": {
    "1": {
      "reportName": "NCSR",
      "fullName": "National Consolidated Squadron Report",
      "email": "reports@floridasons.org"
    },
    ...
  },
  "lastUpdated": "2025-01-14T12:00:00.000Z",
  "updatedBy": "Admin Name"
}
```

## Fallback Behavior

The system uses this priority order for email addresses:

1. **Config File**: First checks `reportEmails.json`
2. **Environment Variables**: Falls back to `EMAIL_1` through `EMAIL_10`
3. **Error**: Returns error if neither is available

This ensures backward compatibility with existing environment variable setup.

## Security Notes

1. **Password Protection**: The admin panel is protected by the `ADMIN_PASSWORD` environment variable
2. **No Database Required**: Configuration is stored in a JSON file
3. **Audit Trail**: All changes are logged with timestamp and user name
4. **Vercel Deployment**: The config file persists across deployments when committed to git

## Environment Variables

### Required for Admin Panel

```bash
ADMIN_PASSWORD=your_secure_password_here
```

### Optional (Fallback)

These are still used as fallback if config file is unavailable:

```bash
EMAIL_1=reports@floridasons.org
EMAIL_2=csr@floridasons.org
EMAIL_3=var@floridasons.org
EMAIL_4=var@floridasons.org
EMAIL_5=amer.reports@floridasons.org
EMAIL_6=cy.reports@floridasons.org
EMAIL_7=reports@floridasons.org
EMAIL_8=sdr@floridasons.org
EMAIL_9=reports@floridasons.org
EMAIL_10=reports@floridasons.org
```

## Troubleshooting

### "Unauthorized" Error

- Verify `ADMIN_PASSWORD` is set in environment variables
- Check that you're entering the correct password
- Ensure environment variables are loaded (restart dev server if needed)

### Email Not Sending

- Check that email address is properly configured in admin panel
- Verify SMTP2GO settings are correct
- Check server logs for specific error messages

### Config File Not Found

- Ensure `app/config/reportEmails.json` exists
- Run the population script: `node scripts/populate-config.js`
- System will fallback to environment variables if file is missing

## Deployment to Vercel

1. Set `ADMIN_PASSWORD` in Vercel environment variables
2. Commit the `reportEmails.json` file to git
3. Deploy as normal
4. Access admin panel at `https://your-domain.com/admin`

## Future Enhancements

Possible improvements for future versions:

- Database integration for multi-admin support
- Role-based access control
- Email template customization
- Notification settings
- Report submission analytics
