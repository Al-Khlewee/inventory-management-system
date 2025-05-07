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
  ImageUrls: string[] | null;
}

// Helper to determine if we're in a Vercel production environment
const isVercelProduction = process.env.VERCEL === '1';

// In-memory store for production use on Vercel
let inMemoryDevices: MedicalDevice[] | null = null;

export function getMedicalDevices(): MedicalDevice[] {
  // For Vercel production environment, use in-memory storage or fetch from database/API
  if (isVercelProduction) {
    // Return in-memory data if available
    if (inMemoryDevices) return [...inMemoryDevices];
    
    // For initial load, use a starter dataset or empty array
    // In a real production app, you would fetch from a database here
    inMemoryDevices = [];
    return inMemoryDevices;
  }
  
  // For local development, continue using the local JSON file
  try {
    // Use a path within the project for better compatibility
    const filePath = path.join(process.cwd(), 'MDDB.json');
    
    // If the file doesn't exist in the standard location, try with ../ path
    if (!fs.existsSync(filePath)) {
      const altFilePath = path.join(process.cwd(), '..', 'MDDB.json');
      if (fs.existsSync(altFilePath)) {
        const jsonData = fs.readFileSync(altFilePath, 'utf8');
        return JSON.parse(jsonData);
      }
    } else {
      const jsonData = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(jsonData);
    }
    
    console.error('Medical devices data file not found');
    return [];
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
  // For Vercel production environment, use in-memory storage
  if (isVercelProduction) {
    try {
      inMemoryDevices = [...devices];
      return true;
    } catch (error) {
      console.error('Error saving medical devices data in memory:', error);
      return false;
    }
  }
  
  // For local development, continue using the local JSON file
  try {
    // Try to save to the standard location first
    const filePath = path.join(process.cwd(), 'MDDB.json');
    fs.writeFileSync(filePath, JSON.stringify(devices, null, 2), 'utf8');
    return true;
  } catch (error) {
    try {
      // If that fails, try to save to the parent directory
      const altFilePath = path.join(process.cwd(), '..', 'MDDB.json');
      fs.writeFileSync(altFilePath, JSON.stringify(devices, null, 2), 'utf8');
      return true;
    } catch (innerError) {
      console.error('Error saving medical devices data:', innerError);
      return false;
    }
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