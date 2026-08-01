import { useState, useRef, useEffect } from "react";
import { TbWorld, TbChevronDown } from "react-icons/tb";
import styles from "./languageSwitcher.module.css";
import { useLanguage } from "../../hooks";

export const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { changeLanguage, lang } = useLanguage();
  const [currentLang, setCurrentLang] = useState<string>(lang);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const selectLanguage = (language: "he" | "en") => {
    setCurrentLang(language);
    setIsOpen(false);
  };

  return (
    <div className={styles["lang-switcher-container"]}>
      <div
        ref={menuRef}
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
                selectLanguage("he");
                changeLanguage("he");
              }}
            >
              <span>עברית (HE)</span>
            </button>
            <button
              className={styles["lang-btn"]}
              onClick={(e) => {
                e.stopPropagation();
                selectLanguage("en");
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
