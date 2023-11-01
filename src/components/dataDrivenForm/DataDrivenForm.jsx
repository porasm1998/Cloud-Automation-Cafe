import React, { useEffect, useState } from "react";
import { Button } from 'primereact/button';
import RenderLayoutForm from "./RenderLayoutForm";
import { isInvalid, validations } from "./validationUtil";
import RenderFormArray from "./RenderFormArray";
import RenderSubForm from "./RenderSubForm";
import { v4 as uuidv4 } from 'uuid';
export default function DataDrivenForm({ schema, onSubmit, data, onChange }) {
    const [form, setForm] = useState({});
    const [errors, setErros] = useState({});
    const setFormValues = (field) => {
        return ({ target: { value } }) => {
            if (onChange) {
                onChange(({ ...form, ...{ [field]: value } }));
            }
            else {
                setForm(prevState => {
                    return ({ ...prevState, ...{ [field]: value } });
                });
            }
        }
    }

    const { fields, footer } = schema;
   
    const submitForm = () => {
        const errorsObj = validations(fields, form);
        if (isInvalid(errorsObj)) {
            setErros(errorsObj);
        } else {
            onSubmit(form);
        }
    }

    const resetForm = () => {
        setForm({});
        setErros({});
    }

    useEffect(() => {
        setForm(p => ({ ...p, ...(data || {}) }));
    }, [data]);

    return (
        <>
            {
                fields.map((field, index) => {
                    if (field.name === 'layout' && 'fields' in field) {
                        return <RenderLayoutForm field={field}
                            key={index} index={index}
                            setFormValues={setFormValues} form={form}
                            errors={errors}
                        />;
                    } else if (field.component === 'FORM_ARRAY') {
                        return <RenderFormArray field={field}
                            key={index}
                            setFormValues={setFormValues} form={form}
                            errors={errors}
                        />;
                    } else if (field.component === 'SUB_FORM') {
                        return <RenderSubForm field={field}
                            key={index}
                            setFormValues={setFormValues} form={form}
                            errors={errors} />
                    }
                    else {
                        return null;
                    }
                })
            }
            <Footer footer={footer} onSubmitForm={submitForm}
                onResetForm={resetForm}></Footer>
        </>
    );
}

function Footer({ footer, onSubmitForm, onResetForm }) {
    const { submit, reset } = footer || {};
    const { label: submitButtonLabel, className: submitButtonClassName = '' } = (submit || { label: 'Submit', className: '' });
    const { label: resetButtonLabel, className: resetButtonClassName = '' } = (reset || { label: 'Reset', className: '' });
    const { customComponent: CustomComponent, customProps } = footer;
    return (
        <div className="p-grid p-justify-end cac-data-driven-footer">
            <div className="p-col-12 p-text-right">
                {CustomComponent &&
                    <CustomComponent onSubmitForm={onSubmitForm}
                        onResetForm={onResetForm} {...customProps} />
                }
                {!CustomComponent &&
                    <>
                        <Button label={resetButtonLabel} className={`${resetButtonClassName}`}
                            onClick={onResetForm} />
                        <Button label={submitButtonLabel} className={`${submitButtonClassName}`}
                            onClick={onSubmitForm} />
                    </>
                }
            </div>
        </div>
    )
}
