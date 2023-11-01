import { Chart } from "primereact/chart";
import React from "react";
import lodash from 'lodash';

const ChartContainer = React.memo(({ data, type, options }) => {
    return (
        <Chart type={type} data={data} options={options} />
    );
}, (preProps, nextProps) => {
    const { data } = preProps;
    const { data: nextData } = nextProps;
    return lodash.isEqual(data, nextData);
});

export default ChartContainer;