import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";
import { getCustomers, createCustomer, deleteCustomer } from "../services/api";

const empty = { full_name: "", email: "", phone: "" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const load = () => getCustomers().then(setCustomers).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await createCustomer(form);
      addToast("Customer added successfully");
      setModal(false);
      setForm(empty);
      load();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c) => {
    if (!confirm(`Delete customer "${c.full_name}"?`)) return;
    try {
      await deleteCustomer(c.id);
      addToast("Customer deleted");
      load();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  if (loading) return <div className="page-loading">Loading customers…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p className="page-subtitle">{customers.length} registered customer{customers.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(empty); setErrors({}); setModal(true); }}>
          + Add Customer
        </button>
      </div>

      <div className="card">
        {customers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◉</div>
            <p>No customers yet. Add your first customer!</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.full_name}</strong></td>
                  <td>{c.email}</td>
                  <td>{c.phone || <span className="text-muted">—</span>}</td>
                  <td className="text-muted text-sm">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title="Add Customer" onClose={() => setModal(false)}>
          <div className="form-grid">
            <div className="form-group form-full">
              <label>Full Name *</label>
              <input className={`input${errors.full_name ? " input-error" : ""}`} value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="e.g. Rahul Sharma" />
              {errors.full_name && <span className="field-error">{errors.full_name}</span>}
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" className={`input${errors.email ? " input-error" : ""}`} value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="rahul@example.com" />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="input" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving…" : "Add Customer"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
