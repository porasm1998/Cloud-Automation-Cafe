import { useEffect, useRef, useState, useContext } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { Sidebar } from 'primereact/sidebar';
import settings from '../../../settings.json';
import { createUseStyles } from "react-jss";
import { SelectButton } from "primereact/selectbutton";
import { InputText } from "primereact/inputtext";
import axios from "axios";
import { ToasterContext } from "../../common/Context";
import { FileUpload } from 'primereact/fileupload';
import ClientList from "../users/ClientList";
import { retrieveKeyValue } from "../../../util/commonUtils";

const { ip } = settings;

function StandardControlGrid({ onDelete, onUpdate, onError, rerender, selectedRow, onSelectedRow }) {
    const dataGridRef = useRef(null);
    const [state, setState] = useState({
        loading: false,
        totalRecords: 0,
        data: null,
        lazyParams: {
            first: 0,
            rows: 10,
            page: 0
        }
    });

    const ActionBodyTemplate = (rowData) => {
        const deleteRecord = () => {
            onDelete(rowData);
        }
        const updateRecord = () => {
            onUpdate(rowData);
        }
        return (
            <div style={{ textAlign: 'right' }}>
                <Button icon="pi pi-pencil" className="p-button-link p-button-rounded p-button-success" onClick={updateRecord} />
                <Button icon="pi pi-trash" className="p-button-link p-button-rounded p-button-warning" onClick={deleteRecord} />
            </div>
        );
    }

    const columns = [
        { field: 'client.shortName', header: 'Client Name', sortable: true, filter: true, filterPlaceholder: 'Search by Client Name', headerStyle: { width: 105 } },
        { field: 'cloud.code', header: 'Cloud Provider', sortable: true, filter: true, filterPlaceholder: 'Search by Cloud Provider', headerStyle: { width: 120 } },
        { field: 'categoryName', header: 'Category Name', sortable: true, filter: true, filterPlaceholder: 'Search by Category', headerStyle: { width: 140 } },
        { field: 'name', header: 'Key', sortable: true, filter: true, filterPlaceholder: 'Search by Name', headerStyle: { width: 130 } },
        { field: 'value', header: 'Value', sortable: true, filter: true, filterPlaceholder: 'Search by Value', headerStyle: { width: 130 } },
        { field: 'serialNo', header: 'Serial No', sortable: true, filter: true, filterPlaceholder: 'Search by Serial No', headerStyle: { width: 85 }, bodyStyle: { textAlign: 'center' } },
        { field: 'remarks', header: 'Remarks', sortable: true, filter: true, filterPlaceholder: 'Search by Remarks', headerStyle: { width: 135 } },
        { field: 'standardControl.name', header: 'Parent Control Name', sortable: true, filter: true, filterPlaceholder: 'Search by Parent Control Name', headerStyle: { width: 155 } },
        { body: ActionBodyTemplate, headerStyle: { width: 55 } }
    ]

    if (onSelectedRow) {
        columns.splice(6, 1);
        columns.unshift({ selectionMode: "single", headerStyle: { width: "3em" } });
    }

    const featchData = () => {
        setState((prevState) => Object.assign({}, prevState, { loading: true }));
        const { page, rows, sortField = ['cloud.code', 'categoryName', 'serialNo'], sortOrder = [1, 1, 1, 1], filters = {} } = state.lazyParams;
        axios.get(`${ip}standardControl`, {
            params: {
                page,
                size: parseInt(rows),
                sortField,
                sortOrder,
                filters
            }
        })
            .then(({ data }) => {
                setState((prevState) => Object.assign({}, prevState, {
                    loading: false,
                    data: data.rows, totalRecords: data.count
                }));
            }).catch((e) => {
                onError({
                    severity: 'error', summary: 'Fetch Enterprise Standards',
                    detail: 'Failed to fetch Enterprise Standards', sticky: true
                });
                setState((prevState) => Object.assign({}, prevState, { loading: false }));
            });
    }

    useEffect(() => {
        featchData();
    }, [state.lazyParams.first, state.lazyParams.page,
    state.lazyParams.rows, state.lazyParams.sortField,
    state.lazyParams.sortOrder, state.lazyParams.filters, rerender]);

    const onPage = (e) => {
        setState((prevState) => Object.assign({}, prevState, { lazyParams: { ...prevState.lazyParams, ...e } }));
    }

    const onSort = (e) => {
        setState((prevState) => Object.assign({}, prevState, { lazyParams: { ...prevState.lazyParams, ...e } }));
    }

    const onFilter = (e) => {
        setState((prevState) => {
            const lazy = { ...prevState.lazyParams, ...e };
            lazy.first = 0;
            lazy.page = 0;
            prevState.lazyParams = lazy;
            return { ...prevState };
        });
    }

    return (
        <Col sm={12}>
            {onSelectedRow ? <DataTable ref={dataGridRef} value={state.data} lazy rows={state.lazyParams.rows} paginator
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                first={state.lazyParams.first} totalRecords={state.totalRecords}
                onPage={onPage} onSort={onSort} sortField={state.lazyParams.sortField}
                sortOrder={state.lazyParams.sortOrder}
                onFilter={onFilter} filters={state.lazyParams.filters}
                loading={state.loading} rowsPerPageOptions={[10, 20, 50, 100]}
                selection={selectedRow}
                onSelectionChange={onSelectedRow}
                className="cac-datatable">
                {columns.map((column, idx) => (
                    <Column {...column} key={idx}></Column>
                ))}
            </DataTable> :
                <DataTable ref={dataGridRef} value={state.data} lazy rows={state.lazyParams.rows} paginator
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                    first={state.lazyParams.first} totalRecords={state.totalRecords}
                    onPage={onPage} onSort={onSort} sortField={state.lazyParams.sortField}
                    sortOrder={state.lazyParams.sortOrder}
                    onFilter={onFilter} filters={state.lazyParams.filters}
                    loading={state.loading} rowsPerPageOptions={[10, 20, 50, 100]}
                    className="cac-datatable">
                    {columns.map((column, idx) => (
                        <Column {...column} key={idx}></Column>
                    ))}
                </DataTable>
            }
        </Col>
    );
}

