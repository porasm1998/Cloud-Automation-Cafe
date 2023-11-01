import { useEffect, useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { SelectButton } from 'primereact/selectbutton';
import { Card } from 'primereact/card';
import settings from '../../../../settings.json';
import { InputText } from 'primereact/inputtext';
import axios from "axios";
import './cloudConnection.css';
import { createUseStyles } from "react-jss";
import { getUser } from "../../../../hooks/useFindUser";
import { saveAs } from 'file-saver';

const { ip } = settings;

function CloudConnectionList({ onDelete, onUpdate, onError, rerender, user }) {

    const [cloudConnections, setCloudConnections] = useState([]);

    const awsFields = [
        { label: 'Account Code', field: 'accountCode' },
        { label: 'Access Key', field: 'accessKey' },
        { label: 'Secret Key', field: 'secretKey', mask: true }
    ];

    const azureFields = [
        { label: 'Client Id', field: 'clientId' },
        { label: 'Client Secret', field: 'clientSecret', mask: true },
        { label: 'Subscription Id', field: 'subscriptionId' },
        { label: 'Tenant Id', field: 'tenantId' }
    ];

    const gcpFields = [
        { label: 'File Name', field: 'gcpFileName', download: true }
    ];

    const featchData = () => {
        axios.get(`${ip}cloudConnectionVault`)
            .then(({ data }) => {
                setCloudConnections(data);
            }).catch((e) => {
                onError({
                    severity: 'error', summary: 'Fetch CloudConnection',
                    detail: 'Failed to fetch cloud connection from vault', sticky: true
                });
            });
    }

    useEffect(() => {
        featchData();
    }, [rerender]);

    const useStyles = createUseStyles({
        'cac-card': {
            width: '25%',
            marginRight: `${(15 / 16)}rem`,
            '& .p-card-title': {
                borderBottom: '1px solid burlywood',
                color: 'darkblue',
                fontSize: '1.2rem'
            },
            '& .p-card-content': {
                height: `${(195 / 16)}rem`,
                paddingTop: 0
            },
            ' & .p-field': {
                marginBottom: `${(2.2 / 16)}rem`,
                '& > label': {
                    marginBottom: `${(1.8 / 16)}rem`,
                    fontWeight: 600,
                    fontSize: `${12 / 16}rem`
                },
                '& > .value': {
                    fontSize: `${(13 / 16)}rem`
                },
                '& i.pi': {
                    float: 'right',
                    cursor: 'pointer'
                }
            }
        },
        'edit-button': {
            textAlign: 'right'
        }
    });

    const classes = useStyles();

    const fieldBasedOnCloudProvider = (cloudCode) => {
        if (cloudCode.trim().toUpperCase() === 'AWS') {
            return awsFields;
        } else if (cloudCode.trim().toUpperCase() === 'AZURE') {
            return azureFields;
        } else if (cloudCode.trim().toUpperCase() === 'GCP') {
            return gcpFields;
        }
    }

    const Footer = (card) => {
        const onDeleteClick = () => {
            onDelete(card);
        }
        const onEditClick = () => {
            onUpdate(card);
        }
        return (
            <div className="p-grid">
                <div className="p-col-6">
                    <Button label="Delete" icon="pi pi-times" className="p-button-text"
                        onClick={onDeleteClick} />
                </div>
                <div className={`p-col-6 ${classes["edit-button"]}`}>
                    <Button label="Edit" icon="pi pi-pencil" className="p-button-text"
                        onClick={onEditClick} />
                </div>
            </div>
        );
    };

    const download = (cloudConnection) => {
        const { gcpFile, gcpFileName } = cloudConnection;
        const blob = new Blob([gcpFile]);
        saveAs(blob, gcpFileName)
    }

    return (
        <>
            {
                cloudConnections.map((cloudConnection, index) => (
                    <Card className={classes["cac-card"]} title={cloudConnection.cloud.code} key={index}
                        footer={Footer(cloudConnection)}>
                        <div className={`p-fluid p-formgrid p-grid`}>
                            {
                                fieldBasedOnCloudProvider(cloudConnection.cloud.code).map((field, idx) => (
                                    <div className="p-field p-col-12 p-md-12" key={idx}>
                                        <label>{field.label}</label>
                                        <div className="value">
                                            <span>{
                                                field.mask ?
                                                    'XXXXXXXXXXXXX' :
                                                    cloudConnection[field.field]}
                                            </span>
                                            {
                                                field.download && <i className="pi pi-download"
                                                    onClick={e => download(cloudConnection)}></i>
                                            }
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </Card>
                ))
            }
        </>
    );
}

function NewCloudConnection({ showSlider = false, onHide, onSave, onError, cloudConnection = {}, user = {} }) {
    const [cloudId, setcloudId] = useState(1);
    const [cloudData, setcloudData] = useState(null);
    let formGroupData = null;

    const useStyles = createUseStyles({
        'cac-form': {
            ' & > .p-field': {
                marginBottom: `${(7 / 16)}rem`,
                '& > label': {
                    marginBottom: `${(5 / 16)}rem`
                },
                '& > .p-inputtext': {
                    padding: `${(6 / 16)}rem ${(12 / 16)}rem`
                }
            }
        },
        'button-action': {
            textAlign: 'right',
            marginTop: `${(10 / 16)}rem`,
            '& > .p-button.p-component': {
                width: '15%',
                '&:not(:first-child)': {
                    marginLeft: `${(10 / 16)}rem`
                }
            }
        }
    });

    const classes = useStyles();

    const featchCloudProvides = () => {
        axios.get(`${ip}cloud`)
            .then(({ data }) => {
                setcloudData(data);
            }).catch((e) => {
                onError({
                    severity: 'error', summary: 'Cloud Provides',
                    detail: 'Faield to fetch Cloud Providers list', sticky: true
                });
            });
    }

    const formGroup = (fromGroup) => {
        formGroupData = fromGroup;
    }

    const save = () => {
        const { form, validate } = formGroupData;
        const { userId } = user;
        const validation = validate();
        if (validation) {
            const { field, message } = validation;
            onError({ severity: 'error', summary: field, detail: message, sticky: true });
        } else {
            const { cloudConnectionId } = cloudConnection;
            const saveObject = { ...form, ...{ cloudId, userId } };
            onSave(cloudConnectionId, saveObject);
        }
    }

    useEffect(() => {
        const { cloudId = 1 } = cloudConnection;
        setcloudId(parseInt(cloudId));
        featchCloudProvides();
    }, [cloudConnection]);

    const onCancel = () => {
        onHide();
    }

    const onCloudProviderChange = (e) => {
        setcloudId(e.value);
    }

    return (
        <Sidebar visible={showSlider} position="right" onHide={onHide} modal showCloseIcon={false}
            className="custom-sidebar">
            <h3>Cloud Connection</h3>
            <div className={`p-fluid p-formgrid p-grid ${classes['cac-form']}`}>
                <div className="p-field p-col-12 p-md-6">
                    <label>Cloud Provider</label>
                    <SelectButton optionLabel="code" optionValue="cloudId"
                        value={cloudId}
                        options={cloudData}
                        onChange={onCloudProviderChange}>
                    </SelectButton>
                </div>
                {(cloudId === 1) &&
                    <AwsCloud formGroup={formGroup} cloudConnection={cloudConnection}></AwsCloud>
                }
                {(cloudId === 2) &&
                    <AzureCloud formGroup={formGroup} cloudConnection={cloudConnection}></AzureCloud>
                }
                {(cloudId === 3) &&
                    <GcpCloud formGroup={formGroup} cloudConnection={cloudConnection}></GcpCloud>
                }
                <div className={`p-col-12 ${classes["button-action"]}`}>
                    <Button label="Cancel" className="p-button-secondary" onClick={onCancel} />
                    <Button label="Save" className={classes['button']} onClick={save} />
                </div>
            </div>
        </Sidebar>
    );
}

export const AwsCloud = ({ formGroup, cloudConnection }) => {
    const [form, setFormData] = useState({});

    const fields = [
        { field: 'input', fieldType: 'text', label: 'Account Code', apiField: 'accountCode' },
        { field: 'input', fieldType: 'text', label: 'Access Key', apiField: 'accessKey' },
        { field: 'input', fieldType: 'text', label: 'Secret Key', apiField: 'secretKey' }
    ];

    const validate = () => {
        const field = fields.find(field => !form[field.apiField]?.trim()?.length);
        if (field) {
            return { field: field.label, message: `${field.label} cannot be empty` };
        }
        return null;
    }

    formGroup({ form, validate });

    const setFormValues = (field) => {
        return ({ target: { value } }) => {
            setFormData(prevState => ({ ...prevState, ...{ [field]: value } }));
        }
    }

    useEffect(() => {
        const { accountCode, accessKey, secretKey } = cloudConnection
        setFormData({ accountCode, accessKey, secretKey });
    }, [cloudConnection?.cloudConnectionId]);

    return (
        <>
            {
                fields.map((field, index) => (
                    <div className="p-field p-col-12 p-md-12" key={index}>
                        <label htmlFor="firstname6">{field.label}</label>
                        <InputText type={field.fieldType} value={form[field.apiField]}
                            onChange={setFormValues(field.apiField)} placeholder={field.label} />
                    </div>
                ))
            }
        </>
    )
}


export const AzureCloud = ({ formGroup, cloudConnection }) => {
    const [form, setFormData] = useState({});

    const fields = [
        { field: 'input', fieldType: 'text', label: 'Client Id', apiField: 'clientId' },
        { field: 'input', fieldType: 'text', label: 'Client Secret', apiField: 'clientSecret' },
        { field: 'input', fieldType: 'text', label: 'Subscription Id', apiField: 'subscriptionId' },
        { field: 'input', fieldType: 'text', label: 'Tenant Id', apiField: 'tenantId' }
    ];

    const validate = () => {
        const field = fields.find(field => !form[field.apiField]?.trim()?.length);
        if (field) {
            return { field: field.label, message: `${field.label} cannot be empty` };
        }
        return null;
    }

    formGroup({ form, validate });

    const setFormValues = (field) => {
        return ({ target: { value } }) => {
            setFormData(prevState => ({ ...prevState, ...{ [field]: value } }));
        }
    }

    useEffect(() => {
        const { clientId, clientSecret, subscriptionId, tenantId } = cloudConnection
        setFormData({ clientId, clientSecret, subscriptionId, tenantId });
    }, [cloudConnection?.cloudConnectionId]);

    return (
        <>
            {
                fields.map((field, index) => (
                    <div className="p-field p-col-12 p-md-12" key={index}>
                        <label htmlFor="firstname6">{field.label}</label>
                        <InputText type={field.fieldType} value={form[field.apiField]}
                            onChange={setFormValues(field.apiField)} placeholder={field.label} />
                    </div>
                ))
            }
        </>
    )
}

export const GcpCloud = ({ formGroup, cloudConnection }) => {
    const [form, setFormData] = useState({});

    function uploadJSONFile(event) {
        const { files = [] } = event.currentTarget;
        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);
        setFormData({ gcpFileName: file.name, gcpFile: '', formData, files });
    }

    const validate = () => {
        const { gcpFileName, files } = form;
        if (!(gcpFileName || '').trim().length || (files || []).length === 0) {
            return { message: 'Please select file', field: 'Credential File' };
        } else if (!/.json$/.test(gcpFileName)) {
            return { message: 'Please select JSON file only', field: 'Credential File' };
        }
        return null;
    }

    formGroup({ form, validate });

    useEffect(() => {
        const { gcpFileName = '', gcpFile = '' } = cloudConnection
        setFormData({ gcpFileName, gcpFile });
    }, [cloudConnection?.cloudConnectionId]);

    return (
        <>
            <div className="p-field p-col-12 p-md-12">
                <label>Credential File</label>
                <InputText type="file" onChange={uploadJSONFile} placeholder="Upload file" />
            </div>
        </>
    )
}

export default function CloudConnectionsVault({ onError }) {
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showCreateOrUpdatePopup, setShowCreateOrUpdatePopup] = useState(false);
    const [rerender, setRerender] = useState(1);
    const [cloudConnection, setcloudConnection] = useState({});
    const user = getUser();

    const deletecloudConnection = (e) => {
        setcloudConnection(e);
        setShowDeletePopup(true);
    }

    const updatecloudConnection = (e) => {
        setcloudConnection(e);
        setShowCreateOrUpdatePopup(true);
    }

    const deleteRecord = () => {
        axios.delete(`${ip}cloudConnectionVault/${cloudConnection.cloud.code}`).then(() => {
            setShowDeletePopup(false);
            setRerender(Math.random());
            handleError({ severity: 'success', summary: 'CloudConnection',
             detail: `Successfully deleted CloudConnection from vault`, sticky: true });
        }).catch((_) => {
            setShowDeletePopup(false);
            handleError({ severity: 'error', summary: 'CloudConnection',
             detail: `Error deleting CloudConnection from vault`, sticky: true });
        });
    }

    const handleError = (message) => {
        onError(message);
    }

    const createCloudConnectionInfo = (data) => {
        axios.post(`${ip}cloudConnectionVault`, data).then((res) => {
            setShowCreateOrUpdatePopup(false);
            setRerender(Math.random());
            handleError({
                severity: 'success', summary: 'CloudConnection',
                detail: `Successfully created cloudConnection in vault`, sticky: true
            });
        }).catch(({ response: { data } }) => {
            handleError({
                severity: 'error', summary: 'CloudConnection to vault',
                detail: data?.message, sticky: true
            });
        });
    }

    const updateCloudConnectionInfo = (id, data) => {
        axios.put(`${ip}cloudConnectionVault/${id}`, data).then((res) => {
            setShowCreateOrUpdatePopup(false);
            setRerender(Math.random());
            handleError({
                severity: 'success', summary: 'CloudConnection',
                detail: `Successfully updated CloudConnection to vault`, sticky: true
            });
        }).catch(({ response: { data } }) => {
            handleError({
                severity: 'error', summary: 'CloudConnection',
                detail: data?.message, sticky: true
            });
        });
    }

    const createOrUpdateCloudConnection = (id, data) => {
        if (id) {
            if (data.cloudId === 3) {
                updateCloudConnectionForGcp(id, data);
            } else {
                updateCloudConnectionInfo(id, data);
            }
        } else {
            if (data.cloudId === 3) {
                createCloudConnectionForGcp(data);
            } else {
                createCloudConnectionInfo(data);
            }
        }
    }

    const createCloudConnectionForGcp = (data) => {
        const config = {
            headers: { 'content-type': 'multipart/form-data' }
        }
        data.formData.append('cloudId', data.cloudId);
        data.formData.append('userId', data.userId);
        axios.post(`${ip}cloudConnectionVault/gcp/upload`, data.formData, config).then(() => {
            setShowCreateOrUpdatePopup(false);
            setRerender(Math.random());
            handleError({
                severity: 'success', summary: 'CloudConnection',
                detail: `Successfully created CloudConnection in Vault`, sticky: true
            });
        }).catch(({ response: { data } }) => {
            handleError({
                severity: 'error', summary: 'CloudConnection',
                detail: data?.message, sticky: true
            });
        });
    }

    const updateCloudConnectionForGcp = (id, data) => {
        const config = {
            headers: { 'content-type': 'multipart/form-data' }
        }
        data.formData.append('cloudId', data.cloudId);
        data.formData.append('userId', data.userId);
        axios.put(`${ip}cloudConnectionVault/gcp/upload/${id}`, data.formData, config).then(() => {
            setShowCreateOrUpdatePopup(false);
            setRerender(Math.random());
            handleError({
                severity: 'success', summary: 'CloudConnection',
                detail: `Successfully created CloudConnection in vault`, sticky: true
            });
        }).catch(({ response: { data } }) => {
            handleError({
                severity: 'error', summary: 'CloudConnection',
                detail: data?.message, sticky: true
            });
        });
    }

    const DeleteProductsDialogFooter = () => {
        return (
            <>
                <Button label="No" icon="pi pi-times" className="p-button-text"
                    onClick={() => setShowDeletePopup(false)} />
                <Button label="Yes" icon="pi pi-check" className="p-button-text"
                    onClick={deleteRecord} />
            </>
        );
    }

    const createNewCloudConnection = () => {
        setcloudConnection({});
        setShowCreateOrUpdatePopup(true);
    }

    return (
        <>
            <Container>
                <Row>
                    <Col sm={12} style={{ textAlign: 'center' }}>
                        <h3 style={{ marginBottom: 0 }}>Cloud Connections - Vault</h3>
                    </Col>
                    <Col sm={12} style={{ textAlign: 'right', marginBottom: 10 }}>
                        <Button label="Add Cloud Connection" icon="pi pi-plus"
                            className="p-button-success p-mr-2" onClick={createNewCloudConnection} />
                    </Col>
                    <CloudConnectionList onDelete={deletecloudConnection}
                        onUpdate={updatecloudConnection}
                        onError={handleError} rerender={rerender}
                        user={user}></CloudConnectionList>
                </Row>
            </Container>
            <Dialog visible={showDeletePopup} style={{ width: '450px' }} header="Confirm" modal
                footer={DeleteProductsDialogFooter} onHide={() => { setShowDeletePopup(false) }}>
                <div className="confirmation-content center-align">
                    <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                    <span style={{ marginLeft: 10 }}>Are you sure you want to delete the Cloud Connection <strong>{cloudConnection?.cloud?.code}</strong>?</span>
                </div>
            </Dialog>
            <NewCloudConnection showSlider={showCreateOrUpdatePopup} user={user}
                onHide={() => { setShowCreateOrUpdatePopup(false) }}
                cloudConnection={cloudConnection} onError={handleError}
                onSave={createOrUpdateCloudConnection}></NewCloudConnection>
        </>
    );
}