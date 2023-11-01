import lodash from 'lodash';
import RenderLayoutForm from './RenderLayoutForm';

export default function RenderSubForm({ field, setFormValues, form, errors }) {

    const getForm = (form) => {
        return (form[field.name] || {});
    }

    const getError = (errors) => {
        return (errors[field.name] || {});
    }

    const setSubFromValues = (field) => {
        return (name) => {
            return ({ target: { value } }) => {
                let clonedSubForm = lodash.cloneDeep(form[field.name]);
                clonedSubForm = { ...(clonedSubForm || {}), ...{ [name]: value } };
                setFormValues(field.name)({ target: { value: clonedSubForm } });
            }
        };
    }

    return (
        <>
            <div className="p-grid cac-data-driven-sub-form">
                <div className="p-col-12">
                    <h5 className={`sub-form-heading ${field.className}`}>{field.label}</h5>
                </div>
                <div className="p-col-12">
                    {
                        field.fields.map((item, idx) => (
                            <RenderLayoutForm field={item}
                                key={`${item.uniqueKey}`}
                                index={idx}
                                setFormValues={setSubFromValues(field)}
                                form={getForm(form)}
                                errors={getError(errors)}
                            />
                        ))
                    }
                </div>
            </div>
        </>
    );
}