import { useState } from "react";
import styles from "./dashboard.module.css";
const mockTransactions = [
  {
    id: 1,
    type: "הפקדה",
    amount: 100,
    from: "משתמש 1",
    date: "18.4.2026",
  },
  {
    id: 2,
    type: "הוצאה",
    amount: 100,
    to: "משתמש 2",
    date: "18.4.2026",
  },
];

export default function Dashboard() {
  const [balance] = useState(20000);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);
  const filtered = mockTransactions.filter((t) =>
    JSON.stringify(t).toLowerCase().includes(search.toLowerCase()),
  );
  const visibleTransactions = filtered.slice(0, visibleCount);

  return (
    <div className={styles["page"]}>
      <div className={styles["card"]}>
        <h2 className={styles["title"]}>היתרה שלך:</h2>
        <div className={styles["balance"]}>₪ {balance.toLocaleString()}</div>
      </div>
      <div className={styles["actions"]}>
        <button className={styles["circleBtn"]}>↑ שלח</button>
      </div>

      <input
        className={styles["search"]}
        placeholder="חפש"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className={styles["list"]}>
        {visibleTransactions.map((t) => (
          <div key={t.id} className={styles["item"]}>
            <div className={styles["amount"]}>
              {t.type === "הפקדה" ? "+" : "-"} {t.amount}
            </div>
            <div className={styles["meta"]}>
              <div>{t.from || t.to}</div>
              <div>{t.type} </div>
              <div className={styles.date}>{t.date}</div>
            </div>
          </div>
        ))}
        {visibleCount < filtered.length && (
          <button
            className={styles["loadMore"]}
            onClick={() => setVisibleCount((prev) => prev + 5)}
          >
            טען עוד
          </button>
        )}
      </div>

      {filtered.length === 0 && <div>אין תוצאות</div>}
    </div>
  );
}
