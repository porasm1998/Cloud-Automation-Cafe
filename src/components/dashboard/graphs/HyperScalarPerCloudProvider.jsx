import { useEffect, useMemo, useState } from 'react';
import { Card } from 'primereact/card';
import axios from 'axios';
import settings from '../../../settings.json';
import dayjs from 'dayjs';
import ChartContainer from './ChartContainer';
import { getRandomHexaColor } from '../../../util/commonUtils';
import FilterHeader from './FilterHeader';

const { ip } = settings;

export default function HyperScalarPerCloudProvider({ cloudProviders, user, onError, classes }) {

    const [filterFormData, setFilterFormData] = useState(() => {
        const selectedStartDate = dayjs().subtract(1, 'month').toDate();
        const selectedEndDate = new Date();
        const selectedCloudProvider = [];
        const selectedFrequency = 'd';
        const selectedGraphType = 'pie';
        return {
            range: [selectedStartDate, selectedEndDate], selectedFrequency, selectedCloudProvider,
            selectedGraphType
        };
    });
    const [data, setData] = useState();
    const frequencies = useMemo(() => [{ name: 'Daily', value: 'd' }, { name: 'Monthly', value: 'm' }], []);
    const graphTypes = useMemo(() => [{ name: 'Pie', value: 'pie' }, { name: 'Doughnut', value: 'doughnut' }], []);

    const lightTheme = {
        maintainAspectRatio: false,
        aspectRatio: 1,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const { label, raw } = context;
                        const calculatePercenrtage = (input) => {
                            const { dataset: { data } } = context;
                            const sum = data.reduce((acc, value) => {
                                acc += parseInt(value);
                                return acc;
                            }, 0);
                            return Number(((parseInt(input) / sum) * 100)).toFixed(0);
                        }
                        return `${label} : ${raw} (${calculatePercenrtage(raw)}%)`;
                    }
                }
            },
            legend: {
                labels: {
                    color: '#495057'
                }
            }
        }
    };

    const fetchHyperScalarData = ({ range = [],
        selectedFrequency: frequency, selectedCloudProvider: cloudIds, userIds }) => {
        const [startDate, endDate] = range;
        axios.get(`${ip}requestStats/hyperScalarPerCloudProvider`, {
            params: {
                startDate,
                endDate,
                frequency,
                cloudIds,
                userIds
            }
        }).then(({ data }) => {
            convertToPieChartFormat(data);
        }).catch(() => {
            onError({
                severity: 'error', summary: 'Fetch HyperScalar Stats',
                detail: 'Failed to fetch HyperScalar data', sticky: true
            });
        });
    }

    const convertToPieChartFormat = (data) => {
        const labels = Array.from(new Set(data.map(item => item.code)).values());
        const dataSetData = data.map(item => item.count);
        const backgroundColor = data.map(_ => getRandomHexaColor());
        const output = {
            labels, datasets: [{
                data: dataSetData,
                backgroundColor
            }]
        };
        setData(output);
    }

    const onSubmit = (filterData) => {
        fetchStats(filterData);
        setFilterFormData(p => ({ ...p, ...filterData }));
    }

    const fetchStats = (form) => {
        const { userId, role } = user;
        const { range, selectedFrequency, selectedCloudProvider } = form;
        fetchHyperScalarData({
            range,
            selectedFrequency,
            selectedCloudProvider,
            userIds: role === 'ADMIN' ? [] : [userId]
        });
    }


    useEffect(() => {
        fetchStats(filterFormData);
    }, []);

    return (
        <Card className={`${classes["cac-card"]}`}
            title="Requests executed by CloudProviders">
            <div className="card p-d-flex p-jc-center">
                <div className="p-grid p-nogutter">
                    <div className="p-col-12">
                        <FilterHeader frequencies={frequencies} data={filterFormData}
                            graphTypes={graphTypes} showCloudProviderDropDown={true}
                            showResourceTypeDropDown={false} showUsersDropDown={false}
                            cloudProviders={cloudProviders} showFrequencyDropDown={false}
                            cloudProviderType={'multiSelect'}
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