import React, { useEffect, useState } from "react";
import axios from "axios";
import _ from "lodash";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../../service/format";
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css';
import 'swiper/css/pagination';
import { Autoplay, Pagination } from 'swiper/modules';

function Top5Booking() {
    const [trips, setTrips] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:8080/api/trips/top5`)
            .then(res => {
                setTrips(res.data);
            })
            .catch(err => {
                console.log(err);
            });
    }, []);

    return (
        <div className="mt-5 container-top5 text-center">
            <Swiper
                slidesPerView={3}
                spaceBetween={30}
                loop={true}
                autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                }}
                modules={[Pagination, Autoplay]}
                className="mySwiper"
            >
                {
                    !_.isEmpty(trips) && trips.map(trip => (
                        <SwiperSlide key={trip.id}>
                            <div className="trip-item border rounded overflow-hidden"
                                style={{ height: '550px', textAlign: 'center', background: '#eaeaea' }}>
                                <Link to={`/trip-detail/${trip.id}`} className="nav-link">
                                    <div className="position-relative overflow-hidden">
                                        <img height={300} width={"100%"} src={trip.thumbnail} alt="Trip Thumbnail" />
                                    </div>
                                    <div className="p-3 pb-0">
                                        <h4 className="text-center text-truncate">{trip.name}</h4>
                                        <h5 className="color-primary text-center">
                                            {formatCurrency(trip.price - trip.price * trip.sale / 100)} / vé
                                            {trip.sale > 0 && (
                                                <del className="text-secondary ms-3 fs-6">
                                                    {formatCurrency(trip.price)}
                                                </del>
                                            )}
                                        </h5>
                                        <p className="text-truncate mt-2">
                                            <i className="fa fa-map-marker-alt me-2 color-primary"></i>
                                            {trip.departure} → {trip.destination}
                                        </p>
                                        <p className="text-truncate">
                                            <i className="fa fa-chair me-2 color-primary"></i>
                                            Ghế còn: {trip.seat - trip.seatBooking} / {trip.seat}
                                        </p>
                                    </div>
                                    <div className="d-flex border-top p-2 mt-3">
                                        <small className="flex-fill text-center border-end py-2">
                                            <i className="fa fa-id-badge me-2 color-primary"></i>
                                            {trip.licensePlate}
                                        </small>
                                        <small className="flex-fill text-center py-2">
                                            <i className="fa fa-calendar me-2 color-primary"></i>
                                            {new Date(trip.departureDate).toLocaleDateString('vi-VN')}
                                        </small>
                                    </div>
                                </Link>
                            </div>
                        </SwiperSlide>
                    ))
                }
            </Swiper>
        </div>
    );
}

export default Top5Booking;
