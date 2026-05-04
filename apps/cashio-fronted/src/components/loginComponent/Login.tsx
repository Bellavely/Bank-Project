import { AuthInput } from "../input";
import { AuthButton } from "../button";
import { TbLock, TbMail } from "react-icons/tb";
import styles from "./login.module.css";

export const Login = () => {
  return (
    <>
      <div className={styles["auth-form"]}>
        <AuthInput Icon={TbMail} placeholder="מייל" />
        <AuthInput Icon={TbLock} placeholder="סיסמה" />
      </div>
      <AuthButton title="התחבר" onClick={() => console.log("clicked")} />
    </>
  );
};
