import { useState } from "react";

const navBarInfo = () => JSON.parse(localStorage.getItem('navBar'));

export default function useNavBar() {

    const [navBar, setNavBar] = useState(navBarInfo);

    const setNavBarData = (e) => {
        setNavBar(p => ({ ...p, ...e }));
        localStorage.setItem('navBar', JSON.stringify({ ...(navBarInfo() || {}), ...e }));
    }

    const clear = () => {
        localStorage.setItem('navBar', JSON.stringify({}));
        setNavBar({});
    }

    return [navBar, setNavBarData, clear];
}