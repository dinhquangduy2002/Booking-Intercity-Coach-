import instance from "./axiosConfig";

const API_URL = '/api/owners';

const createTrip = (data) =>{
    return instance.post(`${API_URL}/create-trip`, data);
}

const editTrip = (data) =>{
    return instance.post(`${API_URL}/edit-trip`, data);
}

const cancelBookingOwner = (idBooking, message) => {
    return instance.post(`${API_URL}/cancel-booking/${idBooking}`, message);
}

export {createTrip, editTrip, cancelBookingOwner};