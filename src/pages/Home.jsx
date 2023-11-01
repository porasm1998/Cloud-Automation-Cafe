import React, { useContext, useRef, useState } from "react";
import { Container } from "react-bootstrap";
import abc from "../images/CAC-Full-Logo-V1.0.jpg";
import hashicorp from "../images/hashicorp.png";
import onePlaceForAllCloud from "../images/one-place-for-all-cloud.png";
import RequestSummaryGrid from "../components/dashboard/RequestSummaryGrid";
import RequestDetailsSlider from "../components/dashboard/RequestDetailsInfo";
import RequestLogSidebar from "../components/dashboard/RequestSummaryLogs";
import { createUseStyles } from "react-jss";
import { TabPanel, TabView } from "primereact/tabview";
import RequestStats from "../components/dashboard/RequestStats";
import { ToasterContext } from "../components/common/Context";

const DashboardHeader = () => {

  const useStyles = createUseStyles({
    'title': {
      color: '#3489ba',
      fontSize: '2em',
      textAlign: 'center'
    },
    'title-image': {
      height: '3rem'
    },
    'one-place-image': {
      height: '7rem'
    },
    'one-place-label': {
      fontSize: `${20 / 16}rem`
    },
    'one-place-image-container': {
      width: '41%'
    },
    'one-place-label-container': {
      width: '28%'
    },
    'container': {
      padding: 0
    }
  });

  const classes = useStyles();

  return (
    <div className="p-col-12">
      <div className="p-grid p-nogutter">
        <div className="p-col-6 p-text-left">
          <img src={hashicorp} alt="no image" className={classes["title-image"]} />
        </div>
        <div className="p-col-6 p-text-right">
          <img src={abc} alt="no image" className={classes["title-image"]} />
        </div>
        <div className={`p-col-12 ${classes.title}`}>
          Welcome to Cloud Automation Café !!
        </div>
        <div className="p-col-12">
          <div className={`p-col-12 p-text-center ${classes.container}`}>
            <div className="p-grid p-nogutter p-justify-start p-align-center">
              <div className={`p-col-4 p-text-right ${classes["one-place-image-container"]}`}>
                <img src={onePlaceForAllCloud} alt="no image" className={classes["one-place-image"]} />
              </div>
              <div className={`p-col-5 ${classes["one-place-label-container"]}`}>
                <span className={classes["one-place-label"]}>
                  Your one stop shop for automating the entire cloud spectrum.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Home = () => {

  const { addMessage } = useContext(ToasterContext);
  const [requestId, setRequestId] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [showRequestLogs, setShowRequestLogs] = useState(false);

  const onRowSelected = (row) => {
    setRequestId(row.requestId);
    setShowRequestDetails(true);
  }

  const onShowLogs = (row) => {
    setRequestId(row.requestId);
    setShowRequestLogs(true);
  }

  const useStyles = createUseStyles({
    'container': {
      marginTop: '4.5rem'
    },
    'dashboard-header': {
      color: '#3489ba',
    },
    'tabs': {
      boxShadow: '0px 0px 2px 4px #3489ba'
    }
  });

  const classes = useStyles();

  return (
    <>
      <Container fluid className={classes.container}>
        <div className="p-grid p-nogutter">
          <DashboardHeader></DashboardHeader>
          <div className="p-col-12">
            <div className="p-grid p-nogutter">
              <div className="p-col-12">
                <h4 className={classes["dashboard-header"]}>Dashboard</h4>
              </div>
              <div className={`p-col-12 ${classes.tabs}`}>
                <TabView>
                  <TabPanel header='Requests'>
                    <RequestSummaryGrid onError={addMessage} onRowSelected={onRowSelected}
                      onShowLogs={onShowLogs}>
                    </RequestSummaryGrid>
                    <RequestDetailsSlider onError={addMessage} requestId={requestId}
                      showSlider={showRequestDetails}
                      onHide={() => { setShowRequestDetails(false) }}></RequestDetailsSlider>
                    <RequestLogSidebar onError={addMessage} requestId={requestId}
                      showSlider={showRequestLogs}
                      onHide={() => { setShowRequestLogs(false) }}></RequestLogSidebar>
                  </TabPanel>
                  <TabPanel header="Charts">
                    <RequestStats onError={addMessage}></RequestStats>
                  </TabPanel>
                </TabView >
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export default Home;
