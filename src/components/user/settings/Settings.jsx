import axios from "axios";
import { TabPanel, TabView } from "primereact/tabview";
import { useContext, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { createUseStyles } from "react-jss";
import { ToasterContext } from "../../common/Context";
import CloudConnectionsDB from "./cloudConnections/CloudConnectionsDB";
import CloudConnectionsVault from "./cloudConnections/CloudConnectionsVault";
import settings from '../../../settings.json';
import { getUser } from "../../../hooks/useFindUser";
import { STANDARD_CONTROL_CATEGORIES } from "../../constants/constant";

const { ip } = settings;


export default function Settings() {

    const { addMessage } = useContext(ToasterContext);
    const [showCloudConnection, setCloudConnection] = useState(null);

    const useStyles = createUseStyles({
        'container': {
            marginTop: '3.5rem'
        }
    });

    const classes = useStyles();

    const fetchClodConnectinSwitch = () => {
        const user = getUser();
        axios.get(`${ip}standardControl/${STANDARD_CONTROL_CATEGORIES.SECRETS_MANAGER}`).then(({ data }) => {
            const record = data.find(item => parseInt(item.clientId) === parseInt(user.clientId));
            setCloudConnection((record && record.value.toLowerCase()) === 'vault' ? 'Vault' : 'DB');
        }).catch(err => {
            addMessage({
                severity: 'error', summary: 'Enterprise Standards & Controls',
                detail: `Failed to fetch Enterprise Standards & Controls`, sticky: true
            });
        })
    }

    useEffect(() => {
        fetchClodConnectinSwitch();
    }, []);

    return (
        <>
            <Container fluid className={classes.container}>
                <TabView>
                    <TabPanel header='Cloud Connections'>
                        {showCloudConnection === 'DB' &&
                            <CloudConnectionsDB onError={addMessage}></CloudConnectionsDB>
                        }
                        {showCloudConnection === 'Vault' &&
                            <CloudConnectionsVault onError={addMessage}></CloudConnectionsVault>
                        }
                    </TabPanel>
                </TabView >
            </Container>
        </>
    );
}