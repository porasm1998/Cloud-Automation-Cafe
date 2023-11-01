import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../components/common/Context";
import settings from '../settings.json';

const { ip } = settings;

let loggedInUser = null;

export default function useFindUser() {
    const { user: contextUser, setUser: setContextUser } = useContext(UserContext);
    const [user, setUser] = useState(contextUser);
    const [isLoading, setLoading] = useState(!contextUser);
    useEffect(() => {
        function getUser() {
            axios.get(`${ip}isAlive`).then(({ data: userData }) => {
                loggedInUser = userData;
                setUser(userData);
                setContextUser(userData);
                setLoading(false);
            }).catch(() => {
                setContextUser(null);
                setLoading(false);
            })
        }
        if (!user) {
            getUser();
        }
    }, []);
    return [user, isLoading];
}

export const getUser = () => {
    return Object.freeze(loggedInUser);
}