"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useGetPurchaseMapsQuery } from "@/store/features/app/purchaseOrder/purchaseOrderApiService";
import { ResizeMap } from "@/shared/components/maps/ResizeMap";


// Fix default marker icons
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Default fallback data
const defaultMapData = {
    total: 0,
    locations: [],
};

const PurchaseOrdersMapPage: React.FC = () => {
    const { data } = useGetPurchaseMapsQuery();

    const mapData = data?.data ?? defaultMapData;
    const locations = mapData.locations;
    const total = mapData.total;

    const defaultCenter: [number, number] = [23.8103, 90.4125];
    const center: [number, number] = locations.length > 0 && locations[0].coordinates.lat && locations[0].coordinates.lng
        ? [locations[0].coordinates.lat, locations[0].coordinates.lng]
        : defaultCenter;

    return (
        <div className="max-w-7xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">
                Purchase Orders Map ({total} locations)
            </h1>

            <MapContainer
                center={center}
                zoom={6}
                scrollWheelZoom={true}
                className="w-full h-[clamp(320px,60vh,720px)] rounded-lg shadow z-0"
            >
                <ResizeMap />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />

                <MarkerClusterGroup>
                    {locations
                        .filter(loc => loc.coordinates.lat && loc.coordinates.lng) // filter only valid coordinates
                        .map(loc => (
                            <Marker
                                key={loc.id}
                                position={[loc.coordinates.lat!, loc.coordinates.lng!]}
                            >
                                <Popup maxWidth={260} minWidth={200}>
                                    <div className="text-sm">
                                        <strong>{loc.poNumber}</strong>
                                        <br />
                                        Status: {loc.status}
                                        <br />
                                        Total: RM {loc.totalAmount.toFixed(2)}
                                        <br />
                                        Order Date: {new Date(loc.orderDate).toLocaleDateString()}
                                        <br />
                                        Expected Delivery: {new Date(loc.expectedDeliveryDate).toLocaleDateString()}
                                        <hr className="my-1" />
                                        <strong>Supplier:</strong> {loc.supplier.name}
                                        <br />
                                        Contact: {loc.supplier.contactPerson || "-"}
                                        <br />
                                        Phone: {loc.supplier.phone || "-"}
                                        <br />
                                        Email: {loc.supplier.email || "-"}
                                        <br />
                                        Address: {loc.supplier.address || "-"}
                                        <br />
                                        City: {loc.supplier.city || "-"}
                                        <div className="mt-3">
                                            <a
                                                href={`https://www.waze.com/ul?ll=${loc.coordinates.lat},${loc.coordinates.lng}&navigate=yes`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block text-center px-3 py-1.5 bg-[#33CCFF] text-white rounded font-bold text-xs hover:bg-[#2EB8E6] transition-colors"
                                            >
                                                Navigate with Waze
                                            </a>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                </MarkerClusterGroup>
            </MapContainer>

            {locations.length === 0 && (
                <p className="text-center mt-4 text-muted-foreground">
                    No purchase order locations available
                </p>
            )}
        </div>
    );
};

export default PurchaseOrdersMapPage;
