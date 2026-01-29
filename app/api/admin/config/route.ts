import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CONFIG_PATH = path.join(process.cwd(), 'app', 'config', 'reportEmails.json');

// Helper function to verify admin credentials
function verifyAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD not configured');
    return false;
  }
  
  return token === adminPassword;
}

// GET - Retrieve current configuration
export async function GET(request: NextRequest) {
  try {
    // Check if admin is authenticated
    if (!verifyAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const configData = await fs.readFile(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(configData);
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error reading config:', error);
    return NextResponse.json(
      { error: 'Failed to read configuration' },
      { status: 500 }
    );
  }
}

// POST - Update configuration
export async function POST(request: NextRequest) {
  try {
    // Check if admin is authenticated
    if (!verifyAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reportEmails, updatedBy } = body;

    if (!reportEmails) {
      return NextResponse.json(
        { error: 'Missing reportEmails in request body' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const [id, report] of Object.entries(reportEmails)) {
      const { email } = report as { email: string };
      if (email && !emailRegex.test(email)) {
        return NextResponse.json(
          { error: `Invalid email format for ${id}` },
          { status: 400 }
        );
      }
    }

    const updatedConfig = {
      reportEmails,
      lastUpdated: new Date().toISOString(),
      updatedBy: updatedBy || 'Admin'
    };

    await fs.writeFile(CONFIG_PATH, JSON.stringify(updatedConfig, null, 2), 'utf-8');

    return NextResponse.json({ 
      success: true, 
      message: 'Configuration updated successfully',
      config: updatedConfig
    });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}
