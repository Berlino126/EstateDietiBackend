import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  InfoWindow,
} from "@react-google-maps/api";
import "./MapComponent.scss";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "8px",
};

const defaultCities = [
  { name: "Roma", lat: 41.9028, lng: 12.4964 },
  { name: "Milano", lat: 45.4642, lng: 9.19 },
  { name: "Napoli", lat: 40.8522, lng: 14.2681 },
  { name: "Torino", lat: 45.0703, lng: 7.6869 },
  { name: "Firenze", lat: 43.7696, lng: 11.2558 },
];

const MapComponent = ({ items }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyAAjvaziPhKPzbFfhXEmtsdVUuIV5dmm9Y",
  });

  const [selectedMarker, setSelectedMarker] = useState(null);
  const [center, setCenter] = useState(null);
  const [showMarkers, setShowMarkers] = useState(false); // Stato per controllare la visibilità dei marker

  useEffect(() => {
    if (items.length > 0) {
      setCenter({ lat: items[0].latitude, lng: items[0].longitude });
    } else {
      const randomCity = defaultCities[Math.floor(Math.random() * defaultCities.length)];
      setCenter({ lat: randomCity.lat, lng: randomCity.lng });
    }

    // Imposta un timeout per mostrare i marker dopo 2 secondi
    const timer = setTimeout(() => {
      setShowMarkers(true);
    }, 200);

    // Pulizia del timeout per evitare memory leak
    return () => clearTimeout(timer);
  }, [items]);

  if (loadError) return <div>Errore nel caricamento della mappa</div>;
  if (!isLoaded || !center) return <div>Caricamento della mappa...</div>;

  return (
    <div className="mapWrapper">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={13}
        center={center}
      >
        {showMarkers && // Renderizza i marker solo se showMarkers è true
          items.map((item, index) => (
            <Marker
              key={item.id || index}
              position={{ lat: item.latitude, lng: item.longitude }}
              onClick={() => setSelectedMarker(item)}
            />
          ))}

        {selectedMarker && (
          <InfoWindow
            position={{
              lat: selectedMarker.latitude,
              lng: selectedMarker.longitude,
            }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="infoWindow">
              <img className="infoImage" src={selectedMarker.images[0]} alt="" />
              <h3 className="infoTitle">{selectedMarker.title}</h3>
              <p className="infoPrice">{selectedMarker.price}€</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default MapComponent;