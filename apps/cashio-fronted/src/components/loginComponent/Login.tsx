import { AuthInput } from "../input";
import { AuthButton } from "../button";
import { TbLock, TbMail } from "react-icons/tb";
import styles from "./login.module.css";
import { useState } from "react";
import { api } from "../../services";

export const Login = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const validateLogin = () => {};

  const onChangeInput = (key: string, value: string) => {
    setLoginData((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogin = async () => {
    const accessToken = await api.post("/auth/login", {
      email: loginData.email,
      password: loginData.password,
    });
  };

  console.log(loginData);

  return (
    <>
      <div className={styles["auth-form"]}>
        <AuthInput
          Icon={TbMail}
          placeholder="מייל"
          onChange={(value) => onChangeInput("email", value)}
        />
        <AuthInput
          Icon={TbLock}
          placeholder="סיסמה"
          isPassword
          onChange={(value) => onChangeInput("password", value)}
        />
      </div>
      <AuthButton title="התחבר" onClick={handleLogin} />
    </>
  );
};
