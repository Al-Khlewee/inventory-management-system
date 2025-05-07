import fs from 'fs';
import path from 'path';

export interface MedicalDevice {
  SequenceNumber: number | null;
  DeviceName: string;
  SerialNumber: string | null;
  Manufacturer: string;
  Model: string;
  CountryOfOrigin: string | null;
  DeviceCategory: string | null;
  DeviceLocation: string | null;
  Supplier: string;
  ITM: number | string;
  Accessories: string | null;
  Details: string | null;
  WarrantyPeriod: string | null;
  RecipientName: string | null;
  CommissioningDate: string | null;
  DeviceStatus: string | null;
  ReceiptFormNumber: string | null;
  ImageUrls: string[] | null; // Added image URLs array to store multiple images
}

export function getMedicalDevices(): MedicalDevice[] {
  const filePath = path.join(process.cwd(), '..', 'MDDB.json');
  try {
    const jsonData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error loading medical devices data:', error);
    return [];
  }
}

export function getDeviceCategories(): string[] {
  const devices = getMedicalDevices();
  const categories = new Set<string>();
  
  devices.forEach(device => {
    if (device.DeviceCategory) {
      categories.add(device.DeviceCategory);
    }
  });
  
  return Array.from(categories).sort();
}

export function getDeviceLocations(): string[] {
  const devices = getMedicalDevices();
  const locations = new Set<string>();
  
  devices.forEach(device => {
    if (device.DeviceLocation) {
      locations.add(device.DeviceLocation);
    }
  });
  
  return Array.from(locations).sort();
}

export function getManufacturers(): string[] {
  const devices = getMedicalDevices();
  const manufacturers = new Set<string>();
  
  devices.forEach(device => {
    if (device.Manufacturer) {
      manufacturers.add(device.Manufacturer);
    }
  });
  
  return Array.from(manufacturers).sort();
}

export function saveMedicalDevices(devices: MedicalDevice[]): boolean {
  const filePath = path.join(process.cwd(), '..', 'MDDB.json');
  try {
    fs.writeFileSync(filePath, JSON.stringify(devices, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving medical devices data:', error);
    return false;
  }
}

export function addMedicalDevice(device: MedicalDevice): boolean {
  const devices = getMedicalDevices();
  
  // Assign sequence number if not provided
  if (!device.SequenceNumber) {
    const maxSequence = Math.max(...devices
      .filter(d => d.SequenceNumber !== null)
      .map(d => d.SequenceNumber as number), 0);
    device.SequenceNumber = maxSequence + 1;
  }
  
  devices.push(device);
  return saveMedicalDevices(devices);
}

export function updateMedicalDevice(updatedDevice: MedicalDevice): boolean {
  const devices = getMedicalDevices();
  const index = devices.findIndex(d => 
    d.SequenceNumber === updatedDevice.SequenceNumber
  );
  
  if (index === -1) {
    return false;
  }
  
  devices[index] = updatedDevice;
  return saveMedicalDevices(devices);
}

export function deleteMedicalDevice(sequenceNumber: number): boolean {
  const devices = getMedicalDevices();
  const filteredDevices = devices.filter(d => d.SequenceNumber !== sequenceNumber);
  
  if (filteredDevices.length === devices.length) {
    return false; // No device was found with the given sequence number
  }
  
  return saveMedicalDevices(filteredDevices);
}