import { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, BarChart3, Navigation } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Community {
  id: string;
  cidade: string;
  estado: string;
  bairro: string;
  idh: number;
  total_beneficiarios: number;
  latitude?: number;
  longitude?: number;
  projectCount?: number;
  coordinates?: { lat: number; lng: number };
  distanceFromUser?: number;
}

interface MapboxMapProps {
  height?: string;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoicmFmYWVsY2tkIiwiYSI6ImNtZHM4aHh0bTBwNmQybG9oY2MydXo3c2gifQ.IhlgDjS77agOzYkLHkUcLA';

// Coordinates for major Brazilian cities
const CITY_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  'São Paulo': { lat: -23.5505, lng: -46.6333 },
  'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
  'Belo Horizonte': { lat: -19.9167, lng: -43.9345 },
  'Salvador': { lat: -12.9714, lng: -38.5014 },
  'Brasília': { lat: -15.8267, lng: -47.9218 },
  'Fortaleza': { lat: -3.7319, lng: -38.5267 },
  'Recife': { lat: -8.0476, lng: -34.8770 },
  'Porto Alegre': { lat: -30.0346, lng: -51.2177 },
  'Manaus': { lat: -3.1190, lng: -60.0217 },
  'Curitiba': { lat: -25.4284, lng: -49.2733 }
};

