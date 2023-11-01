import { Route, Redirect } from "react-router-dom";
import useFindUser from "../../hooks/useFindUser";
import BlockUI from "./BlockUI";
import Navbar from "../navBar/Navbar";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import settings from '../../settings.json';

const { ip } = settings;

export default function PrivateRoute({ component: Component, ...rest }) {
    const [user, isLoading] = useFindUser();

    return (
        <Route {...rest} render={props => {
            return isLoading ?
                <BlockUI /> :
                user ? <RoleBasedRoute component={Component} routeProps={props}
                    route={rest} user={user} /> :
                    <Redirect to="/login" />
        }}></Route>
    );
}

function RoleBasedRoute({ component, routeProps, route, user }) {
    if (!route.roles) {
        if (route.requireUsePremission) {
            return <PermissionBasedRoute component={component} routeProps={routeProps}
                route={route} user={user}>
            </PermissionBasedRoute>;
        } else {
            return <Container component={component} routeProps={routeProps}></Container>;
        }
    } else if (route.roles?.includes(user.role)) {
        return <Container component={component} routeProps={routeProps}></Container>;
    } else {
        return <Redirect to="/home" />;
    }
}

function PermissionBasedRoute({ component, routeProps, route, user }) {

    const [isLoading, setLoading] = useState(true);
    const [hasAccess, setAccess] = useState(false);

    const checkForAccess = () => {
        setLoading(true);
        axios.get(`${ip}user/access/route/${user.userId}`, { params: { uipath: route.path } })
            .then(() => {
                setAccess(true);
                setLoading(false);
            }).catch(() => {
                setAccess(false);
                setLoading(false);
            });
    }

    useEffect(() => {
        checkForAccess();
    }, [route?.path]);

    return (
        <>{
            isLoading ?
                <BlockUI /> :
                hasAccess ?
                    <Container component={component} routeProps={routeProps}></Container>
                    : <Redirect to="/home" />
        }
        </>
    );
}

function Container({ component: Component, routeProps }) {
    return (
        <>
            <Navbar />
            <Component {...routeProps} />
        </>
    );
}
