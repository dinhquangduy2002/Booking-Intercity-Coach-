import React, { useEffect, useState, useRef } from 'react';
import { ErrorMessage, Field, Form, Formik } from "formik";
import { getAllDistrictsByProvinceId, getAllProvinces, getAllWardsByDistrictId } from "../../service/addressService";
import _ from 'lodash';
// You will need to create/update this schema in your validate/validate.js
// It should validate fields like name, departure, destination, licensePlate, seat, driver, price, departureDate, thumbnail, images.
import { saveTripSchema } from "../../validate/validate"; // NEW: Rename/Update your validation schema
import { Modal } from "react-bootstrap";
import './saveTrip.scss'; // Keep if styling is generic, update if specific to trip
// You will need to ensure these service functions handle Trip entity on backend
import { createTrip, editTrip } from "../../service/ownerService"; // Assuming ownerService handles trips now
import Swal from 'sweetalert2'
import ThumbnailItem from "./ThumbnailItem/ThumbnailItem";
import ImageItem from "./ImageItem/ImageItem";
import TinyMCE from "./TinyMCE/TinyMCE";
import { Link, useNavigate, useParams } from "react-router-dom";
// You will need to ensure these service functions handle Trip entity on backend
import { getTripByIdAndOwnerId } from "../../service/tripService"; // Assuming tripService for fetching
import { getAllImagesByTripId } from "../../service/imageService"; // Assuming imageService for trip images
import ImageItemEdit from "./ImageItemEdit/ImageItemEdit";
import { useSelector } from "react-redux";
import { format } from 'date-fns'; // For formatting LocalDate from backend if needed for initial values

