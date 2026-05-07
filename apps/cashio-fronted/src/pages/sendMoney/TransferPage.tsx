import { useState } from "react";
import styles from "./transfer.module.css";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../../services";
import type { SentTransaction } from "../../types/transaction";
import { useNavigate } from "react-router-dom";
import { TbArrowRight } from "react-icons/tb";


export const TransferPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", amount: "", description: "" });

  const { data: walletData } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const res = await api.get("/wallet/myBalance");
      return res.data;
    },
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const createTransaction = useMutation<any, Error, SentTransaction>({
    mutationFn: async (data) => {
      const res = await api.post("/transactions", data);
      return res.data;
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createTransaction.mutate({
      receiverEmail: form.email,
      amount: Number(form.amount),
      message: form.description,
    });
    navigate("/app/dashboard");
  };

  return (
    <>
      <div className={styles.card}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate("/app/dashboard")}
        >
          <TbArrowRight />
          חזרה לדשבורד
        </button>

        <div className={styles.header}>
          <div className={styles.title}>היתרה שלך</div>
          <div className={styles.balance}>₪ {walletData?.balance ?? 0}</div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">אימייל הנמען</label>
            <input
              id="email"
              name="email"
              placeholder="example@email.com"
              onChange={handleChange}
              type="email"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="amount">סכום להעברה</label>
            <input
              id="amount"
              name="amount"
              placeholder="0.00"
              onChange={handleChange}
              type="number"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">הערה (אופציונלי)</label>
            <input
              id="description"
              name="description"
              placeholder="על מה התשלום?"
              onChange={handleChange}
              type="text"
            />
          </div>

          <button type="submit" disabled={createTransaction.isPending}>
            {createTransaction.isPending ? "שולח..." : "אשר העברה"}
          </button>
        </form>
      </div>
    </>
  );
};

