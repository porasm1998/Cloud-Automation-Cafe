import { useEffect, useMemo, useState } from 'react';
import { Card } from 'primereact/card';
import axios from 'axios';
import settings from '../../../settings.json';
import dayjs from 'dayjs';
import ChartContainer from './ChartContainer';
import { getRandomHexaColor } from '../../../util/commonUtils';
import FilterHeader from './FilterHeader';

const { ip } = settings;

export default function HyperScalarStats({ cloudProviders, user, onError, classes }) {
    const [filterFormData, setFilterFormData] = useState(() => {
        const selectedStartDate = dayjs().subtract(1, 'month').toDate();
        const selectedEndDate = new Date();
        const selectedCloudProvider = [];
        const selectedFrequency = 'd';
        const selectedGraphType = 'bar';
        return {
            range: [selectedStartDate, selectedEndDate], selectedCloudProvider,
            selectedFrequency, selectedGraphType
        };
    });
    const [data, setData] = useState();
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
        selectedFrequency: frequency, userIds }) => {
        const [startDate, endDate] = range;
        axios.get(`${ip}requestStats/hyperScalar`, {
            params: {
                startDate,
                endDate,
                cloudIds,
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

    const convertToBarChartFormat = (data = []) => {
        const labels = Array.from(new Set(data.map(item => item.date)).values());
        const cloudProviders = Array.from(new Set(data.map(item => item.code)).values());
        const groupHyperScalar = labels.reduce((acc, date) => {
            let filterData = data.filter(item => item.date === date);
            if (!filterData.length) {
                filterData.concat(cloudProviders.map(code => ({ code, count: 0 })));
            } else if (filterData.length !== cloudProviders.length) {
                const codes = cloudProviders.filter(code => filterData.findIndex(i => i.code === code) === -1);
                const filledWithZeros = codes.map(code => ({ code, count: 0 }));
                filterData = [...filterData, ...filledWithZeros];
            }
            filterData.forEach((item) => {
                if (item.code in acc) {
                    acc[item.code].push(item.count);
                } else {
                    acc[item.code] = [item.count];
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
        const { range, selectedCloudProvider, selectedFrequency } = form;
        fetchHyperScalarData({
            range,
            selectedCloudProvider,
            selectedFrequency,
            userIds: role === 'ADMIN' ? [] : [userId]
        });
    }


    useEffect(() => {
        fetchStats(filterFormData);
    }, []);

    return (
        <Card className={`${classes["cac-card"]}`}
            title="Requests executed by Hyperscaler">
            <div className="card p-d-flex p-jc-center">
                <div className="p-grid p-nogutter">
                    <div className="p-col-12">
                        <FilterHeader cloudProviders={cloudProviders}
                            frequencies={frequencies} data={filterFormData}
                            graphTypes={graphTypes} cloudProviderType={'multiSelect'}
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