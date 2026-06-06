# InvenFlow — Inventory & Order Management System

A full-stack application to manage products, customers, and orders — fully containerized with Docker.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | FastAPI (Python) |
| Database | PostgreSQL 16 |
| Containerization | Docker + Docker Compose |

---

## Local Development (Docker Compose)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git

### Steps

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd inventory-system

# 2. Copy the environment file
cp .env.example .env
# Edit .env and set a strong POSTGRES_PASSWORD

# 3. Start all services
docker compose up --build

# 4. Open in browser
# Frontend: http://localhost:3000
# Backend API docs: http://localhost:8000/docs
```

### Stop the stack
```bash
docker compose down
# To also delete the database volume:
docker compose down -v
```

---

## Project Structure

```
inventory-system/
├── backend/
│   ├── app/
│   │   ├── core/          # Config, database session
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── routers/       # API route handlers
│   │   └── main.py        # FastAPI app entry point
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context (Toast)
│   │   ├── pages/         # Dashboard, Products, Customers, Orders
│   │   └── services/      # API call functions
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── render.yaml            # Backend deploy config (Render)
└── .env.example
```

---

## API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /products | List all products |
| POST | /products | Create product |
| GET | /products/{id} | Get product |
| PUT | /products/{id} | Update product |
| DELETE | /products/{id} | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /customers | List all customers |
| POST | /customers | Create customer |
| GET | /customers/{id} | Get customer |
| DELETE | /customers/{id} | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /orders | List all orders |
| POST | /orders | Create order (auto-deducts stock) |
| GET | /orders/{id} | Get order details |
| DELETE | /orders/{id} | Cancel order (restores stock) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /dashboard | Summary stats + low-stock alerts |

Full interactive docs: `http://localhost:8000/docs`

---

## Deployment

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/inventory-system.git
git push -u origin main
```

### Step 2 — Push Docker Image to Docker Hub

```bash
# Build and tag
docker build -t <your-dockerhub-username>/inventory-backend:latest ./backend

# Login and push
docker login
docker push <your-dockerhub-username>/inventory-backend:latest
```

### Step 3 — Deploy Backend on Render

1. Go to [render.com](https://render.com) → New → Blueprint
2. Connect your GitHub repo
3. Render will auto-detect `render.yaml` and create the backend + PostgreSQL
4. After deploy, copy your backend URL (e.g. `https://inventory-backend.onrender.com`)

**Or manually:**
1. New → Web Service → connect repo
2. Root Directory: `backend`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add env var: `DATABASE_URL` (from Render's free PostgreSQL)

### Step 4 — Deploy Frontend on Vercel

```bash
# Install Vercel CLI
npm i -g vercel

cd frontend
vercel

# When prompted:
# Root directory: frontend
# Framework: Vite
# Build command: npm run build
# Output dir: dist
```

Then add the environment variable in Vercel dashboard:
- `VITE_API_URL` = `https://your-backend.onrender.com`

Trigger a redeploy after setting the env var.

---

## Business Rules Implemented

- ✅ Product SKU must be unique
- ✅ Customer email must be unique  
- ✅ Product quantity cannot be negative
- ✅ Orders rejected if stock is insufficient
- ✅ Stock automatically reduced on order creation
- ✅ Stock restored when order is cancelled/deleted
- ✅ Order total auto-calculated from line items
- ✅ Proper HTTP status codes (201, 204, 400, 404, 409)
- ✅ Full request validation via Pydantic

---

## Submission Checklist

- [ ] GitHub repository URL
- [ ] Docker Hub image URL: `docker.io/<username>/inventory-backend:latest`
- [ ] Live frontend URL (Vercel)
- [ ] Live backend API URL (Render)
