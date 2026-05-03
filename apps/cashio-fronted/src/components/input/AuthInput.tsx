import styles from "./authInput.module.css";
import type { IconType } from "react-icons/lib";

type AuthInputProps = {
  Icon?: IconType;
  placeholder: string;
};

export const AuthInput = ({ Icon, placeholder }: AuthInputProps) => {
  return (
    <div className={styles["input-container"]}>
      {Icon && <Icon />}
      <input className={styles["input-style"]} placeholder={placeholder} />
    </div>
  );
};
