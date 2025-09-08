import axios from "axios";

const API_URL = `http://localhost:8080/api/trips`;

const getTripById = (id) => {
  return axios.get(`${API_URL}/${id}`);
}

const getTripByIdAndOwnerId = (id, ownerId) => {
  return axios.get(`${API_URL}/${id}/${ownerId}`);
}


export {getTripById, getTripByIdAndOwnerId};
