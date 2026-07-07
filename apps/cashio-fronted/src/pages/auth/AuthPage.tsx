import styles from "./authPage.module.css";
import icon from "../../assets/cashio-icon.png";
import { useState } from "react";
import { Login, Register, LanguageSwitcher } from "../../components";
import { useLanguage } from "../../hooks";

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { translate } = useLanguage();
  return (
    <div className={styles["login-container"]}>
      <div className={styles["top-bar"]}>
        <LanguageSwitcher />
      </div>
      <div className={styles["card"]}>
        <div className={styles["logo"]}>
          <img className={styles["icon-style"]} src={icon} />
          <div className={styles["logo-title"]}>Cashio</div>
          <div className={styles["logo-paragraph"]}>
            {translate("common.logoParagraph")}
          </div>
        </div>
        <div className={styles.switcher}>
          <button
            className={isLogin ? styles.active : ""}
            onClick={() => setIsLogin(true)}
          >
            {translate("common.login")}
          </button>
          <button
            className={!isLogin ? styles.active : ""}
            onClick={() => setIsLogin(false)}
          >
            {translate("common.register")}
          </button>
        </div>
        {isLogin ? <Login /> : <Register />}
      </div>
    </div>
  );
};
