# DeliverShield AI Frontend

Production-grade, mobile-first React frontend for an AI-powered parametric insurance platform for quick-commerce delivery partners.

## Tech Stack
- React (functional components + hooks)
- JavaScript (ES6+)
- Tailwind CSS
- React Router v6+
- Axios

## Run Locally
1. Install dependencies:
```bash
npm install
```
2. Create env file:
```bash
copy .env.example .env
```
3. Start app:
```bash
npm start
```

## Environment Variables
- `REACT_APP_API_BASE_URL`: Spring Boot backend base URL
- `REACT_APP_USE_MOCK_API`: `true` for mock mode, `false` for real backend mode

## Architecture Highlights
- Centralized API client with request/response interceptors (`src/services/api.js`)
- Lightweight global state via Context (`src/context/AppContext.jsx`)
- Route-level lazy loading for better initial performance (`src/App.js`)
- Decoupled payment abstraction layer (`src/services/paymentService.js`)
- Reusable UI components and page-level separation

## Folder Structure
```text
src/
  components/
  context/
    AppContext.jsx
  hooks/
    useApp.js
  pages/
  services/
    api.js
    paymentService.js
  App.js
```

## API Methods (Client Abstractions)
In `src/services/api.js`:
- `login()` / `loginUser()` -> `POST /login`
- `getPlans()` -> `GET /plans`
- `activatePlan()` -> `POST /activate-plan`
- `getStatus()` -> `GET /status`
- `getPayouts()` -> `GET /payouts`
- `initiatePayment()` / `createPayment()` -> `POST /payment`

## Payment Integration Readiness
In `src/services/paymentService.js`:
- `initiatePayment(payload)`
- `verifyPayment(payload)`
- `paymentGatewayHandlers.launchRazorpay(...)`
- `paymentGatewayHandlers.launchUpi(...)`

Current flow supports:
- Pending state
- Success state
- Failure state
- Gateway selection UI
- Demo failure simulation for hackathon judging

## Backend Integration (Spring Boot)
1. Set `REACT_APP_USE_MOCK_API=false`.
2. Set `REACT_APP_API_BASE_URL` to your Spring Boot server.
3. Match backend response shapes used by frontend.

Recommended response shapes:
- Login:
```json
{
  "token": "jwt-token",
  "user": { "id": 1, "name": "Rider", "contact": "9876543210" }
}
```
- Plans:
```json
[{ "id": 1, "name": "Starter Shield", "premium": 20, "coverage": 1000 }]
```
- Status:
```json
{ "rain": 20, "temp": 33, "aqi": 110, "label": "Risk" }
```
- Payouts:
```json
[{ "id": 101, "date": "2026-03-20", "reason": "Heavy Rain Detected", "amount": 300 }]
```

## Razorpay / UPI Integration Path
1. Backend creates payment order/intent and returns transaction identifiers.
2. Frontend triggers gateway SDK or UPI deep-link from `paymentService` handlers.
3. Backend verifies gateway signature/status.
4. Frontend calls `activatePlan` only after verified payment.

## Features Included
- Login/Register
- Dashboard with live-like environmental metrics
- Plan selection
- Payment module (simulation + extensible architecture)
- Payout view
- Payout history
- Monitoring page
- Toasts, loader states, API error handling
- Token + session persistence
