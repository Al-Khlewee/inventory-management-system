'use client';

import { useEffect, useState } from 'react';
import { MedicalDevice } from '@/utils/data';
import DeviceForm from '@/app/components/DeviceForm';
import Link from 'next/link';

export default function EditDevicePage({ params }: { params: { id: string } }) {
  const [device, setDevice] = useState<MedicalDevice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
        <div className="text-xl text-red-600 mb-4 font-medium">Error: {error || 'Device not found'}</div>
        <Link href="/" className="text-teal-600 hover:text-teal-800">
          Return to inventory
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Link href={`/device/${params.id}`} className="inline-flex items-center text-teal-600 hover:text-teal-800 transition-colors font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to device details
        </Link>
      </div>
      
      <DeviceForm initialData={device} isEditMode={true} />
    </div>
  );
}