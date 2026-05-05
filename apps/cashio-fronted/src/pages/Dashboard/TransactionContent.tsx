import type { Transaction } from "../../types/transaction";
import styles from "./dashboard.module.css";
type TransactionContentProps = {
  transaction: Transaction;
};

export const TransactionContent = ({
  transaction,
}: TransactionContentProps) => {
    
  return (
    <div>
      <div key={transaction._id} className={styles.item}>
        <div className={styles.amount}>
          {transaction. === "deposit" ? "+" : "-"} {t.amount}
        </div>

        <div className={styles.meta}>
          <div>{t.from || t.to}</div>
          <div>{t.type}</div>
          <div className={styles.date}>{t.createdAt}</div>
        </div>
      </div>
    </div>
  );
};
