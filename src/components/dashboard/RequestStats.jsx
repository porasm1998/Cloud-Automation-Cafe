
import React, { useEffect, useState } from 'react';
import settings from '../../settings.json';
import axios from 'axios';
import { createUseStyles } from 'react-jss';
import { getUser } from '../../hooks/useFindUser';
import HyperScalarStats from './graphs/HyperScalarStats';
import HyperScalarAndResourceType from './graphs/HyperScalarAndResourceType';
import HyperScalarPerUserStats from './graphs/HyperScalarPerUserStats';
import HyperScalarPerCloudProvider from './graphs/HyperScalarPerCloudProvider';

const { ip } = settings;

export default function RequestStats({ onError }) {

    const [cloudProviders, setCloudProviders] = useState([]);

    const user = getUser();

    const featchCloudProvides = () => {
        axios.get(`${ip}cloud`)
            .then(({ data }) => {
                setCloudProviders(data);
            }).catch((e) => {
                onError({
                    severity: 'error', summary: 'Cloud Provides',
                    detail: 'Faield to fetch Cloud Providers list', sticky: true
                });
            });
    }

    useEffect(() => {
        featchCloudProvides();
    }, []);

    const useStyles = createUseStyles({
        label: {
            display: 'block'
        },
        'card-container': {
            display: 'flex',
            flexWrap: 'wrap'
        },
        'cac-card': {
            width: '48.5%',
            marginRight: `${(15 / 16)}rem`,
            marginBottom: '1rem',
            '& .p-card-title': {
                borderBottom: '1px solid burlywood',
                color: 'darkblue',
                fontSize: '1.2rem'
            },
            '& .p-card-content': {
                paddingTop: 0
            },
            '& .p-field-checkbox': {
                margin: '0px 0px 5px 0px'
            },
            '& .card.p-jc-center': {
                border: 'none'
            }
        }
    });

    const classes = useStyles();

    return (
        <div className="p-grid p-nogutter">
            <div className={`p-col-12 ${classes['card-container']}`}>
                <HyperScalarStats user={user} cloudProviders={cloudProviders}
                    onError={onError} classes={classes}></HyperScalarStats>
                <HyperScalarAndResourceType user={user} cloudProviders={cloudProviders}
                    onError={onError} classes={classes}></HyperScalarAndResourceType>
                {user.role === 'ADMIN' &&
                    <HyperScalarPerUserStats onError={onError} classes={classes}>
                    </HyperScalarPerUserStats>
                }
                <HyperScalarPerCloudProvider cloudProviders={cloudProviders}
                    user={user} onError={onError} classes={classes}>
                </HyperScalarPerCloudProvider>
            </div>
        </div>
    );
}