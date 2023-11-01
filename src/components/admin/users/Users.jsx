import { useContext, useEffect, useRef, useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { Sidebar } from "primereact/sidebar";
import { Dropdown } from "primereact/dropdown";
import settings from "../../../settings.json";
import axios from "axios";
import "./users.css";
import ClientList from "./ClientList";
import MenuTreeSlidebar from "./menuTree";
import { Password } from "primereact/password";
import { createUseStyles } from "react-jss";
import { CONSTANT } from "../../constants/constant";
import { Divider } from "primereact/divider";
import { ToasterContext } from "../../common/Context";

const { ip } = settings;

function UsersGrid({ onDelete, onUpdate, onUserPermission, onError, rerender }) {
  const dataGridRef = useRef(null);

  const [state, setState] = useState({
    loading: false,
    totalRecords: 0,
    data: null,
    lazyParams: {
      first: 0,
      rows: 10,
      page: 0,
    },
  });
  const ActionBodyTemplate = (rowData) => {
    const deleteRecord = () => {
      onDelete(rowData);
    };

    const updateRecord = () => {
      onUpdate(rowData);
    };

    const userPermission = () => {
      onUserPermission(rowData);
    }

    return (
      <div style={{ textAlign: "right" }}>
        <Button
          icon="pi pi-key"
          className="p-button-link p-button-rounded p-button-success"
          onClick={userPermission}
        />
        <Button
          icon="pi pi-pencil"
          className="p-button-link p-button-rounded p-button-success"
          onClick={updateRecord}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-link p-button-rounded p-button-erroring"
          onClick={deleteRecord}
        />
      </div>
    );
  };
  const columns = [
    {
      field: "name",
      header: "Name",
      sortable: true,
      filter: true,
      filterPlaceholder: "Search by Name",
    },
    {
      field: "email",
      header: "Email",
      sortable: true,
      filter: true,
      filterPlaceholder: "Search by Email",
    },
    {
      field: "role",
      header: "Role",
      sortable: true,
      filter: true,
      filterPlaceholder: "Search by Role",
    },
    {
      field: "client.shortName",
      header: "Client Name",
      sortable: true,
      filter: true,
      filterPlaceholder: "Search by Client Id",
    },
    {
      field: "passwordExpiry",
      header: "Password Expiry",
      sortable: true,
      filter: true,
      filterPlaceholder: "Date",
    },
    { body: ActionBodyTemplate },
  ];
  const featchData = () => {
    setState((prevState) => Object.assign({}, prevState, { loading: true }));
    const {
      page,
      rows,
      sortField = "userId",
      sortOrder = -1,
      filters = {},
    } = state.lazyParams;
    axios
      .get(
        `${ip}user?page=${page}&size=${parseInt(
          rows
        )}&sortField=${sortField}&sortOrder=${parseInt(
          sortOrder
        )}&filters=${JSON.stringify(filters)}`
      )
      .then(({ data }) => {
        setState((prevState) =>
          Object.assign({}, prevState, {
            loading: false,
            data: data.rows,
            totalRecords: data.count,
          })
        );
      })
      .catch((e) => {
        onError({
          severity: "error",
          summary: "Fetch users",
          detail: "Failed to fetch Users",
          sticky: true,
        });
        setState((prevState) =>
          Object.assign({}, prevState, { loading: false })
        );
      });
  };
  useEffect(() => {
    featchData();
  }, [
    state.lazyParams.first,
    state.lazyParams.page,
    state.lazyParams.rows,
    state.lazyParams.sortField,
    state.lazyParams.sortOrder,
    state.lazyParams.filters,
    rerender,
  ]);
  const onPage = (e) => {
    setState((prevState) =>
      Object.assign({}, prevState, {
        lazyParams: { ...prevState.lazyParams, ...e },
      })
    );
  };
  const onSort = (e) => {
    setState((prevState) =>
      Object.assign({}, prevState, {
        lazyParams: { ...prevState.lazyParams, ...e },
      })
    );
  };
  const onFilter = (e) => {
    setState((prevState) => {
      const lazy = { ...prevState.lazyParams, ...e };
      lazy.first = 0;
      lazy.page = 0;
      prevState.lazyParams = lazy;
      return { ...prevState };
    });
  };
  return (
    <Col sm={12}>
      <DataTable
        ref={dataGridRef}
        value={state.data}
        lazy
        rows={state.lazyParams.rows}
        paginator
        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
        first={state.lazyParams.first}
        totalRecords={state.totalRecords}
        onPage={onPage}
        onSort={onSort}
        sortField={state.lazyParams.sortField}
        sortOrder={state.lazyParams.sortOrder}
        onFilter={onFilter}
        filters={state.lazyParams.filters}
        loading={state.loading}
        rowsPerPageOptions={[10, 20, 50]}
        className="cac-datatable"
      >
        {columns.map((column, idx) => (
          <Column {...column} key={idx}></Column>
        ))}
      </DataTable>
    </Col>
  );
}

function NewUser({ showSlider = false, onHide, onSave, onError, clearPassword, user = {} }) {
  const Role = [
    { label: "ADMIN", value: "ADMIN" },
    { label: "USER", value: "USER" },
  ];
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [visible, setVisible] = useState(null);
  const [role, setRole] = useState(null);
  const [diabledPassword, setDisablePassword] = useState(false);

  const useStyles = createUseStyles({
    'password-container': {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'baseline',
      '& .p-password ': {
        flex: '1 1',
        '& .p-inputtext ': {
          width: '100%'
        }
      }
    }
  });

  const classes = useStyles();

  const header = <h6>Password</h6>;
  const footer = (
    <>
      <Divider />
      <p className="p-mt-2">Requirements</p>
      <ul className="p-pl-2 p-ml-2 p-mt-0">
        <li>{`At least one lowercase [a-z]`}</li>
        <li>{`At least one uppercase [A-Z]`}</li>
        <li>At least one numeric [0-9]</li>
        <li>At least one special character like $ # @ !</li>
        <li>Range between 8 - 20 characters</li>
      </ul>
    </>
  );

  const save = () => {
    if (isValid()) {
      const { userId } = user;
      const { clientId } = selectedClient;
      if (userId) {
        const tempData = { name, email, role, clientId };
        if (!diabledPassword) {
          tempData.password = password;
        }
        onSave(userId, tempData);
      } else {
        onSave(userId, {
          ...user, ...{
            name, password, email, role,
            isFirstTimeLoggedIn: 1,
            clientId
          },
        });
      }
    }
  };

  const isValid = () => {
    const emptyObj = [
      { label: "Name", value: name },
      { label: "Password", value: password },
      { label: "Email", value: email },
    ].find((item) => {
      return !item.value.trim().length;
    });
    if (emptyObj) {
      onError({
        severity: "error",
        summary: emptyObj.label,
        detail: `${emptyObj.label} cannot be empty`,
        sticky: true,
      });
      return false;
    } else if (!selectedClient.shortName) {
      onError({
        severity: "error",
        summary: 'Client',
        detail: `Please select client to which this User will be created`,
        sticky: true,
      });
      return false;
    } else if (name.trim().length < 4) {
      onError({
        severity: "error",
        summary: "Name",
        detail: "Name should be atleast 4 characters",
        sticky: true,
      });
      return false;
    } else if (!diabledPassword && !new RegExp(CONSTANT.PASSWORD_REGEX).test(password)) {
      onError({
        severity: "error",
        summary: "Password",
        detail:
          "Password doesnt meet the requirement",
        sticky: true,
      });
      return false;
    } else if (!new RegExp(CONSTANT.EMAIL_REGEX).test(email)) {
      onError({
        severity: "error",
        summary: "Email",
        detail: "Please provide valid email",
        sticky: true,
      });
      return false;
    } else if (!role) {
      onError({
        severity: "error",
        summary: "Role",
        detail: "Please select User Role",
        sticky: true,
      });
      return false;
    }
    return true;
  };

  const onSetClient = (selectedClient) => {
    setSelectedClient(selectedClient);
    setVisible(false);
  };

  const editPassword = (e) => {
    e.preventDefault();
    clearPassword();
  }

  const setFormValues = (setStateFn) => {
    return ({ target: { value } }) => {
      eval(setStateFn)(value);
    }
  }

  useEffect(() => {
    let { client = {}, name = '', password = '', email = '', role } = user;
    setName(name);
    setPassword(password);
    setEmail(email);
    setSelectedClient(client);
    setRole(role);
    setDisablePassword(password ? true : false);
    return () => {
      setDisablePassword(false);
    }
  }, [user]);

  return (
    <Sidebar
      visible={showSlider}
      position="right"
      onHide={onHide}
      modal
      showCloseIcon={false}
      className="custom-sidebar"
    >
      <h3 style={{ textAlign: "center" }}>User</h3>

      <Sidebar
        position="right"
        className="custom-sidebar1"
        visible={visible}
        onHide={() => setVisible(false)}
      >
        <ClientList onSelectedRow={onSetClient} selectedClient={selectedClient} />
      </Sidebar>

      <Form.Group className="mb-3" controlId="clientname">
        <Form.Label style={{ display: "block" }}>Client Name</Form.Label>
        <Form.Control
          style={{ display: "inline-block", width: "50%" }}
          placeholder="Select Client"
          value={selectedClient?.shortName}
          readOnly
        />
        <Button icon="pi pi-pencil" onClick={(e) => setVisible(true)} />
      </Form.Group>
      <Form>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Name"
            value={name}
            onChange={setFormValues('setName')}
            maxLength="10"
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={setFormValues('setEmail')}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <div className="p-grid p-nogutter">
            <div className={`p-col-12 ${classes["password-container"]}`}>
              <Password value={password}
                className={`p-inputtext-sm `}
                placeholder="Password"
                feedback={true} toggleMask strongLabel header={header} footer={footer}
                strongRegex={CONSTANT.PASSWORD_REGEX}
                maxLength="20" disabled={diabledPassword}
                onChange={setFormValues('setPassword')} />
              {diabledPassword &&
                <Button icon="pi pi-pencil" className="p-button-success" onClick={editPassword} />}
            </div>
          </div>
        </Form.Group>
        <Form.Group className="mb-3" controlId="ROLE">
          <Form.Label style={{ display: "block" }}>Select Role </Form.Label>
          <Dropdown
            label="Select Role"
            value={role}
            options={Role}
            onChange={(e) => setRole(e.value)}
            placeholder="Role"
          />
        </Form.Group>
      </Form>
      <div style={{ textAlign: "right" }}>
        <Button
          label="Cancel"
          className="p-button-secondary"
          onClick={onHide}
        />
        <Button label="Save" onClick={save} style={{ marginLeft: 10 }} />
      </div>
    </Sidebar>
  );
}

export default function Users() {
  const { addMessage } = useContext(ToasterContext);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showCreateOrUpdatePopup, setShowCreateOrUpdatePopup] = useState(false);
  const [showUserMenuPopup, setShowUserMenuPopup] = useState(false);
  const [rerender, setRerender] = useState(1);
  const [user, setUser] = useState({});

  const deleteUser = (e) => {
    setUser(e);
    setShowDeletePopup(true);
  };
  const updateUser = (e) => {
    setUser(e);
    setShowCreateOrUpdatePopup(true);
  };
  const deleteRecord = () => {
    axios
      .delete(`${ip}user/${user.userId}`)
      .then(() => {
        setShowDeletePopup(false);
        setRerender(Math.random());
        addMessage({
          severity: "success",
          summary: "User",
          detail: `Successfully deleted User : ${user.name}`,
          sticky: true,
        });
      })
      .catch((_) => {
        setShowDeletePopup(false);
        addMessage({
          severity: "error",
          summary: "User",
          detail: `Error deleting User : ${user.name}`,
          sticky: true,
        });
      });
  };
  const createUserInfo = (data) => {
    axios
      .post(`${ip}user`, data)
      .then((res) => {
        setShowCreateOrUpdatePopup(false);
        setRerender(Math.random());
        addMessage({
          severity: "success",
          summary: "User",
          detail: `Successfully created User : ${data.name}`,
          sticky: true,
        });
      })
      .catch(({ response: { data } }) => {
        addMessage({
          severity: "error",
          summary: "User",
          detail: data,
          sticky: true,
        });
      });
  };
  const updateUserInfo = (id, data) => {
    axios
      .put(`${ip}user/${id}`, data)
      .then((res) => {
        setShowCreateOrUpdatePopup(false);
        setRerender(Math.random());
        addMessage({
          severity: "success",
          summary: "User",
          detail: `Successfully updated User : ${data.name}`,
          sticky: true,
        });
      }).catch(({ response: { data } }) => {
        addMessage({
          severity: "error",
          summary: "User",
          detail: data,
          sticky: true,
        });
      });
  };
  const createOrUpdateUser = (id, data) => {
    if (id) {
      updateUserInfo(id, data);
    } else {
      createUserInfo(data);
    }
  };
  const DeleteProductsDialogFooter = () => {
    return (
      <>
        <Button
          label="No"
          icon="pi pi-times"
          className="p-button-text"
          onClick={() => setShowDeletePopup(false)}
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          className="p-button-text"
          onClick={deleteRecord}
        />
      </>
    );
  };
  const createNewUser = () => {
    setUser({ client: { shortName: '' } });
    setShowCreateOrUpdatePopup(true);
  };

  const onUserPermission = (user) => {
    setUser(user);
    setShowUserMenuPopup(true);
  }

  const clearPassword = () => {
    setUser(p => ({ ...p, ...{ password: '' } }));
  }

  return (
    <>
      <Container style={{ marginTop: "3.5rem" }}>
        <Row>
          <Col sm={12} style={{ textAlign: "center" }}>
            <h3 style={{ marginBottom: 0 }}>Users</h3>
          </Col>
          <Col sm={12} style={{ textAlign: "right", marginBottom: 10 }}>
            <Button
              label="Add User"
              icon="pi pi-plus"
              className="p-button-success p-mr-2"
              onClick={createNewUser}
            />
          </Col>
          <UsersGrid
            onDelete={deleteUser}
            onUpdate={updateUser}
            onUserPermission={onUserPermission}
            onError={addMessage}
            rerender={rerender}
          ></UsersGrid>
        </Row>
      </Container>
      <Dialog
        visible={showDeletePopup}
        style={{ width: "450px" }}
        header="Confirm"
        modal
        footer={DeleteProductsDialogFooter}
        onHide={() => {
          setShowDeletePopup(false);
        }}
      >
        <div className="confirmation-content center-align">
          <i
            className="pi pi-exclamation-triangle p-mr-3"
            style={{ fontSize: "2rem" }}
          />
          <span style={{ marginLeft: 10 }}>
            Are you sure you want to delete the user{" "}
            <strong>{user.name}</strong>?
          </span>
        </div>
      </Dialog>
      <MenuTreeSlidebar showSlider={showUserMenuPopup}
        onHide={() => {
          setShowUserMenuPopup(false);
        }}
        onError={addMessage}
        user={user}></MenuTreeSlidebar>
      <NewUser
        showSlider={showCreateOrUpdatePopup}
        onHide={() => {
          setShowCreateOrUpdatePopup(false);
        }}
        user={user}
        onError={addMessage}
        onSave={createOrUpdateUser}
        clearPassword={clearPassword}
      ></NewUser>
    </>
  );
}
