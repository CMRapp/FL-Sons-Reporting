/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'floridasons.org',
        port: '',
        pathname: '/**',
      },
    ],
    domains: ['floridasons.org'],
  },
  env: {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    EMAIL_1: process.env.EMAIL_1,
    EMAIL_2: process.env.EMAIL_2,
    EMAIL_3: process.env.EMAIL_3,
    EMAIL_4: process.env.EMAIL_4,
    EMAIL_5: process.env.EMAIL_5,
    EMAIL_6: process.env.EMAIL_6,
    EMAIL_7: process.env.EMAIL_7,
    EMAIL_8: process.env.EMAIL_8,
    EMAIL_9: process.env.EMAIL_9,
    EMAIL_10: process.env.EMAIL_10,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig; 