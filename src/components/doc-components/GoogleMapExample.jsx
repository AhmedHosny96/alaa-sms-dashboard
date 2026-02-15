import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconComponentCard from 'components/common/FalconComponentCard';
import PageHeader from 'components/common/PageHeader';
import { Button, Card } from 'react-bootstrap';
import GoogleMap from 'components/map/GoogleMap';

const exampleCode = `<GoogleMap
  position={{
    lat: 48.8583736,
    lng: 2.2922926
  }}
  className="vh-50"
>
  <h5 className="text-700">Eiffel Tower</h5>
  <p className="fs-10 mb-0">
    Gustave Eiffel's iconic, wrought-iron 1889 tower,
    <br /> with steps and elevators to observation decks.
  </p>
</GoogleMap>`;
const streetviewCode = `<GoogleMap
  position={{ lat: 43.0795932, lng: -79.0776385 }}
  streetview={true}
  streetViewClass="min-vh-50"
  dataZoom={1}
/>`;

const GoogleMapExample = () => {
  return (
    <>
      <PageHeader
        title="React google maps"
        description="React components for the latest Google Maps JavaScript API, featuring AdvancedMarkers, InfoWindows, and vector map rendering using Google Cloud map IDs."
        className="mb-3"
      >
        <Button
          href="https://visgl.github.io/react-google-maps/docs"
          target="_blank"
          variant="link"
          size="sm"
          className="ps-0"
        >
          React Google Maps Api Documentation
          <FontAwesomeIcon icon="chevron-right" className="ms-1 fs-11" />
        </Button>
      </PageHeader>

      <FalconComponentCard>
        <FalconComponentCard.Header title="Example" />
        <FalconComponentCard.Body
          code={exampleCode}
          scope={{ GoogleMap }}
          language="jsx"
        />
      </FalconComponentCard>
      <FalconComponentCard>
        <FalconComponentCard.Header title="Streetview" />
        <FalconComponentCard.Body
          code={streetviewCode}
          scope={{ GoogleMap }}
          language="jsx"
        />
      </FalconComponentCard>
    </>
  );
};

export default GoogleMapExample;
