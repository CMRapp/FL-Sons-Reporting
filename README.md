# FL SAL Reporting Portal

A modern web application for the Florida Sons of the American Legion (FL SAL) to handle report submissions. Built with Next.js 14 and TypeScript.

## Features

- Secure file upload system for multiple report types
- Form validation and sanitization
- Responsive design for all devices
- Real-time upload status feedback
- Modal notifications for successful submissions
- Secure file handling and validation
- Support for multiple file formats (JPG, PNG, PDF)
- Maximum file size limit of 10MB
- Automatic file naming with squadron number and report type
- Email notifications for report submissions

## Report Types

1. National Consolidated Squadron Report (NCSR)
2. Detachment Consolidated Squadron Report (DCSR)
3. Veterans Affairs & Rehabilitation (VA&R)
4. VAVS Volunteer of the Year
5. Americanism
6. Children & Youth (C&Y)
7. Squadron Information Report (SIR)
8. Annual Squadron Data Report (SDR)

## Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager
- Environment variables configured (see Environment Variables section)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd reporting
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with the following variables:
```env
ADMIN_EMAIL=your-admin-email@example.com
EMAIL_1=recipient1@example.com
EMAIL_2=recipient2@example.com
# ... Add more email variables as needed

# Email delivery (SMTP2GO — required for uploads; copy from detachment portal Vercel project)
SMTP2GO_API_KEY=api-...
SMTP_FROM_EMAIL=noreply@floridasons.org

# Squadron → district lookup + admin reporting sync (detachment-florida Postgres)
DETACHMENT_DATABASE_URL=postgresql://...

# User id for report_status.last_updated_by (optional if email resolves)
# DETACHMENT_REPORTING_USER_ID=1
# DETACHMENT_REPORTING_USER_EMAIL=reports@floridasons.org
```

When `DETACHMENT_DATABASE_URL` is set:

- Squadron number auto-fills **district** from the detachment `squadron` table.
- Successful uploads mark the report **Complete** on detachment **Admin → Reporting** (`report_status` + `squadron_reports`), except **SDR** (not in that dashboard).

Copy `DATABASE_URL` / `POSTGRES_URL` from the **detachment-florida** Vercel project. For `last_updated_by`, set `DETACHMENT_REPORTING_USER_ID` or `DETACHMENT_REPORTING_USER_EMAIL` (defaults to `reports@floridasons.org`, then first admin user).

**Email not arriving?** Recipients in the admin database only control *who* gets mail. Delivery requires **`SMTP2GO_API_KEY`** and **`SMTP_FROM_EMAIL`** on the **reporting** Vercel project (separate from `DETACHMENT_DATABASE_URL`). After deploy, sign in to `/admin` and call `GET /api/admin/email-status` (Bearer token) or `POST /api/admin/test-email` with `{ "reportId": "2" }` to verify SMTP.

## Development

Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

Build the application:
```bash
npm run build
# or
yarn build
```

Start the production server:
```bash
npm start
# or
yarn start
```

## Security Features

- File type validation
- File size limits
- Filename sanitization
- Input validation and sanitization
- XSS prevention
- Secure file handling
- Email validation
- Form data validation

## File Upload Specifications

- Maximum file size: 10MB
- Supported file types: JPG, JPEG, PNG, PDF
- File naming format: `FL-SQ[squadronNumber]-[reportName].[extension]`

## Environment Variables

Required environment variables in `.env.local`:

- `ADMIN_EMAIL`: Default email for notifications
- `EMAIL_1` through `EMAIL_8`: Report-specific recipient emails (fallback when not set in the admin database)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary and confidential. All rights reserved.

## Support

For support, please contact the FL SAL IT Committee or CMR Web Studio.
