import React, {useContext} from 'react';
import {TripDetailContext} from "../TripDetail";

const Description = () => {
    const {trip} = useContext(TripDetailContext);
    return (
        <div className="row product-description" style={{textAlign: 'justify'}}>
            <div className="col-lg-8 col-md-8 col-12">
                <h4 className="mb-3">Mô tả phòng:</h4>
                <div style={{margin: '10px 100px'}} dangerouslySetInnerHTML={{__html: trip.description}}></div>
            </div>
        </div>
    );
};

export default Description;
