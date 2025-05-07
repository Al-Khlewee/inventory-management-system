'use client';

import { useState, useEffect } from 'react';
import { MedicalDevice } from '@/utils/data';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface DeviceFormProps {
  initialData?: MedicalDevice;
  isEditMode?: boolean;
}

export default function DeviceForm({ initialData, isEditMode = false }: DeviceFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState<MedicalDevice>(initialData || {
    SequenceNumber: null,
    DeviceName: '',
    SerialNumber: null,
    Manufacturer: '',
    Model: '',
    CountryOfOrigin: null,
    DeviceCategory: null,
    DeviceLocation: null,
    Supplier: '',
    ITM: '',
    Accessories: null,
    Details: null,
    WarrantyPeriod: null,
    RecipientName: null,
    CommissioningDate: null,
    DeviceStatus: null,
    ReceiptFormNumber: null,
    ImageUrls: null
  });

  useEffect(() => {
    async function fetchMetadata() {
      try {
        // Fetch categories and locations for dropdown menus
        const response = await fetch('/api/devices');
        const devices = await response.json();
        
        // Extract unique categories and locations
        const uniqueCategories = Array.from(
          new Set(devices.map((device: MedicalDevice) => device.DeviceCategory).filter(Boolean))
        );
        const uniqueLocations = Array.from(
          new Set(devices.map((device: MedicalDevice) => device.DeviceLocation).filter(Boolean))
        );
        
        setCategories(uniqueCategories as string[]);
        setLocations(uniqueLocations as string[]);
      } catch (error) {
        console.error('Error fetching form metadata:', error);
      }
    }

    fetchMetadata();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (url: string) => {
    if (formData.ImageUrls) {
      setFormData(prev => ({
        ...prev,
        ImageUrls: prev.ImageUrls?.filter(imgUrl => imgUrl !== url) || null
      }));
    }
  };

  const uploadImages = async (deviceId: number): Promise<string[]> => {
    if (imageFiles.length === 0) {
      return [];
    }

    setIsUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      // Upload each image and get its URL
      for (let i = 0; i < imageFiles.length; i++) {
        const formData = new FormData();
        formData.append('file', imageFiles[i]);
        formData.append('deviceId', deviceId.toString());
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Error uploading image ${i + 1}`);
        }
        
        const data = await response.json();
        uploadedUrls.push(data.filePath);
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / imageFiles.length) * 100));
      }
      
      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // First save/update the device to get its ID
      const url = isEditMode 
        ? `/api/devices/${formData.SequenceNumber}` 
        : '/api/devices';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const deviceResponse = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!deviceResponse.ok) {
        const errorData = await deviceResponse.json();
        throw new Error(errorData.error || 'Failed to save device');
      }

      // For new devices, get the device data to get the assigned ID
      let deviceId = formData.SequenceNumber as number;
      if (!isEditMode) {
        const allDevices = await fetch('/api/devices').then(res => res.json());
        // Find the newly created device (should be the one with the highest sequence number)
        const newDevice = allDevices.reduce((latest: MedicalDevice | null, device: MedicalDevice) => {
          if (!latest || (device.SequenceNumber && latest.SequenceNumber && device.SequenceNumber > latest.SequenceNumber)) {
            return device;
          }
          return latest;
        }, null);
        
        if (newDevice) {
          deviceId = newDevice.SequenceNumber as number;
        }
      }

      // Upload images if there are any
      if (imageFiles.length > 0 && deviceId) {
        const uploadedUrls = await uploadImages(deviceId);
        
        // Update the device with image URLs
        if (uploadedUrls.length > 0) {
          const existingUrls = formData.ImageUrls || [];
          const combinedUrls = [...existingUrls, ...uploadedUrls];
          
          const updateResponse = await fetch(`/api/devices/${deviceId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...formData,
              ImageUrls: combinedUrls
            }),
          });
          
          if (!updateResponse.ok) {
            console.error('Failed to update device with image URLs');
          }
        }
      }

      // Redirect to the device page or back to inventory
      router.push(isEditMode ? `/device/${formData.SequenceNumber}` : '/');
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6 text-teal-700">
        {isEditMode ? 'Edit Device' : 'Add New Device'}
      </h2>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="DeviceName"
                value={formData.DeviceName}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serial Number
              </label>
              <input
                type="text"
                name="SerialNumber"
                value={formData.SerialNumber || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manufacturer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Manufacturer"
                value={formData.Manufacturer}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Model"
                value={formData.Model}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country of Origin
              </label>
              <input
                type="text"
                name="CountryOfOrigin"
                value={formData.CountryOfOrigin || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device Category
              </label>
              <select
                name="DeviceCategory"
                value={formData.DeviceCategory || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device Location
              </label>
              <select
                name="DeviceLocation"
                value={formData.DeviceLocation || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select Location</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier
              </label>
              <input
                type="text"
                name="Supplier"
                value={formData.Supplier || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ITM
              </label>
              <input
                type="text"
                name="ITM"
                value={formData.ITM || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warranty Period
              </label>
              <input
                type="text"
                name="WarrantyPeriod"
                value={formData.WarrantyPeriod || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device Status
              </label>
              <select
                name="DeviceStatus"
                value={formData.DeviceStatus || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select Status</option>
                <option value="Operational">Operational</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Faulty">Faulty</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Accessories
          </label>
          <textarea
            name="Accessories"
            value={formData.Accessories || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            rows={3}
          ></textarea>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Details
          </label>
          <textarea
            name="Details"
            value={formData.Details || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            rows={3}
          ></textarea>
        </div>

        {/* Image Upload Section */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Device Images
          </label>
          
          <div className="flex items-center space-x-4 mb-4">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <label
              htmlFor="image-upload"
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 cursor-pointer"
            >
              Select Images
            </label>
            <span className="text-sm text-gray-500">
              {imageFiles.length > 0 ? `${imageFiles.length} file(s) selected` : 'No files selected'}
            </span>
          </div>

          {/* Image Upload Progress */}
          {isUploading && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-teal-600 h-2.5 rounded-full transition-all" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">Uploading: {uploadProgress}%</p>
            </div>
          )}
          
          {/* Selected images preview */}
          {imageFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imageFiles.map((file, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <div className="aspect-square overflow-hidden bg-gray-100 rounded-md">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Selected image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing images (in edit mode) */}
          {isEditMode && formData.ImageUrls && formData.ImageUrls.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {formData.ImageUrls.map((url, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <div className="aspect-square overflow-hidden bg-gray-100 rounded-md">
                      <Image
                        src={url}
                        alt={`Device image ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
          >
            {isSubmitting || isUploading ? 'Saving...' : isEditMode ? 'Update Device' : 'Add Device'}
          </button>
        </div>
      </form>
    </div>
  );
}