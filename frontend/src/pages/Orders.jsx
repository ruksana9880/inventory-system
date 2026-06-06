import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";
import { getOrders, createOrder, deleteOrder, getCustomers, getProducts } from "../services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "create" | order object
  const [form, setForm] = useState({ customer_id: "", items: [{ product_id: "", quantity: 1 }] });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const load = () =>
    Promise.all([getOrders(), getCustomers(), getProducts()])
      .then(([o, c, p]) => { setOrders(o); setCustomers(c); setProducts(p); })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const addItem = () =>
    setForm((f) => ({ ...f, items: [...f.items, { product_id: "", quantity: 1 }] }));

  const removeItem = (i) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const updateItem = (i, field, val) =>
    setForm((f) => {
      const items = [...f.items];
      items[i] = { ...items[i], [field]: val };
      return { ...f, items };
    });

  const calcTotal = () =>
    form.items.reduce((sum, item) => {
      const prod = products.find((p) => p.id === Number(item.product_id));
      return sum + (prod ? prod.price * Number(item.quantity || 0) : 0);
    }, 0);

  const validate = () => {
    const e = {};
    if (!form.customer_id) e.customer_id = "Select a customer";
    if (form.items.length === 0) e.items = "Add at least one item";
    form.items.forEach((item, i) => {
      if (!item.product_id) e[`item_${i}_product`] = "Select a product";
      if (!item.quantity || item.quantity <= 0) e[`item_${i}_qty`] = "Qty must be > 0";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        customer_id: Number(form.customer_id),
        items: form.items.map((i) => ({ product_id: Number(i.product_id), quantity: Number(i.quantity) })),
      };
      await createOrder(payload);
      addToast("Order created successfully");
      setModal(null);
      setForm({ customer_id: "", items: [{ product_id: "", quantity: 1 }] });
      load();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (o) => {
    if (!confirm(`Cancel order #${o.id}?`)) return;
    try {
      await deleteOrder(o.id);
      addToast("Order cancelled and stock restored");
      load();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const statusBadge = (s) => {
    const map = { pending: "badge-warning", completed: "badge-success", cancelled: "badge-danger" };
    return map[s] || "badge-outline";
  };

  if (loading) return <div className="page-loading">Loading orders…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p className="page-subtitle">{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>
        </div>
        <button className="btn btn-primary"
          onClick={() => { setForm({ customer_id: "", items: [{ product_id: "", quantity: 1 }] }); setErrors({}); setModal("create"); }}>
          + New Order
        </button>
      </div>

      <div className="card">
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◎</div>
            <p>No orders yet. Create your first order!</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><strong>#ORD-{String(o.id).padStart(4, "0")}</strong></td>
                  <td>{o.customer?.full_name}</td>
                  <td>{o.items?.length} item{o.items?.length !== 1 ? "s" : ""}</td>
                  <td><strong>₹{o.total_amount.toFixed(2)}</strong></td>
                  <td><span className={`badge ${statusBadge(o.status)}`}>{o.status}</span></td>
                  <td className="text-muted text-sm">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-sm btn-outline" onClick={() => setModal(o)}>View</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(o)}>Cancel</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Order Modal */}
      {modal === "create" && (
        <Modal title="Create New Order" onClose={() => setModal(null)}>
          <div className="form-grid">
            <div className="form-group form-full">
              <label>Customer *</label>
              <select className={`input${errors.customer_id ? " input-error" : ""}`}
                value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
                <option value="">Select a customer…</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>)}
              </select>
              {errors.customer_id && <span className="field-error">{errors.customer_id}</span>}
            </div>
          </div>

          <div className="order-items-section">
            <div className="order-items-header">
              <label>Order Items *</label>
              <button className="btn btn-sm btn-outline" onClick={addItem}>+ Add Item</button>
            </div>
            {form.items.map((item, i) => {
              const prod = products.find((p) => p.id === Number(item.product_id));
              return (
                <div key={i} className="order-item-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <select className={`input${errors[`item_${i}_product`] ? " input-error" : ""}`}
                      value={item.product_id} onChange={(e) => updateItem(i, "product_id", e.target.value)}>
                      <option value="">Select product…</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity}) — ₹{p.price}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <input type="number" min="1" className={`input${errors[`item_${i}_qty`] ? " input-error" : ""}`}
                      value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)}
                      placeholder="Qty" />
                  </div>
                  <div className="item-subtotal">
                    {prod ? `₹${(prod.price * Number(item.quantity || 0)).toFixed(2)}` : "₹0.00"}
                  </div>
                  {form.items.length > 1 && (
                    <button className="btn btn-sm btn-danger" onClick={() => removeItem(i)}>✕</button>
                  )}
                </div>
              );
            })}
            <div className="order-total">
              <strong>Estimated Total: ₹{calcTotal().toFixed(2)}</strong>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Placing…" : "Place Order"}
            </button>
          </div>
        </Modal>
      )}

      {/* View Order Modal */}
      {modal && modal !== "create" && (
        <Modal title={`Order #ORD-${String(modal.id).padStart(4, "0")}`} onClose={() => setModal(null)}>
          <div className="order-detail">
            <div className="detail-row">
              <span>Customer</span><strong>{modal.customer?.full_name}</strong>
            </div>
            <div className="detail-row">
              <span>Email</span><span>{modal.customer?.email}</span>
            </div>
            <div className="detail-row">
              <span>Status</span>
              <span className={`badge ${statusBadge(modal.status)}`}>{modal.status}</span>
            </div>
            <div className="detail-row">
              <span>Date</span><span>{new Date(modal.created_at).toLocaleString()}</span>
            </div>
          </div>
          <table className="table mt-4">
            <thead>
              <tr><th>Product</th><th>SKU</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              {modal.items?.map((item) => (
                <tr key={item.id}>
                  <td>{item.product?.name}</td>
                  <td><code>{item.product?.sku}</code></td>
                  <td>{item.quantity}</td>
                  <td>₹{item.unit_price.toFixed(2)}</td>
                  <td><strong>₹{(item.unit_price * item.quantity).toFixed(2)}</strong></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}><strong>Total</strong></td>
                <td><strong>₹{modal.total_amount.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
