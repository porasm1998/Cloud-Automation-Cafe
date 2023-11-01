import React, { useState, useEffect } from "react";
import axios from "axios";

import { Card } from "primereact/card";

import Api from "../../settings.json";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";

import { useContext, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { ConnectionInfo } from "../common/connectionInfo";
import { ToasterContext } from "../common/Context";
import { DropDownList } from "../constants/constant";
import DataDrivenForm from "../dataDrivenForm/DataDrivenForm";
import Output from "../Output";
import { Review } from "../Review/Review";
import input from "./input.json";
import cac from "../../images/CAC-Full-Logo-V1.0.jpg";
import { UserContext } from "../common/Context";
const { ip } = "../../settings.json";
function App() {
  const [fileNames, setFileNames] = useState([]);
  const [visible, setVisible] = useState(false);
  const [refresh, setrefresh] = useState(false);
  const [usecasedata, setusecasedata] = useState([]);
  const [usecase, setusecase] = useState({});
  const { user, setUser: setContextUser } = useContext(UserContext);
  const [form, setForm] = useState({
    configList1: {},
    configList: {}
    ,
    output: "",
  });
  const [formIndex, setFormIndex] = useState(0);

  const [showCloudConnectionPopup, setShowCloudConnectionPopup] =
    useState(false);

  const [aws_access_key, setaws_access_key] = useState(null);

  const [aws_secret_key, setaws_secret_key] = useState(null);

  const [dropDownOptions, setDropDownOptions] = useState({});

  const { addMessage } = useContext(ToasterContext);

  const [formschema, setformschema] = useState(null);

  const [formname, setformname] = useState("");
  const [usecaseid, setsetusecaseid] = useState();
  const options = []

  const getDropDownValues = (categoryName) => {
    return axios.get(`${Api.ip}standardControl/${categoryName}`);
  };

  const getAllCategoryDropDownList = async (categories) => {
    const requestMap = categories.map((category) =>
      getDropDownValues(category)
    );
    try {
      const values = await Promise.allSettled(requestMap);
      const valueObject = values.reduce((acc, { value: { data } }, index) => {
        acc[categories[index]] = data.map((i) => ({
          ...i,
          ...{
            originalName: i.name,
            name: `${i.name} || ${i.value}`,
          },
        }));
        return acc;
      }, {});
      setDropDownOptions((p) => ({ ...p, ...valueObject }));
    } catch (e) {
      addMessage({
        severity: "error",
        summary: "Enterprise Standards & Controls",
        detail: `Error fetching the Enterprise Standards & Controls`,
      });
    }
  };

  // var schema = useMemo(() => (
  //   formschema
  // ), [dropDownOptions]);

  const onSubmit = (form) => {
    const { fields } = formschema;
    
      const configList1 = preparePreviewObject(form, fields);
      const configList = {
        usecaseid:usecaseid,
        parameter: { ...form },
      };
      setForm({ configList1, configList, output: "" });
      setFormIndex(1);
    
  };
  const preparePreviewObject = (form, fields) => {
    return fields.reduce((acc, item) => {
      if (item.fields) {
        acc = { ...acc, ...preparePreviewObject(form, item.fields) };
      } else {
        acc = { ...acc, ...{ [item.label]: form[item.name] } };
      }
      console.log("acc",acc);
      return acc;
    }, {});
  };

  const setCredentials = (input) => {
    setaws_access_key(input.accessKey);
    setaws_secret_key(input.secretKey);
  };

  const submitdetails = (e) => {
    const data = e.currentTarget.getAttribute("data");

    Object.keys(JSON.parse(data)).map(function (key, index) {});
    setusecase(JSON.parse(data));
    const useCaseId = JSON.parse(data).useCaseId;
    setformname(JSON.parse(data).name);
    setsetusecaseid(useCaseId)

    axios.get(`${Api.ip}usecase/form/${useCaseId}`).then((data) => {
      setformschema(data.data);
      console.log(data.data);
      // console.log("input", input);
    }).catch((error)=>{
      console.log(error);
    })
  };

  useEffect(() => {
    // categories = [STANDARD_CONTROL_CATEGORIES.REGION];
    //getAllCategoryDropDownList(categories);
    const { userId } = user;
    axios
      .get(`${Api.ip}usecase/dynamic/${userId}`)
      .then((res) => {
        console.log("print",res.data);
        
        setusecasedata(res.data);
      })
      .catch((err) => {
        console.log("something went wrong", err);
      });
  }, [refresh]);

  // console.log(fileNames);
  return (
    <>
      <div className="card flex justify-content-center cac-container">
        
        <Sidebar
          className="p-sidebar-left"
          visible={visible}
          onHide={() => setVisible(false)}
        >
          <h2>UseCases</h2>
          <div className="card flex flex-wrap justify-content-center gap-2">
            {usecasedata.map((data, index) => {
              const data1 = JSON.stringify(data);

              return (
                <Button
                  label={data.name}
                  id={index}
                  data={data1}
                  text
                  onClick={submitdetails}
                  style={{ textAlign: 'left', paddingLeft: '20px' }}
                />
              );
            })}
          </div>
        </Sidebar>
        <Button icon="pi pi-arrow-right" onClick={() => setVisible(true)} />
      </div>

      <div
        className={`p-grid p-nogutter ${
          formIndex === 0 ? "cac-container" : ""
        }`}
      >
        {formIndex === 0 && (
          <>
            {" "}
            <div className="p-col-12">
              <div className="p-grid p-nogutter p-align-center cac-header-container">
                <div className="p-col-10 cac-header-title">
                  <h4>{formname}</h4>
                </div>
                <div className="p-col-2 p-text-right">
                  <img src={cac} alt="no image" className="cac-title-image" />
                </div>
              </div>
            </div>
          </>
        )}
        <div className="p-col-12 cac-form-container">
          {formIndex === 0 && (
            <>
              {
                formschema ? <>
                <div className="p-card cac-card">
                
                  <DataDrivenForm
                    schema={formschema}
                    onSubmit={onSubmit}
                    data={form.configList.parameter}
                  ></DataDrivenForm>
                 
              </div>
                </> : <></>
              }
              

              <div className="description col-10 mt-8"></div>
            </>
          )}
          {formIndex === 1 && (
            <Review
              configList1={form.configList1}
              configList={form.configList}
              setformIndex={setFormIndex}
            />
          )}
          {formIndex === 2 && <Output output={form.output} />}
        </div>

        {/* <ConnectionInfo setCredentials={setCredentials}
                setConnectionPopup={setShowCloudConnectionPopup}
                showCloudConnectionPopup={showCloudConnectionPopup}>
            </ConnectionInfo> */}
      </div>
    </>
  );
}

export default App;
