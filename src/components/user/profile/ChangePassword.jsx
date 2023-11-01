import axios from "axios";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { Divider } from 'primereact/divider';
import { useState } from "react";
import { createUseStyles } from "react-jss";
import settings from "../../../settings.json";
import { CONSTANT } from "../../constants/constant";
import { getUser } from "../../../hooks/useFindUser";

const { ip } = settings;

export default function ChangePassword({ onError }) {

  const [currentPassword, setCurrentPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const user = getUser()


  const useStyles = createUseStyles({
    'container': {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '30%'
    },
    'change-password': {
      marginTop: `${10 / 16}rem`
    }
  });

  const classes = useStyles();

  const setPasswordValues = (stateFn) => {
    return ({ target: { value } }) => {
      eval(stateFn)(value);
    }
  }

  const onChangePassword = () => {
    if (validate()) {
      const { userId } = user;
      const data = { currentPassword, confirmPassword };
      axios.put(`${ip}user/changepwd/${userId}`, data).then(() => {
        setCurrentPassword('');
        setConfirmPassword('');
        onError({
          severity: 'success', summary: 'Change Password',
          detail: 'Successfully changed the Password', sticky: true
        });
      }).catch(({ response: { data } }) => {
        onError({
          severity: 'error', summary: 'Change Password',
          detail: data, sticky: true
        });
      });
    }
  }

  const validate = () => {
    if (!currentPassword.trim().length) {
      onError({
        severity: 'error', summary: 'Current Password',
        detail: 'Current Password is empty', sticky: true
      });
      return false;
    } else if (!confirmPassword.trim().length) {
      onError({
        severity: 'error', summary: 'Confirm Password',
        detail: 'Confirm Password is empty', sticky: true
      });
      return false;
    } else if (!new RegExp(CONSTANT.PASSWORD_REGEX).test(confirmPassword)) {
      onError({
        severity: 'error', summary: 'Confirm Password',
        detail: `Confirm Password doesn't meet the requirement`, sticky: true
      });
      return false;
    }
    return true;
  }

  const header = <h6>Confirm password</h6>;
  const footer = (
    <>
      <Divider />
      <p className="p-mt-2">Requirements</p>
      <ul className="p-pl-2 p-ml-2 p-mt-0">
        <li>At least one lowercase [a-z]</li>
        <li>At least one uppercase [A-Z]</li>
        <li>At least one numeric [0-9]</li>
        <li>At least one special character like $ # @ !</li>
        <li>Range between 8 - 20 characters</li>
      </ul>
    </>
  );

  return (
    <div className={`p-fluid p-formgrid p-grid cac-form ${classes.container}`}>
      <div className="p-field p-col-12 p-md-12">
        <label>Current Password</label>
        <Password value={currentPassword} className="p-inputtext-sm"
          onChange={setPasswordValues('setCurrentPassword')} placeholder="Current Password"
          feedback={false} toggleMask />
      </div>
      <div className="p-field p-col-12 p-md-12">
        <label>Confirm Password</label>
        <Password value={confirmPassword} className="p-inputtext-sm"
          onChange={setPasswordValues('setConfirmPassword')} placeholder="Confirm Password"
          feedback={true} toggleMask strongLabel header={header} footer={footer}
          strongRegex={CONSTANT.PASSWORD_REGEX}
          maxLength="20" />
      </div>
      <div className={`p-col-12 ${classes["change-password"]}`}>
        <Button label="Change my Password" className="p-button-success"
          onClick={onChangePassword} />
      </div>
    </div>
  );
}