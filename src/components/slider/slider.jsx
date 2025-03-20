import React, { useState, useEffect } from "react";
import "./slider.scss";

function Slider({ images }) {
    const [imgIndex, setImgIndex] = useState(null);

    const changeSlide = (direction) => {
        setImgIndex(prev => 
            direction === "left" 
                ? (prev === 0 ? images.length - 1 : prev - 1)
                : (prev === images.length - 1 ? 0 : prev + 1)
        );
    };

    useEffect(() => {
        if (imgIndex !== null) {
            document.body.style.overflow = "hidden"; // Blocca lo scrolling
        } else {
            document.body.style.overflow = "auto"; // Ripristina lo scrolling
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [imgIndex]);

    return (
        <div className="slider">
            {imgIndex !== null && (
                <div className={`slideropen open`}>
                    <div className="arrow" onClick={() => changeSlide("left")}>
                        <img src="/arrow.png" alt="Left Arrow" className="left" />
                    </div>
                    <div className="imgContainer">
                        <img src={images[imgIndex]} alt={`Slide ${imgIndex}`} />
                    </div>
                    <div className="arrow" onClick={() => changeSlide("right")}>
                        <img src="/arrow.png" alt="Right Arrow" className="right" />
                    </div>
                    <div className="close" onClick={() => setImgIndex(null)}>X</div>
                </div>
            )}
            <div className="big">
                <img src={images[0]} alt="Main" onClick={() => setImgIndex(0)} />
            </div>
            <div className="small">
                {images.slice(1).map((image, index) => (
                    <img 
                        src={image} 
                        alt={`Thumbnail ${index + 1}`} 
                        key={index} 
                        className={imgIndex === index + 1 ? "active" : ""}
                        onClick={() => setImgIndex(index + 1)} 
                    />
                ))}
            </div>
        </div>
    );
}

export default Slider;
