import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, LayersControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as LeafletMap } from 'leaflet';

interface WeatherMapProps {
  isActive: boolean;
}

// Map controller component
const MapController: React.FC<{ isActive: boolean; position: [number, number] }> = ({ isActive, position }) => {
  const map = useMap();
  
  // Handle initial map setup
  useEffect(() => {
    map.setView(position, 7);
    map.invalidateSize();
  }, [map, position]);
  
  // Handle resize when section becomes active
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isActive, map]);
  
  return null;
};

const WeatherMap: React.FC<WeatherMapProps> = ({ isActive }) => {
  const [position, setPosition] = useState<[number, number]>([43.6532, -79.3832]); // Toronto default
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;

    const getUserLocation = () => {
      if (!navigator.geolocation) {
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (mounted) {
            setPosition([pos.coords.latitude, pos.coords.longitude]);
            setLoading(false);
          }
        },
        (err) => {
          console.error('Geolocation error:', err);
          if (mounted) {
            setLoading(false);
          }
        },
        {
          timeout: 10000,
          maximumAge: 300000,
          enableHighAccuracy: false
        }
      );
    };

    getUserLocation();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
          <p className="text-white text-xl">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-5xl font-light text-white mb-2">Weather Map</h2>
        <div className="h-1 w-48 mx-auto bg-gradient-to-r from-transparent via-green-500 to-transparent rounded-full"></div>
      </div>

      {/* Map Container */}
      <div 
        ref={containerRef}
        className="w-full max-w-7xl rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-gray-900/50 backdrop-blur-sm"
        style={{ 
          height: '70vh',
          minHeight: '500px',
          maxHeight: '800px'
        }}
      >
        <MapContainer
          ref={mapRef}
          center={position}
          zoom={7}
          scrollWheelZoom={true}
          style={{ 
            height: '100%', 
            width: '100%'
          }}
          zoomControl={true}
          attributionControl={true}
          preferCanvas={true}
        >
          {/* Base Map */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Weather Layers */}
          <LayersControl position="topright">
            <LayersControl.Overlay name="Temperature">
              <TileLayer
                url="/api/map_tile/temp_new/{z}/{x}/{y}/"
                opacity={0.6}
              />
            </LayersControl.Overlay>

            <LayersControl.Overlay name="Precipitation">
              <TileLayer
                url="/api/map_tile/precipitation_new/{z}/{x}/{y}/"
                opacity={0.6}
              />
            </LayersControl.Overlay>

            <LayersControl.Overlay name="Wind Speed">
              <TileLayer
                url="/api/map_tile/wind_new/{z}/{x}/{y}/"
                opacity={0.6}
              />
            </LayersControl.Overlay>

            <LayersControl.Overlay name="Clouds">
              <TileLayer
                url="/api/map_tile/clouds_new/{z}/{x}/{y}/"
                opacity={0.6}
              />
            </LayersControl.Overlay>
          </LayersControl>

          {/* Map Controller */}
          <MapController isActive={isActive} position={position} />
        </MapContainer>
      </div>
    </div>
  );
};

export default WeatherMap;