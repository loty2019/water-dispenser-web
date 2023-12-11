import React from 'react';
import './FluidMeter.css'; // Make sure to import your CSS file

const FluidMeter = ({ percentage }) => {

    let adjustedPercentage;
    let waterStyle = {};
    waterStyle.top = "";
    if (percentage <= 0) {
        waterStyle.top = '-100%';
    } else if (percentage >= 100) {
        waterStyle.top = '-200%';
    } else {
        waterStyle.top = `-1${percentage}%`;
    }


    return (
        <div className="water-container">
        <div className="water" >
            <div className="water-before" style={waterStyle}></div>
            <div className="water-after" style={waterStyle}></div>
        </div>
        </div>
    );
};

export default FluidMeter;
