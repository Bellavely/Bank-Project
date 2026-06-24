import { useState } from "react";
import styles from "./dashboard.module.css";
import { useNavigate } from "react-router-dom";
import { api } from "../../services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Transaction } from "../../types/transaction";
import { useUser } from "../../hooks/authContext";
import { TbCheck, TbX } from "react-icons/tb";

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
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"all" | "pending">("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 5;

  const { data, isLoading } = useQuery<transactionQuery>({
    queryKey: ["transactions", activeTab, page],
    queryFn: async () => {
      const statusParam = activeTab === "pending" ? "&status=PENDING" : "";
      const res = await api.get(
        `/transactions/all?limit=${limit}&page=${page}${statusParam}`,
      );
      if (res.status !== 200) {
        return [];
      }
      return res.data;
    },
  });

  const handleTransactionAction = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: "accept" | "reject";
    }) => {
      await api.patch(`/transactions/${id}/${action}`);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.setQueryData<Transaction[]>(["transactions"], (oldData) => {
        if (!oldData) return [];
        return oldData.filter((t) => t.id !== variables.id);
      });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });

  const handleAction = async (id: string, action: "accept" | "reject") => {
    try {
      await handleTransactionAction.mutateAsync({ id, action });
    } catch (err) {
      console.error(`Failed to ${action} transaction:`, err);
    }
  };

  const { data: walletData } = useQuery({
    queryKey: ["wallet"],

    queryFn: async () => {
      const res = await api.get("/wallet/myBalance");
      return res.data;
    },
  });

  const transactions = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 0;

  const handleTabChange = (tab: "all" | "pending") => {
    setActiveTab(tab);
    setPage(1);
  };

  const filtered = transactions.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.status?.toLowerCase().includes(q) ||
      t.receiver.email?.toLowerCase().includes(q) ||
      t.sender.email?.toLowerCase().includes(q) ||
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

      <div className={styles["tabs-container"]}>
        <div
          className={`${styles["tab"]} ${activeTab === "all" ? styles["active"] : ""}`}
          onClick={() => handleTabChange("all")}
        >
          כל העסקאות
        </div>
        <div
          className={`${styles["tab"]} ${activeTab === "pending" ? styles["active"] : ""}`}
          onClick={() => handleTabChange("pending")}
        >
          פעולות ממתינות
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
        {isLoading ? (
          <div className={styles["loading"]}>טוען עסקאות...</div>
        ) : filtered.length > 0 ? (
          <>
            {filtered.map((t) => {
              const isReceived = t.receiver.email === user?.email;
              const isPending = t.status === "PENDING";
              return (
                <div key={t.id} className={styles["item"]}>
                  <div className={styles["item-header"]}>
                    <div className={styles["meta"]}>
                      <span
                        className={`${styles["status-pill"]} ${styles[t.status === "COMPLETED" ? "status-success" : isPending ? "status-pending" : "status-failed"]}`}
                      >
                        {t.status}
                      </span>
                      <span className={styles["message"]}>
                        {t.message || "ללא הערה"}
                      </span>
                      <span className={styles["names"]}>
                        {isReceived
                          ? `מ-  ${t.sender.fullName} (${t.sender.email})`
                          : `ל- ${t.receiver.fullName} (${t.receiver.email}) `}
                      </span>
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

                  {isPending && isReceived && (
                    <div className={styles["item-actions"]}>
                      <button
                        className={`${styles["action-btn"]} ${styles["accept"]}`}
                        onClick={() => handleAction(t.id, "accept")}
                      >
                        <TbCheck />
                        אישור
                      </button>
                      <button
                        className={`${styles["action-btn"]} ${styles["reject"]}`}
                        onClick={() => handleAction(t.id, "reject")}
                      >
                        <TbX />
                        דחייה
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <div className={styles["pagination"]}>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={styles["pageBtn"]}
              >
                הקודם
              </button>
              <span className={styles["pageInfo"]}>
                עמוד {page} מתוך {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className={styles["pageBtn"]}
              >
                הבא
              </button>
            </div>
          </>
        ) : (
          <div className={styles["noResults"]}>לא נמצאו עסקאות</div>
        )}
      </div>
    </div>
  );
};
