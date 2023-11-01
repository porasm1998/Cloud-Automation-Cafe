import { useEffect, useMemo, useState } from 'react';
import { Card } from 'primereact/card';
import axios from 'axios';
import settings from '../../../settings.json';
import dayjs from 'dayjs';
import ChartContainer from './ChartContainer';
import { getRandomHexaColor } from '../../../util/commonUtils';
import FilterHeader from './FilterHeader';

const { ip } = settings;

export default function HyperScalarAndResourceType({ cloudProviders, user, onError, classes }) {
    const [filterFormData, setFilterFormData] = useState(() => {
        const selectedStartDate = dayjs().subtract(1, 'month').toDate();
        const selectedEndDate = new Date();
        const selectedCloudProvider = 1;
        const selectedFrequency = 'd';
        const selectedResourceTypes = [];
        const selectedGraphType = 'bar';
        return {
            range: [selectedStartDate, selectedEndDate], selectedCloudProvider,
            selectedFrequency, selectedGraphType
        };
    });
    const [data, setData] = useState();
    const [resourceTypes, setResouceTypes] = useState([]);
    const frequencies = useMemo(() => [{ name: 'Daily', value: 'd' }, { name: 'Monthly', value: 'm' }], []);
    const graphTypes = useMemo(() => [{ name: 'Bar', value: 'bar' }, { name: 'Line', value: 'line' }], []);

    const lightTheme = {
        maintainAspectRatio: false,
        aspectRatio: .8,
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

    const fetchHyperScalarData = ({ range = [], selectedCloudProvider: cloudIds,
        selectedFrequency: frequency, selectedResourceTypes: resourceTypes, userId }) => {
        const [startDate, endDate] = range;
        axios.get(`${ip}requestStats/hyperScalarAndResourceType`, {
            params: {
                startDate,
                endDate,
                cloudIds: [cloudIds],
                frequency,
                resourceTypes,
                userId
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

    const fetchResourceTypes = () => {
        axios.get(`${ip}requestDetail/resourceTypes/all`).then(({ data }) => {
            setResouceTypes(data.map(item => ({ name: item.resourceType, value: item.resourceType })));
        }).catch(() => {
            onError({
                severity: 'error', summary: 'Fetch ResourceTypes',
                detail: 'Failed to fetch Rsource Types', sticky: true
            });
        });
    }

    const convertToBarChartFormat = (data = []) => {
        const labels = Array.from(new Set(data.map(item => item.date)).values());
        const resourceTypesData = Array.from(new Set(data.map(item => item.resourceType)).values());
        const groupHyperScalar = labels.reduce((acc, date) => {
            let filterData = data.filter(item => item.date === date);
            if (!filterData.length) {
                filterData.concat(resourceTypesData.map(resourceType => ({ resourceType, count: 0 })));
            } else if (filterData.length !== resourceTypesData.length) {
                const missingResourceTypes = resourceTypesData.filter(resourceType => filterData.findIndex(i => i.resourceType === resourceType) === -1);
                const filledWithZeros = missingResourceTypes.map(resourceType => ({ resourceType, count: 0 }));
                filterData = [...filterData, ...filledWithZeros];
            }
            filterData.forEach((item) => {
                if (item.resourceType in acc) {
                    acc[item.resourceType].push(item.count);
                } else {
                    acc[item.resourceType] = [item.count];
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
        const { userId, role } = user;
        const { range, selectedCloudProvider, selectedFrequency, selectedResourceTypes } = form;
        fetchHyperScalarData({
            range,
            selectedCloudProvider,
            selectedFrequency,
            selectedResourceTypes,
            userIds: role === 'ADMIN' ? [] : [userId]
        });
    }


    useEffect(() => {
        fetchStats(filterFormData);
        fetchResourceTypes();
    }, []);

    return (
        <Card className={`${classes["cac-card"]}`}
            title="Requests executed by Hyperscaler & Resource Category">
            <div className="card p-d-flex p-jc-center">
                <div className="p-grid p-nogutter">
                    <div className="p-col-12">
                        <FilterHeader cloudProviders={cloudProviders}
                            frequencies={frequencies} data={filterFormData}
                            graphTypes={graphTypes} resourceTypes={resourceTypes}
                            showResourceTypeDropDown
                            onSubmit={onSubmit} />
                    </div>
                    <div className="p-col-12">
                        <ChartContainer type={filterFormData.selectedGraphType}
                            data={data} options={lightTheme} />
                    </div>
                </div>
            </div>
        </Card>
    );
}