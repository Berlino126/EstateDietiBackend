import "./Pin.scss"

function Pin({item}){
    return(
        <Marker
        key={loc.id}
        position={{ lat: loc.lat, lng: loc.lng }}
        onClick={() => setSelectedLocation(loc)}
      />
    )
}