const SaveTrip = () => {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [provinceName, setProvinceName] = useState("");
    const [districtName, setDistrictName] = useState("");
    const [isDescription, setIsDescription] = useState(true);
    const [showTinyMCE, setShowTinyMCE] = useState(false);
    const [thumbnailURL, setThumbnailURL] = useState("");
    const [imagesURL, setImagesURL] = useState([]);
    const [imagesURLEdit, setImagesURLEdit] = useState([]);
    const [imagesURLDelete, setImagesURLDelete] = useState([]);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [imagesFile, setImagesFile] = useState([]);
    const [trip, setTrip] = useState({}); // Renamed from trip
    const [description, setDescription] = useState("");
    const [driverInfo, setDriverInfo] = useState(""); // Renamed from facility to driverInfo for Trip entity
    const account = useSelector(state => state.account);
    const navigate = useNavigate();

    const { tripId } = useParams(); // Renamed from tripId

    const thumbnailRef = useRef();
    const imagesRef = useRef();

    const handleClose = () => setShowTinyMCE(false);
    const handleShowDescription = () => {
        setShowTinyMCE(true);
        setIsDescription(true);
    }

    const handleShowDriverInfo = () => { // Renamed from handleShowFacility
        setShowTinyMCE(true);
        setIsDescription(false);
    }

    const editorRef = useRef(null);
    const handleSaveTinyMCE = (values) => {
        if (!editorRef.current) return;
        if (editorRef.current.getContent()) {
            console.log(editorRef.current.getContent())
            if (isDescription) {
                values.description = "Bài viết mô tả đã được lưu. Click để sửa bài viết";
                setDescription(editorRef.current.getContent());
            } else {
                values.driver = "Thông tin tài xế đã được lưu. Click để sửa"; // Updated for driverInfo
                setDriverInfo(editorRef.current.getContent()); // Updated for driverInfo
            }
        } else {
            if (isDescription) {
                values.description = "";
                setDescription("");
            } else {
                values.driver = ""; // Updated for driverInfo
                setDriverInfo(""); // Updated for driverInfo
            }
        }
        handleClose();
    };

    useEffect(() => {
        const callAPI = async () => {
            const provincesData = await getAllProvinces();
            setProvinces(provincesData.data.data);

            if (tripId) { // Renamed from tripId
                const imagesTripData = await getAllImagesByTripId(tripId); // Renamed service
                setImagesURLEdit(imagesTripData.data);

                const tripData = await getTripByIdAndOwnerId(tripId, account.id); // Renamed service
                setThumbnailURL(tripData.data.thumbnail);
                setTrip(tripData.data); // Renamed from setTrip
                setDescription(tripData.data.description);
                setDriverInfo(tripData.data.driver); // Using driver for TinyMCE content
                setProvinceName(tripData.data.address?.split(', ')[2] || ''); // Assuming address format "tripNumber, ward, district, province"
                setDistrictName(tripData.data.address?.split(', ')[1] || ''); // Assuming district from address
            } else {
                setTrip({ // Initial values for new trip
                    name: "",
                    departure: "",
                    destination: "",
                    licensePlate: "",
                    seat: "",
                    driver: "", // This will be from TinyMCE content
                    price: "",
                    sale: 0,
                    area: "", // Still exists in Trip entity
                    description: "",
                    category: 1, // Default category ID
                    thumbnail: "",
                    images: "",
                    address: "", // Combined address from province/district/ward/tripNumber
                    departureDate: ""
                })
            }
        }

        callAPI().then();
    }, [tripId, account.id]) // Added account.id to dependencies

    useEffect(() => {
        if (provinceName) {
            const province = provinces.find(item => item.ProvinceName === provinceName);
            if (province) {
                getAllDistrictsByProvinceId(province.ProvinceID).then(response => {
                    setDistricts(response.data.data);
                }).catch(error => {
                    console.log(error)
                })
            }
        } else {
            setDistricts([]);
            setDistrictName("");
        }
    }, [provinceName, provinces])

    useEffect(() => {
        if (districtName) {
            const district = districts.find(item => item.DistrictName === districtName);
            if (district) {
                getAllWardsByDistrictId(district.DistrictID).then(response => {
                    setWards(response.data.data);
                }).catch(error => {
                    console.log(error)
                })
            }
        } else {
            setWards([]);
        }
    }, [districtName, districts])

    const handleThumbnailFile = (event, values) => {
        values.thumbnail = 'is valid';
        setThumbnailFile(event.target.files[0]);
        if (thumbnailRef) thumbnailRef.current.value = null;
    }

    const handleImagesFile = (event, values) => {
        values.images = 'is valid';
        setImagesFile([...imagesFile, ...event.target.files]);
        if (imagesRef) imagesRef.current.value = null;
    }

    const handleSaveTrip = (values) => { // Renamed from handleSaveTrip
        const data = { ...values };
        data.id = parseInt(tripId); // Renamed from tripId
        // Construct the full address string from selected province, district, ward, and tripNumber
        data.address = `${data.tripNumber}, ${data.ward}, ${data.district}, ${data.province}`; // Assuming `address` field in Trip entity stores this general location
        data.description = description;
        data.driver = driverInfo; // Assigning TinyMCE content for driver info
        data.thumbnail = thumbnailURL;
        data.owner = { id: account.id };
        data.category = { id: values.category }; // category for trip (vehicle type)
        // Ensure departureDate is sent in appropriate format (e.g., "YYYY-MM-DD")
        data.departureDate = values.departureDate; // This is a LocalDate, so "YYYY-MM-DD" string is fine

        if (tripId) { // Renamed from tripId
            data.createAt = trip.createAt;
            data.status = trip.status;
            data.images = [...imagesURLEdit, ...imagesURL];
            data.imagesDelete = imagesURLDelete;
            console.log("data")
            console.log(data)
            editTrip(data).then(response => { // Renamed service
                Swal.fire({
                    icon: 'success',
                    title: 'Cập nhật chuyến đi thành công !', // Updated text
                    showConfirmButton: false,
                    timer: 1500
                })
                navigate("/profile/trips-owner"); // Updated navigate path
            }).catch(error => {
                console.log(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Cập nhật chuyến đi thất bại !', // Updated text
                    showConfirmButton: false,
                    timer: 1500
                })
            })
        } else {
            data.images = imagesURL;
            createTrip(data).then(response => { // Renamed service
                Swal.fire({
                    icon: 'success',
                    title: 'Thêm chuyến đi thành công !', // Updated text
                    showConfirmButton: false,
                    timer: 1500
                })
                navigate("/profile/trips-owner"); // Updated navigate path
            }).catch(error => {
                console.log(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Thêm chuyến đi thất bại !', // Updated text
                    showConfirmButton: false,
                    timer: 1500
                })
            })
        }
    }

    return (
        <div className="container">
            {!_.isEmpty(trip) && // Renamed from trip
                <Formik
                    initialValues={{
                        name: trip.name,
                        departure: trip.departure,
                        destination: trip.destination,
                        licensePlate: trip.licensePlate,
                        seat: trip.seat,
                        driver: trip.driver ? "Thông tin tài xế đã được lưu. Click để sửa" : "", // Changed from bathroom/facility
                        province: trip.address?.split(', ')[3] || '', // Parsing address from trip object for initial value
                        district: trip.address?.split(', ')[2] || '',
                        ward: trip.address?.split(', ')[1] || '',
                        tripNumber: trip.address?.split(', ')[0] || '', // Assuming tripNumber is the first part of address
                        price: trip.price,
                        category: trip.category?.id || 1, // Category ID for trip type
                        sale: trip.sale,
                        area: trip.area,
                        description: trip.description ? "Bài viết mô tả đã được lưu. Click để sửa bài viết" : "",
                        thumbnail: thumbnailURL ? "is valid" : "",
                        images: !_.isEmpty(imagesURLEdit) ? "is valid" : "",
                        departureDate: trip.departureDate ? format(new Date(trip.departureDate), 'yyyy-MM-dd') : '', // Format date for input type="date"
                    }}
                    innerRef={(actions) => {
                        if (actions && actions.touched.province)
                            setProvinceName(actions.values.province);

                        if (actions && actions.touched.district)
                            setDistrictName(actions.values.district);
                    }}
                    validationSchema={saveTripSchema} // Renamed schema
                    validateOnBlur={true}
                    validateOnChange={true}
                    onSubmit={values => {
                        handleSaveTrip(values); // Renamed handler
                    }}>
                    {({ values }) => (
                        <Form>
                            <div className="row">
                                <h2 className="text-center text-uppercase mb-5">{tripId ? "Sửa đổi thông tin chuyến đi" : "Thêm chuyến đi mới"}</h2> {/* Updated text */}
                                <div className="mb-3 col-4">
                                    <label htmlFor="name" className="form-label">Tên chuyến đi</label> {/* Updated text */}
                                    <Field type="text" className="form-control" id="name" placeholder="Nhập tên chuyến đi"
                                        name="name" />
                                    <ErrorMessage name="name" className="text-danger" component="small" />
                                </div>

                                <div className="mb-3 col-4">
                                    <label htmlFor="departure" className="form-label">Điểm xuất phát</label> {/* New field */}
                                    <Field type="text" className="form-control" id="departure" placeholder="Nhập điểm xuất phát"
                                        name="departure" />
                                    <ErrorMessage name="departure" className="text-danger" component="small" />
                                </div>

                                <div className="mb-3 col-4">
                                    <label htmlFor="destination" className="form-label">Điểm đến</label> {/* New field */}
                                    <Field type="text" className="form-control" id="destination" placeholder="Nhập điểm đến"
                                        name="destination" />
                                    <ErrorMessage name="destination" className="text-danger" component="small" />
                                </div>

                                <div className="mb-3 col-3">
                                    <label htmlFor="licensePlate" className="form-label">Biển số xe</label> {/* New field */}
                                    <Field type="text" className="form-control" id="licensePlate" placeholder="Nhập biển số xe"
                                        name="licensePlate" />
                                    <ErrorMessage name="licensePlate" className="text-danger" component="small" />
                                </div>

                                <div className="mb-3 col-3">
                                    <label htmlFor="seat" className="form-label">Số ghế</label> {/* New field (repurposed from bedroom) */}
                                    <Field type="number" className="form-control" id="seat" placeholder="Nhập số ghế"
                                        name="seat" />
                                    <ErrorMessage name="seat" className="text-danger" component="small" />
                                </div>

                                <div className="mb-3 col-3">
                                    <label htmlFor="departureDate" className="form-label">Ngày khởi hành</label> {/* New field */}
                                    <Field type="date" className="form-control" id="departureDate" name="departureDate" />
                                    <ErrorMessage name="departureDate" className="text-danger" component="small" />
                                </div>

                                <div className="mb-3 col-3">
                                    <label htmlFor="category" className="form-label">Loại phương tiện</label> {/* Updated text */}
                                    <Field as="select" className="form-select" name="category">
                                        <option value="">---Vui lòng chọn---</option>
                                        <option value="1">Ô tô</option> {/* Example categories for trips */}
                                        <option value="2">Xe khách</option>
                                        <option value="3">Xe bus</option>
                                    </Field>
                                    <ErrorMessage name="category" className="text-danger" component="small" />
                                </div>

                                {/* Address fields (for general trip location/base) */}
                                <div className="col-3 form-group mb-3">
                                    <label className="form-label" htmlFor="province">
                                        Tỉnh/Thành phố (địa chỉ chung)
                                    </label>
                                    <Field as="select" className="form-select" id="province" name="province">
                                        <option value="">---Chọn Tỉnh/Thành phố---</option>
                                        {!_.isEmpty(provinces) && provinces.map(province => (
                                            <option key={province.ProvinceID}
                                                value={province.ProvinceName}>
                                                {province.ProvinceName}
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="province" className="text-danger" component="small" />
                                </div>

                                <div className="col-3 form-group mb-3">
                                    <label className="form-label" htmlFor="district">Quận/Huyện (địa chỉ chung)</label>
                                    <Field as="select" className="form-select" id="district" name="district">
                                        <option value="">---Chọn Quận/Huyện---</option>
                                        {!_.isEmpty(districts) && districts.map(district => (
                                            <option key={district.DistrictID}
                                                value={district.DistrictName}>
                                                {district.DistrictName}
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="district" className="text-danger" component="small" />
                                </div>

                                <div className="col-3 form-group mb-3">
                                    <label className="form-label" htmlFor="ward">Phường/Xã (địa chỉ chung)</label>
                                    <Field as="select" className="form-select" id="ward" name="ward">
                                        <option value="">---Chọn Phường/Xã---</option>
                                        {!_.isEmpty(wards) && wards.map(ward => (
                                            <option key={ward.WardCode} value={ward.WardName}>
                                                {ward.WardName}
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="ward" className="text-danger" component="small" />
                                </div>

                                <div className="col-md-3 form-group mb-3">
                                    <label className="form-label" htmlFor="tripNumber">Số nhà/Đường (địa chỉ chung)</label> {/* Renamed from tripNumber to be more generic for an address part */}
                                    <Field className="form-control" id="tripNumber" type="text" name="tripNumber"
                                        placeholder="Nhập địa chỉ chi tiết" />
                                    <ErrorMessage name="tripNumber" className="text-danger" component="small" />
                                </div>

                                <div className="col-md-3 form-group mb-3">
                                    <label className="form-label" htmlFor="price">Giá tiền (VNĐ/vé)</label> {/* Updated text */}
                                    <Field className="form-control" id="price" type="number" name="price"
                                        placeholder="Nhập giá tiền" />
                                    <ErrorMessage name="price" className="text-danger" component="small" />
                                </div>

                                <div className="col-md-3 form-group mb-3">
                                    <label className="form-label" htmlFor="sale">Giảm giá (%)</label>
                                    <Field className="form-control" id="sale" type="number" name="sale"
                                        placeholder="Nhập % giảm giá" />
                                    <ErrorMessage name="sale" className="text-danger" component="small" />
                                </div>

                                <div className="col-md-3 form-group mb-3">
                                    <label className="form-label" htmlFor="area">Diện tích (m2)</label> {/* Still exists in Trip entity */}
                                    <Field className="form-control" id="area" type="number" name="area"
                                        placeholder="Nhập diện tích" />
                                    <ErrorMessage name="area" className="text-danger" component="small" />
                                </div>

                                <div className="col-md-6 form-group mb-3">
                                    <label htmlFor="description" className="form-label">Mô tả chuyến đi</label> {/* Updated text */}
                                    <Field as="textarea" type="text" className="form-control" id="description" readOnly
                                        name="description" placeholder="Click để viết bài mô tả"
                                        onClick={handleShowDescription} />
                                    <ErrorMessage name="description" className="text-danger" component="small" />
                                </div>

                                <div className="col-md-6 form-group mb-3">
                                    <label htmlFor="driver" className="form-label">Thông tin tài xế</label> {/* Renamed from facility to driver */}
                                    <Field as="textarea" type="text" className="form-control" id="driver" readOnly
                                        name="driver" placeholder="Click để viết thông tin tài xế" // Updated placeholder
                                        onClick={handleShowDriverInfo} /> {/* Renamed handler */}
                                    <ErrorMessage name="driver" className="text-danger" component="small" />
                                </div>

                                <div className="col-md-6 form-group mb-3">
                                    <label htmlFor="thumbnail" className="form-label">Ảnh đại diện</label>
                                    <input type="file" className="form-control" id="thumbnail" name="thumbnail"
                                        ref={thumbnailRef}
                                        onChange={(event) => handleThumbnailFile(event, values)} accept={"image/jpeg ,image/png"} />
                                    <ErrorMessage name="thumbnail" className="text-danger" component="small" />
                                </div>

                                <div className="col-md-6 form-group mb-3">
                                    <label htmlFor="images" className="form-label">Ảnh giới thiệu chi tiết</label>
                                    <input type="file" className="form-control" id="images" name="images"
                                        multiple={true}
                                        onChange={(event) => handleImagesFile(event, values)} ref={imagesRef} accept={"image/jpeg ,image/png"} />
                                    <ErrorMessage name="images" className="text-danger" component="small" />
                                </div>

                                <div className="col-md-6 form-group mb-3">
                                    <ThumbnailItem file={thumbnailFile} setThumbnailFile={setThumbnailFile}
                                        setThumbnailURL={setThumbnailURL} thumbnailURL={thumbnailURL}
                                        values={values} />
                                </div>

                                <div className="col-md-6 form-group mb-3">
                                    {!_.isEmpty(imagesURLEdit) && imagesURLEdit.map((item, index) => (
                                        <ImageItemEdit key={item.id} index={index} url={item.url}
                                            setImageURLEdit={setImagesURLEdit} values={values}
                                            imagesFile={imagesFile} setImagesURLDelete={setImagesURLDelete} />
                                    ))}

                                    {!_.isEmpty(imagesFile) && imagesFile.map(file => (
                                        <ImageItem file={file} setImagesFile={setImagesFile}
                                            setImagesURL={setImagesURL} key={file.name}
                                            imagesFile={imagesFile} values={values} tripId={tripId} />
                                    ))}

                                </div>

                                <div className="text-center my-3">
                                    <button type="submit" className="btn btn-lg btn-primary me-3"
                                        style={{ minWidth: '120px' }}>
                                        {tripId ? "Cập nhật" : "Thêm chuyến đi"} {/* Updated text */}
                                    </button>
                                    <Link to="/profile/owner-trips" className="btn btn-lg btn-secondary" // Updated navigate path
                                        style={{ minWidth: '120px' }}>
                                        Hủy
                                    </Link>
                                </div>
                            </div>

                            <Modal
                                show={showTinyMCE}
                                onHide={handleClose}
                                size="lg"
                                aria-labelledby="contained-modal-title-vcenter"
                                centered
                            >
                                <TinyMCE editorRef={editorRef} handleSaveTinyMCE={handleSaveTinyMCE}
                                    description={description} isDescription={isDescription}
                                    facility={driverInfo} values={values} handleClose={handleClose} /> {/* Passing driverInfo as facility prop */}
                            </Modal>
                        </Form>
                    )}
                </Formik>
            }
        </div>
    );
};

export default SaveTrip;