function NewStandardControl({ showSlider = false, onHide, onSave, onError, standardControl = {} }) {
    const [cloudId, setCloudId] = useState(1);
    const [cloudData, setCloudData] = useState(null);
    const [createAnother, setCreateAnother] = useState(false);
    const [clientListGrid, setClientListGrid] = useState(false);
    const [standardControlGrid, setStandardControlGrid] = useState(false);
    const [standardControlData, setStandardControlData] = useState({});
    let formGroupData = null;

    const useStyles = createUseStyles({
        'cac-form': {
            ' & > .p-field': {
                marginBottom: `${(7 / 16)}rem`,
                '&  label': {
                    marginBottom: `${(5 / 16)}rem`
                },
                '&  .p-inputtext': {
                    padding: `${(6 / 16)}rem ${(12 / 16)}rem`
                }
            }
        },
        'button-action-container': {
            textAlign: 'right',
            marginTop: `${(10 / 16)}rem`,
            '& .checkbox-action': {
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'baseline',
                '& .p-checkbox-label': {
                    position: 'relative',
                    top: '5px',
                    left: '3px'
                }
            },
            '& .button-action': {
                display: 'inherit',
                justifyContent: 'end'
            },
            '& .p-button.p-component': {
                width: '15%',
                marginLeft: `${(10 / 16)}rem`
            }
        }
    });

    const classes = useStyles();

    const featchCloudProvides = () => {
        axios.get(`${ip}cloud`)
            .then(({ data }) => {
                setCloudData(data);
            }).catch((e) => {
                onError({
                    severity: 'error', summary: 'Cloud Provides',
                    detail: 'Faield to fetch Cloud Providers list', sticky: true
                });
            });
    }

    useEffect(() => {
        const { cloudId = 1 } = standardControl;
        setCloudId(cloudId)
        featchCloudProvides();
        setStandardControlData(standardControl);
        return () => {
            setCreateAnother(false);
        }
    }, [standardControl]);


    const save = () => {
        const { form, validate } = formGroupData;
        const validation = validate();
        if (validation) {
            const { field, message } = validation;
            onError({ severity: 'error', summary: field, detail: message, sticky: true });
        } else {
            const { standardControlId } = standardControlData;
            const { categoryName = '', name = '', value = '', remarks = '', standardControl = {}, client = {}, serialNo } = form;
            const { standardControlId: parentId = null } = (standardControl || {});
            const { clientId } = (client || {});
            const saveObject = { ...{ categoryName, name, value, remarks, parentId, clientId, serialNo }, ...{ cloudId, createAnother } };
            onSave(standardControlId, saveObject);
        }
    }

    const onCancel = () => {
        onHide()
    }

    const onCloudProviderChange = (e) => {
        setCloudId(e.value);
    }

    const formGroup = (fromGroup) => {
        formGroupData = fromGroup;
    }

    const onCreateAnother = ({ checked }) => {
        setCreateAnother(checked);
    }

    const setClient = (selectedClient) => {
        setStandardControlData(p => ({ ...p, ...{ client: selectedClient } }));
        setClientListGrid(false);
    }

    const showClientListGrid = (flag) => {
        setClientListGrid(flag);
    }

    const setStandardControlFormData = (form) => {
        setStandardControlData(p => ({ ...p, ...form }));
    }

    const setShowStandardControlListGrid = (flag) => {
        setStandardControlGrid(flag);
    }

    const setStandardControl = ({ value }) => {
        setStandardControlData(p => ({ ...p, ...{ standardControl: value } }));
        setStandardControlGrid(false);
    }

    return (
        <Sidebar visible={showSlider} position="right" onHide={onHide} modal showCloseIcon={false}
            className="custom-sidebar">
            <h3>Enterprise Standards</h3>
            <div className={`p-fluid p-formgrid p-grid ${classes['cac-form']}`}>
                <div className="p-field p-col-12 p-md-6">
                    <label>Cloud Provider</label>
                    <SelectButton optionLabel="code" optionValue="cloudId"
                        value={cloudId}
                        options={cloudData}
                        onChange={onCloudProviderChange}>
                    </SelectButton>
                </div>
                <StandardControlFields formGroup={formGroup} standardControlData={standardControlData}
                    cloudId={cloudId} onShowClientListGrid={showClientListGrid}
                    onStandardControlFormData={setStandardControlFormData}
                    onShowStandardControlListGrid={setShowStandardControlListGrid}>
                </StandardControlFields>
                <div className={`p-col-12 ${classes["button-action-container"]}`}>
                    <div className="p-grid p-nogutter p-justify-center p-align-center">
                        <div className="p-col-8 checkbox-action">
                            <Checkbox value="createAnother" onChange={onCreateAnother}
                                checked={createAnother}></Checkbox>
                            <label className="p-checkbox-label">Create another</label>
                        </div>
                        <div className="p-col-4 button-action">
                            <Button label="Cancel" className="p-button-secondary" onClick={onCancel} />
                            <Button label="Save" className={classes['button']} onClick={save} />
                        </div>
                    </div>
                </div>
            </div>
            <ClientListGrid clientListGrid={clientListGrid}
                selectedClient={standardControlData.client}
                onSetClient={setClient}
                onHide={showClientListGrid}></ClientListGrid>
            <StandardControlListGrid showStandardControlListGrid={standardControlGrid}
                selectedStandardControl={standardControlData.standardControl}
                onSelectedRow={setStandardControl}
                onHide={setShowStandardControlListGrid}></StandardControlListGrid>
        </Sidebar>
    );
}

