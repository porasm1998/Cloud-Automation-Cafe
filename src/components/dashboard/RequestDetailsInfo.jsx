import axios from 'axios';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Sidebar } from 'primereact/sidebar';
import { useEffect, useMemo, useRef, useState } from 'react';
import settings from '../../settings.json';

const { ip } = settings;

export default function RequestDetailsSlider({ onError, requestId, showSlider, onHide }) {

    return (
        <Sidebar visible={showSlider} position="right" onHide={onHide} modal showCloseIcon={true}
            className="p-sidebar-md">
            <h4>Request Details</h4>
            <RequestDetailsInfo onError={onError} requestId={requestId}></RequestDetailsInfo>
        </Sidebar>
    );
}

function RequestDetailsInfo({ onError, requestId }) {

    const [gridOption, setGridOption] = useState({
        loading: false,
        lazyParams: { first: 0, rows: 10, page: 0 }
    });

    const [rowData, setRowData] = useState({ totalRecords: 0, data: null });

    const featchData = () => {
        setGridOption((prevState) => Object.assign({}, prevState, { loading: true }));
        const { page, rows, sortField = 'requestDetailId', sortOrder = -1, filters = {} } = gridOption.lazyParams;
        axios.get(`${ip}requestDetail/${requestId}?page=${page}&size=${rows}&sortField=${sortField}&sortOrder=${sortOrder}&filters=${JSON.stringify(filters)}`)
            .then(({ data }) => {
                setGridOption((prevState) => Object.assign({}, prevState, { loading: false }));
                setRowData({ data: data.rows, totalRecords: data.count });
            }).catch((e) => {
                onError({ severity: 'error', summary: 'Fetch clients', detail: 'Failed to fetch Clients', sticky: true  });
                setGridOption((prevState) => Object.assign({}, prevState, { loading: false }));
            });
    }

    useEffect(() => {
        featchData();
    }, [gridOption.lazyParams.first, gridOption.lazyParams.page,
    gridOption.lazyParams.rows, gridOption.lazyParams.sortField,
    gridOption.lazyParams.sortOrder, gridOption.lazyParams.filters, requestId]);

    const onPage = (e) => {
        setGridOption((prevState) => Object.assign({},
            prevState,
            {
                lazyParams: { ...prevState.lazyParams, ...e }
            }
        ));
    }

    const onSort = (e) => {
        setGridOption((prevState) => Object.assign({},
            prevState,
            {
                lazyParams: { ...prevState.lazyParams, ...e }
            }
        ));
    }

    const onFilter = (e) => {
        setGridOption((prevState) => {
            const lazy = { ...prevState.lazyParams, ...e };
            lazy.first = 0;
            lazy.page = 0;
            prevState.lazyParams = lazy;
            return { ...prevState };
        });
    }

    return (
        <RequestDetailsGrid gridOption={gridOption} rowData={rowData} onPage={onPage}
            onSort={onSort} onFilter={onFilter}></RequestDetailsGrid>
    );
}

function RequestDetailsGrid({ gridOption, rowData, onPage, onSort, onFilter }) {

    const dataTableRef = useRef(null);

    const columns = useMemo(() => {
        return [
            { field: 'resourceType', header: 'Resource Type', sortable: true, filter: true, filterPlaceholder: 'Search by Resource Name' },
            { field: 'resourceDescription', header: 'Resource Name', sortable: true, filter: true, filterPlaceholder: 'Search by Description' },
            { field: 'resourceCount', header: 'Resource Count', sortable: true, filter: true, filterPlaceholder: 'Search by Resource Count', className: 'number' }
        ];
    }, []);

    return (
        <DataTable ref={dataTableRef} value={rowData.data} lazy rows={gridOption.lazyParams.rows} paginator
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
            first={gridOption.lazyParams.first} totalRecords={rowData.totalRecords}
            onPage={onPage} onSort={onSort} sortField={gridOption.lazyParams.sortField}
            sortOrder={gridOption.lazyParams.sortOrder}
            onFilter={onFilter} filters={gridOption.lazyParams.filters}
            loading={gridOption.loading} rowsPerPageOptions={[10, 20, 50, 100]}
            className="cac-datatable">
            {columns.map((column, idx) => (
                <Column {...column} key={idx}></Column>
            ))}
        </DataTable>
    );
}