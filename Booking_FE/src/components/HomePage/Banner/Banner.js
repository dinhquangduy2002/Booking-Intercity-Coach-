import React from 'react';

const Banner = () => {
    return (
        <div className="container mb-5">
            <div id="slide-carousel" className="carousel slide text-center" data-bs-ride="carousel">
                <div className="carousel-indicators">
                    <button type="button" data-bs-target="#slide-carousel" data-bs-slide-to="0"
                            className="active" aria-current="true" aria-label="Slide 1"></button>
                    <button type="button" data-bs-target="#slide-carousel" data-bs-slide-to="1"
                            aria-label="Slide 2"></button>
                    <button type="button" data-bs-target="#slide-carousel" data-bs-slide-to="2"
                            aria-label="Slide 3"></button>
                </div>
                <div className="carousel-inner">
                    <div className="carousel-item active" data-bs-interval="3000">
                        <img
                            src="https://nhaxequocdat.com/wp-content/uploads/2023/12/quoc-dat-7.png"
                            className="img-thumbnail" alt="..." width={1200} style={{height: '560px'}}/>
                        {/*<div className="carousel-caption d-none d-md-block">
                            <h5>First slide label</h5>
                            <p>Some representative placeholder content for the first slide.</p>
                        </div>*/}
                    </div>
                    <div className="carousel-item" data-bs-interval="3000">
                        <img src="https://nhaxequocdat.com/wp-content/uploads/2023/12/quoc-dat-3.png"
                             className="img-thumbnail" alt="..." width={1200} style={{height: '560px'}}/>
                        {/*<div className="carousel-caption d-none d-md-block">
                            <h5>Second slide label</h5>
                            <p>Some representative placeholder content for the second slide.</p>
                        </div>*/}
                    </div>
                    <div className="carousel-item" data-bs-interval="3000">
                        <img
                            src="https://nhaxequocdat.com/wp-content/uploads/2023/12/quoc-dat-4.png"
                            className="img-thumbnail" alt="..." width={1200} style={{height: '560px'}}/>
                        {/*<div className="carousel-caption d-none d-md-block">
                            <h5>Third slide label</h5>
                            <p>Some representative placeholder content for the third slide.</p>
                        </div>*/}
                    </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#slide-carousel"
                        data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#slide-carousel"
                        data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>
        </div>
    );
};

export default Banner;
