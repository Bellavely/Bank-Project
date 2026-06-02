import { Outlet } from "react-router-dom";
import { Navbar } from "../navbar";
import { BankingAiAssistant } from "../BankingAiAssistant";
import styles from "./appLayout.module.css";

export default function AppLayout() {
  return (
    <div className={styles["layout"]}>
      <Navbar />
      <main className={styles["main-content"]}>
        <div className={styles["container"]}>
          <Outlet />
        </div>
      </main>
      <BankingAiAssistant />
    </div>
  );
}

