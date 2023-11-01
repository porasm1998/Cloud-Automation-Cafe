import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Sidebar } from 'primereact/sidebar';
import settings from '../../../settings.json';
import axios from "axios";
import './clients.css';
import { CONSTANT } from "../../constants/constant";
import { ToasterContext } from "../../common/Context";

const { ip } = settings;

function ClientsGrid({ onDelete, onUpdate, onError, rerender }) {
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
        return [{ field: 'shortName', header: 'Name', sortable: true, filter: true, filterPlaceholder: 'Search by Name' },
        { field: 'description', header: 'Description', sortable: true, filter: true, filterPlaceholder: 'Search by Description' },
        { field: 'email', header: 'Email', sortable: true, filter: true, filterPlaceholder: 'Search by Email' },
        { field: 'contact', header: 'Phone No', sortable: true, filter: true, filterPlaceholder: 'Search by Phone No' },
        { field: 'address', header: 'Address', sortable: true, filter: true, filterPlaceholder: 'Search by Address' },
        { body: ActionBodyTemplate, className: 'action-fields' }
        ];
    }, []);
    const featchData = () => {
        setState((prevState) => Object.assign({}, prevState, { loading: true }));
        const { page, rows, sortField = 'clientId', sortOrder = -1, filters = {} } = state.lazyParams;
        axios.get(`${ip}client?page=${page}&size=${parseInt(rows)}&sortField=${sortField}&sortOrder=${parseInt(sortOrder)}&filters=${JSON.stringify(filters)}`)
            .then(({ data }) => {
                setState((prevState) => Object.assign({}, prevState, {
                    loading: false,
                    data: data.rows, totalRecords: data.count
                }));
            }).catch((e) => {
                onError({ severity: 'error', summary: 'Fetch clients', detail: 'Failed to fetch Clients', sticky: true });
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

function NewClient({ showSlider = false, onHide, onSave, onError, client = {} }) {
    const shortNameRef = useRef(null);
    const descriptionRef = useRef(null);
    const emailRef = useRef(null);
    const contactRef = useRef(null);
    const addressRef = useRef(null);
    const save = () => {
        const { current } = shortNameRef;
        const { current: descCurrent } = descriptionRef;
        const { current: emailCurrent } = emailRef;
        const { current: contactCurrent } = contactRef;
        const { current: addressCurrent } = addressRef;
        if (isValid()) {
            onSave({
                ...client, ...{
                    shortName: current.value, description: descCurrent.value,
                    email: emailCurrent.value, contact: contactCurrent.value,
                    address: addressCurrent.value
                }
            });
        }
    }
    const isValid = () => {
        const { current } = shortNameRef;
        const { current: descCurrent } = descriptionRef;
        const { current: emailCurrent } = emailRef;
        const { current: contactCurrent } = contactRef;
        const { current: addressCurrent } = addressRef;
        const emptyObj = [{ label: 'Short Name', current }, { label: 'Description', current: descCurrent },
        { label: 'Email', current: emailCurrent }, { label: 'Contact', current: contactCurrent },
        { label: 'Address', current: addressCurrent }].find((item) => {
            return !item.current.value.trim().length;
        });
        if (emptyObj) {
            onError({ severity: 'error', summary: emptyObj.label, detail: `${emptyObj.label} cannot be empty`, sticky: true });
            return false;
        } else if (current.value.trim().length < 4) {
            onError({ severity: 'error', summary: 'Short Name', detail: 'Short Name should be atleast 4 characters', sticky: true });
            return false;
        } else if (!new RegExp(CONSTANT.PHONE_NUMBER_REGEX).test(contactCurrent.value)) {
            onError({ severity: 'error', summary: 'Phone No', detail: 'Phone No should contain +country code - atleast 4 digit number', sticky: true });
            return false;
        } else if (!new RegExp(CONSTANT.EMAIL_REGEX).test(emailCurrent.value)) {
            onError({ severity: 'error', summary: 'Email', detail: 'Please provide valid email', sticky: true });
            return false;
        }
        return true;
    }
    return (
        <Sidebar visible={showSlider} position="right" onHide={onHide} modal showCloseIcon={false}
            className="custom-sidebar">
            <h3>Client</h3>
            <Form>
                <Form.Group className="mb-3" controlId="shortName">
                    <Form.Label>Short Name*</Form.Label>
                    <Form.Control type="text" placeholder="Short Name" defaultValue={client.shortName}
                        ref={shortNameRef} maxLength="10" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="description">
                    <Form.Label>Description</Form.Label>
                    <Form.Control type="text" placeholder="Description" defaultValue={client.description}
                        ref={descriptionRef} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="contact">
                    <Form.Label>Phone No</Form.Label>
                    <Form.Control type="text" placeholder="+91-987456321" defaultValue={client.contact}
                        ref={contactRef} maxLength="15" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control type="email" placeholder="name@example.com" defaultValue={client.email}
                        ref={emailRef} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="address">
                    <Form.Label>Address</Form.Label>
                    <Form.Control as="textarea" rows={3} defaultValue={client.address}
                        ref={addressRef} />
                </Form.Group>
            </Form>
            <div style={{ textAlign: 'right' }}>
                <Button label="Cancel" className="p-button-secondary" onClick={onHide} />
                <Button label="Save" onClick={save} style={{ marginLeft: 10 }} />
            </div>
        </Sidebar>
    );
}

export default function Clients() {

    const { addMessage } = useContext(ToasterContext);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showCreateOrUpdatePopup, setShowCreateOrUpdatePopup] = useState(false);
    const [rerender, setRerender] = useState(1);
    const [client, setClient] = useState({});

    const deleteClient = (e) => {
        setClient(e);
        setShowDeletePopup(true);
    }

    const updateClient = (e) => {
        setClient(e);
        setShowCreateOrUpdatePopup(true);
    }

    const deleteRecord = () => {
        axios.delete(`${ip}client/${client.clientId}`).then(() => {
            setShowDeletePopup(false);
            setRerender(Math.random());
            addMessage({ severity: 'success', summary: 'Client', detail: `Successfully deleted Client : ${client.shortName}`, sticky: true });
        }).catch((_) => {
            setShowDeletePopup(false);
            addMessage({ severity: 'error', summary: 'Client', detail: `Error deleting Client : ${client.shortName}`, sticky: true });
        });
    }

    const createClientInfo = (data) => {
        axios.post(`${ip}client`, data).then(() => {
            setShowCreateOrUpdatePopup(false);
            setRerender(Math.random());
            addMessage({ severity: 'success', summary: 'Client', detail: `Successfully created Client : ${data.shortName}`, sticky: true });
        }).catch((_) => {
            addMessage({ severity: 'error', summary: 'Client', detail: `Error creating Client : ${data.shortName}`, sticky: true });
        });
    }
    const updateClientInfo = (data) => {
        axios.put(`${ip}client/${data.clientId}`, data).then(() => {
            setShowCreateOrUpdatePopup(false);
            setRerender(Math.random());
            addMessage({ severity: 'success', summary: 'Client', detail: `Successfully updated Client : ${data.shortName}`, sticky: true });
        }).catch((_) => {
            addMessage({ severity: 'error', summary: 'Client', detail: `Error updating Client : ${data.shortName}`, sticky: true });
        });
    }
    const createOrUpdateClient = (data) => {
        if (data.clientId) {
            updateClientInfo(data);
        } else {
            createClientInfo(data);
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
    const createNewClient = () => {
        setClient({});
        setShowCreateOrUpdatePopup(true);
    }
    return (
        <>
            <Container style={{ marginTop: '3.5rem' }}>
                <Row>
                    <Col sm={12} style={{ textAlign: 'center' }}>
                        <h3 style={{ marginBottom: 0 }}>Clients</h3>
                    </Col>
                    <Col sm={12} style={{ textAlign: 'right', marginBottom: 10 }}>
                        <Button label="Add Client" icon="pi pi-plus" className="p-button-success p-mr-2" onClick={createNewClient} />
                    </Col>
                    <ClientsGrid onDelete={deleteClient} onUpdate={updateClient}
                        onError={addMessage} rerender={rerender}></ClientsGrid>
                </Row>
            </Container>
            <Dialog visible={showDeletePopup} style={{ width: '450px' }} header="Confirm" modal
                footer={DeleteProductsDialogFooter} onHide={() => { setShowDeletePopup(false) }}>
                <div className="confirmation-content center-align">
                    <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                    <span style={{ marginLeft: 10 }}>Are you sure you want to delete the client <strong>{client.shortName}</strong>?</span>
                </div>
            </Dialog>
            <NewClient showSlider={showCreateOrUpdatePopup}
                onHide={() => { setShowCreateOrUpdatePopup(false) }}
                client={client} onError={addMessage} onSave={createOrUpdateClient}></NewClient>
        </>
    );
}