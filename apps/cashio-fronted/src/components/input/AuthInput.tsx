import styles from "./authInput.module.css";
import type { IconType } from "react-icons/lib";

type AuthInputProps = {
  value?: string;
  Icon?: IconType;
  placeholder: string;
  onChange?: (value: string) => void;
  error?: string | undefined;
  isPassword?: boolean;
};

export const AuthInput = ({
  value,
  Icon,
  placeholder,
  onChange,
  error,
  isPassword = false,
}: AuthInputProps) => {
  return (
    <div className={styles["input-container"]}>
      {Icon && <Icon />}
      <input
        value={value}
        type={isPassword ? "password" : ""}
        className={styles["input-style"]}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
      />
      {error && <div className={styles["error-message"]}>{error}</div>}
    </div>
  );
};