const ClientListGrid = ({ clientListGrid, selectedClient, onSetClient, onHide }) => {
    return (
        <Sidebar
            position="right"
            className="p-sidebar-lg"
            visible={clientListGrid}
            onHide={() => onHide(false)}>
            <ClientList onSelectedRow={onSetClient} selectedClient={selectedClient} />
        </Sidebar>
    )
}

const StandardControlListGrid = ({ showStandardControlListGrid, selectedStandardControl, onSelectedRow, onHide }) => {
    return (
        <Sidebar
            position="right"
            className="p-sidebar-lg"
            visible={showStandardControlListGrid}
            onHide={() => onHide(false)}>
            <StandardControlGrid selectedRow={selectedStandardControl}
                onSelectedRow={onSelectedRow}>
            </StandardControlGrid>
        </Sidebar>
    )
}

export const StandardControlFields = ({ formGroup, standardControlData, onShowClientListGrid, onStandardControlFormData, onShowStandardControlListGrid }) => {
    const [form, setFormData] = useState({});

    const [fields, setFields] = useState([
        { fieldName: 'externalInput', fieldType: 'text', label: 'Client Name', apiField: 'client.shortName', validationRequired: true },
        { fieldName: 'input', fieldType: 'text', label: 'Category Name', apiField: 'categoryName', validationRequired: true },
        { fieldName: 'input', fieldType: 'text', label: 'Key', apiField: 'name', validationRequired: true },
        { fieldName: 'input', fieldType: 'text', label: 'Value', apiField: 'value', validationRequired: false },
        { fieldName: 'input', fieldType: 'number', label: 'Serial No', apiField: 'serialNo', validationRequired: true },
        { fieldName: 'input', fieldType: 'text', label: 'Remarks', apiField: 'remarks', validationRequired: false },
        { fieldName: 'externalInput', fieldType: 'text', label: 'Parent Name', apiField: 'standardControl.name', validationRequired: false }
    ]);

    const validateCategoryFormat = (input = '') => {
        const tokens = input.split('_');
        return tokens.findIndex(token => token.charAt(0) !== token.charAt(0).toUpperCase()) === -1;
    }

    const validate = () => {
        const field = fields.filter(f => f.validationRequired)
            .find(field => {
                const value = retrieveKeyValue(form, field.apiField);
                return (!value || !String(value).trim()?.length);
            });
        if (field) {
            return { field: field.label, message: `${field.label} cannot be empty` };
        } else if (!validateCategoryFormat(retrieveKeyValue(form, 'categoryName'))) {
            return {
                field: 'Category Name', message: `Category Name should be in the format like 
            "Category_Name" or "Category" or "Category_Name_Name1"` };
        }
        return null;
    }

    formGroup({ form, validate });

    const setFormValues = (field) => {
        return ({ target: { value } }) => {
            setFormData(prevState => {
                onStandardControlFormData({ ...prevState, ...{ [field]: value } });
                return { ...prevState, ...{ [field]: value } };
            });
        }
    }

    const getExternalData = (e) => {
        const label = e.currentTarget.getAttribute('data-label');
        if (label === 'Client Name') {
            onShowClientListGrid(true);
        } else if (label === 'Parent Name') {
            onShowStandardControlListGrid(true);
        }
    }

    useEffect(() => {
        const { categoryName = '', name = '', value = '', remarks = '',
            standardControl = {}, client = {}, serialNo } = standardControlData;
        setFormData({ categoryName, name, value, remarks, client, standardControl, serialNo });
    }, [standardControlData]);

    const getFormFieldBasedOnFieldType = (field) => {
        let value = '';
        switch (field.fieldName) {
            case 'input':
                value = retrieveKeyValue(form, field.apiField) || '';
                return <InputText type={field.fieldType} value={value}
                    onChange={setFormValues(field.apiField)} placeholder={field.label} />;
            case 'externalInput':
                value = retrieveKeyValue(form, field.apiField) || '';
                return (
                    <div className="p-grid p-nogutter">
                        <div className="p-col-11">
                            <InputText type={field.fieldType}
                                value={value}
                                placeholder={field.label} disabled />
                        </div>
                        <div className="p-col-1">
                            <Button icon="pi pi-pencil" className="p-button-success"
                                data-label={field.label} onClick={getExternalData} />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <>
            {
                fields.map((field, index) => (
                    <div className="p-field p-col-12 p-md-12" key={index}>
                        <label>{field.label}</label>
                        {getFormFieldBasedOnFieldType(field)}
                    </div>
                ))
            }
        </>
    )
}

export default function StandardControl() {

    const { addMessage } = useContext(ToasterContext);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showCreateOrUpdatePopup, setShowCreateOrUpdatePopup] = useState(false);
    const [rerender, setRerender] = useState(1);
    const [standardControl, setStandardControl] = useState({});

    const deleteStandardControl = (e) => {
        setStandardControl(e);
        setShowDeletePopup(true);
    }

    const updateStandardControl = (e) => {
        setStandardControl(e);
        setShowCreateOrUpdatePopup(true);
    }

    const deleteRecord = () => {
        axios.delete(`${ip}standardControl/${standardControl.standardControlId}`).then(() => {
            setShowDeletePopup(false);
            setRerender(Math.random());
            addMessage({
                severity: 'success', summary: 'Enterprise Standards',
                detail: `Successfully deleted Enterprise Standards : ${standardControl.name}`, sticky: true
            });
        }).catch((_) => {
            setShowDeletePopup(false);
            addMessage({
                severity: 'error', summary: 'Enterprise Standards',
                detail: `Error deleting Enterprise Standards : ${standardControl.name}`, sticky: true
            });
        });
    }

    const createAnother = (data) => {
        const { createAnother } = data;
        if (createAnother) {
            setStandardControl({});
        } else {
            setShowCreateOrUpdatePopup(false);
        }
        setRerender(Math.random());
    }

    const createStandardControl = (data) => {
        axios.post(`${ip}standardControl`, data).then(() => {
            createAnother(data);
            addMessage({
                severity: 'success', summary: 'Enterprise Standards',
                detail: `Successfully created Enterprise Standards : ${data.name}`, sticky: true
            });
        }).catch(({ response: { data: errorData } }) => {
            addMessage({
                severity: 'error', summary: 'Enterprise Standards',
                detail: `Error creating Enterprise Standards : ${data.name} : ${errorData}`, sticky: true
            });
        });
    }

    const updateStandardControlInfo = (id, data) => {
        axios.put(`${ip}standardControl/${id}`, data).then(() => {
            createAnother(data);
            addMessage({
                severity: 'success', summary: 'Enterprise Standards',
                detail: `Successfully updated Enterprise Standards : ${data.name}`, sticky: true
            });
        }).catch(({ response: { data: errorData } }) => {
            addMessage({
                severity: 'error', summary: 'Enterprise Standards',
                detail: `Error updating Enterprise Standards : ${data.name} : ${errorData}`,
                sticky: true
            });
        });
    }

    const createOrUpdateStandardControl = (id, data) => {
        if (id) {
            updateStandardControlInfo(id, data);
        } else {
            createStandardControl(data);
        }
    }

    const DeleteProductsDialogFooter = () => {
        return (
            <>
                <Button label="No" icon="pi pi-times" className="p-button-text" onClick={() => setShowDeletePopup(false)} />
                <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteRecord} />
            </>
        );
    }

    const createNewStandardControl = () => {
        setStandardControl({});
        setShowCreateOrUpdatePopup(true);
    }

    const uploadStandardControlExcelFile = ({ files, options }) => {
        if (validateFileUpload(files)) {
            const formData = new FormData();
            formData.append('file', files[0]);
            createStandardControls(formData, options);
        }
    }

    const createStandardControls = (data, options) => {
        const config = {
            headers: { 'content-type': 'multipart/form-data' }
        }
        axios.post(`${ip}standardControl/bulkUpload`, data, config).then(({ data }) => {
            addMessage({
                severity: 'success', summary: 'Enterprise Standards',
                detail: 'Successfully uploaded Enterprise Standards'
            });
            setRerender(Math.random());
            options.clear();
        }).catch(({ response: { data } }) => {
            addMessage({
                severity: 'error', summary: 'Enterprise Standards',
                detail: data?.message, sticky: true
            });
        });
    }

    const validateFileUpload = (files) => {
        if (files.length > 1) {
            addMessage({
                severity: 'error', summary: 'Enterprise Standards File Upload',
                detail: `Only one Excel file can be uploaded at a time`
            });
            return false;
        } else if (!/.xls[x]?$/.test(files[0].name)) {
            addMessage({
                severity: 'error', summary: 'Enterprise Standards File Upload',
                detail: `Please select excel file only`
            });
            return false;
        }
        return true;
    }

    const useStyles = createUseStyles({
        'standard-control-upload': {
            '& .p-fileupload-content': {
                padding: 5,
                textAlign: 'center'
            }
        }
    });

    const classes = useStyles();

    return (
        <>
            <Container style={{ marginTop: '3.5rem' }}>
                <Row>
                    <Col sm={12} style={{ textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '0' }}>Enterprise Standards & Controls</h3>
                    </Col>
                    <Col sm={12} style={{ textAlign: 'right', marginBottom: 15 }}>
                        <Button label="Add Enterprise Standards" icon="pi pi-plus" className="p-button-success p-mr-2"
                            onClick={createNewStandardControl} />
                    </Col>
                    <Col sm={12} style={{ textAlign: 'right', marginBottom: 10 }}>
                        <FileUpload name="standardControlsExcelFile" customUpload
                            uploadHandler={uploadStandardControlExcelFile}
                            accept="xlsx, .xls,
                            application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
                            application/vnd.ms-excel"
                            multiple={false}
                            className={classes["standard-control-upload"]}
                            emptyTemplate={<p className="p-m-0">
                                Drag and drop excel(.xlsx or .xls) file here to upload.</p>} />
                    </Col>
                    <StandardControlGrid onDelete={deleteStandardControl} onUpdate={updateStandardControl}
                        onError={addMessage} rerender={rerender}></StandardControlGrid>
                </Row>
            </Container>
            <Dialog visible={showDeletePopup} style={{ width: '450px' }} header="Confirm" modal
                footer={DeleteProductsDialogFooter} onHide={() => { setShowDeletePopup(false) }}>
                <div className="confirmation-content center-align">
                    <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                    <span style={{ marginLeft: 10 }}>Are you sure you want to delete the Cloud Standard <strong>{standardControl?.name}</strong>?</span>
                </div>
            </Dialog>
            <NewStandardControl showSlider={showCreateOrUpdatePopup}
                onHide={() => { setShowCreateOrUpdatePopup(false) }}
                standardControl={standardControl} onError={addMessage}
                onSave={createOrUpdateStandardControl}>
            </NewStandardControl>
        </>
    );
}