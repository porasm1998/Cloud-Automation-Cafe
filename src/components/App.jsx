import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import React, { useRef, useState } from 'react';
import { Switch, BrowserRouter, Redirect, Route } from "react-router-dom";
import LogoutInterceptor from './common/Interceptor';
import PrivateRoute from './common/PrivateRoute';
import PublicRoute from './common/PublicRoute';
import routes from '../config/routes';
import { ToasterContext, UserContext } from './common/Context';
import { Toast } from 'primereact/toast';
import { ToastContainer} from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import { Preview } from '../pages/index';

// import OverviewFlow from "./Components/flowBuilder/FlowBuilder"

const addDaysPulgins = () => {
    dayjs.extend(timezone);
    dayjs.extend(utc);
    dayjs.extend(advancedFormat);
    dayjs.tz.setDefault('Asia/Kolkata');
}

const App = () => {

    const toast = useRef(null);

    const [user, setUser] = useState();

    addDaysPulgins();

    const addMessage = (message) => {
        message.sticky = false;
        message.life = 5000;
        toast?.current?.show(message);
    }
    
    const [files, setFiles] = useState([]);
    const onSuccess = (savedFiles) => {
        setFiles(savedFiles)
    };

    // const [fileNames, setFileNames] = useState([]);


    return (
        <>
            <UserContext.Provider value={{ user, setUser }}>
                <ToasterContext.Provider value={{ addMessage }}>
                    <BrowserRouter>
                        <LogoutInterceptor></LogoutInterceptor>
                        <Switch>
                            {routes.map(({ isPrivate, ...rest }, index) => {
                                
                                if (isPrivate) {
                                    return <PrivateRoute {...rest} exact key={index} />;
                                } else {
                                    return <PublicRoute {...rest} excat key={index} />
                                }
                            })}
                            <Redirect to="/home" />
                        </Switch>
                    </BrowserRouter>
                </ToasterContext.Provider>
            </UserContext.Provider>
            <Toast ref={toast} />
            <div>
      
      <Preview files={files}/>
      <ToastContainer/>
    </div> 

      {/* <OverviewFlow /> */}
  
        </>

    );
};

export default App;
