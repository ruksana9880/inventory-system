const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "An error occurred");
  return data;
}

// Products
export const getProducts = () => request("/products");
export const getProduct = (id) => request(`/products/${id}`);
export const createProduct = (body) => request("/products", { method: "POST", body: JSON.stringify(body) });
export const updateProduct = (id, body) => request(`/products/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteProduct = (id) => request(`/products/${id}`, { method: "DELETE" });

// Customers
export const getCustomers = () => request("/customers");
export const getCustomer = (id) => request(`/customers/${id}`);
export const createCustomer = (body) => request("/customers", { method: "POST", body: JSON.stringify(body) });
export const deleteCustomer = (id) => request(`/customers/${id}`, { method: "DELETE" });

// Orders
export const getOrders = () => request("/orders");
export const getOrder = (id) => request(`/orders/${id}`);
export const createOrder = (body) => request("/orders", { method: "POST", body: JSON.stringify(body) });
export const deleteOrder = (id) => request(`/orders/${id}`, { method: "DELETE" });

// Dashboard
export const getDashboard = () => request("/dashboard");
