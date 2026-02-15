import GoogleMap from 'components/map/GoogleMap';

const EventDetailsGmap = () => {
  return <>
    <GoogleMap
      position={{
        lat: 23.8383608,
        lng: 90.3680554
      }}
      className="vh-50 rounded-soft mt-5"
    >
      <h5 className="text-700">Arham Engineering Limited</h5>
      <p className="fs-10 mb-0">
        House # 783
        Road # 11 Avenue 3
        Dhaka 1216
        Bangladesh
      </p>
    </GoogleMap>
  </>;
};

export default EventDetailsGmap;
