import axios from "axios";

const API_URL = `http://localhost:8080/api/reviews`;

const getAllReviewsByTripId = (tripId, page = 0, size = 5) => {
    return axios.get(`${API_URL}/trip/${tripId}?page=${page}&size=${size}`);
}

const avgRatingByTripId = (tripId) => {
    return axios.get(`${API_URL}/avg-rating/${tripId}`);
}

const getAllReviewsByAccountId = (accountId) => {
    return axios.get(`${API_URL}/accounts/${accountId}`);
}

export {getAllReviewsByTripId, avgRatingByTripId, getAllReviewsByAccountId}
