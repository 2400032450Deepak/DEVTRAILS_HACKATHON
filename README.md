#  DeliverShield AI – Frontend

A production-ready, mobile-first React frontend for an **AI-powered parametric insurance platform** designed for quick-commerce delivery partners.

This project is built as part of a **hackathon**, with a modular architecture where:

*  Frontend is fully developed and functional
*  Backend (Spring Boot) will be integrated by teammates
*  Payment gateway will be added if required

---

##  Project Idea

DeliverShield AI provides **automatic insurance payouts** to delivery partners based on real-world environmental conditions such as:

*  Rainfall
*  Temperature
*  Air Quality (AQI)

 No manual claims
 Fully automated triggers
 Real-time data driven

---

##  Tech Stack

* React (Functional Components + Hooks)
* JavaScript (ES6+)
* Tailwind CSS
* React Router v6+
* Axios

---

##  Run Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Setup environment variables

```bash
copy .env.example .env
```

Update `.env`:

```env
REACT_APP_OPENWEATHER_API_KEY=your_api_key
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_USE_MOCK_API=true
```

### 3. Start application

```bash
npm start
```

---

##  Environment Variables

| Variable                      | Description                          |
| ----------------------------- | ------------------------------------ |
| REACT_APP_OPENWEATHER_API_KEY | API key for weather + AQI + location |
| REACT_APP_API_BASE_URL        | Backend (Spring Boot) base URL       |
| REACT_APP_USE_MOCK_API        | Toggle mock vs real backend          |

---

##  Architecture Highlights

*  Centralized API client with interceptors (`api.js`)
*  Global state using Context API
*  Lazy loading for performance
*  Payment abstraction layer
*  Clean separation of components and pages
*  Global live location system with persistence

---

##  Folder Structure

```text
src/
  components/
  context/
    AppContext.jsx
  hooks/
    useApp.js
  pages/
    AuthPage.jsx
    DashboardPage.jsx
    MonitoringPage.jsx
    PaymentPage.jsx
    PayoutPage.jsx
    PlansPage.jsx
  services/
    api.js
    paymentService.js
  App.js
```

---

## 🔌 API Integration (Frontend Expectations)

The frontend is fully prepared for backend integration.

### Expected Endpoints:

| Method | Endpoint       |
| ------ | -------------- |
| POST   | /login         |
| GET    | /plans         |
| POST   | /activate-plan |
| GET    | /status        |
| GET    | /payouts       |
| POST   | /payment       |

---

## 📦 Expected Backend Response Format

### Login

```json
{
  "token": "jwt-token",
  "user": { "id": 1, "name": "Rider", "contact": "9876543210" }
}
```

### Plans

```json
[
  { "id": 1, "name": "Starter Shield", "premium": 20, "coverage": 1000 }
]
```

### Status (Live Data)

```json
{
  "rain": 20,
  "temp": 33,
  "aqi": 110,
  "label": "Risk"
}
```

### Payouts

```json
[
  { "id": 101, "date": "2026-03-20", "reason": "Heavy Rain Detected", "amount": 300 }
]
```

---

## 💰 Payment Integration (Extensible)

Frontend is ready for:

* Razorpay
* UPI
* Any custom gateway

### Flow:

1. Backend creates payment order
2. Frontend triggers gateway
3. Backend verifies payment
4. Plan activated after success

---

## 🌟 Features Implemented

* 🔐 Login / Register UI
* 📊 Dashboard with real-time environmental data
* 📍 Live location with city detection
* 📦 Insurance plan selection
* 💳 Payment simulation system
* 💰 Payout trigger simulation
* 📜 Payout history tracking
* 📡 Live monitoring page
* 🔄 Global state + persistence
* ⚡ Responsive UI + animations
* 🚨 Error handling + loaders

---

## 🤝 Team Collaboration

This frontend is designed to integrate seamlessly with backend services.

### Backend Team Responsibilities:

* Implement REST APIs
* Handle authentication (JWT)
* Manage payout logic
* Integrate payment gateway
* Connect database

---

## 🧪 Demo Capability

* Simulated payout trigger available
* Mock API mode enabled for testing
* Easy switch to real backend

---

## 🔐 Security Note

* `.env` is not included in repository
* Use `.env.example` as reference
* API keys must be configured locally

---

## 🚀 Future Enhancements

* Auto payout based on real-time thresholds
* AI-based risk prediction
* Map integration
* Push notifications
* Advanced analytics dashboard

---

## 🏆 Hackathon Value

This project demonstrates:

* Real-world problem solving
* Scalable frontend architecture
* API-ready design
* Production-level UI/UX

---

## 📢 Final Note

👉 This is a **frontend-complete system**
👉 Backend + database will be integrated by team members
👉 Designed for **real-world deployment readiness**
