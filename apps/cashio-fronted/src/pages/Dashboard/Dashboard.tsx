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
        <h2 className={styles["title"]}>היתרה שלך:</h2>
        <div className={styles["balance"]}>₪ {walletData?.balance ?? 0}</div>
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
        {filtered.map((t) => (
          <div key={t._id} className={styles["item"]}>
            <div className={styles["meta"]}>
              <div>{t.status}</div>
              <div>{t.message}</div>
              <div className={styles["date"]}>
                {new Date(t.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className={styles["amount"]}>
              {t.receiverId.email === user?.email ? "+" : "-"} {t.amount}
            </div>
          </div>
        ))}

        {page < totalPages && (
          <button
            className={styles.loadMore}
            onClick={() => setPage((prev) => prev + 1)}
          >
            טען עוד
          </button>
        )}
      </div>

      {!isLoading && filtered.length === 0 && <div>אין תוצאות</div>}
    </div>
  );
};
