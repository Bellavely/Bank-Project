import { useState } from "react";

import { AuthInput } from "../input";
import { TbLock, TbMail, TbUser, TbPhone } from "react-icons/tb";
import { AuthButton } from "../button";
import styles from "./register.module.css";
import { api } from "../../services";

type User = {
  fullname: string;
  email: string;
  password: string;
  validatePassword: string;
  phone: string;
};

export const Register = () => {
  const [userData, setUserData] = useState({
    fullname: "",
    email: "",
    password: "",
    validatePassword: "",
    phonePrefix: "",
    phoneNum: "",
  });

  const [errors, setErrors] = useState<User>({
    fullname: "",
    email: "",
    password: "",
    validatePassword: "",
    phone: "",
  });

  const onChangeValue = (valueName: string, input: string) => {
    setUserData((prev) => ({ ...prev, [valueName]: input }));
  };

  const validateData = () => {
    const newErrors: User = {
      fullname: "",
      email: "",
      password: "",
      validatePassword: "",
      phone: "",
    };

    if (userData.email.trim() === "" || userData.email.includes("@")) {
      newErrors.email = "מייל לא תקין";
    }
    if (userData.fullname.trim() === "") {
      newErrors.fullname = "שם מלא לא יכול להיות ריק";
    }
    if (userData.password.trim() === "") {
      newErrors.password = "אנא רשום סיסמה";
    }
    if (userData.validatePassword.trim() === "") {
      newErrors.validatePassword = "אנא וודא את הסיסמה שרשמת";
    }
    if (userData.validatePassword !== userData.password) {
      newErrors.validatePassword = `${newErrors.validatePassword} אנא וודא שהסיסמאות דומות `;
    }
    const phoneRestRegex = /^\d{7}$/;
    if (
      userData.phonePrefix.trim() !== "" ||
      userData.phoneNum.trim() !== "" ||
      phoneRestRegex.test(userData.phoneNum)
    ) {
      newErrors.phone = "מספר טלפון לא תקין";
    }

    setErrors(newErrors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateData()) {
      await api.post("/auth/register", {
        email: userData.email,
        password: userData.password,
        validatePassword: userData.validatePassword,
        phone: `${userData.phonePrefix}${userData.phoneNum}`,
        fullname: userData.fullname,
      });
    }
    return;
  };


  return (
    <div className={styles["register-container"]}>
      <div className={styles["register-form"]}>
        <AuthInput
          Icon={TbUser}
          placeholder="שם מלא"
          onChange={(value) => onChangeValue("fullname", value)}
          error={errors.fullname}
        />
        <AuthInput
          Icon={TbMail}
          placeholder="כתובת אימייל"
          onChange={(value) => onChangeValue("email", value)}
          error={errors.email}
        />
        <AuthInput
          Icon={TbLock}
          isPassword
          placeholder="סיסמה"
          onChange={(value) => onChangeValue("password", value)}
          error={errors.password}
        />
        <AuthInput
          isPassword
          Icon={TbLock}
          placeholder="אימות סיסמה"
          onChange={(value) => onChangeValue("validatePassword", value)}
          error={errors.validatePassword}
        />
        <div className={styles["phone-group"]}>
          <div className={styles["select-wrapper"]}>
            <TbPhone className={styles["phone-icon"]} />
            <select
              className={styles["register-select"]}
              onChange={(e) => onChangeValue("phonePrefix", e.target.value)}
            >
              <option value="">050</option>
              <option>052</option>
              <option>053</option>
              <option>054</option>
              <option>055</option>
              <option>058</option>
            </select>
          </div>
          <input
            className={styles["phone-input"]}
            placeholder="מספר טלפון"
            onChange={(e) => onChangeValue("phoneNum", e.target.value)}
          />
        </div>
      </div>
      <AuthButton title="צור חשבון חדש" onClick={() => handleSubmit()} />
    </div>
  );
};

