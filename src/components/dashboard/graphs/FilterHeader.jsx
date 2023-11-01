import { useEffect, useState } from "react"
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';

export default function FilterHeader({ cloudProviders, frequencies, graphTypes, resourceTypes,
    showResourceTypeDropDown = false, cloudProviderType = 'dropDown', showCloudProviderDropDown = true,
    showUsersDropDown = false, showFrequencyDropDown = true, usersList = [], data, onSubmit }) {

    const [form, setForm] = useState({});

    useEffect(() => {
        setForm(data);
    }, [data]);

    const onChange = (field) => {
        return ({ value }) => {
            setForm(p => ({ ...p, ...{ [field]: value } }));
        }
    }

    const onApply = () => {
        onSubmit(form);
    }

    return (
        <div className="p-fluid p-grid p-formgrid">
            <div className={`p-field ${showResourceTypeDropDown ? 'p-col-6' : 'p-col-8'}`}>
                {(showCloudProviderDropDown && cloudProviderType === 'multiSelect') && <MultiSelect display="chip" optionLabel="code"
                    optionValue="cloudId"
                    value={form.selectedCloudProvider} options={cloudProviders}
                    onChange={onChange('selectedCloudProvider')}
                    placeholder="Select Cloud Provider" />
                }
                {(showCloudProviderDropDown && cloudProviderType === 'dropDown') && <Dropdown optionLabel="code" optionValue="cloudId"
                    value={form.selectedCloudProvider}
                    options={cloudProviders}
                    onChange={onChange('selectedCloudProvider')}
                    placeholder="Select Cloud Provider" />
                }
            </div>
            {showResourceTypeDropDown && <div className="p-field p-col-6">
                <MultiSelect display="chip" optionLabel="name" optionValue="value"
                    value={form.selectedResourceTypes} options={resourceTypes}
                    onChange={onChange('selectedResourceTypes')}
                    placeholder="Select Resource Type" />
            </div>
            }
            {showUsersDropDown && <div className="p-field p-col-8">
                <MultiSelect display="chip" optionLabel="name" optionValue="userId"
                    value={form.selectedUsers} options={usersList}
                    onChange={onChange('selectedUsers')}
                    placeholder="Select User" />
            </div>
            }
            {showFrequencyDropDown && <div className="p-field p-col-4">
                <Dropdown optionLabel="name" optionValue="value" value={form.selectedFrequency}
                    options={frequencies} onChange={onChange('selectedFrequency')}
                    placeholder="Select Frequency" />
            </div>
            }
            <div className="p-field p-col-6">
                <DateFilterTemplate onChange={onChange('range')}
                    value={form.range} />
            </div>
            <div className="p-field p-col-4">
                <Dropdown optionLabel="name" optionValue="value" value={form.selectedGraphType}
                    options={graphTypes} onChange={onChange('selectedGraphType')}
                    placeholder="Select Graph Type" />
            </div>
            <div className="p-field p-col-2">
                <Button label="Apply" onClick={onApply} style={{ height: '100%' }} />
            </div>
        </div>
    )
}


function DateFilterTemplate({ onChange, value }) {
    const MonthNavigatorTemplate = (e) => {
        return <Dropdown value={e.value} options={e.options}
            onChange={(event) => e.onChange(event.originalEvent, event.value)}
            style={{ lineHeight: 1 }} />;
    }

    const YearNavigatorTemplate = (e) => {
        return <Dropdown value={e.value} options={e.options}
            onChange={(event) => e.onChange(event.originalEvent, event.value)} className="p-ml-2"
            style={{ lineHeight: 1 }} />;
    }
    return (
        <Calendar value={value}
            onChange={onChange} monthNavigator={false} yearNavigator={true}
            yearRange="2010:2030" monthNavigatorTemplate={MonthNavigatorTemplate}
            yearNavigatorTemplate={YearNavigatorTemplate} showIcon dateFormat="yy-mm-dd"
            selectionMode="range" placeholder="Range" numberOfMonths={2} />
    );
}