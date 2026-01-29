/**
 * Script to migrate existing report email configuration from JSON to database
 * 
 * Run with: npx tsx scripts/migrate-to-database.ts
 */

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables from .env.local
config({ path: '.env.local' });
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔄 Starting migration from JSON to database...\n');

    // Read the JSON config file
    const configPath = path.join(process.cwd(), 'app', 'config', 'reportEmails.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configData);

    // Migrate report emails
    console.log('📧 Migrating report emails...');
    for (const [reportId, report] of Object.entries(config.reportEmails)) {
      const reportData = report as {
        reportName: string;
        fullName: string;
        email: string;
      };

      await prisma.reportEmail.upsert({
        where: { reportId },
        update: {
          reportName: reportData.reportName,
          fullName: reportData.fullName,
          email: reportData.email || '',
        },
        create: {
          reportId,
          reportName: reportData.reportName,
          fullName: reportData.fullName,
          email: reportData.email || '',
        },
      });

      console.log(`  ✓ ${reportData.reportName}: ${reportData.email || '(not set)'}`);
    }

    // Store metadata
    if (config.lastUpdated) {
      await prisma.configMetadata.upsert({
        where: { key: 'last_migrated' },
        update: {
          value: new Date().toISOString(),
          updatedBy: 'Migration Script',
        },
        create: {
          key: 'last_migrated',
          value: new Date().toISOString(),
          updatedBy: 'Migration Script',
        },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'migrate',
        entity: 'report_email',
        changes: JSON.stringify({ source: 'JSON file', destination: 'Database' }),
        performedBy: 'Migration Script',
      },
    });

    console.log('\n✅ Migration completed successfully!');
    console.log(`📊 Migrated ${Object.keys(config.reportEmails).length} report email configurations`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
