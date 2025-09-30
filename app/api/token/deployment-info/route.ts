import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  try {
    const deploymentFile = path.join(process.cwd(), 'deployment-info.json');
    
    if (!fs.existsSync(deploymentFile)) {
      return NextResponse.json({ 
        error: 'Token not deployed yet',
        deployed: false 
      }, { status: 404 });
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf-8'));
    
    return NextResponse.json({
      deployed: true,
      ...deploymentInfo
    });

  } catch (error) {
    console.error('Error loading deployment info:', error);
    return NextResponse.json({ 
      error: 'Failed to load deployment info',
      deployed: false 
    }, { status: 500 });
  }
}
