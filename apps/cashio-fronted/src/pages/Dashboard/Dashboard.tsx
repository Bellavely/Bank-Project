import { useState } from "react";
import styles from "./dashboard.module.css";
import { useNavigate } from "react-router-dom";
import { api } from "../../services";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(5);
  const fetchTransactions = async () => {
    const res = await api.get(
      `/transactions/all?limit=10&page=${visibleCount}`,
    );
    return res.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", visibleCount],
    queryFn: () => fetchTransactions(),
  });

  //   const { data: walletData, isLoading: loadingWalletData } = useQuery({
  //     queryKey: ["wallet"],
  //     queryFn: async () => {
  //       const balance = await api.get("/wallet/myBalance");
  //       return balance.data;
  //     },
  //   });

  const [balance] = useState(20000);
  const [search, setSearch] = useState("");
  const filtered = (data ?? []).filter((t) => {
    const q = search.toLowerCase();

    return (
      t.type.toLowerCase().includes(q) ||
      (t.from && t.from.toLowerCase().includes(q)) ||
      (t.to && t.to.toLowerCase().includes(q)) ||
      String(t.amount).includes(q) ||
      t.date.includes(q)
    );
  });
  const visibleTransactions = filtered?.slice(0, visibleCount);

  //   if (isLoading) {
  //     return <div>loading</div>;
  //   }

  return (
    <div className={styles["page"]}>
      <div className={styles["card"]}>
        <h2 className={styles["title"]}>היתרה שלך:</h2>
        <div className={styles["balance"]}>₪ {balance}</div>
      </div>
      <div className={styles["actions"]}>
        <button
          className={styles["circleBtn"]}
          onClick={() => navigate("/app/send")}
        >
          ↑ שלח
        </button>
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
