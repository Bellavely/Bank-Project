import { useMemo } from "react";
import styles from "./statistics.module.css";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services";
import { useUser } from "../../hooks/authContext";
import { useLanguage } from "../../hooks";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { TbTrendingUp, TbTrendingDown } from "react-icons/tb";

export const Statistics = () => {
  const { user } = useUser();
  const { translate } = useLanguage();

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ["transactions", "statistics"],
    queryFn: async () => {
      // Fetch a large number of completed transactions to calculate stats
      const res = await api.get(
        "/transactions/all?limit=100000&page=1&status=COMPLETED",
      );
      if (res.status !== 200) {
        return [];
      }
      return res.data.data || [];
    },
  });

  const stats = useMemo(() => {
    if (!transactionsData || !user) return { chartData: [], totalIncome: 0, totalOutcome: 0 };

    const monthlyStats: Record<
      string,
      { month: string; timestamp: number; incomes: number; outcomes: number }
    > = {};

    let totalIncome = 0;
    let totalOutcome = 0;

    transactionsData.forEach((t: any) => {
      const isIncome = t.receiver?.email === user.email;
      const amount = Number(t.amount);
      const date = new Date(t.createdAt);
      
      // Group by month and year (e.g., "Jan 2026")
      const monthYear = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });

      if (!monthlyStats[monthYear]) {
        monthlyStats[monthYear] = { 
          month: monthYear, 
          timestamp: new Date(date.getFullYear(), date.getMonth(), 1).getTime(),
          incomes: 0, 
          outcomes: 0 
        };
      }

      if (isIncome) {
        monthlyStats[monthYear].incomes += amount;
        totalIncome += amount;
      } else {
        monthlyStats[monthYear].outcomes += amount;
        totalOutcome += amount;
      }
    });

    // Sort by chronological order
    const chartData = Object.values(monthlyStats).sort((a, b) => a.timestamp - b.timestamp);

    return { chartData, totalIncome, totalOutcome };
  }, [transactionsData, user]);

  return (
    <div className={styles["page"]}>
      <div className={styles["header"]}>
        <h2 className={styles["title"]}>{translate("dashboard.statistics") || "Statistics"}</h2>
        <p className={styles["subtitle"]}>
          {translate("dashboard.statisticsSubtitle")}
        </p>
      </div>

      {isLoading ? (
        <div className={styles["loading"]}>{translate("common.loading") || "Loading statistics..."}</div>
      ) : stats.chartData.length > 0 ? (
        <>
          <div className={styles["summary-cards"]}>
            <div className={styles["summary-card"]}>
              <div className={styles["summary-title"]}>
                {translate("dashboard.totalIncome") || "Total Income"}
              </div>
              <div className={`${styles["summary-amount"]} ${styles["positive"]}`}>
                +₪{stats.totalIncome.toFixed(2)}
              </div>
            </div>
            <div className={styles["summary-card"]}>
              <div className={styles["summary-title"]}>
                {translate("dashboard.totalOutcome") || "Total Outcome"}
              </div>
              <div className={`${styles["summary-amount"]} ${styles["negative"]}`}>
                -₪{stats.totalOutcome.toFixed(2)}
              </div>
            </div>
            <div className={styles["summary-card"]}>
              <div className={styles["summary-title"]}>
                {translate("dashboard.netBalance") || "Net Flow"}
              </div>
              <div
                className={`${styles["summary-amount"]} ${
                  stats.totalIncome - stats.totalOutcome >= 0
                    ? styles["positive"]
                    : styles["negative"]
                }`}
              >
                {stats.totalIncome - stats.totalOutcome >= 0 ? "+" : ""}₪
                {(stats.totalIncome - stats.totalOutcome).toFixed(2)}
              </div>
            </div>
          </div>

          <div className={styles["charts-container"]}>
            <div className={styles["chart-card"]}>
              <div className={styles["chart-title"]}>
                <TbTrendingUp color="#22c55e" />
                {translate("dashboard.incomeVsOutcome") || "Income vs Outcome"}
              </div>
              <div className={styles["chart-wrapper"]}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="incomes" name={translate("dashboard.incomes") || "Incomes"} fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    <Bar dataKey="outcomes" name={translate("dashboard.outcomes") || "Outcomes"} fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles["chart-card"]}>
              <div className={styles["chart-title"]}>
                <TbTrendingDown color="#3b82f6" />
                {translate("dashboard.trends") || "Trends"}
              </div>
              <div className={styles["chart-wrapper"]}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="incomes" name={translate("dashboard.incomes") || "Incomes"} stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="outcomes" name={translate("dashboard.outcomes") || "Outcomes"} stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={styles["no-data"]}>
          {translate("dashboard.noTransactionsStats") || "No transaction data available for statistics."}
        </div>
      )}
    </div>
  );
};
