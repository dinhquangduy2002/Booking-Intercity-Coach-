import axios from "axios";

const API_URL = `http://localhost:8080/api/images`;

const getAllImagesByTripId = (id) => {
    return axios.get(`${API_URL}/trip/${id}`);
}

export {getAllImagesByTripId}
