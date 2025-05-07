import { getMedicalDevices, updateMedicalDevice, deleteMedicalDevice } from '@/utils/data';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const deviceId = parseInt(params.id, 10);
  const devices = getMedicalDevices();
  const device = devices.find(d => d.SequenceNumber === deviceId);
  
  if (!device) {
    return NextResponse.json({
      error: 'Device not found'
    }, {
      status: 404
    });
  }
  
  return NextResponse.json(device);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const deviceId = parseInt(params.id, 10);
  const updatedDeviceData = await request.json();
  
  // Validate the device exists before updating
  const devices = getMedicalDevices();
  const existingDevice = devices.find(d => d.SequenceNumber === deviceId);
  
  if (!existingDevice) {
    return NextResponse.json({
      error: 'Device not found'
    }, {
      status: 404
    });
  }
  
  // Ensure we keep the correct sequence number
  updatedDeviceData.SequenceNumber = deviceId;
  
  // If the device has existing images and we're adding new ones, merge them
  if (existingDevice.ImageUrls && updatedDeviceData.ImageUrls) {
    // Filter out any duplicates when merging
    const existingUrls = new Set(existingDevice.ImageUrls);
    updatedDeviceData.ImageUrls.forEach((url: string) => existingUrls.add(url));
    updatedDeviceData.ImageUrls = Array.from(existingUrls);
  } else if (existingDevice.ImageUrls && !updatedDeviceData.ImageUrls) {
    // Keep existing images if none provided in update
    updatedDeviceData.ImageUrls = existingDevice.ImageUrls;
  }
  
  const success = updateMedicalDevice(updatedDeviceData);
  
  if (success) {
    return NextResponse.json({
      message: 'Device updated successfully'
    }, {
      status: 200
    });
  } else {
    return NextResponse.json({
      error: 'Failed to update device'
    }, {
      status: 500
    });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const deviceId = parseInt(params.id, 10);
  const success = deleteMedicalDevice(deviceId);
  
  if (success) {
    return NextResponse.json({
      message: 'Device deleted successfully'
    }, {
      status: 200
    });
  } else {
    return NextResponse.json({
      error: 'Device not found'
    }, {
      status: 404
    });
  }
}