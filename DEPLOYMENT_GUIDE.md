# Student Mart — Complete Deployment & Verification Guide

This project is a full-stack **MERN (MongoDB, Express, React, Node)** e-commerce portal tailored for college students, featuring two distinct portals:
1. **Student Customer Portal** (`/`, `/products`, `/cart`, `/orders`, `/account`): For students to browse stationery, save credit/debit cards, manage profiles, and place hostel delivery orders.
2. **Admin Operations Portal** (`/admin/login`, `/admin`, `/admin/add-product`, `/admin/products`, `/admin/orders`, `/admin/students`): For store administrators to add, edit, or delete products, track inventory, manage student orders, and view registered accounts.

---

## 1. Quick Local Setup & Verification

### Prerequisites:
- **MongoDB**: Installed and running locally (`mongodb://127.0.0.1:27017`)
- **Node.js**: v18+

### Step 1: Install & Seed (First-Time Setup)
From the project root (`React Lab`):
```bash
npm run install-all   # Installs root, backend, and Frontend dependencies
npm run seed          # Seeds 16 products, demo student, and default admin
```

### Step 2: Run Both Frontend & Backend Together
From the project root (`React Lab`), run a single command:
```bash
npm run dev
```
This launches both simultaneously:
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

### Step 3: Demo Accounts
- **Student Portal (`/login`)**:
  - Email: `student@campus.edu` | Password: `password123`
- **Admin Portal (`/admin/login`)**:
  - Email: `admin@campus.edu` | Password: `admin123`
*(Both login screens have a 1-click Auto-fill button for quick evaluation).*

### Step 4: Teacher Verification in MongoDB Compass
Connect to `mongodb://127.0.0.1:27017` and inspect database **`student_mart`**:
1. `products` — 16+ academic products (newly added products from Admin Portal appear here immediately).
2. `users` — Student and Admin accounts with bcrypt-hashed passwords.
3. `cards` — Saved credit/debit cards linked to student `user` ObjectId.
4. `orders` — Placed orders with delivery addresses and fulfillment status.

---

## 2. Cloud Deployment: Vercel (Frontend) + Render (Backend) + Aiven (MongoDB)

```
  +------------------+         REST API Calls          +--------------------+
  |      Vercel      |  ============================>  |       Render       |
  |  (React Frontend)|  <============================  |  (Node/Express API)|
  +------------------+     CORS & JWT Authorization    +--------------------+
                                                                  |
                                                                  | Mongoose Connection
                                                                  v
                                                       +--------------------+
                                                       |   Aiven MongoDB    |
                                                       |  (Cloud Database)  |
                                                       +--------------------+
```

### Part A: Set Up MongoDB Database on Aiven
1. Log in to [Aiven.io](https://aiven.io/) and create a **MongoDB** service.
2. Wait for the service status to turn **Running**.
3. Copy the **Service URI** from the Aiven Overview tab (looks like `mongodb+srv://avnadmin:<PASSWORD>@<HOST>/defaultdb?authSource=admin&tls=true`).
4. Replace `defaultdb` in the URI with `student_mart`:
   `mongodb+srv://avnadmin:<PASSWORD>@<HOST>/student_mart?authSource=admin&tls=true`
5. Under Aiven's **Allowed IP Addresses**, ensure `0.0.0.0/0` is allowed so Render's dynamic IPs can connect.

---

### Part B: Deploy Backend on Render
1. Push your code to a GitHub repository.
2. Log in to [Render.com](https://render.com/), click **New +** -> **Web Service** (or use the included `render.yaml` Blueprint).
3. Connect your GitHub repository and configure:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add **Environment Variables** in Render:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = `<Your Aiven MongoDB URI from Part A>`
   - `JWT_SECRET` = `<Any long random string>`
   - `CLIENT_URL` = `https://<your-vercel-app>.vercel.app` (update after deploying Vercel)
   - `ADMIN_EMAIL` = `admin@campus.edu`
   - `ADMIN_PASSWORD` = `admin123` (recommended: set a strong password for production)
5. Deploy! On first boot, the backend **automatically seeds** the 16 products, Admin account, and Demo Student account into your Aiven MongoDB database.
6. Verify by visiting `https://<your-render-app>.onrender.com/api/health` — it should report `"status": "online"` and `"database.status": "Connected"`.

---

### Part C: Deploy Frontend on Vercel
1. Log in to [Vercel.com](https://vercel.com/) -> **Add New...** -> **Project**.
2. Import the same GitHub repository.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variable**:
   - `VITE_API_BASE_URL` = `https://<your-render-app>.onrender.com/api`
5. Click **Deploy**!
   - Note: `Frontend/vercel.json` is already configured so React Router URLs (`/products`, `/account`, `/admin`, `/admin/add-product`) work cleanly on direct page load/refresh.
6. Copy your final Vercel URL (e.g. `https://student-mart.vercel.app`) and paste it into `CLIENT_URL` in Render's Environment Variables.
