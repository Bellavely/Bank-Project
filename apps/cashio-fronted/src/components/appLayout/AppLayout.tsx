import { Outlet } from "react-router-dom";
import { Navbar } from "../navbar";
import styles from "./appLayout.module.css";

export default function AppLayout() {
  return (
    <div>
      <Navbar />
      <div className={styles["main-content"]}>
        <div className={styles["card"]}>
          <main className={styles['main-content']}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
