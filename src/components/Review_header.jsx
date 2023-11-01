import React from 'react'
import abc from "../images/CAC-Full-Logo-V1.0.jpg"
export default function Review_header() {
    return (
        <div>
            <div className="clearfix">
                <div className="box3"></div>
                <div> <h4 className="box1">Review the parameters</h4> </div>
                <img src={abc} alt="z" className="box2" />
            </div>
            <hr style={{ backgroundColor: "black", opacity: .1 }} />
        </div>
    )
}
