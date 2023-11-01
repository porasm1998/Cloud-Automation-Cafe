import React from "react";

import { NavLink } from "react-router-dom";
import { Card } from "react-bootstrap";


const Cards = (props) => {
  return (
    <>
            
      <Card


            
        style={{  width: '12rem', margin: '4px', height: '12em' ,background:'#ADD8E6'}}
        className="mb-2  text-dark bg-light "
      >

        <Card.Body>
          <h6 className="fw-bold">{props.title}</h6>
          
          {/* <Card.Title>  </Card.Title>
          <Card.Text className="cardDesc">
            
          This application architecture blueprint automatically provisions 3-tier Web Application
          </Card.Text> */}
        </Card.Body>
        <div className="cardbtn">
          <NavLink to={props.to} className=" btn btn-outline-primary">
            Go To ➡
          </NavLink>
        </div>
      </Card>


    </>
  );
};

export default Cards;

