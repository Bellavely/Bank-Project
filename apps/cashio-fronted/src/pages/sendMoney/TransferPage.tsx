import { useState } from "react";
import styles from "./transfer.module.css";

export default function TransferPage() {
  const [form, setForm] = useState({
    id: "",
    amount: "",
    description: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.title}>היתרה שלך:</div>
          <div className={styles.balance}>₪ 20,000</div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>מי</label>
          <input
            name="id"
            value={form.id}
            onChange={handleChange}
            type="text"
          />

          <label>כמה</label>
          <input
            name="amount"
            value={form.amount}
            onChange={handleChange}
            type="number"
          />

          <label>סיבה</label>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            type="text"
          />

          <button type="submit">שלח</button>
        </form>
      </div>
    </>
  );
}
