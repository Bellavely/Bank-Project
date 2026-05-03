import { AuthButton, AuthInput } from "../../components";
import styles from "./loginPage.module.css";
import icon from "../../assets/cashio-icon.png";

import { TbLock, TbMail } from "react-icons/tb";

export const LoginPage = () => {
  return (
    <div className={styles["login-container"]}>
      <div className={styles["card"]}>
        <div className={styles["logo"]}>
          <img className={styles["icon-style"]} src={icon} />
          <div className={styles["logo-title"]}>Cashio</div>
          <div className={styles["logo-paragraph"]}>הבנק החכם שלך</div>
        </div>
        <AuthInput Icon={TbMail} placeholder="מייל" />
        <AuthInput Icon={TbLock} placeholder="סיסמה" />
        <AuthButton title="התחבר" />
      </div>
    </div>
  );
};
