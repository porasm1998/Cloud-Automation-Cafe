import { Chips } from "primereact/chips";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import { ToggleButton } from "primereact/togglebutton";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { Calendar } from "primereact/calendar";
import { ToasterContext } from "../common/Context";
import { InputTextarea } from "primereact/inputtextarea";
import { STANDARD_CONTROL_CATEGORIES } from "../constants/constant";
import lodash from "lodash";
import { useEffect, useState } from "react";
import axios from "axios";
import { useContext } from "react";
import Api from "../../settings.json";


export default function RenderComponent({
  field,
  setFormValues,
  form,
  isInvalid,
}) {
  const { addMessage } = useContext(ToasterContext);
  var DropDownOptions = {};
  //var options = [];
  const [options, setoptions] = useState([]);
  const getDropDownValues = (categoryName) => {
    return axios.get(`${Api.ip}standardControl/${categoryName}`);
  };

  const getAllCategoryDropDownList = async (categories) => {
    const requestMap = categories.map((category) =>
      getDropDownValues(category)
    );
    try {
      const values = await Promise.allSettled(requestMap);
      const valueObject = values.reduce((acc, { value: { data } }, index) => {
        acc[categories[index]] = data.map((i) => ({
          ...i,
          ...{
            originalName: i.name,
            name: `${i.name} || ${i.value}`,
          },
        }));
        return acc;
      }, {});
      DropDownOptions = { ...DropDownOptions, ...valueObject };
      return DropDownOptions;
    } catch (e) {
      addMessage({
        severity: "error",
        summary: "Enterprise Standards & Controls",
        detail: `Error fetching the Enterprise Standards & Controls`,
      });
    }
  };

  useEffect(() => {
    if (field.component == "Dropdown") {
      getAllCategoryDropDownList([field.options]).then((data) => {
        const dropdownVALUE = data?.[`${field.options}`]?.map(val => {
          return { name: val.name, value: val.value }
        })
        setoptions(dropdownVALUE);

      });
    }
  }, [])

  const customOnchange = (field) => {
    return (e) => {
      const { name } = field;
      setFormValues(name)(e);
      if (field.onChange) {
        field.onChange(field, e);
      }
    };
  };

  switch (field.component) {
    case "InputText":
      return (
        <span className="p-float-label">
          <InputText

            type={field.type}
            value={form[field.name] || ""}
            onChange={customOnchange(field)}
            className={`${isInvalid() ? "p-invalid" : ""}`}
            disabled={field.disabled}
          />
          <label htmlFor={field.label}>{field.label}</label>
        </span>
      );
    case "Chips":
      return (
        <Chips
          value={form[field.name] || []}
          onChange={customOnchange(field)}
          className={`${isInvalid() ? "p-invalid" : ""}`}
          placeholder={field.label}
        ></Chips>
      );
    case "InputSwitch":
      return (
        <>
          <h6 className={field.labelClassName}>{field.label}</h6>
          <InputSwitch
            name={field.name}
            checked={form[field.name] || false}
            onChange={customOnchange(field)}
          />
        </>
      );
    case "ToggleButton":
      return (
        <>
          <h6>{field.label}</h6>
          <ToggleButton
            onLabel={field.onLabel}
            offLabel={field.offLabel}
            onIcon={field.onIcon}
            offIcon={field.offIcon}
            checked={form[field.name] || false}
            onChange={customOnchange(field)}
          />
        </>
      );
    case "Dropdown":
      const dropDownProps = lodash.omit(field, [
        "validators",
        "uniqueKey",
        "onChange",
        "options",
      ]);
      return (
        <Dropdown
          value={form[field.name] || ""}
          onChange={customOnchange(field)}
          options={options}
          {...dropDownProps}
          
        />
      );
    case "MultiSelect":
      const multipSelectDropDownProps = lodash.omit(field, [
        "validators",
        "uniqueKey",
        "onChange",
      ]);
      return (
        <MultiSelect
          value={form[field.name] || ""}
          onChange={customOnchange(field)}
          {...multipSelectDropDownProps}
        />
      );
    case "Calendar":
      const calendarProps = lodash.omit(field, [
        "validators",
        "uniqueKey",
        "onChange",
      ]);
      return (
        <>
          <Calendar
            value={form[field.name] || ""}
            onChange={customOnchange(field)}
            {...calendarProps}
          />
        </>
      );
    case "InputTextarea":
      const inputTextAreaProps = lodash.omit(field, [
        "validators",
        "uniqueKey",
        "onChange",
      ]);
      return (
        <>
          <h6 className={field.labelClassName}>{field.label}</h6>
          <InputTextarea
            value={form[field.name] || ""}
            onChange={customOnchange(field)}
            {...inputTextAreaProps}
          />
        </>
      );
    default:
      return null;
  }
}