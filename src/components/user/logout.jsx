import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import { useRef } from 'react';
import { createUseStyles } from 'react-jss';
import { useHistory } from 'react-router';

export default function Logout({ signout }) {

    const menuRef = useRef(null);

    const history = useHistory();

    const items = [
        { label: 'Profile', icon: 'pi pi-user-edit', command: () => { history.push('/user/profile'); } },
        { label: 'Settings', icon: 'pi pi-cog', command: () => { history.push('/user/settings'); } },
        { label: 'Sign out', icon: 'pi pi-power-off', command: signout }
    ];

    const useStyles = createUseStyles({
        container: {
            justifyContent: 'space-between',
            alignItems: 'end'
        },
        avatar: {
            color: 'white',
            backgroundColor: 'rgb(73, 80, 87)',
            marginRight: '0 !important'
        },
        icon: {
            color: 'white',
            fontSize: `${10 / 16}rem`
        }
    });

    const classes = useStyles();

    const onClick = (e) => {
        menuRef.current.toggle(e);
    }

    return (
        <div className={`p-grid p-nogutter ${classes.container}`}>
            <div className="p-col-10">
                <Menu model={items} popup ref={menuRef} id="popup_menu" />
                <Avatar icon="pi pi-user" className={`p-mr-2 ${classes.avatar}`}
                    size="large" shape="circle" baseZIndex="1050" />
            </div>
            <div className="p-col-2">
                <i className={`pi pi-caret-down ${classes.icon}`} onClick={onClick} ></i>
            </div>
        </div>
    );
}