import { useState } from "react";
import { TbWorld, TbChevronDown } from "react-icons/tb";
import styles from "./languageSwitcher.module.css";
import { useLanguage } from "../../hooks";

export const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("EN");
  const { changeLanguage } = useLanguage();

  const toggleMenu = () => setIsOpen(!isOpen);

  const selectLanguage = (lang: string) => {
    setCurrentLang(lang);
    setIsOpen(false);
  };

  return (
    <div className={styles["lang-switcher-container"]}>
      <div
        className={`${styles["lang-switcher"]} ${isOpen ? styles["active"] : ""}`}
        onClick={toggleMenu}
      >
        <div className={styles["lang-info"]}>
          <TbWorld className={styles["world-icon"]} />
          <span className={styles["lang-text"]}>{currentLang}</span>
          <TbChevronDown
            className={`${styles["chevron"]} ${isOpen ? styles["rotate"] : ""}`}
          />
        </div>

        {isOpen && (
          <div className={styles["dropdown-menu"]}>
            <button
              className={styles["lang-btn"]}
              onClick={(e) => {
                e.stopPropagation();
                selectLanguage("HE");
                changeLanguage("he");
              }}
            >
              <span>עברית (HE)</span>
            </button>
            <button
              className={styles["lang-btn"]}
              onClick={(e) => {
                e.stopPropagation();
                selectLanguage("EN");
                changeLanguage("en");
              }}
            >
              <span>English (EN)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
