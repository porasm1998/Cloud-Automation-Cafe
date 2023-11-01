import { Route, Redirect } from "react-router-dom";
import useFindUser from "../../hooks/useFindUser";
import BlockUI from "./BlockUI";

export default function PublicRoute({ component: Component, ...rest }) {
    const [user, isLoading] = useFindUser();
    return (
        <Route {...rest} render={props => {
            return isLoading ?
                <BlockUI /> :
                user ? <Redirect to="/home" /> :
                    <Component {...props} />
        }}></Route>
    );
}