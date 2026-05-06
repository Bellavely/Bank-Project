import styles from "./authButton.module.css";

type AuthButtonProps = {
  title: string;
  onClick: () => void;
};
export const AuthButton = ({ title, onClick }: AuthButtonProps) => {
  return (
    <div className={styles["button-container"]} onClick={onClick}>
      {title}
    </div>
  );
};
