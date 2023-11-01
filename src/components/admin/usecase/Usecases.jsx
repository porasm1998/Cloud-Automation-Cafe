import { useEffect, useMemo, useRef, useState, useContext } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { Sidebar } from 'primereact/sidebar';
import settings from '../../../settings.json';
import { Dropdown } from 'primereact/dropdown';
import { CascadeSelect } from 'primereact/cascadeselect';
import { createUseStyles } from "react-jss";
import { SelectButton } from "primereact/selectbutton";
import { InputText } from "primereact/inputtext";
import axios from "axios";
import './usecases.css';
import { ToasterContext } from "../../common/Context";

const { ip } = settings;

function UsecasesGrid({ onDelete, onUpdate, onError, rerender }) {
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

    const columns = useMemo(() => {
        return [
            { field: 'cloud.code', header: 'Cloud Provider', sortable: true, filter: true, filterPlaceholder: 'Search by Cloud Provider' },
            { field: 'code', header: 'Code', sortable: true, filter: true, filterPlaceholder: 'Search by Code' },
            { field: 'name', header: 'Name', sortable: true, filter: true, filterPlaceholder: 'Search by Name' },
            { field: 'useCase.name', header: 'Parent Name', sortable: true, filter: true, filterPlaceholder: 'Search by Parent Name' },
            { field: 'UIRoute', header: 'UIRoute Name', sortable: true, filter: true, filterPlaceholder: 'Search by UIRoute Name' },
            { body: ActionBodyTemplate }];
    }, []);

    const featchData = () => {
        setState((prevState) => Object.assign({}, prevState, { loading: true }));
        const { page, rows, sortField = 'useCaseId', sortOrder = -1, filters = {} } = state.lazyParams;
        axios.get(`${ip}usecase?page=${page}&size=${parseInt(rows)}&sortField=${sortField}&sortOrder=${parseInt(sortOrder)}&filters=${JSON.stringify(filters)}`)
            .then(({ data }) => {
                setState((prevState) => Object.assign({}, prevState, {
                    loading: false,
                    data: data.rows, totalRecords: data.count
                }));
            }).catch((e) => {
                onError({ severity: 'error', summary: 'Fetch usecases', detail: 'Failed to fetch usecases', sticky: true });
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
            <DataTable ref={dataGridRef} value={state.data} lazy rows={state.lazyParams.rows} paginator
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                first={state.lazyParams.first} totalRecords={state.totalRecords}
                onPage={onPage} onSort={onSort} sortField={state.lazyParams.sortField}
                sortOrder={state.lazyParams.sortOrder}
                onFilter={onFilter} filters={state.lazyParams.filters}
                loading={state.loading} rowsPerPageOptions={[10, 20, 50]}
                className="cac-datatable">
                {columns.map((column, idx) => (
                    <Column {...column} key={idx}></Column>
                ))}
            </DataTable>
        </Col>
    );
}

function NewUsecase({ showSlider = false, onHide, onSave, onError, useCase = {} }) {
    const [cloudId, setCloudId] = useState(1);
    const [cloudData, setCloudData] = useState(null);
    const [createAnother, setCreateAnother] = useState(false);
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
        const { cloudId = 1 } = useCase;
        setCloudId(cloudId)
        featchCloudProvides();
        return () => {
            setCreateAnother(false);
        }
    }, [useCase]);


    const save = () => {
        const { form, validate } = formGroupData;
        const validation = validate();
        if (validation) {
            const { field, message } = validation;
            onError({ severity: 'error', summary: field, detail: message, sticky: true });
        } else {
            const { useCaseId } = useCase;
            const { code, name, UIRoute, parentId } = form;
            const saveObject = { ...{ code, name, UIRoute, parentId }, ...{ cloudId, createAnother } };
            onSave(useCaseId, saveObject);
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

    return (
        <Sidebar visible={showSlider} position="right" onHide={onHide} modal showCloseIcon={false}
            className="custom-sidebar">
            <h3>Usecases</h3>
            <div className={`p-fluid p-formgrid p-grid ${classes['cac-form']}`}>
                <div className="p-field p-col-12 p-md-6">
                    <label>Cloud Provider</label>
                    <SelectButton optionLabel="code" optionValue="cloudId"
                        value={cloudId}
                        options={cloudData}
                        onChange={onCloudProviderChange}>
                    </SelectButton>
                </div>
                <UseCaseFields formGroup={formGroup} useCase={useCase}
                    cloudId={cloudId} onError={onError}></UseCaseFields>
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
        </Sidebar>
    );
}

export const UseCaseFields = ({ formGroup, useCase, cloudId, onError }) => {
    const [dropDown, setDropDown] = useState({});
    const [form, setFormData] = useState({});

    const useStyles = createUseStyles({
        'menu-item': {
            textDecoration: 'none',
            color: 'currentColor'
        }
    });
    const classes = useStyles();

    const getParentLevelMenu = () => {
        axios.get(`${ip}usecase/cloud/${cloudId}`)
            .then(({ data }) => {
                data = prepareTreeFormat(data);
                if (useCase?.useCaseId) {
                    const selectedMenu = setSelectedTreeParent(data, (useCase?.parentId || useCase?.useCaseId));
                    setFormData(prevState => ({ ...prevState, ...{ ['parentMenu']: selectedMenu } }));
                }
                setDropDown(prev => ({ ...{ prev }, ...{ parentMenu: data } }));
            }).catch((e) => {
                onError({
                    severity: 'error', summary: 'Menu',
                    detail: 'Faield to fetch Parent Menu', sticky: true
                });
            });
    }

    const setSelectedTreeParent = (data, parentId) => {
        return data.reduce((acc, item) => {
            if (item.useCaseId === parentId) {
                acc = item;
            } else if (item.subMenu && !acc) {
                acc = setSelectedTreeParent(item.subMenu, parentId);
            }
            return acc;
        }, null);
    }

    const prepareTreeFormat = (data = []) => {
        return data.filter(f => !f.parentId).map((item) => {
            item.subMenu = getChildMenu(data, item.useCaseId);
            if (!item.subMenu.length) {
                delete item.subMenu;
            }
            return item;
        });
    }

    const getChildMenu = (data = [], parentId) => {
        return data
            .filter(item => {
                return item?.useCase?.useCaseId === parentId;
            }).map(item => {
                item.subMenu = getChildMenu(data, item?.useCaseId);
                if (!item.subMenu.length) {
                    delete item.subMenu;
                }
                return item;
            });
    }

    const [fields, setFields] = useState([
        {
            fieldName: 'casecaseSelect', options: getParentLevelMenu,
            optionLabel: 'name', optionValue: 'useCaseId', optionsBindingKey: 'parentMenu',
            label: 'Parent Menu', uiBindingField: 'parentMenu', optionGroupLabel: 'name',
            optionGroupChildren: ['subMenu', 'subMenu', 'subMenu', 'subMenu', 'subMenu', 'subMenu'],
            validationRequired: false
        },
        { fieldName: 'input', fieldType: 'text', label: 'Name', apiField: 'name', validationRequired: true },
        { fieldName: 'input', fieldType: 'text', label: 'Code', apiField: 'code', validationRequired: true },
        { fieldName: 'input', fieldType: 'text', label: 'UIRoute', apiField: 'UIRoute', validationRequired: true }
    ]);

    const validate = () => {
        const field = fields.filter(f => f.validationRequired).find(field => !form[field.apiField]?.trim()?.length);
        if (field) {
            return { field: field.label, message: `${field.label} cannot be empty` };
        } else if (useCase?.useCaseId && (useCase?.useCaseId === form?.parentId)) {
            return { field: 'Parent Menu', message: `Parent menu and child menu cannot be Same` };
        }
        return null;
    }

    formGroup({ form, validate });

    const setFormValues = (field) => {
        return ({ target: { value } }) => {
            setFormData(prevState => ({ ...prevState, ...{ [field]: value } }));
        }
    }

    const setDropDownValues = (field) => {
        return ({ value }) => {
            setFormData(prevState => ({ ...prevState, ...{ [field]: value, parentId: value?.useCaseId } }));
        }
    }

    const CaseCadeSelectTemplate = (menu) => {
        const onClick = (e) => {
            e.preventDefault();
            setFormData(prevState => ({
                ...prevState, ...{
                    ['parentMenu']: menu,
                    parentId: menu?.useCaseId
                }
            }));
            document.querySelector('.p-cascadeselect')?.click();
        }
        return (
            <a href="/#" className={classes["menu-item"]} onClick={onClick}>{menu.name}</a>
        );
    }

    useEffect(() => {
        const { code = '', name = '', parentId, UIRoute = '' } = useCase;
        setFormData({ code, name, parentId, UIRoute, parentMenu: null });
        getParentLevelMenu();
    }, [useCase, cloudId]);

    const getFormFieldBasedOnFieldType = (field) => {
        switch (field.fieldName) {
            case 'input':
                return <InputText type={field.fieldType} value={form[field.apiField]}
                    onChange={setFormValues(field.apiField)} placeholder={field.label} />
            case 'select':
                return <Dropdown optionLabel={field.optionLabel}
                    optionValue={field.optionValue} options={dropDown[field.optionsBindingKey]}
                    value={form[field.uiBindingField]}
                    onChange={setDropDownValues(field.uiBindingField)} placeholder={field.label} />
            case 'casecaseSelect':
                return <CascadeSelect value={form[field.uiBindingField]}
                    options={dropDown[field.optionsBindingKey]}
                    optionLabel={field.optionLabel} optionGroupLabel={field.optionGroupLabel}
                    optionGroupChildren={field.optionGroupChildren}
                    placeholder={field.label}
                    onChange={setDropDownValues(field.uiBindingField)}
                    itemTemplate={CaseCadeSelectTemplate}
                    style={{ width: '50%' }} />
            default:
                return null;
        }
    }

    return (
        <>
            {
                fields.map((field, index) => (
                    <div className="p-field p-col-12 p-md-12" key={index}>
                        <label htmlFor="firstname6">{field.label}</label>
                        {getFormFieldBasedOnFieldType(field)}
                    </div>
                ))
            }
        </>
    )
}

export default function Usecases() {
    const { addMessage } = useContext(ToasterContext);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showCreateOrUpdatePopup, setShowCreateOrUpdatePopup] = useState(false);
    const [rerender, setRerender] = useState(1);
    const [usecase, setUsecase] = useState({});
    const deleteUsecase = (e) => {
        setUsecase(e);
        setShowDeletePopup(true);
    }
    const updateUsecase = (e) => {
        setUsecase(e);
        setShowCreateOrUpdatePopup(true);
    }
    const deleteRecord = () => {
        axios.delete(`${ip}usecase/${usecase.useCaseId}`).then(() => {
            setShowDeletePopup(false);
            setRerender(Math.random());
            addMessage({
                severity: 'success', summary: 'Usecase',
                detail: `Successfully deleted Usecase : ${usecase.name}`, sticky: true
            });
        }).catch((_) => {
            setShowDeletePopup(false);
            addMessage({
                severity: 'error', summary: 'Usecase',
                detail: `Error deleting Usecase : ${usecase.name}`, sticky: true
            });
        });
    }
    const createAnother = (data) => {
        const { createAnother } = data;
        if (createAnother) {
            setUsecase({});
        } else {
            setShowCreateOrUpdatePopup(false);
        }
        setRerender(Math.random());
    }
    const createUsecaseInfo = (data) => {

        axios.post(`${ip}usecase`, data).then(() => {
            createAnother(data);
            addMessage({
                severity: 'success', summary: 'Usecase',
                detail: `Successfully created Usecase : ${data.name}`, sticky: true
            });
        }).catch((_) => {
            addMessage({
                severity: 'error', summary: 'Usecase',
                detail: `Error creating Usecase : ${data.name}`, sticky: true
            });
        });
    }
    const updateUsecaseInfo = (id, data) => {
        axios.put(`${ip}usecase/${id}`, data).then(() => {
            createAnother(data);
            addMessage({
                severity: 'success', summary: 'Usecase',
                detail: `Successfully updated Usecase : ${data.name}`, sticky: true
            });
        }).catch((_) => {
            addMessage({
                severity: 'error', summary: 'Usecase',
                detail: `Error updating Usecase : ${data.name}`, sticky: true
            });
        });
    }
    const createOrUpdateUsecase = (id, data) => {
        if (id) {
            updateUsecaseInfo(id, data);
        } else {
            createUsecaseInfo(data);
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
    const createNewUsecase = () => {
        setUsecase({});
        setShowCreateOrUpdatePopup(true);
    }
    return (
        <>
            <Container style={{ marginTop: '3.5rem' }}>
                <Row>
                    <Col sm={12} style={{ textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '0' }}>Usecases</h3>
                    </Col>
                    <Col sm={12} style={{ textAlign: 'right', marginBottom: '10' }}>
                        <Button label="Add Usecase" icon="pi pi-plus" className="p-button-success p-mr-2" onClick={createNewUsecase} />
                    </Col>
                    <UsecasesGrid onDelete={deleteUsecase} onUpdate={updateUsecase}
                        onError={addMessage} rerender={rerender}></UsecasesGrid>
                </Row>
            </Container>
            <Dialog visible={showDeletePopup} style={{ width: '450px' }} header="Confirm" modal
                footer={DeleteProductsDialogFooter} onHide={() => { setShowDeletePopup(false) }}>
                <div className="confirmation-content center-align">
                    <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                    <span style={{ marginLeft: 10 }}>Are you sure you want to delete the usecase <strong>{usecase?.name}</strong>?</span>
                </div>
            </Dialog>
            <NewUsecase showSlider={showCreateOrUpdatePopup}
                onHide={() => { setShowCreateOrUpdatePopup(false) }}
                useCase={usecase} onError={addMessage} onSave={createOrUpdateUsecase}></NewUsecase>
        </>
    );
}