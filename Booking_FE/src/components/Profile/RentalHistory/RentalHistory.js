import React, {useContext, useEffect, useState} from 'react';
import {useSelector} from "react-redux";
import _ from 'lodash';
import {Link, useNavigate} from 'react-router-dom';
import BookingService from "../../../service/BookingService";
import {convertDateFormat, formatCurrency} from "../../../service/format";
import {CircularProgress, Pagination} from "@mui/material";
import Swal from "sweetalert2";
import {Button, Modal} from "react-bootstrap";
import {ErrorMessage, Field, Form, Formik} from "formik";
import {reviewSchema} from "../../../validate/validate";
import {getAllReviewsByAccountId} from "../../../service/reviewService";
import {format} from "date-fns";
import {saveNotify} from "../../../service/notifyService";
import {WebSocketContext} from "../../ChatBox/WebSocketProvider";
import axios from "axios";

const RentalHistory = () => {
        const navigate = useNavigate();
        const account = useSelector(state => state.account);
        const [rentalList, setRentalList] = useState([]);
        const [currentPage, setCurrentPage] = useState(1);
        const [totalPages, setTotalPages] = useState(1);
        const [load, setLoad] = useState(false);
        const [showReviewModal, setShowReviewModal] = useState(false);
        const [goldStar, setGoldStar] = useState([1, 2, 3, 4, 5]);
        const [booking, setBooking] = useState({});
        const [reviews, setReviews] = useState([]);
        const [isProgressing, setIsProgressing] = useState(false);
        const {sendNotify} = useContext(WebSocketContext);
        const {unreadNotify, toggleStatus} = useSelector(state => state);

        // Renamed from tripName to tripName
        const [tripName, setTripName] = useState('');
        const [status, setStatus] = useState('');
        const [departureDateFilter, setDepartureDateFilter] = useState(null); // Corresponds to trip.departureDate
        const [localDepartureDateFilter, setLocalDepartureDateFilter] = useState(null);

        useEffect(() => {
            getRentalList(account.id, currentPage - 1);
        }, [currentPage])

        useEffect(() => {
            getRentalList(account.id, currentPage - 1);
            getAllReviewsByAccountId(account.id).then(response => {
                setReviews(response.data);
            }).catch(error => {
                console.log(error);
            })
        }, [load, unreadNotify, toggleStatus, tripName, status, localDepartureDateFilter])


        const handleTripName = (e) => {
            let {value} = e.target;
            console.log(value);
            setTripName(value);
        }

        const changeDate = (dayValue) => {
            const date = dayValue.split("-");
            const year = parseInt(date[0]);
            const month = parseInt(date[1]);
            const day = parseInt(date[2]);

            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                const localDateTime = new Date(year, month - 1, day);
                localDateTime.setMinutes(0);
                localDateTime.setSeconds(0);

                return localDateTime.toISOString().slice(0, 16);
            } else {
                return "";
            }
        }
        const handleDepartureDateFilter = (e) => {
            setDepartureDateFilter(e.target.value);
            setLocalDepartureDateFilter(changeDate(e.target.value));
        }

        const getRentalList = (id, currentPage) => {
            let bookingFilter = {
                tripName: tripName, // Changed from tripName
                status: status,
                departureDate: localDepartureDateFilter // Using departureDate for filtering
            };
            // Assuming BookingService.getHistoryByAccount can now filter by tripName and departureDate
            // And the backend handles these filters for "Trip" entities
            BookingService.getHistoryByAccount(id, currentPage, bookingFilter).then((response) => {
                const result = response.data.content;
                setRentalList(result);
                setTotalPages(response.data.totalPages);
            }).catch(function (err) {
                console.log(err);
            })
        }
        const changePage = (e, value) => {
            setCurrentPage(value);
        }

        const cancelBooking = (item) => {
            Swal.fire({
                title: 'Nhập lý do hủy đặt vé', // Changed text
                input: 'text',
                inputAttributes: {
                    autocapitalize: 'off'
                },
                showCancelButton: true,
                cancelButtonText: 'Đóng',
                confirmButtonText: 'Gửi',
                preConfirm: (value) => {
                    if (!value) {
                        Swal.showValidationMessage('Vui lòng không để trống')
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    setIsProgressing(true);
                    BookingService.cancelBooking(item.id, {message: result.value}).then((response) => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Hủy đặt vé thành công !', // Changed text
                            showConfirmButton: false,
                            timer: 1500
                        }).then();
                        setIsProgressing(false);
                        setLoad(!load);
                        // Using departureDate for trip
                        const departureFormatted = item.trip.departureDate ? format(new Date(item.trip.departureDate), "dd/MM/yyyy") : 'N/A';
                        handleSendNotify(account, item.trip.owner.id, `${account.username} đã hủy đặt vé chuyến đi ${item.trip.name}. Ngày khởi hành: ${departureFormatted}.`, 'profile/trips-owner-booking') // Updated navigate path
                    }).catch(function (err) {
                        console.log(err);
                        setIsProgressing(false);
                    })
                }
            })
        }

        const showCancelBookingConfirm = (booking) => {
            const tripDepartureDate = new Date(booking.trip.departureDate); // Use trip.departureDate
            const now = new Date();
            const oneDayInMillis = 1000 * 60 * 60 * 12;

            if (booking.status === "Chờ xác nhận" || booking.status === "Chờ nhận vé") {
                if (tripDepartureDate.getTime() - now.getTime() > oneDayInMillis) {
                    Swal.fire({
                        title: 'Bạn chắc chắn muốn hủy đặt vé chuyến đi này?', // Changed text
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Xác nhận',
                        cancelButtonText: 'Đóng',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            cancelBooking(booking);
                        }
                    })
                } else if (tripDepartureDate.getTime() - now.getTime() <= oneDayInMillis && tripDepartureDate.getTime() > now.getTime()) {
                    Swal.fire({
                        title: 'Thời gian hủy nhỏ hơn 1 ngày tính tới ngày khởi hành, bạn sẽ chịu khoản phí 10% tiền vé.', // Changed text and percentage
                        icon: 'error',
                        showCancelButton: true,
                        confirmButtonText: 'Xác nhận',
                        cancelButtonText: 'Đóng',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            cancelBooking(booking);
                        }
                    })
                } else { // If departure date has passed
                    Swal.fire({
                        title: 'Không thể hủy vì chuyến đi đã khởi hành.', // New condition for passed departure date
                        icon: 'info',
                        showConfirmButton: true,
                    });
                }
            } else if (booking.status === "Đã hủy") {
                // No action for already cancelled bookings
                return;
            }
        }

        const showReviewForm = (booking) => {
            setShowReviewModal(true);
            setBooking(booking);
            setGoldStar([1, 2, 3, 4, 5]);
        }

        const handleReview = (values) => {
            const data = {
                ...values,
                booking,
                rating: Math.max(...goldStar)
            };
            BookingService.createReview(data).then(response => {
                Swal.fire({
                    icon: 'success',
                    title: 'Viết đánh giá thành công !',
                    showConfirmButton: false,
                    timer: 1500
                }).then();
                setShowReviewModal(false);
                setLoad(!load);
                const trip = response.data.booking.trip; // Changed from trip to trip
                handleSendNotify(account, trip.owner.id, `${account.username} đã bình luận về chuyến đi ${trip.name}.`, `trip-detail/${trip.id}`) // Updated navigate path
            }).catch(function (err) {
                console.log(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Viết đánh giá thất bại !',
                    showConfirmButton: false,
                    timer: 1500
                }).then();
            })
        }

        const checkBookingStatus = (item) => {
            if (item.status === "Đã hủy") {
                return null;
            } else if (item.status === 'Đã hoàn thành') { // Assuming "Đã trả phòng" for trip is "Đã hoàn thành" for trip
                const index = reviews.findIndex(review => review.booking.id === item.id);
                if (index < 0)
                    return (
                        <button className='btn border-primary text-primary'
                                onClick={() => showReviewForm(item)}>
                            Đánh giá
                        </button>
                    )
            } else if (item.status === 'Chờ xác nhận') {
                return (
                    <>
                        <button className='btn btn-danger'
                                onClick={() => showCancelBookingConfirm(item)}>
                            Hủy đặt vé
                        </button>
                        <br/>
                        <button className='btn btn-success mt-2' // Added margin top for spacing
                                onClick={() => bookingOnlineVnpay(item)}>
                            Thanh toán Vnpay
                        </button>
                    </>

                )
            } else if (item.status === "Chờ nhận vé") { // If there's a "Confirmed" status for trips
                return (
                    <button className='btn btn-danger'
                            onClick={() => showCancelBookingConfirm(item)}>
                        Hủy đặt vé
                    </button>
                );
            } else if (item.status === "Đã khởi hành") { // If there's an "On Trip" status
                return (
                    <span className="text-info">Đã khởi hành</span>
                );
            }
            return null; // Default return if no specific status matches
        }

        const handleSendNotify = (accountLogin, receiverId, message, navigate) => {
            const data = {
                sender: accountLogin,
                receiver: {id: receiverId},
                message,
                navigate
            }
            saveNotify(data).then(response => {
                sendNotify(response.data);
            }).catch(error => {
                console.log(error)
            })
        }

        const bookingOnlineVnpay = (bookingItem) => {
            const pay = {idBooking: bookingItem?.id, total:bookingItem?.total};
            console.log("bookingItem")
            console.log(pay)
            axios.post("http://localhost:8080/api/pay/vnpay", pay).then(resp => {
                window.open(resp.data);
                // window.close(); // You typically don't close the current window unless it's a popup
            })
        }

        return (
            <div className='col-9'>
                <div>
                    <h3 className="text-uppercase text-center mb-4">Lịch sử đặt vé chuyến đi</h3> {/* Changed title */}
                    <div className="mb-3 py-4 px-3"
                         style={{backgroundColor: "rgb(0,185,142)"}}>
                        <div className="row g-2">
                            <div className="col-md-3">
                                <select className="form-select py-2 border-0" value={status} onChange={(e) => {
                                    setStatus(e.target.value)
                                }}
                                        style={{minWidth: '200px'}}>
                                    <option value="">Tất cả</option>
                                    <option value="Chờ xác nhận">Chờ xác nhận</option> {/* Updated status */}
                                    <option value="Chờ nhận vé">Chờ nhận vé</option> {/* New status for trips */}
                                    <option value="Đang đi">Đang đi</option> {/* New status for trips */}
                                    <option value="Đã hoàn thành">Đã hoàn thành</option> {/* Updated status */}
                                    <option value="Đã hủy">Đã hủy</option>
                                </select>
                            </div>

                            <div className="col-md-5">
                                <input type="text" className="form-control border-0 py-2"
                                       placeholder="Nhập tên chuyến đi tìm kiếm" // Changed placeholder
                                       onInput={handleTripName} name="tripName" value={tripName}/> {/* Changed name/value */}
                            </div>
                            <div className="col-4">
                                <div className="input-group">
                                    <input type="date" className="form-control" name="departureDate" onChange={handleDepartureDateFilter} // Changed name
                                           value={departureDateFilter}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <table className="table">
                        <thead>
                        <tr align="center">
                            <th scope="col">STT</th>
                            <th scope="col">Tên chuyến đi</th> {/* Changed header */}
                            <th scope="col">Tuyến</th> {/* New header */}
                            <th scope="col">Ngày khởi hành</th> {/* Changed header */}
                            <th scope="col">Số lượng vé</th> {/* New header */}
                            <th scope="col">Tổng đơn</th>
                            <th scope="col">Trạng thái</th>
                            <th scope="col">Hành động</th>
                        </tr>
                        </thead>
                        <tbody style={{verticalAlign: 'middle'}}>
                        {!_.isEmpty(rentalList) ? rentalList.map((item, index) => {
                                return (
                                    <tr key={item.id} align="center">
                                        <th style={{width: '40px'}}>{index + 1}</th>
                                        <th>{item.trip?.name}</th> {/* Changed from trip?.name to trip?.name */}
                                        <td>{item.trip?.departure} <i className="fa-solid fa-arrow-right mx-1"></i> {item.trip?.destination}</td> {/* Displaying trip route */}
                                        <td>{item.trip?.departureDate ? convertDateFormat(item.trip.departureDate) : 'N/A'}</td> {/* Using trip.departureDate */}
                                        <td>{item.ticketQuantity}</td> {/* Displaying ticketQuantity */}
                                        <td>{formatCurrency(item.total)}</td>
                                        <td>{item.status === "Đã hủy" ?
                                            <span className={'text-danger'}>{item.status}</span> :
                                            <span>{item.status}</span>}</td>
                                        <td>
                                            {checkBookingStatus(item)}
                                        </td>
                                    </tr>
                                )
                            })
                            :
                            <tr align="center">
                                <td colSpan="8" className="pt-3 fs-5 text-danger">Danh sách trống</td>
                            </tr>
                        }
                        </tbody>
                    </table>
                    <span className={'text-danger'}>* Lưu ý :Nếu hủy đặt vé trước ngày khởi hành 1 ngày, bạn sẽ phải chịu một khoản phí bằng 10% tiền vé.</span> {/* Updated note */}
                    {!_.isEmpty(rentalList) ?
                        <div className="col-12 mt-5 d-flex justify-content-center">
                            <Pagination count={totalPages} size="large" variant="outlined" shape="rounded"
                                        onChange={changePage} color="primary"/>
                        </div>
                        :
                        null
                    }
                </div>

                <Modal
                    show={showReviewModal}
                    onHide={() => setShowReviewModal(false)}
                >
                    <Formik
                        initialValues={{
                            comment: ""
                        }}
                        validationSchema={reviewSchema}
                        onSubmit={(values) => {
                            handleReview(values);
                        }
                        }>
                        <Form>
                            <Modal.Header closeButton className="p-4">
                                <Modal.Title>Để lại đánh giá</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="px-4">
                                <div>
                                    <div className="d-flex my-3">
                                        <p className="mb-0 me-2">
                                            Đánh giá của bạn <span className="text-danger">*</span> :
                                        </p>
                                        <div className="star-review text-warning" style={{cursor: 'pointer'}}>
                                            <i className="fa-solid fa-star px-1"
                                               onMouseOver={() => setGoldStar([1])}>
                                            </i>

                                            <i className={`fa-solid fa-star px-1 ${goldStar.includes(2) ? '' : 'star-gray'}`}
                                               onMouseOver={() => setGoldStar([1, 2])}>
                                            </i>

                                            <i className={`fa-solid fa-star px-1 ${goldStar.includes(3) ? '' : 'star-gray'}`}
                                               onMouseOver={() => setGoldStar([1, 2, 3])}>
                                            </i>

                                            <i className={`fa-solid fa-star px-1 ${goldStar.includes(4) ? '' : 'star-gray'}`}
                                               onMouseOver={() => setGoldStar([1, 2, 3, 4])}>
                                            </i>

                                            <i className={`fa-solid fa-star px-1 ${goldStar.includes(5) ? '' : 'star-gray'}`}
                                               onMouseOver={() => setGoldStar([1, 2, 3, 4, 5])}>
                                            </i>
                                        </div>
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="form-label" htmlFor="comment">
                                            Nhận xét của bạn <span className="text-danger">*</span>
                                        </label>
                                        <Field as="textarea" id="comment" cols="30" rows="5"
                                               className="form-control" name="comment"/>
                                        <ErrorMessage name="comment" className="text-danger" component="small"/>
                                    </div>
                                </div>
                            </Modal.Body>
                            <Modal.Footer className="px-4">
                                <Button type="button" variant="secondary"
                                        onClick={() => setShowReviewModal(false)}
                                        style={{width: '70px'}}>
                                    Đóng
                                </Button>
                                <Button type="submit" variant="primary"
                                        style={{width: '70px'}}>
                                    Gửi
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Formik>
                </Modal>
                {isProgressing &&
                    <div
                        className="w-100 h-100 position-fixed top-0 start-0 d-flex justify-content-center align-items-center"
                        style={{background: 'rgba(0,0,0,0.4)', zIndex: 9999}}>
                        <CircularProgress color="success"/>
                    </div>
                }
            </div>
        );
    }
;

export default RentalHistory;