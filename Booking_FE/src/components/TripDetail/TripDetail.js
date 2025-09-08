import React, { createContext, useContext, useEffect, useState } from 'react';
import { formatCurrency, getTotalDays } from "../../service/format"; // getTotalDays might not be relevant anymore
import StarsReview from "./StarsReview/StarsReview";
import Description from "./Description/Description";
import Review from "./Review/Review";
import './tripDetail.scss';
import Facility from "./Facility/Facility"; // This might need to be renamed/repurposed for a trip
import { getTripById } from "../../service/tripService"; // Rename to getTripById if applicable
import { avgRatingByTripId, getAllReviewsByTripId } from "../../service/reviewService"; // Adapt to trip reviews
import { getAllImagesByTripId } from "../../service/imageService"; // Adapt to trip images
import _ from 'lodash';
import { useNavigate, useParams } from "react-router-dom";
import Images from "./Images/Images";
import { Button, Modal } from "react-bootstrap";
import { format } from 'date-fns';

import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import BookingService from "../../service/BookingService";
import { CircularProgress } from "@mui/material";
import { WebSocketContext } from "../ChatBox/WebSocketProvider";
import { saveNotify } from "../../service/notifyService";

export const TripDetailContext = createContext();

const TripDetail = () => {
    const [showDesc, setShowDesc] = useState('desc');
    const [trip, setTrip] = useState({});
    const [reviews, setReviews] = useState({}); // Corrected useState declaration
    const [images, setImages] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [showModal, setShowModal] = useState(false);

    // States for modal inputs (updated for trip booking)
    const [pickupAddress, setPickupAddress] = useState(''); // This might be redundant if using trip.departure
    const [destinationAddress, setDestinationAddress] = useState(''); // This might be redundant if using trip.destination
    const [pickupTime, setPickupTime] = useState(''); // Represents time for departure
    const [ticketQuantity, setTicketQuantity] = useState(1); // Number of seats to book

    // Error states for modal inputs
    const [errorPickupAddress, setErrorPickupAddress] = useState('');
    const [errorDestinationAddress, setErrorDestinationAddress] = useState('');
    const [errorPickupTime, setErrorPickupTime] = useState('');
    const [errorTicketQuantity, setErrorTicketQuantity] = useState('');

    const [validate, setValidate] = useState(false);
    const [isRender, setIsRender] = useState(false);
    const [isProgressing, setIsProgressing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const { account, unreadNotify } = useSelector(state => state);
    const { sendNotify } = useContext(WebSocketContext);
    const navigate = useNavigate();

    const { tripId } = useParams(); // Consider renaming tripId to tripId in routes

    useEffect(() => {
        // Assume getTripById now fetches trip data
        getTripById(tripId).then(response => {
            setTrip(response.data);
            // Assuming images are still handled similarly
            getAllImagesByTripId(tripId).then(res => {
                const avatarImage = { id: res.data.length + 1, url: response.data.thumbnail }
                setImages([avatarImage, ...res.data]);
            }).catch(error => {
                console.log(error);
            })
        }).catch(error => {
            console.log(error);
        })

        // Review fetching remains similar, just adapt for trip reviews
        avgRatingByTripId(tripId).then(response => {
            setAvgRating(response.data);
        }).catch(error => {
            console.log(error);
        })

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }, [unreadNotify, tripId]) // Added tripId to dependencies

    useEffect(() => {
        getAllReviewsByTripId(tripId, currentPage - 1).then(response => {
            setReviews(response.data);
        }).catch(error => {
            console.log(error);
        })
    }, [currentPage, unreadNotify, tripId]) // Added tripId to dependencies

    const changePage = (e, value) => {
        setCurrentPage(value);
    }

    const handleCloseModal = () => {
        setShowModal(false);
        // Reset all modal-related states
        setPickupAddress('');
        setDestinationAddress('');
        setPickupTime('');
        setTicketQuantity(1);
        setValidate(false);
        setErrorPickupAddress('');
        setErrorDestinationAddress('');
        setErrorPickupTime('');
        setErrorTicketQuantity('');
    }

    const handleShowModal = (trip) => {
        // Adjust conditions based on trip status and owner
        if (trip.status === "Hết") { // Assuming "Đang sửa" now means "Đang bảo trì" for a trip
            Swal.fire({
                icon: 'warning',
                title: 'Chuyến đi đã hết vé!',
                text: 'Vui lòng chọn chuyến khác',
                showConfirmButton: true,
            }).then();
            return;
        } else if (trip.owner.id === account.id) {
            Swal.fire({
                icon: 'warning',
                title: 'Bạn đang là chủ của chuyến đi này!',
                text: 'Vui lòng chọn chuyến đi khác để đặt vé',
                showConfirmButton: true,
            }).then();
            return;
        } else if (_.isEmpty(account)) {
            Swal.fire({
                icon: 'warning',
                title: 'Bạn cần đăng nhập để đặt vé!',
                showConfirmButton: true,
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/login");
                }
            })
            return;
        } else if (!account.firstname || !account.lastname || !account.phone) {
            Swal.fire({
                icon: 'warning',
                title: 'Bạn chưa đầy đủ thông tin cá nhân!',
                text: 'Vui lòng cập nhật đầy đủ thông tin',
                showConfirmButton: true,
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/profile/edit-profile");
                }
            })
            return;
        }
        setShowModal(true);

    }

    useEffect(() => {
        if (validate)
            validateBooking();
    }, [pickupAddress, destinationAddress, pickupTime, ticketQuantity])

    const handleBooking = () => {
        if (!validateBooking()) return;

        // Construct data for booking a trip/ticket
        const data = {
            pickUp: pickupAddress,
            destination: destinationAddress,
            time: pickupTime,
            quantity: ticketQuantity,
            total: (trip.price - trip.price * trip.sale / 100) * ticketQuantity,
            status: 'Chờ xác nhận',
            trip: trip,
            account: { id: account.id }
        }
        setIsProgressing(true);
        BookingService.bookingTrip(data).then(response => { // Rename bookingTrip to bookingTrip if service is updated
            Swal.fire({
                icon: 'success',
                title: 'Đặt vé thành công!',
                text: 'Vui lòng chờ Admin xác nhận',
                showConfirmButton: true,
            }).then(() => {
                setIsProgressing(false);
                setIsRender(!isRender);
                handleCloseModal();
                handleSendNotify();
            });
        }).catch(error => {
            console.log(error);
            Swal.fire({
                icon: 'error',
                title: 'Đặt vé thất bại!',
                text: 'Bạn đang có chuyến đi khác',
                showConfirmButton: false,
                timer: 2500
            }).then();
            setIsProgressing(false);
        })
    }

    const handleSendNotify = () => {
        const data = {
            sender: account,
            receiver: { id: trip.owner.id },
            message: `${account.username} đã đặt vé ${trip.name}.`,
            navigate: 'profile/trips-owner-booking' // This path might need updating
        }
        saveNotify(data).then(response => {
            sendNotify(response.data);
        }).catch(error => {
            console.log(error)
        })
    }

    const validateBooking = () => {
        let isValid = true;
        setErrorPickupAddress('');
        setErrorDestinationAddress('');
        setErrorPickupTime('');
        setErrorTicketQuantity('');

        if (!pickupAddress.trim()) {
            setErrorPickupAddress('Vui lòng nhập địa chỉ đón.');
            isValid = false;
        }
        if (!destinationAddress.trim()) {
            setErrorDestinationAddress('Vui lòng nhập địa chỉ đến.');
            isValid = false;
        }
        if (!pickupTime.trim()) {
            setErrorPickupTime('Vui lòng chọn khung giờ đón.');
            isValid = false;
        }
        if (ticketQuantity <= 0) {
            setErrorTicketQuantity('Số lượng vé phải lớn hơn 0.');
            isValid = false;
        } else if (trip.seat && ticketQuantity > trip.seat - (trip.seatBooking || 0)) { // Check against available seats
            setErrorTicketQuantity(`Số lượng vé không được vượt quá số ghế trống (${trip.seat - (trip.seatBooking || 0)}).`);
            isValid = false;
        }
        setValidate(true);
        return isValid;
    }

    return (
        <TripDetailContext.Provider value={{ trip: trip, reviews, changePage }}> {/* Still passing 'trip' for now */}
            <div className="container-fluid py-5 container-trip-detail">
                <div className="row px-xl-5">
                    <div className="col-lg-6 pb-5">
                        {!_.isEmpty(images) &&
                            <Images images={images} />
                        }
                    </div>

                    <div className="col-lg-5 ms-5 pb-5">
                        <h3 className="fw-semibold">{trip.name}</h3>
                        <div className="d-flex align-items-center mb-3">
                            <div className="me-2 star-review text-warning d-flex align-items-center">
                                <span
                                    className={`fw-semibold me-2 fs-5 ${avgRating ? "" : "d-none"}`}>{avgRating}</span>
                                <StarsReview rating={avgRating} />
                            </div>
                            <small>({reviews.totalElements} nhận xét)</small>
                        </div>
                        <h3 className="fw-normal mb-4 text-danger">
                            {formatCurrency(trip.price - trip.price * trip.sale / 100)} / vé
                            {trip.sale ?
                                <>
                                    <span className="text-muted fs-5 ms-3">
                                        <del>{formatCurrency(trip.price)}</del>
                                    </span>
                                    <small className="ms-3 bg-danger rounded text-white fs-6">
                                        -{trip.sale}%
                                    </small>
                                </>
                                :
                                null
                            }
                        </h3>
                        {/* Display trip-specific information */}
                        <h4>Loại phương tiện: <span style={{ color: 'blue' }}>{trip.category?.name}</span></h4>
                        <div className="d-flex flex-column mb-2">
                            <p className="mb-2"><i className="fa-solid fa-route me-2"></i>Tuyến: {trip.departure} <i className="fa-solid fa-arrow-right mx-2"></i> {trip.destination}</p>
                            <p className="mb-2"><i className="fa-solid fa-car me-2"></i>Biển số xe: {trip.licensePlate}</p>
                            <p className="mb-2"><i className="fa-solid fa-chair me-2"></i>Số ghế: {trip.seat} (Đã đặt: {trip.seatBooking || 0})</p>
                            <p className="mb-2"><i className="fa-solid fa-user me-2"></i>Tài xế: {trip.driver}</p>
                            <p className="mb-2"><i className="fa-solid fa-calendar-alt me-2"></i>Ngày khởi hành: {trip.departureDate ? format(new Date(trip.departureDate), 'dd/MM/yyyy') : 'N/A'}</p>
                        </div>

                        <p className="mb-2">
                            Trạng thái: <span style={{ color: 'blue' }}>{trip.status}</span>
                        </p>

                        <div className="d-flex align-items-center mb-4 pt-2">
                            <button className="btn btn-trip px-3 py-2"
                                onClick={() => handleShowModal(trip)}>
                                <i className="bi bi-cart-plus me-2"></i>Đặt vé ngay
                            </button>

                            <Modal show={showModal} onHide={handleCloseModal}>
                                <Modal.Header closeButton>
                                    <Modal.Title className="text-center w-100 text-trip">Đặt vé chuyến đi</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <div className="container">
                                        <div className="row">
                                            <div className="col-12 mb-3">
                                                <label htmlFor="pickupAddress" className="form-label">
                                                    <i className="bi bi-geo-alt me-2"></i>Địa chỉ đón
                                                </label>
                                                <input
                                                    id="pickupAddress"
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Nhập địa chỉ đón"
                                                    value={pickupAddress}
                                                    onChange={(e) => setPickupAddress(e.target.value)}
                                                />
                                                <small className="text-danger">{errorPickupAddress}</small>
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label htmlFor="destinationAddress" className="form-label">
                                                    <i className="bi bi-geo-alt-fill me-2"></i>Địa chỉ đến
                                                </label>
                                                <input
                                                    id="destinationAddress"
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Nhập địa chỉ đến"
                                                    value={destinationAddress}
                                                    onChange={(e) => setDestinationAddress(e.target.value)}
                                                />
                                                <small className="text-danger">{errorDestinationAddress}</small>
                                            </div>
                                            <div className="col-6 mb-3">
                                                <label htmlFor="pickupTime" className="form-label">
                                                    <i className="bi bi-clock me-2"></i>Khung giờ đón
                                                </label>
                                                <input
                                                    id="pickupTime"
                                                    type="time"
                                                    className="form-control"
                                                    value={pickupTime}
                                                    onChange={(e) => setPickupTime(e.target.value)}
                                                />
                                                <small className="text-danger">{errorPickupTime}</small>
                                            </div>
                                            <div className="col-6 mb-3">
                                                <label htmlFor="ticketQuantity" className="form-label">
                                                    <i className="bi bi-ticket-perforated me-2"></i>Số lượng vé
                                                </label>
                                                <input
                                                    id="ticketQuantity"
                                                    type="number"
                                                    className="form-control"
                                                    value={ticketQuantity}
                                                    min={1} // Đảm bảo số lượng tối thiểu là 1
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value === '') {
                                                            setTicketQuantity('');
                                                        } else {
                                                            const num = parseInt(value);
                                                            const availableSeats = trip.seat - (trip.seatBooking || 0); // Tính số ghế còn lại

                                                            if (isNaN(num) || num < 1) { // Kiểm tra nếu không phải số hoặc nhỏ hơn 1
                                                                setTicketQuantity(1);
                                                            } else if (num > availableSeats) { // Mới: Kiểm tra nếu lớn hơn số ghế còn lại
                                                                setTicketQuantity(availableSeats > 0 ? availableSeats : 1); // Giới hạn về số ghế còn lại, hoặc 1 nếu hết ghế
                                                            }
                                                            else {
                                                                setTicketQuantity(num);
                                                            }
                                                        }
                                                    }}
                                                />
                                                <small className="text-danger">{errorTicketQuantity}</small>
                                            </div>

                                            <div className="total-price pt-4">
                                                <h4 className="mb-3">Chi tiết vé:</h4>
                                                <p className="fs-6 fw-medium">Tuyến: <strong>{trip.departure} <i className="fa-solid fa-arrow-right mx-2"></i> {trip.destination}</strong></p>
                                                <p className="fs-6 fw-medium">Ngày khởi hành: <strong>{trip.departureDate ? format(new Date(trip.departureDate), 'dd/MM/yyyy') : 'N/A'}</strong></p>
                                                <p className="fs-6 fw-medium">Khung giờ đón: <strong>{pickupTime || 'Chưa chọn'}</strong></p>
                                                <p className="fs-6 fw-medium">
                                                    Đơn
                                                    giá: <strong>{formatCurrency(trip.price - trip.price * trip.sale / 100)} / vé</strong>
                                                </p>
                                                <p className="fs-6 fw-medium">Số lượng vé: <strong>{ticketQuantity}</strong></p>
                                                <p className="fs-6 fw-medium">Thành
                                                    tiền: <strong>{formatCurrency((trip.price - trip.price * trip.sale / 100) * ticketQuantity)}</strong></p>
                                            </div>
                                        </div>
                                    </div>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={handleCloseModal} style={{ minWidth: '80px' }}>
                                        Hủy
                                    </Button>
                                    <Button variant="primary" onClick={handleBooking}>
                                        Xác nhận
                                    </Button>
                                </Modal.Footer>
                                {isProgressing &&
                                    <div
                                        className="w-100 h-100 position-fixed top-0 start-0 d-flex justify-content-center align-items-center"
                                        style={{ background: 'rgba(0,0,0,0.4)', zIndex: 9999 }}>
                                        <CircularProgress color="success" />
                                    </div>
                                }
                            </Modal>
                        </div>
                    </div>
                </div>
                <div className="row px-xl-5">
                    <div className="col">
                        <div className="nav nav-tabs justify-content-center border-bottom-gray mb-4">
                            <span className={`nav-item nav-link ${showDesc === 'desc' ? 'active' : ''}`}
                                onClick={() => setShowDesc('desc')}>Mô tả</span>
                            {/* Renamed "Facility" */}
                            <span className={`nav-item nav-link ${showDesc === 'review' ? 'active' : ''}`}
                                onClick={() => setShowDesc('review')}>Nhận xét ({reviews.totalElements})</span>
                        </div>
                        <div className="tab-content">
                            {showDesc === 'desc' ?
                                <Description />
                                :
                                showDesc === 'facility' ?
                                    <Facility />
                                    :
                                    < Review />
                            }
                        </div>
                    </div>
                </div>
            </div>
        </TripDetailContext.Provider>
    );
};

export default TripDetail;