import icon from "../../assets/cashio-icon.png";
import { useState } from "react";
import { TbUser, TbLogout, TbChevronDown } from "react-icons/tb";
import { useUser } from "../../hooks/authContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../services";
import { LanguageSwitcher } from "../languageSwitcher";
import styles from "./navbar.module.css";
import { useLanguage } from "../../hooks";

export const Navbar = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logOutMutation = useMutation({
    onMutate: () => api.delete("/auth/logout"),
  });
  const {translate} = useLanguage();

  const handleLogout = async () => {
    await logOutMutation.mutate();
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className={styles["nav"]}>
      <div className={styles["brand"]} onClick={() => navigate("/app/dashboard")} style={{cursor: "pointer"}}>
        <img className={styles["icon"]} src={icon} alt="Cashio" />
        <span className={styles["brand-name"]}>Cashio</span>
      </div>

      <div className={styles["nav-links"]}>
        <Link 
          to="/app/dashboard" 
          className={`${styles["nav-link"]} ${location.pathname === "/app/dashboard" ? styles["active"] : ""}`}
        >
          {translate("dashboard.title") || "Dashboard"}
        </Link>
        <Link 
          to="/app/statistics" 
          className={`${styles["nav-link"]} ${location.pathname === "/app/statistics" ? styles["active"] : ""}`}
        >
          {translate("dashboard.statistics") || "Statistics"}
        </Link>
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
              <span className={styles["greeting"]}>{translate("common.Hello")},</span>
              <span className={styles["user-name"]}>
                {user?.fullName || translate("common.guest")}
              </span>
            </div>
            <TbChevronDown
              className={`${styles["chevron"]} ${isMenuOpen ? styles["rotate"] : ""}`}
            />
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
                <span>{translate("common.logout")}</span>
              </button>
            </div>
          )}
        </div>
        <LanguageSwitcher />
      </div>
    </div>
  );
};
