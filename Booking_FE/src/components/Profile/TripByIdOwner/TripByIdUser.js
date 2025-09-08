import React, {useEffect, useState} from 'react';
import Swal from "sweetalert2";
// Assuming you have a specific service for trip-related operations
// Make sure tripService.js has methods like updateStatusTrip and findByOwnerIdAndNameAndStatus
import tripService from "../../../service/TripByIdService"; // Renamed service import
import {Pagination} from "@mui/material";
import {formatCurrency} from "../../../service/format";
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";
import _ from 'lodash';

const TripByIdUser = () => {
    const [status, setStatus] = useState("");
    const [nameSearch, setNameSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [trips, setTrips] = useState([]); // Renamed from houses
    const [selectedTrip, setSelectedTrip] = useState({}); // Renamed from trip to selectedTrip to avoid conflict with `trips` array
    const account = useSelector(state => state.account);

    const changePage = (e, value) => {
        setCurrentPage(value);
    };

    const handleStatusChange = (e, trip) => {
        const newStatus = e.target.value;
        if (newStatus === trip.status) {
            return;
        }
        Swal.fire({
            title: 'Bạn có chắc muốn thay đổi trạng thái chuyến đi này thành "' + newStatus + '"?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có, thay đổi!'
        }).then((result) => {
            if (result.isConfirmed) {
                const updatedTrip = { ...trip, status: newStatus }; // Cập nhật trạng thái mới cho chuyến đi
                updateStatus(updatedTrip); // Gọi hàm để gửi cập nhật lên server
            }

        });
    };


    const updateStatus = (tripToUpdate) => { // Renamed from trip
        // Ensure your tripService has an `updateStatusTrip` method that expects a trip ID and the new status
        tripService
            .updateStatusTrip(tripToUpdate.id, tripToUpdate.status) // Assuming this service call exists
            .then(() => {
                setSelectedTrip(tripToUpdate); // Update state to trigger re-fetch/re-render
                Swal.fire({
                    icon: 'success',
                    title: 'Trạng thái chuyến đi đã được cập nhật thành công !', // Updated text
                    showConfirmButton: false,
                    timer: 1000
                });
            })
            .catch((err) => {
                console.log(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Chuyến đi đã có booking hoặc đang lỗi, hãy kiểm tra lại !', // Updated text
                    showConfirmButton: false,
                    timer: 1000
                });
            });
    };

    const findByOwnerIdAndNameAndStatus = (id, nameSearch, status, currentPage) => {
        // Ensure your tripService has a method to find trips by owner, name, and status
        tripService.findByOwnerIdAndNameAndStatus(id, nameSearch, status, currentPage)
            .then((response) => { // Assuming response has content and totalPages
                console.log(response)
                setTrips(response.content);
                setTotalPages(response.totalPages);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleOptionChange = (event) => {
        const optionValue = event.target.value;
        setStatus(optionValue);
    };

    const handleNameSearch = (event) => {
        const nameSearch = event.target.value;
        setNameSearch(nameSearch);
    };

    useEffect(() => {
        // Trigger a fetch whenever currentPage, selectedTrip (status update), global status filter, or name search changes
        findByOwnerIdAndNameAndStatus(account.id, nameSearch, status, currentPage - 1);
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, [currentPage, selectedTrip, status, nameSearch, account.id]); // Added account.id to dependencies

    return (
        <div className="col-9">
            <h3 className="text-uppercase text-center mb-5">Danh sách chuyến đi</h3> {/* Updated title */}
            <div className="mb-3 py-4 px-3"
                 style={{backgroundColor: "rgb(0,185,142)"}}>
                <div className="row g-2">
                    <div className="col-md-4">
                        <select className="form-select py-2 border-0" value={status}
                                onChange={handleOptionChange}>
                            <option value="">Tất cả</option>
                            <option value="Sắp khởi hành">Sắp khởi hành</option> {/* Updated status options */}
                            <option value="Đang khởi hành">Đang khởi hành</option>
                            <option value="Đã hoàn thành">Đã hoàn thành</option>
                            <option value="Đã hủy">Đã hủy</option>
                            <option value="Đang bảo trì">Đang bảo trì</option> {/* Example for "Đang sửa" equivalent */}
                        </select>
                    </div>

                    <div className="col-md-8">
                        <input type="text" className="form-control border-0 py-2" placeholder="Nhập tên chuyến đi tìm kiếm" // Updated placeholder
                               name="nameSearch" // Added name attribute
                               id="nameSearch" value={nameSearch} onInput={handleNameSearch}/>
                    </div>
                </div>
            </div>
            <Link to="/add-trip" className="btn btn-lg btn-primary mb-3">Thêm chuyến đi mới</Link> {/* Updated text and path */}
            <table className="table">
                <thead>
                <tr align="center" style={{fontSize: '20px'}}>
                    <th>STT</th>
                    <th>Chuyến đi</th> {/* Updated header */}
                    <th style={{minWidth: '130px'}}>Giá</th>
                    <th style={{width: '150px'}}>Trạng thái</th>
                    <th style={{minWidth: '150px'}}>Hành động</th>
                </tr>
                </thead>
                <tbody style={{verticalAlign: 'middle'}}>
                {!_.isEmpty(trips) ? trips.map((trip, index) => {
                        return (
                            <tr key={trip.id} align="center">
                                <td>
                                    <h5>{index + 1}</h5>
                                </td>
                                <td className="text-truncate">
                                    <Link to={`/trip-detail/${trip.id}`} className="nav-link d-flex align-items-center"> {/* Updated path */}
                                        <img className="flex-shrink-0 img-fluid border rounded"
                                             src={trip.thumbnail} alt=""
                                             style={{width: 80, height: 80}}/>
                                        <div className="d-flex flex-column text-start ps-4">
                                            <h5 className="text-truncate">{trip.name}</h5>
                                            <div className="me-3">
                                                <i className="fa fa-map-marker-alt me-2"
                                                   style={{color: "rgb(0,185,142)"}}>
                                                </i>
                                                {trip.departure} - {trip.destination} {/* Displaying departure-destination */}
                                            </div>

                                        </div>
                                    </Link>
                                </td>

                                <td className="mb-3">
                                    <div className="text-truncate"><i
                                        className="far fa-money-bill-alt me-2"
                                        style={{color: "rgb(0,185,142)"}}></i>
                                        {formatCurrency(trip.price)}
                                    </div>                                </td>
                                <td className="mb-3">

                                    <td className="mb-3">
                                        <select
                                            // ClassName để áp dụng màu sắc dựa trên trạng thái hiện tại
                                            className={`form-select border ${
                                                trip.status === "Đang bảo trì" ? "border-danger text-danger" : // Đỏ cho "Đang bảo trì"
                                                    trip.status === "Sắp khởi hành" ? "border-warning text-warning" : // Vàng cho "Sắp khởi hành"
                                                        "border-primary text-primary" // Xanh dương cho các trạng thái khác
                                            }`}
                                            value={trip.status} // Luôn hiển thị trạng thái hiện tại của chuyến đi
                                            onChange={(e) => handleStatusChange(e, trip)} // Truyền event và trip vào hàm xử lý
                                        >
                                            {/* Tất cả các tùy chọn trạng thái */}
                                            <option value="Sắp khởi hành">Sắp khởi hành</option>
                                            <option value="Đang khởi hành">Đang khởi hành</option>
                                            <option value="Đã hoàn thành">Đã hoàn thành</option>
                                            <option value="Đã hủy">Đã hủy</option>
                                            <option value="Đang bảo trì">Đang bảo trì</option>
                                        </select>
                                    </td>
                                </td>

                                <td className="mb-3">
                                    <Link to={`/edit-trip/${trip.id}`} className="btn btn-trip"> {/* Updated path */}
                                        Sửa thông tin
                                    </Link>
                                </td>
                            </tr>
                        );
                    })
                    :
                    <tr align="center">
                        <td colSpan="5" className="pt-3 fs-5 text-danger">Danh sách trống</td>
                    </tr>
                }
                </tbody>
            </table>
            {!_.isEmpty(trips) ?
                <div className="col-12 mt-5 d-flex justify-content-center">
                    <Pagination count={totalPages} size="large" variant="outlined" shape="rounded"
                                onChange={changePage} color="primary"/>
                </div>
                :
                null
            }
        </div>
    );
};

export default TripByIdUser;