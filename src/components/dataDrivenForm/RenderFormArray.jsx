import RenderLayoutForm from "./RenderLayoutForm";
import lodash from 'lodash';
import { Button } from "primereact/button";
import { useEffect, useState } from "react";

export default function RenderFormArray({ field, setFormValues, form, errors }) {

    const [defaultArray, setDefaultArray] = useState([]);

    const getForm = (form, index) => {
        return ((form[field.name] || [])[index] || {});
    }

    const getError = (errors, index) => {
        return ((errors[field.name] || [])[index] || {});
    }

    const setFromArrayValues = (index) => {
        return (name) => {
            return ({ target: { value } }) => {
                const clonedFormArray = lodash.cloneDeep(form[field.name] || defaultArray);
                clonedFormArray[index] = { ...(clonedFormArray[index] || {}), ...{ [name]: value } };
                setFormValues(field.name)({ target: { value: clonedFormArray } });
            }
        };
    }

    const addArrayItems = () => {
        const clonedFormArray = lodash.cloneDeep(form[field.name] || []);
        clonedFormArray.push({});
        setFormValues(field.name)({ target: { value: clonedFormArray } });
    }

    const removeArrayItems = (index) => {
        return () => {
            const clonedFormArray = lodash.cloneDeep(form[field.name]);
            const clonedDefaultArray = lodash.cloneDeep(defaultArray);
            clonedFormArray.splice(index, 1);
            clonedDefaultArray.splice(index, 1);
            setDefaultArray(clonedDefaultArray);
            setFormValues(field.name)({ target: { value: clonedFormArray } });
        }
    }

    useEffect(() => {
        if ('min' in field) {
            if (isNaN(field.min)) {
                throw new TypeError('Invalid min value');
            } else {
                if ((form[field.name] || []).length < parseInt(field.min)) {
                    setDefaultArray(Array(parseInt(field.min)).fill(0).map(() => {
                        return {};
                    }));
                }
            }
        }
    }, []);

    return (
        <>
            <div className="p-grid cac-data-driven-form-array mt-2">
                <div className="p-col-12">
                    <h5 className={`form-array-heading ${field.className}`}>{field.label}</h5>
                    <Button label="Add"
                        className="p-button-text cac-from-array-button"
                        onClick={addArrayItems}
                        disabled={'max' in field ? (form[field.name] || defaultArray).length >= field.max : false} />
                </div>
                <div className="p-col-12">
                    {
                        (form[field.name] || defaultArray).map((_, index) => (
                            <>
                                {
                                    field.fields.map((item, idx) => (
                                        <RenderLayoutForm field={item}
                                            key={`${index}${item.uniqueKey}`}
                                            index={idx}
                                            setFormValues={setFromArrayValues(index)}
                                            form={getForm(form, index)}
                                            errors={getError(errors, index)}
                                            formArrayIndex={index}
                                        />
                                    ))
                                }
                                <div className="p-col-12">
                                    <Button label="Remove"
                                        className="p-button-text cac-from-array-button"
                                        onClick={removeArrayItems(index)}
                                        disabled={'min' in field ? (form[field.name] || defaultArray).length <= field.min : false} />
                                </div>
                            </>
                        ))
                    }
                </div>
            </div>
        </>
    );
}