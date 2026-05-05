import { AuthInput } from "../input";
import { AuthButton } from "../button";
import { TbLock, TbMail } from "react-icons/tb";
import styles from "./login.module.css";
import { useState } from "react";
import { api } from "../../services";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const onChangeInput = (key: string, value: string) => {
    setLoginData((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        email: loginData.email,
        password: loginData.password,
      });

      const token = res.data;
      localStorage.setItem("token", token);
      navigate("/app/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

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
