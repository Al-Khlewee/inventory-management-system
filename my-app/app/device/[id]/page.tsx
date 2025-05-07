'use client';

import { useState, useEffect } from 'react';
import { MedicalDevice } from '@/utils/data';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function DeviceDetail({ params }: { params: { id: string } }) {
  const [device, setDevice] = useState<MedicalDevice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function fetchDevice() {
      try {
        const response = await fetch(`/api/devices/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Device not found');
        }
        
        const data = await response.json();
        setDevice(data);
      } catch (err) {
        console.error('Error fetching device:', err);
        setError(err instanceof Error ? err.message : 'Failed to load device');
      } finally {
        setLoading(false);
      }
    }

    fetchDevice();
  }, [params.id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/devices/${params.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete device');
      }
      
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error deleting device:', error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const nextImage = () => {
    if (device?.ImageUrls && device.ImageUrls.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % device.ImageUrls.length);
    }
  };

  const prevImage = () => {
    if (device?.ImageUrls && device.ImageUrls.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + device.ImageUrls.length) % device.ImageUrls.length);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
          <div className="text-xl font-medium text-teal-700">Loading device information...</div>
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
        <div className="text-xl text-red-600 mb-4 font-medium">Error: {error || 'Device not found'}</div>
        <Link href="/" className="inline-flex items-center text-teal-600 hover:text-teal-800 transition-colors font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to inventory
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    status = status.toLowerCase();
    if (status.includes("active") || status.includes("operational")) 
      return "bg-green-100 text-green-800";
    if (status.includes("maintenance")) 
      return "bg-yellow-100 text-yellow-800";
    if (status.includes("retired") || status.includes("faulty")) 
      return "bg-red-100 text-red-800";
    
    return "bg-blue-100 text-blue-800";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Link href="/" className="inline-flex items-center text-teal-600 hover:text-teal-800 transition-colors font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to inventory
        </Link>
        
        <div className="flex space-x-2">
          <Link 
            href={`/device/${device?.SequenceNumber}/edit`} 
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete "{device?.DeviceName}"? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Device'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white p-6">
          <div className="flex items-center">
            <div className="bg-white/20 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold font-poppins">{device.DeviceName}</h1>
              <div className="text-sm opacity-90 mt-1 flex items-center">
                <span className="mr-3">Category: {device.DeviceCategory || 'N/A'}</span>
                <span className="inline-block h-1 w-1 rounded-full bg-white/50 mr-3"></span>
                <span>Model: {device.Model || 'N/A'}</span>
              </div>
              <div className="text-xs opacity-75 mt-1">AL NASIRIYA TEACHING HOSPITAL</div>
            </div>
          </div>
        </div>

        {/* Device Image Section */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          {device.ImageUrls && device.ImageUrls.length > 0 ? (
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-md h-64 rounded-lg overflow-hidden shadow-inner mb-4">
                <Image
                  src={device.ImageUrls[currentImageIndex]}
                  alt={`${device.DeviceName} image ${currentImageIndex + 1}`}
                  fill
                  className="object-contain"
                  priority
                />
                
                {/* Image navigation arrows */}
                {device.ImageUrls.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              
              {/* Image thumbnails */}
              {device.ImageUrls.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2 max-w-full">
                  {device.ImageUrls.map((url, index) => (
                    <button 
                      key={url} 
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-16 h-16 rounded border-2 overflow-hidden flex-shrink-0 transition-all
                        ${currentImageIndex === index ? 'border-teal-500 scale-105' : 'border-transparent opacity-70'}`}
                    >
                      <Image
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              
              <p className="text-sm text-gray-500 mt-2">
                {device.ImageUrls.length > 1 
                  ? `Image ${currentImageIndex + 1} of ${device.ImageUrls.length}`
                  : ''}
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-full max-w-md h-64 bg-slate-100 flex items-center justify-center border rounded-lg">
                <div className="text-slate-400 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2">No images available</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column - Basic information */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-teal-700 border-b border-teal-100 pb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Basic Information
              </h2>
              
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4 p-2 hover:bg-slate-50 rounded transition-colors">
                  <div className="text-slate-600 font-medium">Manufacturer</div>
                  <div className="col-span-2 font-medium text-slate-800">{device.Manufacturer || 'N/A'}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 p-2 hover:bg-slate-50 rounded transition-colors">
                  <div className="text-slate-600 font-medium">Model</div>
                  <div className="col-span-2 text-slate-800">{device.Model || 'N/A'}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 p-2 hover:bg-slate-50 rounded transition-colors">
                  <div className="text-slate-600 font-medium">Serial Number</div>
                  <div className="col-span-2 font-mono bg-slate-100 px-2 py-1 rounded text-sm text-slate-800 tracking-wide">
                    {device.SerialNumber || 'N/A'}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 p-2 hover:bg-slate-50 rounded transition-colors">
                  <div className="text-slate-600 font-medium">ITM</div>
                  <div className="col-span-2 text-slate-800">{device.ITM || 'N/A'}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 p-2 hover:bg-slate-50 rounded transition-colors">
                  <div className="text-slate-600 font-medium">Country of Origin</div>
                  <div className="col-span-2 text-slate-800">{device.CountryOfOrigin || 'N/A'}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 p-2 hover:bg-slate-50 rounded transition-colors">
                  <div className="text-slate-600 font-medium">Location</div>
                  <div className="col-span-2 text-slate-800">{device.DeviceLocation || 'N/A'}</div>
                </div>
              </div>

              <h2 className="text-lg font-semibold mb-4 text-teal-700 border-b border-teal-100 pb-2 mt-8 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Warranty Information
              </h2>
              
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4 p-2 hover:bg-slate-50 rounded transition-colors">
                  <div className="text-slate-600 font-medium">Warranty Period</div>
                  <div className="col-span-2">{device.WarrantyPeriod || 'N/A'}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 p-2 hover:bg-slate-50 rounded transition-colors">
                  <div className="text-slate-600 font-medium">Device Status</div>
                  <div className="col-span-2">
                    {device.DeviceStatus ? (
                      <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(device.DeviceStatus)}`}>
                        {device.DeviceStatus}
                      </span>
                    ) : (
                      <span className="text-gray-500">Not specified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Additional details */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-teal-700 border-b border-teal-100 pb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Additional Details
              </h2>
              
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4 p-2 hover:bg-slate-50 rounded transition-colors">
                  <div className="text-slate-600 font-medium">Supplier</div>
                  <div className="col-span-2 text-slate-800">{device.Supplier || 'N/A'}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 p-2 hover:bg-slate-50 rounded transition-colors">
                  <div className="text-slate-600 font-medium">Recipient</div>
                  <div className="col-span-2 text-slate-800">{device.RecipientName || 'N/A'}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 p-2 hover:bg-slate-50 rounded transition-colors">
                  <div className="text-slate-600 font-medium">Commissioning Date</div>
                  <div className="col-span-2 text-slate-800">{device.CommissioningDate || 'Not specified'}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 p-2 hover:bg-slate-50 rounded transition-colors">
                  <div className="text-slate-600 font-medium">Receipt Form #</div>
                  <div className="col-span-2 font-mono bg-slate-100 px-2 py-1 rounded text-sm text-slate-800 tracking-wide">
                    {device.ReceiptFormNumber || 'N/A'}
                  </div>
                </div>
              </div>

              <h2 className="text-lg font-semibold mb-4 text-teal-700 border-b border-teal-100 pb-2 mt-8 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Accessories
              </h2>
              
              {device.Accessories ? (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-700 shadow-inner font-medium">
                  <p>{device.Accessories}</p>
                </div>
              ) : (
                <p className="text-slate-500 italic">No accessories listed</p>
              )}

              {device.Details && device.Details !== "URL" && (
                <>
                  <h2 className="text-lg font-semibold mb-4 text-teal-700 border-b border-teal-100 pb-2 mt-8 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Additional Notes
                  </h2>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-700 shadow-inner font-medium">
                    <p style={{ lineHeight: '1.5' }}>{device.Details}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}