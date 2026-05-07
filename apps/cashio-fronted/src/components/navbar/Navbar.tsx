import styles from "./navbar.module.css";
import icon from "../../assets/cashio-icon.png";
import { useState } from "react";

import { TbUser, TbLogout, TbChevronDown } from "react-icons/tb";
import { useUser } from "../../hooks/authContext";
import { useNavigate } from "react-router-dom";


export const Navbar = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className={styles["nav"]}>
      <div className={styles["brand"]}>
        <img className={styles["icon"]} src={icon} alt="Cashio" />
        <span className={styles["brand-name"]}>Cashio</span>
      </div>
      
      <div className={styles["user-section-container"]}>
        <div 
          className={`${styles["user-section"]} ${isMenuOpen ? styles["active"] : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className={styles["user-info"]}>
            <div className={styles["avatar"]}>
              <TbUser />
            </div>
            <div className={styles["welcome-text"]}>
              <span className={styles["greeting"]}>שלום,</span>
              <span className={styles["user-name"]}>{user?.fullname || "אורח"}</span>
            </div>
            <TbChevronDown className={`${styles["chevron"]} ${isMenuOpen ? styles["rotate"] : ""}`} />
          </div>

          {isMenuOpen && (
            <div className={styles["dropdown-menu"]}>
              <button 
                className={styles["logout-btn"]} 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
              >
                <TbLogout />
                <span>התנתק מהמערכת</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


