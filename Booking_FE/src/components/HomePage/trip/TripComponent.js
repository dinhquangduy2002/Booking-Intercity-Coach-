import React from 'react';
import _ from 'lodash';
import '../home.scss';
import { Pagination } from "@mui/material";
import { formatCurrency } from "../../../service/format";
import { Link } from "react-router-dom";

const TripComponent = ({ trips, totalPages, changePage }) => {

    return (
        <div className="container">
            <div className="row g-4">
                {
                    !_.isEmpty(trips) ? trips.map(trip => (
                        <div className="col-lg-4 col-md-6" key={trip.id}>
                            <div className="trip-item border rounded overflow-hidden">
                                <Link to={`/trip-detail/${trip.id}`} className="nav-link">
                                    <div className="position-relative overflow-hidden">
                                        <img height={273} width={406} src={trip.thumbnail} alt="Thumbnail" />
                                    </div>
                                    <div className="p-4 pb-0">
                                        <h5 className="mb-2 text-center text-truncate">{trip.name}</h5>
                                        <h5 className="mb-3 color-primary text-center">
                                            {formatCurrency(trip.price - trip.price * trip.sale / 100)} / vé
                                            {trip.sale > 0 && (
                                                <del className="text-secondary ms-3 fs-6">
                                                    {formatCurrency(trip.price)}
                                                </del>
                                            )}
                                        </h5>
                                        <p className="text-truncate mb-1">
                                            <i className="fa fa-map-marker-alt me-2 color-primary"></i>
                                            {trip.address}
                                        </p>
                                        <p className="text-truncate mb-1">
                                            <i className="fa fa-bus me-2 color-primary"></i>
                                            {trip.departure} → {trip.destination}
                                        </p>
                                        <p className="text-truncate mb-3">
                                            <i className="fa fa-chair me-2 color-primary"></i>
                                            Ghế còn: {trip.seat - trip.seatBooking} / {trip.seat}
                                        </p>
                                    </div>
                                    <div className="d-flex border-top p-2">
                                        <small className="flex-fill text-center border-end py-2">
                                            <i className="fa fa-id-badge me-2 color-primary"></i>
                                            {trip.licensePlate}
                                        </small>
                                        <small className="flex-fill text-center py-2">
                                            <i className="fa fa-calendar me-2 color-primary"></i>
                                            {trip.createAt}
                                        </small>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-danger fs-5">
                            Không tìm thấy chuyến phù hợp
                        </div>
                    )
                }
            </div>

            {totalPages > 0 && (
                <div className="mt-5 d-flex justify-content-center">
                    <Pagination
                        count={totalPages}
                        size="large"
                        variant="outlined"
                        shape="rounded"
                        onChange={changePage}
                        color="primary"
                    />
                </div>
            )}
        </div>
    );
};

export default TripComponent;
