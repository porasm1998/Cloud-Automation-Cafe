import { Divider } from 'primereact/divider';
import RenderField from "./RenderField";

export default function RenderLayoutForm({ field, index: idx, setFormValues, form, errors, formArrayIndex = '' }) {
    return (
        <div className="p-fluid p-formgrid p-grid cac-form cac-data-driven-form">
            {idx > 0 && <Divider />}
            <div className="p-col-12">
                <h6 className="section-title">{field.label}</h6>
            </div>
            {field?.fields?.map((subField) => {
                return <RenderField key={`${formArrayIndex}${subField.uniqueKey}`} field={subField}
                    parentField={field} setFormValues={setFormValues} form={form}
                    errors={errors} formArrayIndex={formArrayIndex}>
                </RenderField>;
            })}
        </div>
    );
}