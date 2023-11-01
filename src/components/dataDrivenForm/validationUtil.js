export const validations = (fields, form) => {
    const errors = {};
    fields.forEach(item => {
        if (item.component === 'FORM_ARRAY') {
            validateFormArrayFields(item, form, errors);
        } else if (item.component === 'SUB_FORM') {
            validateSubFormFields(item, form, errors);
        } else {
            validateFields(item.fields, form, errors);
        }
    });
    return errors;
}

const validateSubFormFields = (field, form, errors) => {
    errors[field.name] = validations(field.fields, (form[field.name] || {}));
}

const validateFormArrayFields = (field, form, errors) => {
    errors[field.name] = (form[field.name] || []).map(formData => {
        return validations(field.fields, formData);
    });
}

const validateFields = (fields, form, errors) => {
    fields.forEach(item => {
        validateField(item, form, errors);
    });
}

const validateField = (field, form, errors) => {
    const { validators = [], name, label } = field;
    validators.forEach(validate => {
        const { type } = validate;
        switch (type) {
            case 'required':
                if (validate.value && !(form[name] || '').toString().trim().length) {
                    errors[name] = `${label} is Required`;
                }
                break;
            case 'size':
                if ((form[name] || []).length < validate.min) {
                    errors[name] = `${label} requires atleast ${validate.min} values`;
                }
                break;
            default:
                break;
        }
    });
}

export const isInvalid = (errors) => {
    return Object.entries(errors).findIndex(([key, val]) => {
        if (val.constructor.name === 'Object' || val.constructor.name === 'Array') {
            return isInvalid(val);
        } else {
            return true;
        }
    }) !== -1;
}

export const getColumnsByLayoutComponent = (field) => {
    const { component } = field;
    switch (component) {
        case 'two-column':
            return 'p-col-6';
        case 'three-column':
            return 'p-col-4';
        case 'four-column':
            return 'p-col-3';
        case 'six-column':
            return 'p-col-2';
        case 'one-column':
        default:
            return 'p-col-12';
    }
}