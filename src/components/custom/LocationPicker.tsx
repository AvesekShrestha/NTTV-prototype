import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, MapPin } from "lucide-react";

// Leaflet's default marker icon paths break under most bundlers because the
// image assets aren't resolved automatically. Pointing at the CDN copies
// sidesteps that without any extra build configuration.
const DEFAULT_ICON = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export type LatLng = { lat: number; lng: number };

interface LocationPickerProps {
    value: LatLng | null;
    onChange: (value: LatLng) => void;
    defaultCenter?: LatLng;
    height?: number;
}

// Kathmandu, used as a sensible default center for the map
const DEFAULT_CENTER: LatLng = { lat: 27.7172, lng: 85.324 };

const LocationPicker = ({
    value,
    onChange,
    defaultCenter = DEFAULT_CENTER,
    height = 280,
}: LocationPickerProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const onChangeRef = useRef(onChange);
    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => {
        onChangeRef.current = onChange;
    });

    // Initialize the map once
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const center = value ?? defaultCenter;

        const map = L.map(containerRef.current, {
            center: [center.lat, center.lng],
            zoom: value ? 15 : 12,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map);

        const placeMarker = (latlng: L.LatLng) => {
            if (markerRef.current) {
                markerRef.current.setLatLng(latlng);
                return;
            }

            const marker = L.marker(latlng, { icon: DEFAULT_ICON, draggable: true }).addTo(map);

            marker.on("dragend", () => {
                const pos = marker.getLatLng();
                onChangeRef.current({ lat: pos.lat, lng: pos.lng });
            });

            markerRef.current = marker;
        };

        if (value) {
            placeMarker(L.latLng(value.lat, value.lng));
        }

        map.on("click", (e: L.LeafletMouseEvent) => {
            placeMarker(e.latlng);
            onChangeRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
        });

        mapRef.current = map;

        // Leaflet sometimes measures its container before layout settles
        // (e.g. inside a flex/grid parent), so nudge it once mounted.
        const resizeTimeout = setTimeout(() => map.invalidateSize(), 100);

        return () => {
            clearTimeout(resizeTimeout);
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keep the marker in sync when the value changes from outside the map
    // (e.g. the "Use my current location" button)
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !value) return;

        const latlng = L.latLng(value.lat, value.lng);

        if (markerRef.current) {
            markerRef.current.setLatLng(latlng);
        } else {
            const marker = L.marker(latlng, { icon: DEFAULT_ICON, draggable: true }).addTo(map);

            marker.on("dragend", () => {
                const pos = marker.getLatLng();
                onChangeRef.current({ lat: pos.lat, lng: pos.lng });
            });

            markerRef.current = marker;
        }

        map.setView(latlng, Math.max(map.getZoom(), 15));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value?.lat, value?.lng]);

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) return;

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                onChangeRef.current({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setIsLocating(false);
            },
            () => setIsLocating(false),
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    return (
        <div className="space-y-2">
            <div
                ref={containerRef}
                style={{ height }}
                className="w-full rounded-xl border border-slate-200 overflow-hidden"
            />

            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003b7a] hover:underline disabled:opacity-50"
                >
                    <LocateFixed className="w-3.5 h-3.5" />
                    {isLocating ? "Locating..." : "Use my current location"}
                </button>

                {value && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                        <MapPin className="w-3 h-3" />
                        {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
                    </span>
                )}
            </div>

            <p className="text-[11px] text-slate-400">
                Click anywhere on the map (or drag the pin) to set the technician visit location.
            </p>
        </div>
    );
};

export default LocationPicker;