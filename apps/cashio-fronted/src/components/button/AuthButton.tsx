import React from "react";
import styles from "./authButton.module.css";

type AuthButtonProps = {
  title: string;
};

export const AuthButton = ({ title }: AuthButtonProps) => {
  return <div className={styles["button-container"]}>{title}</div>;
};
