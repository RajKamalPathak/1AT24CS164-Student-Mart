# Student Mart — Complete Deployment & Verification Guide

This project is a full-stack **MERN (MongoDB, Express, React, Node)** e-commerce portal tailored for college students, featuring academic stationery, scientific calculators, engineering lab gear, and dorm essentials.

---

## 1. Quick Local Evaluation (For Teacher / Evaluator)

### Prerequisites:
- **MongoDB**: Installed and running locally (`mongodb://127.0.0.1:27017`)
- **Node.js**: v18+

### Step 1: Start Backend (Port 5000)
```bash
cd backend
npm install
npm run seed     # Seeds 16 student stationery products and demo student account
npm start        # Starts server on http://localhost:5000
```

### Step 2: Start Frontend (Port 5173)
In a separate terminal:
```bash
cd Frontend
npm install
npm run dev      # Starts Vite React on http://localhost:5173
```

### Step 3: Teacher Verification in MongoDB Compass
Open **MongoDB Compass** and connect to:
`mongodb://127.0.0.1:27017`

You will see the database `student_mart` with 4 collections:
1. `products` — 16 academic products (Casio scientific calculators, Classmate notebooks, lab coats, highlighters, USB drives).
2. `users` — Student accounts with hashed passwords (bcrypt), roll numbers, departments, and hostel room addresses.
3. `cards` — Saved credit/debit cards linked to student `user` ObjectId with masked numbers (`•••• •••• •••• 4242`).
4. `orders` — Placed orders with item lists, payment status, and delivery addresses.

### Step 4: Demo Credentials
- **Email**: `student@campus.edu`
- **Password**: `password123`
*(A 1-click "Auto-fill Demo Account" button is also available on the Login screen).*

---

## 2. Cloud Deployment: Render + Aiven + Vercel

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

### Part A: Database on Aiven (or MongoDB Atlas)
1. Sign up / Log in to [Aiven.io](https://aiven.io/).
2. Create a new service -> select **MongoDB**.
3. Choose the free/starter tier and region closest to your users.
4. Once the service is running, copy the **Service URI** (looks like `mongodb+srv://avnadmin:<PASSWORD>@<HOST>/defaultdb?ssl=true`).
5. Replace `defaultdb` with `student_mart` in the connection string.

---

### Part B: Backend Deployment on Render
1. Log in to [Render.com](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Configure the Web Service settings:
   - **Name**: `student-mart-api` (or your preferred name)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. In **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = `<Your Aiven MongoDB URI from Part A>`
   - `JWT_SECRET` = `student_mart_production_jwt_secret_2026`
   - `CLIENT_URL` = `https://<your-vercel-domain>.vercel.app`
6. Click **Create Web Service**.
7. Once deployed, note down your Render service URL (e.g., `https://student-mart-api.onrender.com`).
   - Test it by visiting `https://student-mart-api.onrender.com/api/health`.

---

### Part C: Frontend Deployment on Vercel
1. Log in to [Vercel.com](https://vercel.com/).
2. Click **Add New...** -> **Project** -> Import your GitHub repository.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and select `Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://student-mart-api.onrender.com/api` (Render backend URL + `/api`)
5. Click **Deploy**.
6. Once deployed, copy your Vercel URL (e.g. `https://student-mart.vercel.app`) and ensure it matches the `CLIENT_URL` variable in your Render dashboard.

---

## 3. Key Technical Features Implemented
- **No Navbar**: Persistent human-designed collegiate sidebar storing Home, Products, My Cart, My Orders, Account & Profile, and Credit Cards.
- **Credit Card Section**: Realistic masked card storage (`•••• •••• •••• 4242`), cardholder name, expiry, card type detection, default toggle, stored in MongoDB `cards` collection.
- **Profile & Password Updates**: Students can modify their full name, phone number, hostel address, department, roll number, and securely change their bcrypt-hashed password.
- **Express Middleware**: Custom JWT auth verification (`protect`), 404 handler, global error handler, and request logging.
- **Database Status Indicator**: Live pill in sidebar showing `🟢 MongoDB Active: student_mart` to provide instant proof of database connectivity during teacher evaluation.
