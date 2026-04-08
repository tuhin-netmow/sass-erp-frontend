import { useEffect } from "react";
import { useMap } from "react-leaflet";

export const ResizeMap = () => {
    const map = useMap();

    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 200);
    }, [map]);

    return null;
};
