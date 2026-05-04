import styles from "./authLogo.module.css";
import icon from "../../assets/cashio-icon.png";

export const AuthLogo = () => {
  return (
    <div className={styles["logo"]}>
      <img className={styles["icon-style"]} src={icon} />
      <div className={styles["logo-title"]}>Cashio</div>
      <div className={styles["logo-paragraph"]}>הבנק החכם שלך</div>
    </div>
  );
};
