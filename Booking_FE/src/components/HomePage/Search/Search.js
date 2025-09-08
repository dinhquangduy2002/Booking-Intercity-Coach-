import React, {useEffect, useState} from 'react';
import _ from "lodash";
import {getAllProvinces} from "../../../service/addressService";

const Search = ({
                    setDeparture,
                    setDestination,
                    setCurrentPage,
                    setCategory,
                    setDepartureDate
                }) => {
    const [departures, setDepartures] = useState([]);
    const [destinations, setDestinations] = useState([]);

    const handleDateSearchChange = (event) => {
        setCurrentPage(1);
        setDepartureDate(event.target.value)
    };
    const handleOptionDepartureChange = (event) => {
        setCurrentPage(1);
        const provinceOption = event.target.value;
        setDeparture(provinceOption);
        if (provinceOption === "ĐIỂM KHỞI HÀNH") {
            setDestination("");
            setDeparture("");
        }
    };
    const handleOptionDestinationChange = (event) => {
        setCurrentPage(1);
        const provinceOption = event.target.value;
        setDestination(provinceOption);
        if (provinceOption === "ĐIỂM ĐẾN") {
            setDestination("");
            setDeparture("");
        }
    };


    const handleOptionCategoryChange = (event) => {
        setCurrentPage(1);
        setCategory(event.target.value);
    };


    useEffect(() => {
        getAllProvinces().then(response => {
            setDepartures(response.data.data);
            setDestinations(response.data.data);
        }).catch(error => {
            console.log(error)
        })
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }, [])
    return (
        <div className="container-fluid mb-5" style={{padding: "35px", backgroundColor: "rgb(0,185,142)"}}>
            <div className="container">
                <div className="row g-2">
                    <div className="col-md-12">
                        <div className="row g-2">


                            <div className="col-md-3">
                                <select className="form-select border-0 py-3" onChange={handleOptionDepartureChange}>
                                    <option>ĐIỂM KHỞI HÀNH</option>
                                    {!_.isEmpty(departures) && departures.map(province => (
                                        <option key={province.ProvinceID}
                                                value={province.ProvinceName}>
                                            {province.ProvinceName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <select className="form-select border-0 py-3" onChange={handleOptionDestinationChange}>
                                    <option>ĐIỂM ĐẾN</option>
                                    {!_.isEmpty(destinations) && destinations.map(province => (
                                        <option key={province.ProvinceID}
                                                value={province.ProvinceName}>
                                            {province.ProvinceName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <select className="form-select border-0 py-3" onChange={handleOptionCategoryChange}>
                                    <option value="0">Loại Xe</option>
                                    <option value="1">Thường</option>
                                    <option value="2">Cao cấp</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <input type="date" className="form-control border-0 py-3"
                                       onChange={handleDateSearchChange}/>
                            </div>
                        </div>
                    </div>
                    {/*<div className="col-md-2">*/}
                    {/*    <button className="btn btn-dark border-0 w-100 py-3">Tìm kiếm</button>*/}
                    {/*</div>*/}
                </div>
            </div>
        </div>
    );
};

export default Search;
