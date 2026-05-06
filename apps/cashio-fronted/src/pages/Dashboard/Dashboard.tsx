import { useState } from "react";
import styles from "./dashboard.module.css";
import { useNavigate } from "react-router-dom";
import { api } from "../../services";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "../../types/transaction";
import { useUser } from "../../hooks/authContext";

type transactionQuery = {
  data: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;

  const { data, isLoading } = useQuery<transactionQuery>({
    queryKey: ["transactions", page],
    queryFn: async () => {
      const res = await api.get(
        `/transactions/all?limit=${limit}&page=${page}`,
      );
      return res.data; //  { data: [], pagination: {} }
    },
  });

  const { data: pendingTransactions } = useQuery<transactionQuery>({
    queryKey: ["transactions", page],
    queryFn: async () => {
      const res = await api.get(
        `/transactions/all?status=ממתין&limit=${limit}&page=${page}`,
      );
      return res.data; //  { data: [], pagination: {} }
    },
  });

  console.log(pendingTransactions);

  const transactions = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 0;

  const { data: walletData } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const res = await api.get("/wallet/myBalance");
      return res.data;
    },
  });

  const filtered = transactions.filter((t) => {
    const q = search.toLowerCase();

    return (
      t.status?.toLowerCase().includes(q) ||
      t.receiverId.name?.toLowerCase().includes(q) ||
      t.senderId.name?.toLowerCase().includes(q) ||
      String(t.amount).includes(q) ||
      t.createdAt?.includes(q)
    );
  });

  return (
    <div className={styles["page"]}>
      <div className={styles["card"]}>
        <h2 className={styles["title"]}>היתרה שלך</h2>
        <div className={styles["balance"]}>₪ {walletData?.balance ?? 0}</div>
        <div className={styles["actions"]}>
          <button
            className={styles["circleBtn"]}
            onClick={() => navigate("/app/send")}
            title="שלח כסף"
          >
            ↑
          </button>
        </div>
      </div>

      <div className={styles["searchWrapper"]}>
        <input
          className={styles["search"]}
          placeholder="חפש עסקאות..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles["list"]}>
        {filtered.map((t) => {
          const isReceived = t.receiverId.email === user?.email;
          return (
            <div key={t._id} className={styles["item"]}>
              <div className={styles["meta"]}>
                <span className={styles["status"]}>{t.status}</span>
                <span className={styles["message"]}>{t.message || "ללא הערה"}</span>
                <span className={styles["date"]}>
                  {new Date(t.createdAt).toLocaleDateString("he-IL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div
                className={`${styles["amount"]} ${
                  isReceived ? styles["positive"] : styles["negative"]
                }`}
              >
                {isReceived ? "+" : "-"} ₪{t.amount}
              </div>
            </div>
          );
        })}

        {page < totalPages && (
          <button
            className={styles.loadMore}
            onClick={() => setPage((prev) => prev + 1)}
          >
            טען עסקאות נוספות
          </button>
        )}
      </div>

      {!isLoading && filtered.length === 0 && (
        <div className={styles["noResults"]}>לא נמצאו עסקאות</div>
      )}
    </div>
  );
};

