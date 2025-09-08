import React, {useContext, useEffect, useState} from 'react';
import {Link} from "react-router-dom";
import _ from "lodash";
import {convertDateFormat, formatCurrency, getTotalDays} from "../../../service/format";
import {CircularProgress, Pagination} from "@mui/material";
import {useSelector} from "react-redux";
import BookingService from "../../../service/BookingService"; // Ensure this service interacts with Booking entity correctly
import Swal from "sweetalert2";
import {Button, Modal} from "react-bootstrap";
import {cancelBookingOwner} from "../../../service/ownerService"; // Assuming this service handles owner-related booking actions
import {saveNotify} from "../../../service/notifyService";
import {WebSocketContext} from "../../ChatBox/WebSocketProvider";
import {format} from "date-fns";

const SearchBooking = () => {
    const [selectedDateStart, setSelectedDateStart] = useState(null);
    const [selectedDateEnd, setSelectedDateEnd] = useState(null);
    const [valueDateStart, setValueDateStart] = useState(null);
    const [valueDateEnd, setValueDateEnd] = useState(null);
    const [status, setStatus] = useState("");
    const [nameSearch, setNameSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [bookings, setBookings] = useState([]);
    const account = useSelector(state => state.account);
    const [isLoad, setIsLoad] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [bookingDetail, setBookingDetail] = useState({});
    const [isProgressing, setIsProgressing] = useState(false);
    const {sendNotify} = useContext(WebSocketContext);
    const unreadNotify = useSelector(state => state.unreadNotify);

    useEffect(() => {
        searchBookingsByOwnerId(account.id, nameSearch, status, selectedDateStart, selectedDateEnd, currentPage - 1);
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, [currentPage, nameSearch, selectedDateStart, selectedDateEnd, status, isLoad, unreadNotify, account.id]); // Added account.id to dependencies

    const changePage = (e, value) => {
        setCurrentPage(value);
    };

    const changeDate = (selectedDate) => {
        const dateParts = selectedDate.split("-");
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const day = parseInt(dateParts[2]);

        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            // Assuming your backend expects YYYY-MM-DDTHH:MM:SS format
            const dateTime = new Date(year, month - 1, day);
            dateTime.setMinutes(0);
            dateTime.setSeconds(0);
            return dateTime.toISOString().slice(0, 16); // "2024-06-17T00:00"
        } else {
            return "";
        }
    };

    const handleDateChange = (event) => {
        const selectedDate = event.target.value;
        setValueDateStart(selectedDate);
        const formattedDatetime = changeDate(selectedDate);
        setSelectedDateStart(formattedDatetime);
    };

    const handleDateChangeEnd = (event) => {
        const selectedDate = event.target.value;
        setValueDateEnd(selectedDate);
        const formattedDatetime = changeDate(selectedDate);
        setSelectedDateEnd(formattedDatetime);
    };

    const handleNameSearch = (event) => {
        const nameSearch = event.target.value;
        setNameSearch(nameSearch);
    };

    const handleOptionChange = (event) => {
        const optionValue = event.target.value;
        setStatus(optionValue);
    };

    const searchBookingsByOwnerId = (ownerId, nameSearch, status, selectedDateStart, selectedDateEnd, currentPage) => {
        BookingService.searchBookingsByOwnerId(ownerId, nameSearch, status, selectedDateStart, selectedDateEnd, currentPage)
            .then((response) => { // Assuming response has data.content and data.totalPages
                setBookings(response.data.content);
                setTotalPages(response.data.totalPages);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleCancelBooking = (booking) => {
        Swal.fire({
            title: 'Bạn chắc chắn muốn hủy đặt chuyến đi của khách?', // Updated text
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Đóng',
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Nhập lý do hủy chuyến đi', // Updated text
                    input: 'text',
                    inputAttributes: {
                        autocapitalize: 'off'
                    },
                    showCancelButton: true,
                    cancelButtonText: 'Đóng',
                    confirmButtonText: 'Gửi',
                    preConfirm: (value) => {
                        if (!value) {
                            Swal.showValidationMessage('Vui lòng không để trống');
                        }
                    }
                }).then((reasonResult) => { // Renamed result to reasonResult
                    if (reasonResult.isConfirmed) {
                        setIsProgressing(true);
                        cancelBookingOwner(booking.id, {message: reasonResult.value})
                            .then((res) => {
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Hủy lịch đặt chuyến đi thành công !', // Updated text
                                    showConfirmButton: false,
                                    timer: 1500
                                }).then();
                                setIsLoad(!isLoad);
                                setIsProgressing(false);
                                // Ensure booking.trip.name and booking.account.id are correct
                                const from = format(new Date(booking.create_at), "dd/MM/yyyy"); // Using create_at as a placeholder if no trip start date
                                const to = format(new Date(booking.create_at), "dd/MM/yyyy"); // Using create_at as a placeholder if no trip end date
                                // If your Booking entity has startTime/endTime for the trip itself, use those.
                                handleSendNotify(account, booking.account.id, `Chủ chuyến đi đã hủy lịch đặt chuyến đi ${booking.trip?.name}. Lịch đặt: ${from} - ${to}. Lý do: ${reasonResult.value}`, 'profile/rental-history'); // Updated text
                            })
                            .catch(err => {
                                console.log(err);
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Hủy lịch đặt chuyến đi thất bại !', // Updated text
                                    showConfirmButton: false,
                                    timer: 1500
                                }).then();
                                setIsProgressing(false);
                            });
                    }
                });
            }
        });
    };

    const handleCompleteTripBooking = (booking) => { // Renamed from handleCheckOutBooking
        Swal.fire({
            title: 'Bạn chắc chắn muốn đánh dấu chuyến đi này đã hoàn thành?', // Updated text
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Đóng',
        }).then((result) => {
            if (result.isConfirmed) {
                // Assuming you have a specific service method for completing a trip booking
                BookingService.checkoutBookingAdmin(booking.id) // New method name
                    .then((res) => {
                        setIsLoad(!isLoad);
                        Swal.fire({
                            icon: 'success',
                            title: 'Trạng thái chuyến đi đã được cập nhật thành công !', // Updated text
                            showConfirmButton: false,
                            timer: 1000
                        }).then();
                        sendNotify({receiver: {id: booking.account.id}, message: 'Trạng thái đặt chuyến đi của bạn đã thay đổi.'}); // Updated message
                    })
                    .catch(err => {
                        console.log(err);
                        Swal.fire({ // Added error handling for consistency
                            icon: 'error',
                            title: 'Có lỗi xảy ra khi cập nhật trạng thái!',
                            showConfirmButton: false,
                            timer: 1000
                        });
                    });
            }
        });
    };

    const handleStartTripBooking = (booking) => { // Renamed from handleCheckInBooking
        Swal.fire({
            title: 'Bạn chắc chắn muốn đánh dấu chuyến đi này đã khởi hành?', // Updated text
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Đóng',
        }).then((result) => {
            if (result.isConfirmed) {
                // Assuming you have a specific service method for starting a trip booking
                BookingService.checkinBookingAdmin(booking.id) // New method name
                    .then((res) => {
                        setIsLoad(!isLoad);
                        Swal.fire({
                            icon: 'success',
                            title: 'Trạng thái chuyến đi đã được cập nhật thành công !', // Updated text
                            showConfirmButton: false,
                            timer: 1000
                        }).then();
                        sendNotify({receiver: {id: booking.account.id}, message: 'Trạng thái đặt chuyến đi của bạn đã thay đổi.'}); // Updated message
                    })
                    .catch(err => {
                        console.log(err);
                        Swal.fire({ // Added error handling for consistency
                            icon: 'error',
                            title: 'Có lỗi xảy ra khi cập nhật trạng thái!',
                            showConfirmButton: false,
                            timer: 1000
                        });
                    });
            }
        });
    };

    const waitOwnerConfirmBooking = (booking) => {
        Swal.fire({
            title: 'Bạn chắc chắn muốn xác nhận lịch đặt chuyến đi này ?', // Updated text
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Đóng',
        }).then((result) => {
            if (result.isConfirmed) {
                setIsProgressing(true);
                BookingService.waitOwnerConfirmBooking(booking.id)
                    .then((res) => {
                        setIsLoad(!isLoad);
                        Swal.fire({
                            icon: 'success',
                            title: 'Xác nhận lịch đặt chuyến đi thành công !', // Updated text
                            showConfirmButton: false,
                            timer: 1500
                        }).then();
                        setIsProgressing(false);
                        const from = format(new Date(booking.create_at), "dd/MM/yyyy"); // Using create_at as a placeholder if no trip start date
                        const to = format(new Date(booking.create_at), "dd/MM/yyyy"); // Using create_at as a placeholder if no trip end date
                        // If your Booking entity has startTime/endTime for the trip itself, use those.
                        handleSendNotify(account, booking.account.id, `Chủ chuyến đi đã xác nhận lịch đặt chuyến đi ${booking.trip?.name}. Lịch đặt: ${from} - ${to}`, 'profile/rental-history'); // Updated text
                    })
                    .catch(err => {
                        console.log(err);
                        Swal.fire({ // Added error handling for consistency
                            icon: 'error',
                            title: 'Có lỗi xảy ra khi xác nhận lịch đặt chuyến đi!',
                            showConfirmButton: false,
                            timer: 1000
                        });
                        setIsProgressing(false);
                    });
            }
        });
    };

    const handleSendNotify = (accountLogin, receiverId, message, navigate) => {
        const data = {
            sender: accountLogin,
            receiver: {id: receiverId},
            message,
            navigate
        };
        saveNotify(data).then(response => {
            sendNotify(response.data);
        }).catch(error => {
            console.log(error);
        });
    };

    const checkStatusBooking = (bookingCheck) => {
        // Updated statuses for trip bookings
        switch (bookingCheck.status) {
            case "Chờ xác nhận":
                return (
                    <div className={'d-flex justify-content-evenly'}>
                        <button onClick={() => waitOwnerConfirmBooking(bookingCheck)}
                                className="btn border border-primary text-primary" style={{width: '105px'}}>
                            Chấp nhận
                        </button>
                        <button
                            className="btn border border-danger text-danger ms-2"
                            onClick={() => handleCancelBooking(bookingCheck)}
                        >
                            Hủy
                        </button>
                        <button className="btn border-primary text-primary ms-2"
                                onClick={() => handleBookingDetail(bookingCheck)}>
                            Chi tiết
                        </button>
                    </div>
                );
            case "Chờ nhận vé": // New status, replacing "Chờ nhận phòng" for trips
                return (
                    <div className={'d-flex justify-content-evenly'}>
                        <button onClick={() => handleStartTripBooking(bookingCheck)} // Renamed
                                className="btn border border-primary text-primary" style={{width: '105px'}}>
                            Khởi hành
                        </button>
                        <button className="btn border border-danger text-danger ms-2"
                                onClick={() => handleCancelBooking(bookingCheck)}>
                            Hủy
                        </button>
                        <button className="btn border-primary text-primary ms-2"
                                onClick={() => handleBookingDetail(bookingCheck)}>
                            Chi tiết
                        </button>
                    </div>
                );
            case "Đã khởi hành": // Renamed from "Đang ở"
                return (
                    <div className={'d-flex justify-content-evenly'}>
                        <button className="btn border border-primary text-primary"
                                onClick={() => handleCompleteTripBooking(bookingCheck)} style={{width: '105px'}}> {/* Renamed */}
                            Hoàn thành
                        </button>
                        <button className="btn border-primary text-primary ms-2"
                                onClick={() => handleBookingDetail(bookingCheck)}>
                            Chi tiết
                        </button>
                    </div>
                );
            default: // For "Đã hoàn thành", "Đã hủy", etc.
                return (
                    <button className="btn border-primary text-primary ms-2"
                            onClick={() => handleBookingDetail(bookingCheck)}>
                        Chi tiết
                    </button>
                );
        }
    };

    const handleBookingDetail = (booking) => {
        setBookingDetail(booking);
        setShowModal(true);
    };

    const showBookingStatus = (booking) => {
        switch (booking.status) {
            case 'Chờ xác nhận':
                return (
                    <b style={{color: 'blue'}}>Chờ xác nhận</b>
                );
            case 'Đã hủy':
                return (
                    <b style={{color: 'red'}}>Đã hủy</b>
                );
            case 'Đã hoàn thành':
                return (
                    <b style={{color: 'green'}}>Đã hoàn thành</b>
                );
            case 'Chờ nhận vé':
                return (
                    <b>Chờ nhận vé</b>
                );
            case 'Đã khởi hành': // Renamed from "Đang ở"
                return (
                    <b style={{color: 'darkorange'}}>Đã khởi hành</b>
                );
            default: // Fallback for any unhandled status
                return (
                    <b>{booking.status}</b>
                );
        }
    };

    return (
        <div className="col-9">
            <div className="container-fluid">
                <h3 className="text-uppercase text-center mb-5">Lịch sử đặt chuyến đi</h3> {/* Updated title */}
                <div className="mb-3 py-4 px-3"
                     style={{backgroundColor: "rgb(0,185,142)"}}>
                    <div className="row g-2">
                        <div className="col-md-3">
                            <select className="form-select py-2 border-0" value={status}
                                    onChange={handleOptionChange} style={{minWidth: '200px'}}>
                                <option value="">Tất cả</option>
                                <option value="Chờ nhận vé">Chờ nhận vé</option> {/* Updated status */}
                                <option value="Đã hoàn thành">Đã hoàn thành</option> {/* Updated status */}
                                <option value="Đã hủy">Đã hủy</option>
                                <option value="Đã khởi hành">Đã khởi hành</option> {/* Updated status */}
                                <option value="Chờ xác nhận">Chờ xác nhận</option>
                            </select>
                        </div>

                        <div className="col-md-5">
                            <input type="text" className="form-control border-0 py-2"
                                   placeholder="Nhập tên chuyến đi tìm kiếm" // Updated placeholder
                                   name="nameSearch" // Added name attribute
                                   id="nameSearch" value={nameSearch} onInput={handleNameSearch}/>
                        </div>
                        <div className="col-2">
                            <div className="input-group">
                                <input type="date" className="form-control" value={valueDateStart}
                                       onChange={handleDateChange}/>
                            </div>
                        </div>
                        <div className="col-2">
                            <div className="input-group">
                                <input type="date" className="form-control" value={valueDateEnd}
                                       onChange={handleDateChangeEnd}/>
                            </div>
                        </div>
                    </div>
                </div>

                <table className="table">
                    <thead>
                    <tr align="center">
                        <th>STT</th>
                        <th>Chuyến đi</th> {/* Updated header */}
                        <th>Ngày đặt</th> {/* Assumed booking.create_at is the booking date */}
                        <th>Thời gian chuyến đi</th> {/* Assuming this is derived or separate field */}
                        <th>Trạng thái</th>
                        <th style={{width: '25%'}}>Hành động</th>
                    </tr>
                    </thead>
                    <tbody style={{verticalAlign: 'middle'}}>
                    {!_.isEmpty(bookings) ? bookings.map((b, index) => {
                            return (
                                <tr key={b.id} align="center">
                                    <td>
                                        <h5>{index + 1}</h5>
                                    </td>
                                    <td>
                                        <Link to={`/trip-detail/${b.trip?.id}`}
                                              className="nav-link d-flex align-items-center">
                                            <img className="flex-shrink-0 img-fluid border rounded"
                                                 src={b.trip?.thumbnail} alt="" // Added ?. for safety
                                                 style={{width: 80, height: 80}}/>
                                            <div className="d-flex flex-column text-start ps-4">
                                                <h5 className="text-truncate">{b.trip?.name}</h5> {/* Added ?. for safety */}
                                                <div className="text-truncate me-3"><i
                                                    className="fa fa-map-marker-alt me-2"
                                                    style={{color: "rgb(0,185,142)"}}></i>
                                                    {b.pickUp} - {b.destination} {/* Using booking's pickUp/destination */}
                                                </div>
                                                <div className="text-truncate"><i
                                                    className="far fa-money-bill-alt me-2"
                                                    style={{color: "rgb(0,185,142)"}}></i>
                                                    {formatCurrency(b.total)} {/* Using booking's total */}
                                                </div>
                                            </div>
                                        </Link>
                                    </td>

                                    <td>
                                        {/* Assuming create_at is your booking date */}
                                        {b.create_at ? convertDateFormat(b.create_at) : 'N/A'}
                                    </td>
                                    <td>
                                        {/* Assuming 'time' field in Booking entity represents trip time/duration */}
                                        {b.time ? b.time : 'N/A'}
                                    </td>

                                    <td style={{width: '180px'}}>
                                        {showBookingStatus(b)}
                                    </td>
                                    <td>
                                        <div className={'d-flex '}>
                                            {checkStatusBooking(b)}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                        :
                        <tr align="center">
                            <td colSpan="6" className="pt-3 fs-5 text-danger">Danh sách trống</td>
                        </tr>
                    }
                    </tbody>
                </table>
                {!_.isEmpty(bookings) ?
                    <div className="col-12 mt-5 d-flex justify-content-center">
                        <Pagination count={totalPages} size="large" variant="outlined" shape="rounded"
                                    onChange={changePage} color="primary"/>
                    </div>
                    :
                    null
                }
            </div>

            <Modal
                size="lg"
                centered
                show={showModal}
                onHide={() => setShowModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Chi tiết lịch đặt chuyến đi
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {!_.isEmpty(bookingDetail) &&
                        <div className="px-4">
                            <div className="row">
                                <div className="col-6">
                                    <h5 className="mb-3">Thông tin chuyến đi</h5> {/* Updated text */}
                                    <p className="mb-2">
                                        <span className="fw-medium">Tên chuyến đi:</span> {bookingDetail.trip?.name} {/* Updated text */}
                                    </p>
                                    <p className="mb-2">
                                        <span className="fw-medium">Tài xế:</span> {bookingDetail.trip?.driver} {/* Using trip.driver */}
                                    </p>
                                    <p>
                                        <span className="fw-medium">Lộ trình:</span> {bookingDetail.trip?.departure} - {bookingDetail.trip?.destination}
                                    </p>
                                    <p><span className="fw-medium">Ảnh:</span></p>
                                    <img src={bookingDetail.trip?.thumbnail} alt="Ảnh chuyến đi" height={200}
                                         width={200}/>
                                </div>
                                <div className="col-6">
                                    <h5 className="mb-3">Thông tin khách đặt</h5> {/* Updated text */}
                                    <p className="mb-2">
                                        <span
                                            className="fw-medium">Tên tài khoản:</span> {bookingDetail.account?.username}
                                    </p>
                                    <p className="mb-2">
                                    <span
                                        className="fw-medium">Họ và tên:</span> {bookingDetail.account?.lastname} {bookingDetail.account?.firstname}
                                    </p>
                                    <p className="mb-2">
                                        <span className="fw-medium">Email:</span> {bookingDetail.account?.email}
                                    </p>
                                    <p className="mb-2">
                                        <span className="fw-medium">Địa chỉ:</span> {bookingDetail.account?.address}
                                    </p>
                                    <p className="mb-2">
                                        <span className="fw-medium">Số điện thoại:</span> {bookingDetail.account?.phone}
                                    </p>
                                    <p className="mb-2">
                                        <span className="fw-medium">Điểm đón:</span> {bookingDetail.pickUp}
                                    </p>
                                    <p className="mb-2">
                                        <span className="fw-medium">Điểm đến:</span> {bookingDetail.destination}
                                    </p>
                                    <p className="mb-2">
                                        <span className="fw-medium">Số lượng ghế:</span> {bookingDetail.quantity}
                                    </p>
                                    <p className="mb-2">
                                        <span className="fw-medium">Thời gian chuyến đi: </span> {/* Updated text */}
                                        {bookingDetail.time} {/* Using booking.time */}
                                    </p>
                                    <p className="mb-2">
                                        <span
                                            className="fw-medium">Tổng tiền:</span> {formatCurrency(bookingDetail.total)}
                                    </p>
                                    <p className="mb-2">
                                        <span className="fw-medium">Trạng thái:</span> {showBookingStatus(bookingDetail)} {/* Use showBookingStatus for consistent styling */}
                                    </p>
                                </div>
                            </div>
                        </div>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" className="py-2 px-3"
                            onClick={() => setShowModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
            {isProgressing &&
                <div
                    className="w-100 h-100 position-fixed top-0 start-0 d-flex justify-content-center align-items-center"
                    style={{background: 'rgba(0,0,0,0.4)'}}>
                    <CircularProgress color="success"/>
                </div>
            }
        </div>
    );
};

export default SearchBooking;