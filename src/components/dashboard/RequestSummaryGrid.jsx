import axios from 'axios';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { useEffect, useRef, useState } from 'react';
import settings from '../../settings.json';
import { Button } from 'primereact/button';
import { createUseStyles } from 'react-jss';
import { getUser } from '../../hooks/useFindUser';

const { ip } = settings;

export default function RequestSummaryGrid({ onError, onRowSelected, onShowLogs }) {
    const user = getUser();
    const [gridOption, setGridOption] = useState({
        loading: false,
        lazyParams: {
            first: 0, rows: 10, page: 0,
            filters: user?.role === 'ADMIN' ? {} :
                { userId: { value: user?.userId, matchMode: 'equals' } }
        }
    });

    const [rowData, setRowData] = useState({ totalRecords: 0, data: null });

    const [date, setDate] = useState({ submittedOn: null, completedOn: null });

    const featchData = () => {
        setGridOption((prevState) => Object.assign({}, prevState, { loading: true }));
        const { page, rows, sortField = 'requestId', sortOrder = -1, filters = {} } = gridOption.lazyParams;
        axios.get(`${ip}request?page=${page}&size=${rows}&sortField=${sortField}&sortOrder=${sortOrder}&filters=${JSON.stringify(filters)}`)
            .then(({ data }) => {
                setGridOption((prevState) => Object.assign({}, prevState, { loading: false }));
                setRowData({ data: data.rows, totalRecords: data.count });
            }).catch((e) => {
                onError({ severity: 'error', summary: 'Fetch clients', detail: 'Failed to fetch Clients', sticky: true });
                setGridOption((prevState) => Object.assign({}, prevState, { loading: false }));
            });
    }

    useEffect(() => {
        featchData();
    }, [gridOption.lazyParams.first, gridOption.lazyParams.page,
    gridOption.lazyParams.rows, gridOption.lazyParams.sortField,
    gridOption.lazyParams.sortOrder, gridOption.lazyParams.filters]);

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

    const onDateChange = (column, value) => {
        setDate(prevState => { return { ...prevState, ...{ [column]: value } } });
    }

    return (
        <RequestGrid gridOption={gridOption} rowData={rowData} onPage={onPage}
            onSort={onSort} onFilter={onFilter} onDateChange={onDateChange}
            date={date} onRowSelected={onRowSelected} onShowLogs={onShowLogs}
            onRefresh={featchData}></RequestGrid>
    );
}

function RequestGrid({ gridOption, rowData, onPage, onSort, onFilter, onDateChange, date, onRowSelected, onShowLogs, onRefresh }) {

    const dataTableRef = useRef(null);

    const useStyles = createUseStyles({
        'cac-col': {
            padding: 0
        },
        'button': {
            marginRight: `${(5 / 16)}rem`
        }
    });

    const classes = useStyles();

    const DateFilter = (name) => {
        const onChange = (e) => {
            dataTableRef.current.filter(e.value, name, 'date');
            onDateChange(name, e.value);
        }
        return (
            <DateFilterTemplate rowData={rowData} onChange={onChange}
                value={date[name]}></DateFilterTemplate>
        )
    }

    const DateFilterTemplate = ({ onChange, value }) => {
        const MonthNavigatorTemplate = (e) => {
            return <Dropdown value={e.value} options={e.options} onChange={(event) => e.onChange(event.originalEvent, event.value)} style={{ lineHeight: 1 }} />;
        }

        const YearNavigatorTemplate = (e) => {
            return <Dropdown value={e.value} options={e.options} onChange={(event) => e.onChange(event.originalEvent, event.value)} className="p-ml-2" style={{ lineHeight: 1 }} />;
        }
        return (
            <Calendar id="navigatorstemplate" value={value}
                onChange={onChange} monthNavigator yearNavigator
                yearRange="2010:2030" monthNavigatorTemplate={MonthNavigatorTemplate}
                yearNavigatorTemplate={YearNavigatorTemplate} showIcon dateFormat="yy-mm-dd" />
        );
    }

    const RequestBodyTemplate = (row) => {
        const { requestId } = row;

        const onClick = (e) => {
            e.preventDefault();
            onRowSelected(row);
        }

        return (
            <a href="/#" onClick={onClick}>{requestId}</a>
        );
    }

    const ActionBodyTemplate = (rowData) => {
        const onClick = () => {
            onShowLogs(rowData);
        }
        return (
            <div style={{ textAlign: 'right' }}>
                <Button icon="pi pi-file-o" className="p-button-link p-button-rounded p-button-success p-mr-2" onClick={onClick} />
            </div>
        );
    }

    const columns = [
        { field: 'requestId', header: 'Request Id', body: RequestBodyTemplate, sortable: true, filter: true, filterPlaceholder: 'Search by RequestId' },
        { field: 'user.name', header: 'User Name', sortable: true, filter: true, filterPlaceholder: 'Search by User Name' },
        { field: 'cloud.code', header: 'Cloud Provider', sortable: true, filter: true, filterPlaceholder: 'Search by Cloud Provider' },
        { field: 'useCase.name', header: 'Usecase Name', sortable: true, filter: true, filterPlaceholder: 'Search by Usecase Name' },
        { field: 'status', header: 'Status', sortable: true, filter: true, filterPlaceholder: 'Search by Status' },
        { field: 'submittedOn', header: 'Submitted Date', sortable: true, filter: true, filterPlaceholder: 'Search by Submitted Date', filterElement: DateFilter('submittedOn') },
        { field: 'completedOn', header: 'Completed Date', sortable: true, filter: true, filterPlaceholder: 'Search by Completed Date', filterElement: DateFilter('completedOn') },
        { body: ActionBodyTemplate, className: 'action-fields' }
    ];

    return (
        <div className="p-grid">
            <div className={`p-col-12 p-text-right ${classes['cac-col']}`}>
                <Button label="Reload" icon="pi pi-refresh"
                    className={`p-button-rounded ${classes.button}`}
                    onClick={onRefresh} />
            </div>
            <div className="p-col-12">
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
            </div>
        </div>
    );
}