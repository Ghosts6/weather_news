import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

declare const L: any;

interface WeatherMapProps {
  isActive: boolean;
}

const WeatherMap: React.FC<WeatherMapProps> = ({ isActive }) => {
  const [position, setPosition] = useState<[number, number]>([43.6532, -79.3832]); // Toronto default
  const [loading, setLoading] = useState(true);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const lightTilesRef = useRef<any | null>(null);
  const darkTilesRef = useRef<any | null>(null);
  const { isDarkMode } = useTheme();

  // Geolocation logic
  useEffect(() => {
    let mounted = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (mounted) {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Geolocation error, using default.', err);
        if (mounted) setLoading(false);
      },
      { timeout: 10000 }
    );
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setIsMapVisible(isActive);
  }, [isActive]);

  // Core effect to create, update, and destroy the Leaflet map
  useEffect(() => {
    if (!isMapVisible || !mapContainerRef.current) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView(position, 7);
      mapInstanceRef.current = map;

      lightTilesRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });

      darkTilesRef.current = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMaptiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });

      // Add initial base layer
      if (isDarkMode) {
        darkTilesRef.current.addTo(map);
      } else {
        lightTilesRef.current.addTo(map);
      }

      // Add weather overlay layers
      const tempLayer = L.tileLayer('/api/map_tile/temp_new/{z}/{x}/{y}/', { opacity: 0.6 });
      const precipLayer = L.tileLayer('/api/map_tile/precipitation_new/{z}/{x}/{y}/', { opacity: 0.6 });
      const windLayer = L.tileLayer('/api/map_tile/wind_new/{z}/{x}/{y}/', { opacity: 0.6 });
      const cloudsLayer = L.tileLayer('/api/map_tile/clouds_new/{z}/{x}/{y}/', { opacity: 0.6 });
      const pressureLayer = L.tileLayer('/api/map_tile/pressure_new/{z}/{x}/{y}/', { opacity: 0.6 });

      const overlayLayers: { [key: string]: any } = {
        "Temperature": tempLayer,
        "Precipitation": precipLayer,
        "Wind Speed": windLayer,
        "Clouds": cloudsLayer,
        "Pressure": pressureLayer,
      };

      // Add Layers Control 
      L.control.layers(null, overlayLayers, { position: 'topright' }).addTo(map);

      let activeOverlay: string | null = null;

      const LEGENDS: { [key: string]: { gradient: string[], labels: string[], unit: string } } = {
        'Temperature': {
          gradient: ['#8b00ff', '#0000ff', '#00ffff', '#ffff00', '#ff0000'],
          labels: ['-30', '-10', '0', '20', '40'],
          unit: '°C'
        },
        'Precipitation': {
          gradient: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
          labels: ['0', '2', '10', '50', '150'],
          unit: 'mm'
        },
        'Wind Speed': {
          gradient: ['#ffffff', '#00aaff', '#0055ff', '#ff0000'],
          labels: ['1', '10', '25', '50'],
          unit: 'm/s'
        },
        'Clouds': {
          gradient: ['#ffffff00', '#f0f0f0', '#a0a0a0', '#505050'],
          labels: ['0', '25', '75', '100'],
          unit: '%'
        },
        'Pressure': {
          gradient: ['#0000ff', '#00ffff', '#ffff00', '#ff0000'],
          labels: ['950', '1000', '1025', '1050'],
          unit: 'hPa'
        }
      };

      const legendControl = new (L.Control.extend({
        options: { position: 'bottomright' },
        onAdd: function () {
          const div = L.DomUtil.create('div', 'info legend');
          return div;
        },
      }))();
      legendControl.addTo(map);
      
      const updateLegend = (layerName?: string) => {
        const legendDiv = (legendControl.getContainer() as HTMLElement);
        if (!legendDiv) return;

        if (!layerName || !LEGENDS[layerName]) {
          legendDiv.innerHTML = '';
          return;
        }

        const legend = LEGENDS[layerName];
        const gradientStyle = `linear-gradient(to right, ${legend.gradient.join(', ')})`;
        
        let labelsHtml = '<div class="labels">';
        legend.labels.forEach((label) => {
          labelsHtml += `<span>${label}</span>`;
        });
        labelsHtml += '</div>';

        legendDiv.innerHTML = `
          <div class="legend-title">${layerName} (${legend.unit})</div>
          <div class="gradient-bar" style="background: ${gradientStyle};"></div>
          ${labelsHtml}
        `;
      };
      
      map.on('overlayadd', function(e: any) {
        activeOverlay = e.name;
        updateLegend(activeOverlay);
      });
      
      map.on('overlayremove', function(e: any) {
        if (activeOverlay === e.name) {
          activeOverlay = null;
          updateLegend();
        }
      });

      const defaultLayerName = 'Precipitation';
      overlayLayers[defaultLayerName].addTo(map);
      activeOverlay = defaultLayerName;
      updateLegend(defaultLayerName);
      // ---

      const RelocateControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
        onAdd: function () {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            container.title = 'Recenter map';
            L.DomUtil.addClass(container, 'recenter-button');
            
            const icon = L.DomUtil.create('i', 'fas fa-location-arrow', container);
            icon.style.lineHeight = '30px';
            icon.style.width = '100%';
            icon.style.textAlign = 'center';
            icon.style.color = '#333';

            L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation)
                      .on(container, 'click', L.DomEvent.preventDefault)
                      .on(container, 'click', () => map.setView(position, 7));
            
            container.style.backgroundColor = 'white';
            container.style.width = '30px';
            container.style.height = '30px';
            container.style.cursor = 'pointer';
            container.style.borderRadius = '4px';
            container.style.boxShadow = '0 1px 5px rgba(0,0,0,0.65)';
            container.style.transition = 'background-color 0.2s, transform 0.2s';

            L.DomEvent.on(container, 'mouseover', () => {
                container.style.backgroundColor = '#f4f4f4';
            });
            L.DomEvent.on(container, 'mouseout', () => {
                container.style.backgroundColor = 'white';
            });
            L.DomEvent.on(container, 'mousedown', () => {
                container.style.transform = 'scale(0.95)';
            });
            L.DomEvent.on(container, 'mouseup', () => {
                container.style.transform = 'scale(1)';
            });

            return container;
        }
      });
      map.addControl(new RelocateControl());
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(position, 7);
      mapInstanceRef.current.invalidateSize();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isMapVisible, position]);

  useEffect(() => {
    if (!mapInstanceRef.current || !isMapVisible) return;

    if (isDarkMode) {
      if (mapInstanceRef.current.hasLayer(lightTilesRef.current)) {
        mapInstanceRef.current.removeLayer(lightTilesRef.current);
      }
      if (darkTilesRef.current && !mapInstanceRef.current.hasLayer(darkTilesRef.current)) {
        darkTilesRef.current.addTo(mapInstanceRef.current);
      }
    } else {
      if (mapInstanceRef.current.hasLayer(darkTilesRef.current)) {
        mapInstanceRef.current.removeLayer(darkTilesRef.current);
      }
      if (lightTilesRef.current && !mapInstanceRef.current.hasLayer(lightTilesRef.current)) {
        lightTilesRef.current.addTo(mapInstanceRef.current);
      }
    }
  }, [isDarkMode, isMapVisible]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white"></div>
          <p className="text-xl text-white">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .legend {
          padding: 6px 8px;
          background: rgba(0,0,0,0.6);
          box-shadow: 0 0 15px rgba(0,0,0,0.2);
          border-radius: 5px;
          color: white;
          width: 200px;
        }
        .legend-title {
          font-weight: bold;
          margin-bottom: 5px;
          text-align: center;
        }
        .gradient-bar {
          height: 15px;
          width: 100%;
          border-radius: 3px;
        }
        .labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-top: 3px;
        }
      `}</style>
      <div className="flex h-full w-full flex-col items-center justify-center px-4">
        {/* Title */}
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-5xl font-light text-white">Weather Map</h2>
          <div className="mx-auto h-1 w-48 rounded-full bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
        </div>

        {/* Map Container */}
        <div
          className="h-[70vh] min-h-[500px] max-h-[800px] w-full max-w-7xl rounded-3xl overflow-hidden border border-white/20 bg-gray-900/50 shadow-2xl backdrop-blur-sm"
        >
          <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }}>
              {!isMapVisible && (
                  <div className="flex h-full w-full items-center justify-center bg-gray-800/50">
                      <p className="text-lg text-white">Map is inactive</p>
                  </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WeatherMap;