export const MapboxMap = ({ height = '400px' }: MapboxMapProps) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestCommunity, setNearestCommunity] = useState<Community | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const initialized = useRef(false);

  // Set Mapbox access token
  mapboxgl.accessToken = MAPBOX_TOKEN;

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userCoords);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Fallback to São Paulo coordinates if geolocation fails
          setUserLocation({ lat: -23.5505, lng: -46.6333 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      console.warn('Geolocation not supported');
      // Fallback to São Paulo coordinates
      setUserLocation({ lat: -23.5505, lng: -46.6333 });
    }
  };

  // Find nearest community to user location
  const findNearestCommunity = (userCoords: { lat: number; lng: number }, communitiesList: Community[]): Community | null => {
    if (communitiesList.length === 0) return null;

    let nearest: Community | null = null;
    let minDistance = Infinity;

    communitiesList.forEach(community => {
      // Use precise neighborhood coordinates if available, otherwise fall back to city coordinates
      const coords = community.coordinates || CITY_COORDINATES[community.cidade];
      if (coords) {
        const distance = calculateDistance(
          userCoords.lat, userCoords.lng,
          coords.lat, coords.lng
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearest = {
            ...community,
            coordinates: coords,
            distanceFromUser: distance
          };
        }
      }
    });

    return nearest;
  };

  const fetchCommunities = async () => {
    try {
      const { data: communitiesData, error } = await supabase
        .from('comunidades')
        .select(`
          *,
          projetos(id)
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('Error fetching communities:', error);
        setLoading(false);
        return;
      }

      if (!communitiesData) {
        setLoading(false);
        return;
      }

      // Process communities with precise coordinates
      const processedCommunities = communitiesData.map((community: any) => ({
        ...community,
        projectCount: community.projetos?.length || 0,
        coordinates: community.latitude && community.longitude ? {
          lat: parseFloat(community.latitude),
          lng: parseFloat(community.longitude)
        } : null
      }));

      setCommunities(processedCommunities);
      
      // Find nearest community if user location is available
      if (userLocation) {
        const nearest = findNearestCommunity(userLocation, processedCommunities);
        setNearestCommunity(nearest);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error processing communities:', error);
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current || initialized.current) return;

    try {
      // Determine initial center and zoom based on nearest community or default to Brazil center
      let initialCenter: [number, number] = [-51.9253, -14.2350]; // Center of Brazil
      let initialZoom = 4;
      
      if (nearestCommunity && nearestCommunity.coordinates) {
        initialCenter = [nearestCommunity.coordinates.lng, nearestCommunity.coordinates.lat];
        initialZoom = 12; // Zoom closer to show neighborhood level
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: initialCenter,
        zoom: initialZoom
      });

      // Wait for map to load before adding features
      map.current.on('load', () => {
        // Add neighborhood boundaries for the nearest community
        if (nearestCommunity && nearestCommunity.coordinates) {
          addNeighborhoodBoundary(nearestCommunity);
        }
        
        // Add user location marker if available
        if (userLocation) {
          addUserLocationMarker();
        }
        
        // Add markers for each community
        communities.forEach((community) => {
          // Use precise neighborhood coordinates if available, otherwise fall back to city coordinates
          const coords = community.coordinates || CITY_COORDINATES[community.cidade];
          if (!coords) return;

          // Create marker element
          const el = document.createElement('div');
          const isNearest = nearestCommunity && community.id === nearestCommunity.id;
          const size = isNearest ? 20 : (community.projectCount && community.projectCount >= 3 ? 16 : 12);
          const color = isNearest ? '#3b82f6' : (community.idh >= 0.6 ? '#22c55e' : community.idh >= 0.4 ? '#eab308' : '#ef4444');
          
          el.style.width = `${size}px`;
          el.style.height = `${size}px`;
          el.style.backgroundColor = color;
          el.style.borderRadius = '50%';
          el.style.border = isNearest ? '3px solid #1e40af' : '2px solid white';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
          el.style.cursor = 'pointer';
          el.style.zIndex = isNearest ? '1000' : '999';

          // Create marker
          const marker = new mapboxgl.Marker(el)
            .setLngLat([coords.lng, coords.lat])
            .addTo(map.current!);

          // Add popup on click
          el.addEventListener('click', () => {
            const distanceText = isNearest && nearestCommunity?.distanceFromUser 
              ? `<div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>Distância:</span><span style="font-weight: 500;">${nearestCommunity.distanceFromUser.toFixed(1)} km</span></div>`
              : '';
              
            new mapboxgl.Popup({ closeOnClick: true })
              .setLngLat([coords.lng, coords.lat])
              .setHTML(`
                <div style="padding: 8px; min-width: 180px;">
                  <h3 style="font-weight: 600; margin-bottom: 4px;">${community.bairro} ${isNearest ? '🎯' : ''}</h3>
                  <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${community.cidade}, ${community.estado}</p>
                  ${isNearest ? '<p style="font-size: 11px; color: #3b82f6; margin-bottom: 8px; font-weight: 500;">📍 Comunidade mais próxima</p>' : ''}
                  <div style="font-size: 12px;">
                    ${distanceText}
                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                      <span>IDH:</span>
                      <span style="font-weight: 500;">${community.idh?.toFixed(3) || 'N/A'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                      <span>Pessoas:</span>
                      <span style="font-weight: 500;">${community.total_beneficiarios || 0}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span>Projetos:</span>
                      <span style="font-weight: 500;">${community.projectCount || 0}</span>
                    </div>
                  </div>
                </div>
              `)
              .addTo(map.current!);
          });
        });
      });

      initialized.current = true;
    } catch (error) {
      console.error('Error initializing map:', error);
      setLoading(false);
    }
  };

  // Add neighborhood boundary around the nearest community
  const addNeighborhoodBoundary = (community: Community) => {
    if (!map.current || !community.coordinates) return;

    // Create a circular boundary around the community (approximate neighborhood area)
    const center = [community.coordinates.lng, community.coordinates.lat];
    const radius = 2; // 2km radius
    const points = 64;
    const coordinates = [];

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const dx = radius * Math.cos(angle) / 111.32; // Convert km to degrees (approximate)
      const dy = radius * Math.sin(angle) / (111.32 * Math.cos(community.coordinates.lat * Math.PI / 180));
      coordinates.push([center[0] + dx, center[1] + dy]);
    }
    coordinates.push(coordinates[0]); // Close the polygon

    // Add the neighborhood boundary as a source and layer
    map.current.addSource('neighborhood-boundary', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates]
        },
        properties: {
          name: community.bairro
        }
      }
    });

    // Add fill layer
    map.current.addLayer({
      id: 'neighborhood-fill',
      type: 'fill',
      source: 'neighborhood-boundary',
      paint: {
        'fill-color': '#3b82f6',
        'fill-opacity': 0.1
      }
    });

    // Add border layer
    map.current.addLayer({
      id: 'neighborhood-border',
      type: 'line',
      source: 'neighborhood-boundary',
      paint: {
        'line-color': '#3b82f6',
        'line-width': 2,
        'line-opacity': 0.8
      }
    });
  };

  // Add user location marker
  const addUserLocationMarker = () => {
    if (!map.current || !userLocation) return;

    // Create user location marker
    const userEl = document.createElement('div');
    userEl.style.width = '14px';
    userEl.style.height = '14px';
    userEl.style.backgroundColor = '#ef4444';
    userEl.style.borderRadius = '50%';
    userEl.style.border = '3px solid white';
    userEl.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.5)';
    userEl.style.cursor = 'pointer';

    const userMarker = new mapboxgl.Marker(userEl)
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);

    // Add popup for user location
    userEl.addEventListener('click', () => {
      new mapboxgl.Popup({ closeOnClick: true })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setHTML(`
          <div style="padding: 8px; min-width: 120px; text-align: center;">
            <h3 style="font-weight: 600; margin-bottom: 4px;">📍 Sua Localização</h3>
            <p style="font-size: 11px; color: #666;">Lat: ${userLocation.lat.toFixed(4)}<br/>Lng: ${userLocation.lng.toFixed(4)}</p>
          </div>
        `)
        .addTo(map.current!);
    });
  };

  useEffect(() => {
    getUserLocation();
    fetchCommunities();
  }, []);

  useEffect(() => {
    if (userLocation && communities.length > 0) {
      const nearest = findNearestCommunity(userLocation, communities);
      setNearestCommunity(nearest);
    }
  }, [userLocation, communities]);

  useEffect(() => {
    if (communities.length > 0 && !initialized.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        initializeMap();
        setLoading(false);
      }, 100);
    }
  }, [communities, nearestCommunity]);

  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        initialized.current = false;
      }
    };
  }, []);

  if (loading) {
    return (
      <Card style={{ height }}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Carregando mapa...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{ height }}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Mapa de Atuação
          {nearestCommunity && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              Mais próxima: {nearestCommunity.bairro}
            </span>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {nearestCommunity 
            ? `Centralizado na comunidade mais próxima (${nearestCommunity.distanceFromUser?.toFixed(1)} km) - ${communities.length} localidades`
            : `Comunidades onde a ONG atua - ${communities.length} localidades`
          }
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={mapContainer}
          style={{ height: `calc(${height} - 80px)` }}
          className="w-full"
        />
      </CardContent>
    </Card>
  );
};
