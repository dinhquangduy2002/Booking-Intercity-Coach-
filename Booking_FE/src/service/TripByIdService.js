import axios from 'axios';

const TripByIdService = {

    updateStatusTrip: (id, status) => {
        return new Promise((resolve, reject) => {
            axios
                .put(`http://localhost:8080/api/trips/owner/${id}?status=${status}`)
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                });
        });
    },

    getAllTripSearch: (currentPage = 0, departure= "", destination="", idCate=0, departureDate= "") => {
        return new Promise((resolve, reject) => {
            const formattedDeparture = departure.replace(/\s/g, "_");
            const formattedDestination = destination.replace(/\s/g, "_");
            axios
                .get(`http://localhost:8080/api/trips/search?page=${currentPage}&departure=${formattedDeparture}&destination=${formattedDestination}&departureDate=${departureDate}&idCate=${idCate}`)
                .then(response => {
                    resolve(response.data);
                })
                .catch(function (err) {
                    reject(err => console.log(err));
                });
        });
    },

    findByOwnerIdAndNameAndStatus: (ownerId, name, status, currentPage) => {
        console.log(ownerId, name, status, currentPage)
        return new Promise((resolve, reject) => {
            axios
                .get(`http://localhost:8080/api/trips/owner/search/${ownerId}?name=${name}&status=${status}&page=${currentPage}`)
                .then(response => {
                    resolve(response.data);
                })
                .catch(function (err) {
                    console.log(err)
                });
        })
    },
    findByOwnerId : (ownerId , currentPage) => {
        return new Promise((resolve, reject) => {
            axios
                .get(`http://localhost:8080/api/trips/owner/listTrip/${ownerId}?page=${currentPage}`)
                .then(response => {
                    resolve(response.data);
                })
                .catch(function (err) {
                    console.log(err)
                });
        })
    },
    getRevenueByOwnerId : (ownerId ) => {
        return new Promise((resolve, reject) => {
            axios
                .get(`http://localhost:8080/api/trips/owner/revenue/${ownerId}`)
                .then(response => {
                    resolve(response);
                })
                .catch(function (err) {
                    console.log(err)
                });
        })
    },

};


export default TripByIdService;
