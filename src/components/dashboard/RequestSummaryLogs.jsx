import { useEffect, useMemo, useState } from "react"
import { TabView, TabPanel } from 'primereact/tabview';
import settings from '../../settings.json';
import axios from "axios";
import { Sidebar } from "primereact/sidebar";
import { createUseStyles } from "react-jss";

const { ip } = settings;

export default function RequestLogSidebar({ requestId, showSlider, onHide, onError }) {
    return (
        <Sidebar visible={showSlider} position="right" onHide={onHide} modal showCloseIcon={true}
            className="p-sidebar-md">
            <h4>Request Logs</h4>
            <RequestSummaryLogs requestId={requestId} onError={onError}></RequestSummaryLogs>
        </Sidebar>
    );
}

function RequestSummaryLogs({ requestId, onError }) {

    const [requestLog, setRequestLog] = useState({});

    const tabs = useMemo(() => {
        return [{ header: 'Terraform Input', field: 'terraFormInput' },
        { header: 'Terraform Output', field: 'terraFormOutput' },
        { header: 'Terraform Logs', field: 'terraFormLog' }];
    }, []);

    const fetchLogs = () => {
        axios.get(`${ip}requestLog/${requestId}`)
            .then(({ data }) => {
                setRequestLog(data);
            }).catch((e) => {
                onError({
                    severity: 'error', summary: 'Fetching Logs ',
                    detail: 'Failed to fetch Logs', sticky: true 
                });
            });
    }

    useEffect(() => {
        fetchLogs();
    }, [requestId]);

    return (
        <TabView>
            {tabs.map((tab, idx) => (
                <TabPanel header={tab.header} key={idx}>
                    <RequestLogs data={requestLog[tab.field]}></RequestLogs>
                </TabPanel>
            ))}
        </TabView >
    );
}

function RequestLogs({ data }) {
    const useStyles = createUseStyles({
        output: {
            backgroundColor: 'black',
            color: 'white'
        },
        'output-format': {
            whiteSpace: 'pre-line'
        }
    });
    const classes = useStyles();
    return (
        <div className={classes.output}>
            <p className={classes["output-format"]}>{data}</p>
        </div>
    )
}