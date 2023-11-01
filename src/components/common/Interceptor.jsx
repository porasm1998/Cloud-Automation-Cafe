import axios from "axios";
import { useContext } from "react";
import { useHistory } from "react-router";
import { UserContext }  from "./Context";

export default function LogoutInterceptor() {
    const history = useHistory();
    const { setUser: setContextUser } = useContext(UserContext);
    axios.interceptors.response.use(response => response, error => {
        const { status } = error.response;
        if (status === 401) {
            setContextUser(null);
            localStorage.clear();
            history.push('/login');
        }
        return Promise.reject(error);
    });
    return null;
}