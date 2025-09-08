import React, {useContext} from 'react';
import {TripDetailContext} from "../TripDetail";

const Facility = () => {
    const {trip} = useContext(TripDetailContext);
    return (
        <div className="" style={{textAlign: 'justify'}}>
                <h4 className="mb-3">Tiện ích:</h4>
                <div dangerouslySetInnerHTML={{__html: trip.facility}}></div>
        </div>
    );
};

export default Facility;