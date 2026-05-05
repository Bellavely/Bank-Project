import { useState } from "react";
import styles from "./transfer.module.css";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../../services";
import type { SentTransaction } from "../../types/transaction";
import { useNavigate } from "react-router-dom";

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
        <div className={styles.header}>
          <div className={styles.title}>היתרה שלך:</div>
          <div className={styles.balance}>₪ {walletData.balance}</div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>מי</label>
          <input name="id" onChange={handleChange} type="text" />

          <label>כמה</label>
          <input name="amount" onChange={handleChange} type="number" />

          <label>סיבה</label>
          <input name="description" onChange={handleChange} type="text" />

          <button type="submit">שלח</button>
        </form>
      </div>
    </>
  );
};
