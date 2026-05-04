import React from "react";
import { AuthInput } from "../input";
import { TbLock, TbMail, TbUser, TbPhone } from "react-icons/tb";
import { AuthButton } from "../button";
import styles from "./register.module.css";

export const Register = () => {
  return (
    <>
      <div className={styles["register-form"]}>
        <AuthInput Icon={TbUser} placeholder="שם מלא" />
        <AuthInput Icon={TbMail} placeholder="מייל" />
        <AuthInput Icon={TbLock} placeholder="סיסמה" />
        <AuthInput Icon={TbLock} placeholder="וודא סיסמה" />
        <div className={styles["input-container"]}>
          <TbPhone />
          <select className={styles["register-select"]}>
            <option>050</option>
            <option>052</option>
            <option>053</option>
            <option>054</option>
            <option>055</option>
            <option>058</option>
          </select>
          <input className={styles["input-style"]} placeholder={"נייד"} />
        </div>
      </div>
      <AuthButton title="הרשם" onClick={() => console.log("clicked")} />
    </>
  );
};
