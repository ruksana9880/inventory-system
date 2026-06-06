import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../services/api";

const empty = { name: "", sku: "", price: "", quantity: "", description: "" };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "add" | "edit"
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const load = () => getProducts().then(setProducts).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setErrors({}); setEditing(null); setModal("form"); };
  const openEdit = (p) => {
    setForm({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity, description: p.description || "" });
    setEditing(p);
    setErrors({});
    setModal("form");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.sku.trim()) e.sku = "SKU is required";
    if (form.price === "" || isNaN(form.price) || Number(form.price) < 0) e.price = "Valid price required";
    if (form.quantity === "" || isNaN(form.quantity) || Number(form.quantity) < 0) e.quantity = "Valid quantity required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), quantity: Number(form.quantity) };
      if (editing) {
        await updateProduct(editing.id, payload);
        addToast("Product updated successfully");
      } else {
        await createProduct(payload);
        addToast("Product created successfully");
      }
      setModal(null);
      load();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      await deleteProduct(p.id);
      addToast("Product deleted");
      load();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  if (loading) return <div className="page-loading">Loading products…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p className="page-subtitle">{products.length} product{products.length !== 1 ? "s" : ""} in inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      <div className="card">
        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <p>No products yet. Add your first product!</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    {p.description && <div className="text-muted text-sm">{p.description}</div>}
                  </td>
                  <td><code>{p.sku}</code></td>
                  <td>₹{p.price.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${p.quantity === 0 ? "badge-danger" : p.quantity <= 10 ? "badge-warning" : "badge-success"}`}>
                      {p.quantity}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-sm btn-outline" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal === "form" && (
        <Modal title={editing ? "Edit Product" : "Add Product"} onClose={() => setModal(null)}>
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input className={`input${errors.name ? " input-error" : ""}`} value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Widget Pro" />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>SKU *</label>
              <input className={`input${errors.sku ? " input-error" : ""}`} value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. WGT-001" />
              {errors.sku && <span className="field-error">{errors.sku}</span>}
            </div>
            <div className="form-group">
              <label>Price (₹) *</label>
              <input type="number" min="0" step="0.01" className={`input${errors.price ? " input-error" : ""}`}
                value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
              {errors.price && <span className="field-error">{errors.price}</span>}
            </div>
            <div className="form-group">
              <label>Quantity *</label>
              <input type="number" min="0" className={`input${errors.quantity ? " input-error" : ""}`}
                value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
              {errors.quantity && <span className="field-error">{errors.quantity}</span>}
            </div>
            <div className="form-group form-full">
              <label>Description</label>
              <textarea className="input" rows={2} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
