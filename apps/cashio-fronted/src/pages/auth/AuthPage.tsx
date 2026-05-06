import styles from "./authPage.module.css";
import icon from "../../assets/cashio-icon.png";
import { useState } from "react";
import { Login } from "../../components/loginComponent";
import { Register } from "../../components/registerCompanent";


export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  return (
    <div className={styles["login-container"]}>
      <div className={styles["card"]}>
        <div className={styles["logo"]}>
          <img className={styles["icon-style"]} src={icon} />
          <div className={styles["logo-title"]}>Cashio</div>
          <div className={styles["logo-paragraph"]}>הבנק החכם שלך</div>
        </div>
        <div className={styles.switcher}>
          <button
            className={isLogin ? styles.active : ""}
            onClick={() => setIsLogin(true)}
          >
            התחבר
          </button>
          <button
            className={!isLogin ? styles.active : ""}
            onClick={() => setIsLogin(false)}
          >
            הרשם
          </button>
        </div>
        {isLogin ? <Login /> : <Register />}
      </div>
    </div>
  );
};
