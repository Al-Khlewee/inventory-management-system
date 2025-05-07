import { getMedicalDevices, addMedicalDevice } from '@/utils/data';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const devices = getMedicalDevices();
  return NextResponse.json(devices);
}

export async function POST(request: NextRequest) {
  try {
    const deviceData = await request.json();
    
    // Validate required fields
    if (!deviceData.DeviceName || !deviceData.Manufacturer || !deviceData.Model) {
      return NextResponse.json(
        { error: "Device name, manufacturer, and model are required" },
        { status: 400 }
      );
    }
    
    const success = addMedicalDevice(deviceData);
    
    if (success) {
      return NextResponse.json({ message: "Device added successfully" }, { status: 201 });
    } else {
      return NextResponse.json({ error: "Failed to add device" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error adding device:", error);
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
  }
}