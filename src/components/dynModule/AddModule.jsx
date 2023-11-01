import axios from "axios";
import { useState, useEffect } from "react";
import Api from "../../settings.json";
import React, { useRef } from "react";
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { FileUpload } from "primereact/fileupload";

import { Col, Container, Row } from "react-bootstrap";
import { SelectButton } from "primereact/selectbutton";
import cac from "../../images/CAC-Full-Logo-V1.0.jpg";
import { InputText } from "primereact/inputtext";
import settings from "../../settings.json";
import { Dropdown } from "primereact/dropdown";
const { ip } = settings;
export default function AddModule() {
  const [files, setFiles] = React.useState([]);
  const [UseCase, setUseCase] = useState();
  const [folder, setFolder] = React.useState([]);
  const [cloudData, setCloudData] = useState(null);
  const [value, setValue] = useState("");
   const toast = useRef(null);
  const [usecasename, setusecasename] = useState("");
  const [usecasecode, setusecasecode] = useState("");
  //const [parentId, setparentId] = useState(362)
  const [uiroute, setuiroute] = useState("");
  const path = "/api/public";
  const [cloudId, setCloudId] = useState(1);
  const featchCloudProvides = () => {
    axios
      .get(`${Api.ip}cloud`)
      .then(({ data }) => {
        setCloudData(data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const UploadHandlerzip = ({ files }) => {

    const [file] = files;
    
    onUpload(file,"zip").then(()=>{
      toast.current.show({severity:'success', summary: 'Success', detail:'Uploaded Successfully', life: 3000});
    }).catch((error)=>{
      toast.current.show({severity:'error', summary: 'Error', detail:`Upload Failed`, life: 3000});
      console.log(error);
    })
  };
  
  const UploadHandlerjson = ({ files }) => {

    const [file] = files;
    
    onUpload(file,"json").then(()=>{
      toast.current.show({severity:'success', summary: 'Success', detail:'Uploaded Successfully', life: 3000});
    }).catch((error)=>{
      toast.current.show({severity:'error', summary: 'Error', detail:`Upload Failed`, life: 3000});
      console.log(error);
    })
  };

  var data = new FormData();

  const onUpload = async (file,key) => {
    data.append(key, file);
  };

  const onCloudProviderChange = (e) => {
    setCloudId(e.value);
  };

  useEffect(() => {
    const cloudId = 1;
    setCloudId(cloudId);
    featchCloudProvides();
  }, []);

  const onSubmitForm = (e) => {
    

    data.append("code", usecasecode);
    data.append("name", usecasename);
    data.append("cloudId", cloudId["cloudId"]);
    //data.append("parentId", parentId);
    setusecasename("")
    for (var key of data.entries()) {
      console.log(key[0] + ", " + key[1]);
    }

    axios
      .post(`${ip}usecase/upload/file`, data)
      .then((data) => {
        toast.current.show({severity:'success', summary: 'Success', detail:'Submitted Successfully', life: 3000});
        
      })
      .catch((_) => {
        toast.current.show({severity:'error', summary: 'Error', detail:'Something went wrong', life: 3000});
      });

      setusecasename("");
      setCloudId();

  };
  

  return (
    <>
    <div
      className={`p-grid p-nogutter cac-container`}
    >
      <>
          <div className="p-col-12">
            <div className="p-grid p-nogutter p-align-center cac-header-container">
              <div className="p-col-10 cac-header-title">
                <h4>Add Dynamic Module</h4>
              </div>
              <div className="p-col-2 p-text-right">
                <img src={cac} alt="no image" className="cac-title-image" />
              </div>
            </div>
          </div>
        </>

        <div className="p-col-12 cac-form-container">
        
        <Row>
          <Col sm={12} style={{ textAlign: "center", padding:'0.5em'}} >
            <Dropdown
              value={cloudId}
              onChange={onCloudProviderChange}
              options={cloudData}
              optionLabel="code"
              placeholder="Select Cloud Provider"
            />
          </Col>
          <Col sm={12} style={{ textAlign: "center", padding:'0.5em' }}>
            <InputText
              id="UsecaseName"
              placeholder="Enter Usecase Name"
              onChange={(e) => setusecasename(e.target.value)}
            />
          </Col>
          
          <Col sm={12} style={{ textAlign: "center", padding:'0.5em' }}>
            <FileUpload
              customUpload={true}
              name="upload-zip-file"
              accept=".zip"
              multiple={false}
              mode="basic"
              chooseLabel="Upload Zip File"
              uploadHandler={UploadHandlerzip}
              auto
            />
          </Col>
          {/* <Col sm={12} style={{ textAlign: "center", padding:'0.5em' }}>
            <FileUpload
              customUpload={true}
              name="upload-json-file"
              accept=".json"
              multiple={false}
              mode="basic"
              chooseLabel="Upload json"
              uploadHandler={UploadHandlerjson}
              auto
            />
          </Col> */}
          <Col sm={12} style={{ textAlign: "center", padding:'0.5em' }}>
          <Toast ref={toast} />
          <Button  label="Submit" onClick={onSubmitForm} />
          {/* <button type="button" class="btn btn-primary" onClick={onSubmitForm}>Submit</button> */}
          </Col>
        </Row>
          </div>
        
    </div>

      
     
    </>
  );
}
