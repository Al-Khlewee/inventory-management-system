import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
  maxDuration: 10, // Maximum duration for the function in seconds
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const deviceId = formData.get('deviceId') as string;
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check if we're in Vercel production environment
    const isVercelProduction = process.env.VERCEL === '1';
    
    if (isVercelProduction) {
      // In production, we can't write to the filesystem
      // Instead, return a mock URL or integrate with a storage service like S3
      // For demo purposes, we'll just return a mock URL
      const mockPublicPath = `/mock-uploads/devices/${deviceId}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      
      return NextResponse.json({ 
        success: true,
        filePath: mockPublicPath,
        note: "This is a mock path. In production, use a storage service like AWS S3."
      }, { status: 200 });
    }
    
    // For local development, continue using the local filesystem
    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'devices', deviceId);
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/\s+/g, '-')}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the file
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    // Return the path that can be used to access the file
    const publicPath = `/uploads/devices/${deviceId}/${filename}`;
    
    return NextResponse.json({ 
      success: true,
      filePath: publicPath 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error handling file upload:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}