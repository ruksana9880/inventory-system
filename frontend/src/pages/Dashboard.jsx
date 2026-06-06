import { useState, useEffect } from "react";
import { getDashboard } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-subtitle">Overview of your inventory and orders</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-icon">◈</div>
          <div className="stat-value">{stats?.total_products ?? 0}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon">◉</div>
          <div className="stat-value">{stats?.total_customers ?? 0}</div>
          <div className="stat-label">Total Customers</div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-icon">◎</div>
          <div className="stat-value">{stats?.total_orders ?? 0}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card stat-orange">
          <div className="stat-icon">⚠</div>
          <div className="stat-value">{stats?.low_stock_products?.length ?? 0}</div>
          <div className="stat-label">Low Stock Items</div>
        </div>
      </div>

      {stats?.low_stock_products?.length > 0 && (
        <div className="card mt-6">
          <div className="card-header">
            <h2>⚠ Low Stock Alert</h2>
            <span className="badge badge-warning">{stats.low_stock_products.length} items</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {stats.low_stock_products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td><code>{p.sku}</code></td>
                  <td>₹{p.price.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${p.quantity === 0 ? "badge-danger" : "badge-warning"}`}>
                      {p.quantity} left
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
