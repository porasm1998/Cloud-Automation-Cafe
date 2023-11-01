import Box from '@mui/material/Box';
import {useState,useEffect}  from 'react';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';
import data from "../../formFeed/formFeed.json"

import {Grid} from '@mui/material'
import RenderImage from '../Image/imageComponent';
import ATT from "../../images/vpc.png";
function fetchApi(url){
    const dataDropdown= fetch(url)
                .then((res) => res.json())
                .then((json) => {
                    let data=[]
                    json.map((element,id)=>{
                        data.push(element?.address?.city)
                    })
                    return data
                })
    return dataDropdown
   }
function FormComponent() {
  const props=data;
  const [formFeed,setFormFeed]=useState(props);
  const [formImage,setFormImage]=useState(props.image)
   useEffect(() => {
    let tempVal=formFeed.formElements.map(element=>{
      const newDropDown= () => fetchApi(element?.fetchFromApi)
      newDropDown().then((val)=>
      {
      // Enhancement
      // let tempFeed=formFeed.formElements
      // tempFeed.splice(3, 0, {"label":"select the city","values":val,"type":"DROPDOWN"});
      // setFormFeed({formElements:tempFeed})
        if(val!==undefined){
           element.values=val
           return element
        }
      })
      return element
      // setFormFeed({formElements:[...formFeed.formElements,{"label":"select the city","values":val,"type":"DROPDOWN"}]})
    })
    tempVal={formElements:tempVal}
    setFormFeed(tempVal)
  },[formFeed.formElements[0].value]);
  const updateField=(index,value)=>{
  const tempVal = formFeed?.formElements?.map((element,i)=>{
    if(index===i){
        return {...element,value:value}
    }
    return element
  })
  setFormFeed({formElements:tempVal})
  }
  const handleOpen=()=>{
    const tempVal = formFeed?.formElements?.map((element,i)=>{
      // if(i===0){
      //     return {...element,value:""}
      // }
      return element
    })
    setFormFeed({formElements:tempVal})
    }
  const handleSubmit = ()=>{
    let result={}
    let formError=false;
    const tempFeed=formFeed?.formElements?.map((element,i)=>{
      const key=element.label
      let value= element.value
      if(element.value==="" || element.value===undefined){
        element.hasError=true
        formError=true
      }else{
        element.hasError=false
        formError=false
      }
      if(element.type==="EMAILFIELD"){
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value))){
          alert("invalid email")
          element.hasError=true
          formError=true
        }else{
          element.hasError=false
          formError=false
        }
      }else if(element.type===""){// after adding phone number field explicitly enable
        if(!(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(value))){
          alert("invalid phone number")
          element.hasError=true
          formError=true
        }else{
          element.hasError=false
          formError=false
        }
      }
      if(element.type==="DATEFIELD" && element.value===undefined){
        value=new Date() // default value
      }
      result[key]=value
      return element
    })
    setFormFeed({formElements:tempFeed})
    !formError && console.log(result)
  }
  const updateCheckbox=(index,value)=>{
    const tempVal = formFeed?.formElements?.map((element,i)=>{
    if(index===i){
        if(element.value!==undefined){
            if(element?.value?.indexOf(value.name)<0){
                if(value.checked){
                    const v=element.value
                    v.push(value.name)
                    return {...element,value:v}
                }
            }else {
                if(!value.checked){
                     let v=element.value
                     v=v.filter(function(val){
                               return val !== value.name;
                           });
                     return {...element,value:v}
                 }
                }
        }else{
            element.value=[]
            if(value.checked){
                return {...element,value:[value.name]}
            }
        }
    }
    return element
  })
  setFormFeed({formElements:tempVal})
  }
  return (
  <Grid className="App" marginTop="70px" container justifyContent="center">
    <Grid item xs={10}>
   <Box
        component="form"
        id="dynamicForm"
        sx={{
          '& > :not(style)': { m: 1, width: '40%' },
        }}
        autoComplete="off"
      >
        {console.log("form feed  final",formFeed)// TODO : REMOVE
        }
      {
        formFeed?.formElements?.map((element,id)=>{
              switch(element?.type || null){
                case "TEXTFIELD": return(
                    <TextField id={id || ""} label={element.label || ""} error={element.hasError} placeholder={element.placeHolder || ""} onChange={(e)=>updateField(id,e.target.value)} variant="outlined" fullWidth />
                )
                case "TEXTAREA": return(
                    <TextField id={id || ""} label={element.label || ""} error={element.hasError} variant="outlined" placeholder={element.placeHolder || ""} onChange={(e)=>updateField(id,e.target.value)} fullWidth multiline rows={2}/>
                )

                case "NUMBERFIELD": return(
                    <TextField id={id || ""} label={element.label || ""} error={element.hasError} type="number" imputProps={{pattern:"tel"}} onChange={(e)=>updateField(id,e.target.value)} variant="outlined" fullWidth/>
                )
                case "PASSWORDFIELD": return(
                    <TextField id={id  || ""} label={element.label  || ""} error={element.hasError} type="password" onChange={(e)=>updateField(id,e.target.value)} variant="outlined" fullWidth/>
                )
                case "EMAILFIELD": return(
                    <TextField id={id || ""} label={element.label || ""} error={element.hasError} type="email" variant="outlined" onChange={(e)=>updateField(id,e.target.value)} fullWidth/>
                )
                case "DROPDOWN": return(
                    <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">{element.label || ""}</InputLabel>
                            <Select
                              id={id || ""}
                              label={element.label || ""}
                              onChange={(e)=>updateField(id,e.target.value)}
                              onOpen={()=>{handleOpen()}}
                              error={element.hasError}
                            >
                              {element.values.map(dropDown=>{
                                return <MenuItem value={dropDown || ""}>{dropDown || ""}</MenuItem>
                              })}
                            </Select>
                          </FormControl>
                )
                case "CHECKBOX": return(
                <Grid item xs={5} >
                   <FormLabel component="legend">{element.label || ""}</FormLabel>
                   <FormGroup>
                        { element.values.map(label=>{
                            return <FormControlLabel control={<Checkbox onChange={(e)=>updateCheckbox(id,e.target)}/>} label={label || ""} name={label || ""}/>
                        })
                        }
                   </FormGroup>
                </Grid>
                )
                case "DATEFIELD": return(
                     <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label={element.label}
                            value={formFeed.formElements[id].value || new Date()}
                            onChange={(newValue) => {
                              updateField(id,newValue.$d);
                            }}
                            renderInput={(params) => <TextField error={element.hasError} {...params} />}
                          />
                     </LocalizationProvider>
                )
                default: return (<></>)

              }
          })
      }
    </Box>
    <Grid item xs={5} style={{margin:"20px auto"}}>
        <Button variant="contained" fullWidth onClick={handleSubmit}>SUBMIT</Button>
    </Grid>
    {formImage?.imageUrl && <Grid item xs={8} style={{margin:"20px auto"}}>
    {RenderImage({url:formImage?.imageUrl,alt:formImage?.alt})}
    
    </Grid>}
    <img
          src={ATT}
          style={{
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            width: "20%",
            marginTop: "1em",
          }}
          alt="home img"
        />
    </Grid>
    </Grid>
   
  );
}


export default FormComponent;
