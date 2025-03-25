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
9. Squadron Officer Change (SOC)
10. District Officers Report (DOR)

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
```

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
- `EMAIL_1` through `EMAIL_10`: Report-specific recipient emails

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary and confidential. All rights reserved.

## Support

For support, please contact the FL SAR IT Committee or CMR Web Studio.
