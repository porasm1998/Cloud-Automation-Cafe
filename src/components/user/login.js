import React from 'react';
import axios from "axios";
import Api from "../../settings.json"
import cac from '../../images/CAC-Full-Logo-V1.0.jpg';
import { useHistory } from "react-router-dom";
import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';

export default function Login() {
    const [username, setusername] = useState("");
    const [password, setpassword] = useState("");
    const [hasError, setError] = useState(false);
    const history = useHistory();

    const useStyles = createUseStyles({
        'inner': {
            width: '35%'
        },
        'ig-fluid': {
            width: `${(330 / 16)}rem`,
            height: `${(70 / 16)}rem`,
            marginBottom: '0.5rem'
        },
        'login-error': {
            color: 'red',
            display: 'block',
            textAlign: 'center'
        },
        button: {
            marginTop: `${10 / 16}rem`
        }
    });

    const classes = useStyles();

    const login = (e) => {
        e.preventDefault();
        axios.post(Api.ip + "login", {
            username: username,
            password: password,
        }).then(() => {
            history.push('/home');
        }).catch((err) => {
            setError(true);
        });
    };

    const setUserName = ({ target: { value } }) => {
        setusername(value)
    }

    const setPassword = ({ target: { value } }) => {
        setpassword(value);
    }

    return (
        <div className="outer col-12 mx-auto ">
            <div className={`inner ${classes.inner}`}>
                <form>
                    <img
                        src={cac}
                        className={classes['ig-fluid']}
                        alt="login img"
                    />
                    {hasError &&
                        <strong className={classes['login-error']}>
                            Incorrect username or password</strong>
                    }
                    <div className="p-fluid p-formgrid p-grid cac-form">
                        <div className="p-field p-col-12 p-md-12">
                            <label>Username</label>
                            <InputText type="text" className="p-inputtext-sm" value={username}
                                onChange={setUserName} placeholder="UserName" />
                        </div>
                        <div className="p-field p-col-12 p-md-12">
                            <label>Password</label>
                            <Password value={password} className="p-inputtext-sm"
                                onChange={setPassword} placeholder="Password"
                                feedback={false} toggleMask />
                        </div>
                    </div>
                    <button type="submit" className={`btn btn-dark btn-lg w-100 ${classes.button}`}
                        onClick={login}>Sign in</button>
                </form>
            </div>
        </div>
    );
}
