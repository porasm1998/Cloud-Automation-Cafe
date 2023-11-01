import React from 'react'
import Review_header from '../Review_header';
import axios from "axios";
import { Button } from "react-bootstrap";
import Api from "../../settings.json";

export const Review = ({ configList1, configList, setformIndex }) => {


  const toReviewParams = (a) => {
    return Object.entries(a).reduce((acc, [key, val]) => {
        if (val?.constructor.name == 'Object') {
            acc += `\n---------------\n${toReviewParams(val)} `;
        } else if (val?.constructor.name == 'Array') {
            const value = toReviewParams(val);
            if (value[value.length - 1] === ',') {
                acc += `${key} :  ${value.substring(0, value.length - 1)} \n`;
            } else {
                acc += `${key} :  ${value} \n`;
            }
        } else {
            if (isNaN(key)) {
                if (val?.constructor.name === 'String') {
                    acc += `${key} = ${val} \n`;
                } else {
                    acc += `${key} = ${val} \n`;
                }
            } else {
                if (val?.constructor.name === 'String') {
                    acc += `${val}, `;
                } else {
                    acc += `${val}, `;
                }
            }
        }
        return acc;
    }, '');
}


  const reviewParams = toReviewParams(configList1)
  
  const onSubmit = (e) => {
    e.preventDefault();
    axios({
      method: "post",
      header: { "Content-Type": "application/json" },
      url: Api.ip + "runUseCase",
      data: {configList,reviewParams}
    })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
    setformIndex(2)
  };

  const onBack = (e) => {
    setformIndex(0)
  };

  return (
    <>
      <Review_header />
      <div className="Review">
        {/* {Object.entries(configList1).map(([key, value], index) => {
          return (
            <div key={index}>
              {key} : {Array.isArray(value) ? value.join(', ') : (value||'').toString()}
            </div>
          );
        })} */}

        <p style={{whiteSpace:"pre-line"}}>{reviewParams}</p>
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
  )
}
