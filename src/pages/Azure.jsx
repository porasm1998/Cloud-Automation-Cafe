import React, { useState } from "react";
import { Button, Form, Card } from "react-bootstrap";
import axios from "axios";
import graph from "../images/ap2.jpg";
import Header from "../Header";
import Review_header from "../components/Review_header";
import Output_header from "../components/Output_header";
import Output from "../components/Output";
import Api from "../settings.json"


export default function Azure() {

    const [location, setlocation] = useState("");
    const [vnet_cidr, setvnet_cidr] = useState("");
    const [subnet_cidr_1, setsubnet_cidr_1] = useState("");
    const [subnet_cidr_2, setsubnet_cidr_2] = useState("");
    const [vnet_location, setvnet_location] = useState("");
    const [env_name, setenv_name] = useState("");
    const [clientid, setclientid] = useState("");
    const [clientsecret, setclientsecret] = useState("");
    const [subscriptionid, setsubscriptionid] = useState("");
    const [tenantid, settenantid] = useState("");



    const [output, setoutput] = useState("");
    const [flag, setflag] = useState(true);
    const [flag1, setflag1] = useState(true);

    // const  {exec} = require("child_process");

    const configList = {

        "location": location,
        "vnet_cidr": vnet_cidr,
        "subnet_cidr_1": subnet_cidr_1,
        "subnet_cidr_2": subnet_cidr_2,
        "vnet_location": vnet_location,
        "env_name": env_name,
        "clientid": clientid,
        "clientsecret": clientsecret,
        "subscriptionid": subscriptionid,
        "tenantid": tenantid

    };

    const clearInputField = () => {

        setclientsecret("");
        setvnet_cidr("");
        setsubnet_cidr_1("");
        setsubnet_cidr_2("");
        setlocation("");
        setvnet_location("");
        setenv_name("");
        setclientid("");
        setsubscriptionid("");
        settenantid("");
    };
    const reviewList = (e) => {
        e.preventDefault();
        const values = [
            clientsecret,
            vnet_cidr,
            subnet_cidr_1,
            location,
            vnet_location,
            env_name,
            clientid,
            subscriptionid,
            tenantid
        ];

        const allFieldsFilled = values.every((field) => {
            const value = `${field}`.trim();
            return value !== "" && value !== "0";
        });

        if (allFieldsFilled) {
            setflag(false);
        } else {
            alert("fill all the fields");
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        

        axios({
            method: "post",
            header: { "Content-Type": "application/json" },
            url: Api.ip+"azure",
            data: configList,
        })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.log(error);
            });

        clearInputField();
        setflag1(false);
    };

    const onBack = (e) => {
        setflag(true);
    };
    var sno = 0;

    if (flag === true) {
        return (
            <>
                <div>
                    
                        <Header />

                        <hr
                    style={{

                        backgroundColor: "black",
                        opacity: .1

                    }}

                />


                <h4 className="text-center">Azure VNET</h4>

                <hr
                    style={{

                        backgroundColor: "black",
                        opacity: .1

                    }}

                />


                        <section classname="col-10 mx-auto">
               
                            <div>
                                <Form className="main-form">
                                <Card style={{ padding: '10px', margin: '10px', width: 'auto' }}> 
                                
                                    <Form.Group>
                                        <div className="row mt-2">
                                            <div className="col-6 col-6-xsmall">
                                                <Form.Control
                                                    type="text"
                                                    name="location"
                                                    id="location"
                                                    value={location}
                                                    onChange={(e) => setlocation(e.target.value)}
                                                    placeholder="Location"
                                                    required=""
                                                />
                                            </div>

                                            <div className="col-6 col-6-xsmall">
                                                <Form.Control
                                                    type="text"
                                                    onChange={(e) => setvnet_cidr(e.target.value)}
                                                    name="vnet_cidr"
                                                    id="vnet_cidr"
                                                    value={vnet_cidr}
                                                    placeholder="Vnet Cidr"
                                                    required=""
                                                />
                                            </div>
                                        </div>
                                    </Form.Group>

                                    <Form.Group>
                                        <div className="row mt-2">
                                            <div className="col-6 col-6-xsmall">
                                                <Form.Control
                                                    type="text"
                                                    onChange={(e) => setsubnet_cidr_1(e.target.value)}
                                                    name="subnet_cidr_1"
                                                    id="subnet_cidr_1"
                                                    value={subnet_cidr_1}
                                                    placeholder="subnet Cidr-1"
                                                    required=""
                                                />
                                            </div>
                                            <div className="col-6 col-6-xsmall">
                                                <Form.Control
                                                    type="text"
                                                    onChange={(e) => setsubnet_cidr_2(e.target.value)}
                                                    name="subnet_cidr_2"
                                                    id="subnet_cidr_2"
                                                    value={subnet_cidr_2}
                                                    placeholder="Subnet Cidr-2"
                                                    required=""
                                                />
                                            </div>
                                        </div>
                                    </Form.Group>

                                    <Form.Group>
                                        <div className="row mt-2">
                                            <div className="col-6 col-6-xsmall">
                                                <Form.Control
                                                    type="text"
                                                    onChange={(e) => setvnet_location(e.target.value)}
                                                    name="vnet_location"
                                                    id="vnet_location"
                                                    value={vnet_location}
                                                    placeholder="Vnet Location"
                                                    required=""
                                                />
                                            </div>
                                            <div className="col-6 col-6-xsmall">
                                                <Form.Control
                                                    type="text"
                                                    onChange={(e) => setenv_name(e.target.value)}
                                                    name="env_name"
                                                    id="env_name"
                                                    value={env_name}
                                                    placeholder="Environment Name"
                                                    required=""
                                                />
                                            </div>
                                        </div>
                                    </Form.Group>

                                    <Form.Group>
                                        <div className="row mt-2">
                                            <div className="col-6 col-6-xsmall">
                                                <Form.Control
                                                    type="text"
                                                    onChange={(e) => setclientid(e.target.value)}
                                                    name="clientid"
                                                    id="clientid"
                                                    value={clientid}
                                                    placeholder="Client Id"
                                                    required=""
                                                />
                                            </div>
                                            <div className="col-6 col-6-xsmall">
                                                <Form.Control
                                                    type="text"
                                                    onChange={(e) => setclientsecret(e.target.value)}
                                                    name="clientsecret"
                                                    id="clientsecret"
                                                    value={clientsecret}
                                                    placeholder="Client Secret"
                                                    required=""
                                                />
                                            </div>
                                        </div>
                                    </Form.Group>

                                    <Form.Group>
                                        <div className="row mt-2">
                                            <div className="col-6 col-6-xsmall">
                                                <Form.Control
                                                    type="text"
                                                    onChange={(e) => setsubscriptionid(e.target.value)}
                                                    name="subscriptionid"
                                                    id="subscriptionid"
                                                    value={subscriptionid}
                                                    placeholder="Subscription Id"
                                                    required=""
                                                />
                                            </div>
                                            <div className="col-6 col-6-xsmall">
                                                <Form.Control
                                                    type="text"
                                                    onChange={(e) => settenantid(e.target.value)}
                                                    name="tenantid"
                                                    id="tenantid"
                                                    value={tenantid}
                                                    placeholder="Tenant Id"
                                                    required=""
                                                />
                                            </div>
                                        </div>
                                    </Form.Group>


                                    <div className="col-12 mt-4">
                                        <Button
                                            style={{ marginRight: "16px" }}
                                            onClick={reviewList}
                                            className="primary"
                                        >
                                            Review
                                        </Button>
                                        <Button
                                            style={{ marginRight: "16px" }}
                                            onClick={clearInputField}
                                            type="reset"
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                    </Card>
                                </Form>
                            </div>
                            <br />


                        </section>


                       
                    
                </div>
            </>
        );
    } else {
        if (flag1 === true)
            return (
                <>
                    <Review_header/>
                        <div className="Review">
                            {Object.entries(configList).map(([key, value]) => {
                                sno += 1;
                                return (
                                    <div key={sno}>
                                        {key} : {value}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="Review-button">
                            <Button
                                type="submit"
                                style={{ marginRight: "16px" }}
                                onClick={onSubmit}
                                className="primary"
                            >
                                Create
                            </Button>
                            <Button
                                variant="primary"
                                style={{ marginRight: "16px" }}
                                onClick={onBack}
                            >
                                Back
                            </Button>
                        </div>
                    
                </>
            );
        else {
            //  "/var/www/html/cac/3tier_ap4_outputsbs.txt"
            /*
                var fs = require('fs');
                var filepath="/var/www/html/cac/3tier_ap4_outputsbs.txt";
                var file=fs.readFileSync(filepath);
                setoutput(file);
        
                fetch("/var/www/html/cac/3tier_ap4_outputsbs.txt")
               .then(response => console.log(response.text()))
              .then(data => {
              // Do something with your data
              console.log(data);
            });          
               
      */
            function rec() {
                axios
                    .get(Api.ip+"azure")
                    .then((response) => setoutput(response.data));
                setTimeout(rec, 3000);
            }
            rec();
            

          return (
            <>
            <Output output={output}/>
            </>
          );
        }
    }
}
