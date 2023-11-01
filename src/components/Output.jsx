import React from 'react'
// import Output_header from "../components/Output_header";
// import { useState } from 'react';
import Header from '../Header';
import graph from '../images/thumpsup.png';
import { Button, Card } from 'react-bootstrap';
import { NavLink } from "react-router-dom";
import  { useState } from "react";
import abc from "../images/CAC-Full-Logo-V1.0.jpg";



export default function Output(props) {
    var color=true
    // const [flag, setflag] = useState(true)

    return (
        <div>
          <div className="header">
            <img src={abc} className="img-right" alt="home img" />
          </div>
          <Card className="text-center">
            <Card.Header></Card.Header>
            <Card.Body>
              <Card.Title>Blueprint</Card.Title>
              <Card.Text>
                Your request have been submitted. Your blueprint will be ready in few mins
              </Card.Text>
   
              <NavLink style={{ marginRight: '1em' }} activeClassName="selected" to="/"><Button>Ok</Button></NavLink>

            </Card.Body>

            <Card.Footer className="text-muted"></Card.Footer>
          </Card>
          
          </div>
       
    )
}
