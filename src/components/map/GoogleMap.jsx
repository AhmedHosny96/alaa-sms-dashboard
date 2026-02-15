import {
  AdvancedMarker,
  APIProvider,
  Map,
  InfoWindow,
  useMap,
  useMapsLibrary,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import MapMarker from "assets/img/icons/map-marker.png";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppContext } from "providers/AppProvider";


const StreetView = ({ position, pov, zoom, className }) => {
  const map = useMap();
  const streetViewLibrary = useMapsLibrary('streetView');
  const panoramaRef = useRef(null);
  const [panorama, setPanorama] = useState(null);

  useEffect(() => {
    if (!streetViewLibrary || !panoramaRef.current) return;

    const svPanorama = new streetViewLibrary.StreetViewPanorama(
      panoramaRef.current,
      {
        position: position,
        pov,
        zoom,
        visible: true,
        gestureHandling: 'none',
        scrollwheel: false,
        linksControl: true,
        panControl: true,
        motionTracking: false,
      }
    );
    setPanorama(svPanorama);

    if (map) {
      map.setStreetView(svPanorama);
    }

    return () => {
      if (map) {
        map.setStreetView(null);
      }
    };
  }, [streetViewLibrary, map, position]);

  return <div ref={panoramaRef} className={className} />;
};

const GoogleMap = ({
  position,
  dataZoom = 18,
  children,
  className,
  streetview = false,
  streetViewClass,
  pov = { heading: 180, pitch: -30 },
  ...rest
}) => {
  const {
    config: { isDark }
  } = useAppContext();

  const initialPosition = position || {
    lat: 48.8583701,
    lng: 2.2922873
  };

  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoWindowShown, setInfoWindowShown] = useState(false);

  const handleMarkerClick = useCallback(
    () => setInfoWindowShown((shown) => !shown),
    []
  );
  const handleClose = useCallback(() => setInfoWindowShown(false), []);


  return (
    <APIProvider apiKey={import.meta.env.VITE_REACT_APP_GOOGLE_API_KEY}>
      <div className={`h-100 ${className}`} {...rest}>
        <Map
          defaultCenter={initialPosition}
          defaultZoom={dataZoom}
          mapId={import.meta.env.VITE_REACT_APP_MAP_ID}
          mapTypeControl={true}
          streetViewControl={true}
          fullscreenControl={true}
          colorScheme={isDark ? "DARK" : "LIGHT"}
          style={{ width: "100%", height: "100%" }}
        >
          {streetview ? (
            <StreetView
              position={initialPosition}
              pov={pov}
              zoom={dataZoom}
              className={streetViewClass}
            />
          ) : (
            <>
              <AdvancedMarker
                ref={markerRef}
                position={initialPosition}
                onClick={handleMarkerClick}
              >
                <img src={MapMarker} alt="map marker" />
              </AdvancedMarker>

              {children && infoWindowShown && (
                <InfoWindow anchor={marker} onClose={handleClose}>
                  <div>{children}</div>
                </InfoWindow>
              )}
            </>
          )}
        </Map>
      </div>
    </APIProvider>
  );
};

export default GoogleMap;
