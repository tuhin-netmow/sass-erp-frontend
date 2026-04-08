/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

interface GoogleMapsSettings {
    status?: string;
    api_key?: string;
}

export const useGoogleMapsScript = (settings?: GoogleMapsSettings) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState<Error | null>(null);
    const loadScriptPromiseRef = useRef<Promise<void> | null>(null);

    // Determine if Google Maps should be enabled
    const isEnabled = settings?.status === "enabled" && !!settings?.api_key;

    useEffect(() => {
        // If disabled in settings, don't load
        if (!isEnabled) {
            setIsLoaded(false);
            setLoadError(null);
            // Reset the promise so it can be loaded again if re-enabled
            loadScriptPromiseRef.current = null;
            return;
        }

        // Use the API key from settings if available, otherwise fall back to env var
        const apiKey = settings?.api_key || GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            setLoadError(new Error("No Google Maps API key configured"));
            return;
        }

        if ((window as any).google?.maps?.places) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsLoaded(true);
            return;
        }

        if (!loadScriptPromiseRef.current) {
            loadScriptPromiseRef.current = new Promise<void>((resolve, reject) => {
                const callbackName = "initGoogleMapsCallback";
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                window[callbackName] = () => resolve();

                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${LIBRARIES.join(
                    ","
                )}&loading=async&callback=${callbackName}`;
                script.async = true;
                script.defer = true;
                // script.onload = () => resolve(); // Not reliable with loading=async + callback
                script.onerror = (error) => reject(new Error(`Failed to load Google Maps script: ${error}`));
                document.head.appendChild(script);
            });
        }

        loadScriptPromiseRef.current
            .then(() => setIsLoaded(true))
            .catch((err) => setLoadError(err));
    }, [isEnabled, settings?.api_key]);

    return { isLoaded, loadError, isEnabled };
};
