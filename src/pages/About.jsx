import React from "react";
import abc from "../images/CAC-Full-Logo-V1.0.jpg";
const About = () => {
  return (
    <>
      <div className="d-flex align-items-center">
        <section id="header" className="">
          <div className="container-fluid nav_bg">
            <div className="row">
              <div className="col-10 mx-auto">
                <div className="row">
                  <div className="col-md-6 pt-5 pt-lg-0 order-2 order-lg-1">
                    <h1 style={{ color: "#3498db" }}>
                      <strong> Cloud Automation Café </strong>
                    </h1>
                    <h2 className="my-3">
                      Your platform for automating the entire spectrum of Cloud
                      activities spanning Workload Assessment, Foundation,
                      Migration, Blueprint based Provisioning, Operations and
                      FinOps.
                    </h2>

                    <div className="mt-3">
                      <a href="/service" className="btn-get-started">
                        Get Started
                      </a>
                    </div>
                  </div>

                  <div className="col-lg-6 order-1 order-lg-2 header-img">
                    <img src={abc} className="img-fluid animated" alt="home img" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;
