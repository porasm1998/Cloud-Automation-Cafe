import { useContext, useEffect, useRef, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import settings from "../../../settings.json";
import axios from "axios";
import { ToasterContext } from "../../common/Context";

const { ip } = settings;

function ClientsGrid({ onSelectedRow, onError, rerender, selectedClient }) {
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

  const columns = [
    { selectionMode: "single", headerStyle: { width: "3em" } },
    {
      field: "shortName",
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
      field: "contact",
      header: "Phone No",
      sortable: true,
      filter: true,
      filterPlaceholder: "Search by Phone No",
    },
    {
      field: "address",
      header: "Address",
      sortable: true,
      filter: true,
      filterPlaceholder: "Search by Address",
    },
  ];
  const featchData = () => {
    setState((prevState) => Object.assign({}, prevState, { loading: true }));
    const {
      page,
      rows,
      sortField = "clientId",
      sortOrder = -1,
      filters = {},
    } = state.lazyParams;
    axios
      .get(
        `${ip}client?page=${page}&size=${parseInt(
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
          summary: "Fetch clients",
          detail: "Failed to fetch Clients",
          sticky: true ,
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
  
  const onSelectedClient = ({ value }) => {
    onSelectedRow(value);
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
        selection={selectedClient}
        onSelectionChange={onSelectedClient}
        className="cac-datatable"
      >
        {columns.map((column, idx) => (
          <Column {...column} key={idx}></Column>
        ))}
      </DataTable>
    </Col>
  );
}

export default function ClientList({ onSelectedRow, selectedClient }) {
  const [rerender, setRerender] = useState(1);
  const { addMessage } = useContext(ToasterContext);

  return (
    <>
      <Row>
        <Col sm={12} style={{ textAlign: "center" }}>
          <h3>Clients</h3>
        </Col>
        <Col sm={12} style={{ textAlign: "right" }}></Col>
        <ClientsGrid
          onError={addMessage}
          rerender={rerender}
          onSelectedRow={onSelectedRow}
          selectedClient={selectedClient}
        ></ClientsGrid>
      </Row>
    </>
  );
}
