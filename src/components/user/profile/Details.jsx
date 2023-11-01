import axios from "axios";
import dayjs from "dayjs";
import { Button } from "primereact/button";
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { useState, useEffect } from "react";
import { createUseStyles } from "react-jss";
import { getUser } from "../../../hooks/useFindUser";
import settings from "../../../settings.json";
import { CONSTANT } from "../../constants/constant";

const { ip } = settings;

export default function Details({ onError }) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [passwordExpiry, setPasswordExpiry] = useState(0);
    const user = getUser();

    const useStyles = createUseStyles({
        'container': {
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '30%'
        },
        'update': {
            marginTop: `${10 / 16}rem`
        }
    });

    const classes = useStyles();

    const setEmailValue = (stateFn) => {
        return ({ target: { value } }) => {
            eval(stateFn)(value);
        }
    }

    const onUpdate = () => {
        if (validate()) {
            const { userId } = user;
            const data = { email };
            axios.put(`${ip}user/${userId}`, data).then(() => {
                onError({
                    severity: 'success', summary: 'Details',
                    detail: 'Successfully updated User details', sticky: true
                });
            }).catch(() => {
                onError({
                    severity: 'error', summary: 'Details',
                    detail: 'Failed to update User details', sticky: true
                });
            });
        }
    }

    const validate = () => {
        if (!new RegExp(CONSTANT.EMAIL_REGEX).test(email)) {
            onError({
                severity: 'error', summary: 'Email Id',
                detail: 'Please provide valid Email', sticky: true
            });
            return false;
        }
        return true;
    }

    const fetchUserDetails = () => {
        const { userId } = user;
        axios.get(`${ip}user/${userId}`).then(({ data }) => {
            const { name, email, passwordExpiry } = data;
            setEmail(email);
            setName(name);
            setPasswordExpiry(dayjs(passwordExpiry).diff(dayjs(), 'day'));
        }).catch(() => {
            onError({
                severity: 'error', summary: 'User',
                detail: 'Failed to fetch User details', sticky: true
            });
        })
    }

    useEffect(() => {
        fetchUserDetails();
    }, []);

    return (
        <div className={`p-fluid p-formgrid p-grid cac-form ${classes.container}`}>
            <div className="p-field p-col-12 p-md-12">
                <label>UserName</label>
                <InputText type="text" value={name} placeholder="UseName"
                    disabled="true" />
            </div>
            <div className="p-field p-col-12 p-md-12">
                <label>Email Address</label>
                <InputText type="email" value={email} placeholder="Email Address"
                    onChange={setEmailValue('setEmail')} />
            </div>
            <div className="p-field p-col-12 p-md-12">
                <label>Password Expiry</label>
                <InputNumber inputId="expiry" value={passwordExpiry}
                    prefix="Expires in " suffix=" days" disabled="true" />
            </div>
            <div className={`p-col-12 ${classes["update"]}`}>
                <Button label="Update" onClick={onUpdate} />
            </div>
        </div>
    );
}