'use client';

import { useState, useEffect } from 'react';
import { MedicalDevice } from '@/utils/data';
import Link from 'next/link';

export default function Home() {
  const [devices, setDevices] = useState<MedicalDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    async function fetchDevices() {
      try {
        const response = await fetch('/api/devices');
        const data = await response.json();
        setDevices(data);
        
        // Extract unique categories and locations
        const uniqueCategories = Array.from(
          new Set(data.map((device: MedicalDevice) => device.DeviceCategory).filter(Boolean))
        );
        const uniqueLocations = Array.from(
          new Set(data.map((device: MedicalDevice) => device.DeviceLocation).filter(Boolean))
        );
        
        setCategories(uniqueCategories as string[]);
        setLocations(uniqueLocations as string[]);
      } catch (error) {
        console.error('Error fetching devices:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDevices();
  }, []);

  // Filter devices based on search term and selected filters
  const filteredDevices = devices.filter((device) => {
    const matchesSearch = 
      device.DeviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.SerialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.Manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.Model?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || device.DeviceCategory === filterCategory;
    const matchesLocation = !filterLocation || device.DeviceLocation === filterLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Calculate statistics
  const totalDevices = devices.length;
  const uniqueManufacturers = new Set(devices.map(device => device.Manufacturer)).size;
  const devicesWithWarranty = devices.filter(device => device.WarrantyPeriod).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
          <div className="text-xl font-medium text-teal-700 font-poppins">Loading inventory data...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Banner */}
      <div className="mb-8 bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold font-poppins tracking-tight">Medical Device Inventory Management Portal</h1>
        <p className="mt-2 opacity-90">AL NASIRIYA TEACHING HOSPITAL</p>
      </div>
      
      {/* Add New Device Button */}
      <div className="flex justify-end mb-6">
        <Link 
          href="/device/new"
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Device
        </Link>
      </div>
      
      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-teal-500 transition-all hover:shadow-lg">
          <div className="flex items-center">
            <div className="bg-teal-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600 font-poppins">{totalDevices}</div>
              <div className="text-slate-600 mt-1 text-sm">Total Medical Devices</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-cyan-500 transition-all hover:shadow-lg">
          <div className="flex items-center">
            <div className="bg-cyan-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan-600 font-poppins">{uniqueManufacturers}</div>
              <div className="text-slate-600 mt-1 text-sm">Unique Manufacturers</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500 transition-all hover:shadow-lg">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 font-poppins">{devicesWithWarranty}</div>
              <div className="text-slate-600 mt-1 text-sm">Devices with Warranty</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-teal-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search and Filter
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name, serial number, etc."
                className="w-full pl-10 p-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select 
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500" 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <select 
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500" 
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b">
          <h2 className="text-xl font-semibold text-slate-800">Medical Devices</h2>
          <div className="text-sm text-slate-600">
            Total: <span className="font-medium">{filteredDevices.length}</span> devices
            {(searchTerm || filterCategory || filterLocation) ? ' (filtered)' : ''}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Device Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Manufacturer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredDevices.map((device) => (
                <tr key={`${device.SequenceNumber}-${device.DeviceName}-${device.SerialNumber}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium">
                      {device.SequenceNumber || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{device.DeviceName}</div>
                    {device.SerialNumber && (
                      <div className="text-xs text-slate-500 mt-1">SN: {device.SerialNumber}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {device.Manufacturer || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {device.Model || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {device.DeviceCategory ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800">
                        {device.DeviceCategory}
                      </span>
                    ) : (
                      <span className="text-slate-500">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {device.DeviceLocation || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link 
                      href={`/device/${device.SequenceNumber}`}
                      className="text-teal-600 hover:text-teal-900 transition-colors inline-flex items-center"
                    >
                      <span>View Details</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
              
              {filteredDevices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-base">No devices found matching your criteria</p>
                      <button 
                        onClick={() => {
                          setSearchTerm('');
                          setFilterCategory('');
                          setFilterLocation('');
                        }}
                        className="mt-3 text-sm text-teal-600 hover:underline focus:outline-none"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
