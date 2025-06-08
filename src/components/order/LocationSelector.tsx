'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, MapPin, Check } from 'lucide-react';
import Image from 'next/image';
// Assuming you have flags as separate components or images later
// Using emoji flags for now

interface Location {
  id: string;
  name: string;
  flag: string; 
  city?: string;
  continent?: string;
  ping?: number; // ms
  latency?: 'low' | 'medium' | 'high';
}

// Enhanced location data
export const locations: Location[] = [
  { id: 'us-dal', name: 'USA', city: 'Dallas', flag: '🇺🇸', continent: 'North America', ping: 45, latency: 'low' },
  { id: 'us-nyc', name: 'USA', city: 'New York', flag: '🇺🇸', continent: 'North America', ping: 60, latency: 'medium' },
  { id: 'uk-lon', name: 'UK', city: 'London', flag: '🇬🇧', continent: 'Europe', ping: 75, latency: 'medium' },
  { id: 'in', name: 'India', flag: '🇮🇳', continent: 'Asia', ping: 120, latency: 'high' },
  { id: 'de', name: 'Germany', flag: '🇩🇪', continent: 'Europe', ping: 65, latency: 'medium' },
  { id: 'fr', name: 'France', flag: '🇫🇷', continent: 'Europe', ping: 70, latency: 'medium' },
  { id: 'sg', name: 'Singapore', flag: '🇸🇬', continent: 'Asia', ping: 100, latency: 'medium' },
  { id: 'hk', name: 'Hong Kong', flag: '🇭🇰', continent: 'Asia', ping: 110, latency: 'high' },
  { id: 'sa', name: 'Saudi Arabia', flag: '🇸🇦', continent: 'Middle East', ping: 90, latency: 'medium' },
];

interface LocationSelectorProps {
  selectedLocation: string | null;
  onLocationChange: (locationId: string) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ selectedLocation, onLocationChange }) => {
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Group locations by continent
  const continents: string[] = [...new Set(locations
    .map(loc => loc.continent)
    .filter((continent): continent is string => continent !== undefined)
  )];
  
  // Filter locations based on active filter
  const filteredLocations = activeFilter 
    ? locations.filter(loc => loc.continent === activeFilter)
    : locations;

  // Get latency color
  const getLatencyColor = (latency: 'low' | 'medium' | 'high' | undefined) => {
    if (latency === 'low') return 'bg-green-500';
    if (latency === 'medium') return 'bg-yellow-500';
    if (latency === 'high') return 'bg-red-500';
    return 'bg-gray-400';
  };

  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-2 mr-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
        >
          <Globe size={20} />
        </motion.div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Server Location</h3>
          <p className="text-sm text-gray-500">Select the optimal server location for your application</p>
        </div>
      </div>

      {/* Continental filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveFilter(null)}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all
            ${activeFilter === null 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
          `}
        >
          All Regions
        </motion.button>
        
        {continents.map(continent => (
          <motion.button
            key={continent}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveFilter(continent && continent === activeFilter ? null : continent || null)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all
              ${activeFilter === continent 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            {continent}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredLocations.map((location, index) => (
          <motion.div
            key={location.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <motion.button
              type="button"
            onClick={() => onLocationChange(location.id)}
              onMouseEnter={() => setHoveredLocation(location.id)}
              onMouseLeave={() => setHoveredLocation(null)}
              whileHover={{ y: -5 }}
            className={`
                w-full p-4 rounded-xl border transition-all duration-200
              ${selectedLocation === location.id 
                  ? 'bg-white border-indigo-400 shadow-lg ring-2 ring-indigo-500/50' 
                  : 'bg-white/80 backdrop-blur-sm border-gray-200 hover:border-indigo-300 hover:shadow-md'}
              `}
            >
              <div className="flex items-start">
                {/* Flag and Check Icon */}
                <div className="relative mr-3">
                  <span className="text-3xl" role="img" aria-label={location.name}>{location.flag}</span>
                  {selectedLocation === location.id && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-1 -top-1 bg-indigo-600 rounded-full p-0.5"
                    >
                      <Check size={10} className="text-white" />
                    </motion.div>
                  )}
                </div>

                {/* Location Details */}
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-gray-900">{location.name}</h4>
                  <div className="flex items-center mt-0.5">
                    <MapPin size={12} className="text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">
                      {location.city || location.name}
            </span>
                  </div>
                </div>

                {/* Ping Indicator */}
                <div className="flex flex-col items-end">
                  <div className="flex items-center">
                    <span className={`h-2 w-2 rounded-full mr-1.5 ${getLatencyColor(location.latency)}`}></span>
                    <span className="text-xs font-medium text-gray-700">{location.ping} ms</span>
                  </div>
                  <span className="text-xs text-gray-400 mt-1">{location.continent}</span>
                </div>
              </div>

              {/* Progress bar when hovered or selected */}
              {(hoveredLocation === location.id || selectedLocation === location.id) && (
                <motion.div 
                  className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.div>
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Latency Legend */}
      <div className="mt-4 flex items-center justify-end space-x-4 text-xs text-gray-500">
        <div className="flex items-center">
          <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
          <span>Low Latency</span>
        </div>
        <div className="flex items-center">
          <span className="h-2 w-2 rounded-full bg-yellow-500 mr-1.5"></span>
          <span>Medium Latency</span>
        </div>
        <div className="flex items-center">
          <span className="h-2 w-2 rounded-full bg-red-500 mr-1.5"></span>
          <span>High Latency</span>
        </div>
      </div>
    </div>
  );
};

export default LocationSelector; 