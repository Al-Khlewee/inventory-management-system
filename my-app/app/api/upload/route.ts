import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const deviceId = formData.get('deviceId') as string;
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

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