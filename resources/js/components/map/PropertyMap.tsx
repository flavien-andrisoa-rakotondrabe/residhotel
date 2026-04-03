import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";

// Fix default marker icons broken by bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface MapProperty {
  id: number;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  lat: number;
  lng: number;
  image: string;
  type: string;
  // Optional extended fields from Property
  bedrooms?: number;
  bathrooms?: number;
  guests?: number;
  amenities?: string[];
  badge?: string;
  images?: string[];
}

interface PriceMarkerProps {
  property: MapProperty;
  isActive: boolean;
  onClick: (id: number) => void;
}

function createPriceIcon(price: number, isActive: boolean) {
  const bg = isActive ? "#1e5e6e" : "#ffffff";
  const color = isActive ? "#ffffff" : "#1e3a4a";
  const border = isActive ? "#1e5e6e" : "#cbd5e1";
  const shadow = isActive
    ? "0 4px 20px rgba(30,94,110,0.45)"
    : "0 2px 10px rgba(0,0,0,0.18)";

  return L.divIcon({
    className: "",
    html: `
      <div style="
        background:${bg};
        color:${color};
        border:2px solid ${border};
        border-radius:24px;
        padding:6px 12px;
        font-family:Inter,sans-serif;
        font-size:13px;
        font-weight:700;
        white-space:nowrap;
        box-shadow:${shadow};
        cursor:pointer;
        transition:all .2s;
        position:relative;
      ">
        ${price.toLocaleString("fr-FR")} €
        <div style="
          position:absolute;
          bottom:-7px;
          left:50%;
          transform:translateX(-50%);
          width:0;height:0;
          border-left:6px solid transparent;
          border-right:6px solid transparent;
          border-top:7px solid ${isActive ? "#1e5e6e" : border};
        "></div>
      </div>
    `,
    iconAnchor: [38, 38],
    popupAnchor: [0, -40],
  });
}

function PriceMarker({ property, isActive, onClick }: PriceMarkerProps) {
  const markerRef = useRef<L.Marker>(null);
  const icon = createPriceIcon(property.price, isActive);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(createPriceIcon(property.price, isActive));
    }
  }, [isActive, property.price]);

  return (
    <Marker
      ref={markerRef}
      position={[property.lat, property.lng]}
      icon={icon}
      eventHandlers={{ click: () => onClick(property.id) }}
    >
      <Popup
        offset={[0, -10]}
        className="property-popup"
        closeButton={false}
      >
        <Link to={`/property/${property.id}`} className="block w-60 no-underline">
          <div className="rounded-xl overflow-hidden shadow-md bg-white">
            <div className="relative h-32">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5">
                <span className="text-xs font-semibold text-primary font-body">{property.type}</span>
              </div>
            </div>
            <div className="p-3">
              <p className="font-display text-sm font-bold text-foreground leading-tight mb-1 line-clamp-1">
                {property.title}
              </p>
              <div className="flex items-center gap-1 mb-2">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="font-body text-xs text-muted-foreground">{property.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                  <span className="font-body text-xs font-semibold text-foreground">{property.rating}</span>
                  <span className="font-body text-xs text-muted-foreground">({property.reviews})</span>
                </div>
                <span className="font-body text-sm font-bold text-primary">
                  {property.price.toLocaleString("fr-FR")} €
                  <span className="text-xs font-normal text-muted-foreground">/nuit</span>
                </span>
              </div>
            </div>
          </div>
        </Link>
      </Popup>
    </Marker>
  );
}

// Fly to selected property
function MapFlyTo({ property }: { property: MapProperty | null }) {
  const map = useMap();
  useEffect(() => {
    if (property) {
      map.flyTo([property.lat, property.lng], 13, { duration: 0.8 });
    }
  }, [property, map]);
  return null;
}

interface PropertyMapProps {
  properties: MapProperty[];
  activeId: number | null;
  onMarkerClick: (id: number) => void;
  center?: [number, number];
  zoom?: number;
}

export default function PropertyMap({
  properties,
  activeId,
  onMarkerClick,
  center = [46.6, 2.3],
  zoom = 6,
}: PropertyMapProps) {
  const activeProperty = properties.find((p) => p.id === activeId) ?? null;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-full rounded-2xl"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      <MapFlyTo property={activeProperty} />
      {properties.map((p) => (
        <PriceMarker
          key={p.id}
          property={p}
          isActive={p.id === activeId}
          onClick={onMarkerClick}
        />
      ))}
    </MapContainer>
  );
}
