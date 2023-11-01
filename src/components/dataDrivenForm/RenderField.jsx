import React from "react";
import RenderComponent from "./RenderComponent";
import { getColumnsByLayoutComponent } from "./validationUtil";

export default function RenderField({ field, parentField, setFormValues, form, errors, formArrayIndex }) {
    const className = getColumnsByLayoutComponent(parentField);

    const isInvalid = () => !!errors[field.name];

    const getFormErrorMessage = () => {
        return isInvalid() && <small className="p-error p-d-block">{errors[field.name]}</small>;
    };

    return (
        <div className={`p-field ${className} ${field.containerClass || ''}`}>
            <RenderComponent field={field} setFormValues={setFormValues} form={form}
                errors={errors} isInvalid={isInvalid} formArrayIndex={formArrayIndex}>
            </RenderComponent>
            {getFormErrorMessage()}
            <ShowHelpMessage field={field}></ShowHelpMessage>
        </div>
    );
}

const ShowHelpMessage = ({ field }) => {
    const { helpMessage = null } = field;
    if (helpMessage?.constructor?.name === 'String') {
        return <small className="p-d-block">{helpMessage}</small>;
    } else if (React.isValidElement(helpMessage)) {
        return helpMessage;
    } else {
        return null;
    }
}