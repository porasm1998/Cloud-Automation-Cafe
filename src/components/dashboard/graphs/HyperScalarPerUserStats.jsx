import { useEffect, useMemo, useState } from 'react';
import { Card } from 'primereact/card';
import axios from 'axios';
import settings from '../../../settings.json';
import dayjs from 'dayjs';
import ChartContainer from './ChartContainer';
import { getRandomHexaColor } from '../../../util/commonUtils';
import FilterHeader from './FilterHeader';

const { ip } = settings;

export default function HyperScalarPerUserStats({ onError, classes }) {
    const [filterFormData, setFilterFormData] = useState(() => {
        const selectedStartDate = dayjs().subtract(1, 'month').toDate();
        const selectedEndDate = new Date();
        const selectedUsers = [];
        const selectedFrequency = 'd';
        const selectedGraphType = 'bar';
        return {
            range: [selectedStartDate, selectedEndDate], selectedUsers,
            selectedFrequency, selectedGraphType
        };
    });
    const [data, setData] = useState();
    const [usersList, setUsersList] = useState([]);
    const frequencies = useMemo(() => [{ name: 'Daily', value: 'd' }, { name: 'Monthly', value: 'm' }], []);
    const graphTypes = useMemo(() => [{ name: 'Bar', value: 'bar' }, { name: 'Line', value: 'line' }], []);

    const lightTheme = {
        maintainAspectRatio: false,
        aspectRatio: 1,
        plugins: {
            legend: {
                labels: {
                    color: '#495057'
                }
            }
        },
        scales: {
            x: {
                title: {
                    text: 'CompletedOn',
                    display: true
                },
                ticks: {
                    color: '#495057'
                },
                grid: {
                    color: '#ebedef'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Request Count'
                },
                ticks: {
                    color: '#495057'
                },
                grid: {
                    color: '#ebedef'
                }
            }
        }
    };

    const fetchHyperScalarData = ({ range = [],
        selectedFrequency: frequency, selectedUsers: userIds }) => {
        const [startDate, endDate] = range;
        axios.get(`${ip}requestStats/hyperScalarPerUser`, {
            params: {
                startDate,
                endDate,
                frequency,
                userIds
            }
        }).then(({ data }) => {
            convertToBarChartFormat(data);
        }).catch(() => {
            onError({
                severity: 'error', summary: 'Fetch HyperScalar Stats',
                detail: 'Failed to fetch HyperScalar data', sticky: true
            });
        });
    }

    const fetchUsersList = () => {
        axios.get(`${ip}user/find/all`).then(({ data }) => {
            setUsersList(data);
        }).catch(() => {
            onError({
                severity: 'error', summary: 'Fetch UsersList',
                detail: 'Failed to fetch Users List'
            });
        });
    }

    const convertToBarChartFormat = (data = []) => {
        const labels = Array.from(new Set(data.map(item => item.date)).values());
        const usersData = Array.from(new Set(data.map(item => item.name)).values());
        const groupHyperScalar = labels.reduce((acc, date) => {
            let filterData = data.filter(item => item.date === date);
            if (!filterData.length) {
                filterData.concat(usersData.map(name => ({ name, count: 0 })));
            } else if (filterData.length !== usersData.length) {
                const missingUsers = usersData.filter(user => filterData.findIndex(i => i.name === user) === -1);
                const filledWithZeros = missingUsers.map(name => ({ name, count: 0 }));
                filterData = [...filterData, ...filledWithZeros];
            }
            filterData.forEach((item) => {
                if (item.name in acc) {
                    acc[item.name].push(item.count);
                } else {
                    acc[item.name] = [item.count];
                }
            });
            return acc;
        }, {});
        const datasets = Object.keys(groupHyperScalar).map(key => {
            return {
                label: key,
                data: groupHyperScalar[key],
                backgroundColor: getRandomHexaColor()
            };
        });
        setData({ labels, datasets });
    }

    const onSubmit = (filterData) => {
        fetchStats(filterData);
        setFilterFormData(p => ({ ...p, ...filterData }));
    }

    const fetchStats = (form) => {
        const { range, selectedFrequency, selectedUsers } = form;
        fetchHyperScalarData({
            range,
            selectedFrequency,
            selectedUsers
        });
    }


    useEffect(() => {
        fetchStats(filterFormData);
        fetchUsersList();
    }, []);

    return (
        <Card className={`${classes["cac-card"]}`}
            title="Requests executed by Users">
            <div className="card p-d-flex p-jc-center">
                <div className="p-grid p-nogutter">
                    <div className="p-col-12">
                        <FilterHeader frequencies={frequencies} data={filterFormData}
                            graphTypes={graphTypes} showCloudProviderDropDown={false}
                            showResourceTypeDropDown={false} showUsersDropDown={true}
                            usersList={usersList}
                            onSubmit={onSubmit} />
                    </div>
                    <div className="p-col-12" style={{ height: 300 }}>
                        <ChartContainer type={filterFormData.selectedGraphType}
                            data={data} options={lightTheme} />
                    </div>
                </div>
            </div>
        </Card>
    );
}