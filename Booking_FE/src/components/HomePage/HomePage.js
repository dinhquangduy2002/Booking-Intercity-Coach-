import React, {useEffect, useState} from 'react';
import tripByIdService from "../../service/TripByIdService";
import Banner from "./Banner/Banner";
import Search from "./Search/Search";
import Top5Booking from "./Top5/Top5Booking";
import TripComponent from "./trip/TripComponent";
import AdminTeam from "./AdminTeam/AdminTeam";

const HomePage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [departure, setDeparture] = useState("");
    const [destination, setDestination] = useState("");
    const [category, setCategory] = useState(0);
    const [departureDate, setDepartureDate] = useState("");
    const [trips, setTrips] = useState([]);

    const changePage = (e, value) => {
        setCurrentPage(value);
    }

    const getAllTripSearch = (currentPage, departure, destination, idCate, departureDate) => {
        tripByIdService.getAllTripSearch(currentPage, departure, destination, idCate, departureDate)
            .then((trips) => {
                setTrips(trips.content);
                setTotalPages(trips.totalPages);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    useEffect(() => {
        getAllTripSearch(currentPage - 1, departure, destination, category,departureDate)
    }, [currentPage, departure, destination, departureDate, category])


    return (
        <div className="container-home">
            <Banner/>

            <div className="container py-3">
                <h2 className="text-center mb-5">Top tuyến xe có lượt booking nhiều nhất</h2>
                <Top5Booking/>
                <br/>
                <br/>
                {/*Search begin*/}

                <Search setDeparture={setDeparture} setDestination={setDestination}
                        setCurrentPage={setCurrentPage} setCategory={setCategory} setDepartureDate={setDepartureDate}/>
                {/*Search End*/}
                <h2 className="text-center m-5">Danh sách các tuyến xe</h2>
                <TripComponent trips={trips} totalPages={totalPages} changePage={changePage}/>

                <AdminTeam/>
            </div>
        </div>
    );
};

export default HomePage;
