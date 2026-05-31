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
  const [error, setError] = useState({ email: "", password: "" });

  const onChangeInput = (key: string, value: string) => {
    setLoginData((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogin = async () => {
    if (!loginData.email) {
      setError((prev) => ({ ...prev, email: "יש לרשום את המייל" }));
      return;
    }

    if (!loginData.password) {
      setError((prev) => ({ ...prev, password: "יש לרשום את הסיסמה" }));
      return;
    }

    try {
      const res = await api.post("/auth/login", {
        email: loginData.email,
        password: loginData.password,
      });

      const token = res.data;
      localStorage.setItem("token", token);
      window.location.href = "/app/dashboard";
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className={styles["login-container"]}>
      <form className={styles["auth-form"]}>
        <AuthInput
          Icon={TbMail}
          placeholder="כתובת אימייל"
          onChange={(value) => onChangeInput("email", value)}
          error={error.email}
        />
        <AuthInput
          Icon={TbLock}
          placeholder="סיסמה"
          isPassword
          onChange={(value) => onChangeInput("password", value)}
          error={error.password}
        />
      </form>
      <AuthButton title="התחבר למערכת" onClick={handleLogin} />
    </div>
  );
};
