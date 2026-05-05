import styles from "./navbar.module.css";
import icon from "../../assets/cashio-icon.png";
import { TbUser } from "react-icons/tb";

export const Navbar = () => {
  return (
    <div className={styles["nav"]}>
      <img className={styles["icon"]} src={icon} />
      <div className={styles["user-info"]}>
        <TbUser />
        <div>שלום! ישראל ישראלי </div>
      </div>
    </div>
  );
};
