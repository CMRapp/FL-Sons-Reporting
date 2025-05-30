const favicons = require('favicons');
const fs = require('fs').promises;
const path = require('path');

const source = path.join(__dirname, '../public/fl-sons-150.png');
const outputDir = path.join(__dirname, '../public');

const configuration = {
  path: '/',
  appName: 'FL SAR Reporting Portal',
  appShortName: 'FL SAR',
  appDescription: 'Florida Sons of the American Revolution Reporting Portal',
  background: '#fff',
  theme_color: '#fff',
  icons: {
    android: true,
    appleIcon: true,
    appleStartup: false,
    coast: false,
    favicons: true,
    firefox: false,
    windows: false,
    yandex: false
  }
};

(async () => {
  try {
    const response = await favicons(source, configuration);

    // Save the generated files
    await Promise.all([
      fs.writeFile(path.join(outputDir, 'favicon.ico'), response.images.find(img => img.name === 'favicon.ico').contents),
      fs.writeFile(path.join(outputDir, 'favicon-16x16.png'), response.images.find(img => img.name === 'favicon-16x16.png').contents),
      fs.writeFile(path.join(outputDir, 'favicon-32x32.png'), response.images.find(img => img.name === 'favicon-32x32.png').contents),
      fs.writeFile(path.join(outputDir, 'apple-touch-icon.png'), response.images.find(img => img.name === 'apple-touch-icon.png').contents),
      fs.writeFile(path.join(outputDir, 'android-chrome-192x192.png'), response.images.find(img => img.name === 'android-chrome-192x192.png').contents),
      fs.writeFile(path.join(outputDir, 'android-chrome-512x512.png'), response.images.find(img => img.name === 'android-chrome-512x512.png').contents),
    ]);

    console.log('Favicon files have been generated successfully!');
  } catch (error) {
    console.error('An error occurred while generating favicons:', error);
  }
})();
