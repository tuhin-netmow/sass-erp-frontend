
"use client";

import { useMemo } from "react";
import {
    GoogleMap,
    useJsApiLoader,
    MarkerF,
    PolylineF,
} from "@react-google-maps/api";

import { useGetGoogleMapsSettingsQuery } from "@/store/features/admin/settingsApiService";

interface MapEmbedProps {
    center: { lat: number; lng: number };
    zoom: number;
    startLocation: { lat: number; lng: number; name: string };
    endLocation: { lat: number; lng: number; name: string };
    customerMarkers?: Array<{ lat: number; lng: number; name: string }>;
}

const containerStyle = { width: "100%", height: "100%" };

// SUB-COMPONENT: This actually calls the loader and renders the map
const GoogleMapContent = ({ center, zoom, startLocation, endLocation, customerMarkers, apiKey }: MapEmbedProps & { apiKey: string }) => {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: apiKey,
    });

    const routePath = useMemo(() => {
        return [
            { lat: startLocation.lat, lng: startLocation.lng },
            ...(customerMarkers || []).map(c => ({ lat: c.lat, lng: c.lng })),
            { lat: endLocation.lat, lng: endLocation.lng }
        ];
    }, [startLocation, endLocation, customerMarkers]);

    if (!isLoaded) return <div className="w-full h-full bg-muted animate-pulse" />;

    return (
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={zoom}>
            <PolylineF
                path={routePath}
                options={{
                    strokeColor: "#3b82f6",
                    strokeOpacity: 0.8,
                    strokeWeight: 4,
                    icons: [
                        {
                            icon: { path: "M 0,-1 0 1", strokeOpacity: 1, scale: 3 } as google.maps.Symbol,
                            offset: "0",
                            repeat: "20px",
                        },
                        {
                            icon: { path: "M -2,0 0,2 2,0", strokeColor: "#ffffff", strokeWeight: 2 } as google.maps.Symbol,
                            offset: "50%",
                            repeat: "50px",
                        }
                    ],
                }}
            />
            <MarkerF
                position={startLocation}
                label="START"
                icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png"
            />
            {(customerMarkers || []).map((customer, index) => (
                <MarkerF
                    key={index}
                    position={{ lat: customer.lat, lng: customer.lng }}
                    label={(index + 1).toString()}
                    title={customer.name}
                />
            ))}
            <MarkerF
                position={endLocation}
                label="END"
                icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            />
        </GoogleMap>
    );
};

// MAIN EXPORT: Handles fetching the API key before rendering the map content
export const GoogleMapEmbed = (props: MapEmbedProps) => {
    const { data: mapSettings, isLoading } = useGetGoogleMapsSettingsQuery();

    // Check if Google Maps is enabled
    const isEnabled = mapSettings?.data?.status === "enabled";
    // Determine the API key
    const apiKey = mapSettings?.data?.api_key || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // Wait until settings are loaded
    if (isLoading) {
        return <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center text-xs text-muted-foreground">
            Loading Map...
        </div>;
    }

    // If disabled or no API key, show message
    if (!isEnabled || !apiKey) {
        return <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
            {!isEnabled ? "Google Maps is disabled" : "Google Maps API Key not configured"}
        </div>;
    }

    return <GoogleMapContent {...props} apiKey={apiKey} />;
};






/* 
  -------------- uses example  ------------------------

<GoogleMapEmbed
                center={{ lat: route.center_lat, lng: route.center_lng }}
                zoom={route.zoom_level}
                startLocation={{
                  lat: route.center_lat, // Or specific start_lat if you have it
                  lng: route.center_lng,
                  name: route.start_location
                }}
                endLocation={{
                  lat: route.end_lat || route.center_lat,
                  lng: route.end_lng || route.center_lng,
                  name: route.end_location
                }}
                customerMarkers={route.customers?.map((c: any) => ({
                  lat: c.latitude,
                  lng: c.longitude,
                  name: c.name
                }))}
              />


*/