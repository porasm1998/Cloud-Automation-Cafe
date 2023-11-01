import { TabPanel, TabView } from "primereact/tabview";
import { useContext } from "react";
import { Container } from "react-bootstrap";
import { createUseStyles } from "react-jss";
import { ToasterContext } from "../../common/Context";
import ChangePassword from "./ChangePassword";
import Details from "./Details";

export default function Profile() {

    const { addMessage } = useContext(ToasterContext);

    const useStyles = createUseStyles({
        'container': {
            marginTop: '3.5rem'
        }
    });

    const classes = useStyles();

    return (
        <>
            <Container fluid className={classes.container}>
                <TabView>
                    <TabPanel header='Details'>
                        <Details onError={addMessage}></Details>
                    </TabPanel>
                    <TabPanel header='Change Password'>
                        <ChangePassword onError={addMessage}></ChangePassword>
                    </TabPanel>
                </TabView >
            </Container>
        </>
    );
}