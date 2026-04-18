# 🛡️ DeliverShield AI
### AI-Powered Parametric Insurance for Quick Commerce Delivery Partners

<div align="center">

**[Live Demo](https://devtrails-frontend-main.vercel.app)** • **[Backend API](https://delivershield-backend.onrender.com/api/health)** • **[AI Service](https://devtrails-ai.onrender.com/health)** • **[📄 Pitch Deck](https://drive.google.com/file/d/1j5Okg9R29bzTunjUVCe_n9zKzoj9YTav/view?usp=sharing)**

</div>
---

## 📌 Problem Statement

India’s quick commerce ecosystem (Zepto, Blinkit, Swiggy Instamart) delivers in 10–20 minutes, but:

| Problem | Impact |
|--------|--------|
| 🌧️ Weather | 40–60% drop in orders |
| 🚦 Traffic | Delivery SLA breaks |
| 📵 Platform outages | Zero earnings during peak hours |
| 🌫️ Pollution | 30% workdays lost |

### Hard Reality:
- 7.7M+ delivery workers in India
- 20–30% income loss during disruptions
- ₹0 protection available currently

---

## 👤 Target Persona

**Ravi (Hyderabad - Zepto/Blinkit Delivery Partner)**

| Attribute | Value |
|----------|------|
| Monthly Earnings | ₹18,000–25,000 |
| Work Hours | 10–12 hours/day |
| Peak Hours | 6 PM – 10 PM |

Expected ₹400 → Rain → Earned ₹150 → No protection

---

## 💡 Solution

### DeliverShield AI
Parametric insurance with **instant payouts** based on real-world triggers.

- No claims  
- No paperwork  
- Auto payouts  

---

## ⚙️ How It Works

```
User Buys Plan → AI Monitors → Trigger?
     ↓ Yes
Calculate Loss → Auto Payout → UPI Credit
```

---

## 📊 Parametric Triggers

| Trigger | Condition | Payout |
|--------|----------|--------|
| 🌧️ Rain | >40mm/hr | ₹300–500 |
| 🌡️ Heat | >42°C | ₹200–400 |
| 🌫️ AQI | >300 | ₹250–450 |
| 🚦 Traffic | >0.8 index | ₹150–300 |
| 📵 Outage | >30 min | ₹200–350 |

---

## 🏗️ Architecture

```
Frontend (React)
   ↓
Backend (Spring Boot)
   ↓
Database + AI + Weather API
```

---

## 🔄 Flow

```
User → Frontend → Backend → DB
                      ↓
                 AI + Weather
                      ↓
                 Fraud Check
                      ↓
                  Payout
```

---

## ✨ Features

### Users
- GPS location detection  
- Live weather monitoring  
- Dynamic premium  
- Instant payouts (<60s)  
- Payout history  
- AI risk scoring  

### Admin
- Fraud detection  
- Analytics dashboard  
- Risk prediction  

---

## 🛠️ Tech Stack

- Frontend: React  
- Backend: Spring Boot  
- DB: PostgreSQL  
- AI: Python + Flask  
- ML: RandomForest, Isolation Forest  
- Deploy: Vercel + Render  

---

## 🤖 AI Models

### Risk Model
- RandomForest  
- Accuracy: 87.5%

### Fraud Model
- Isolation Forest  
- Detection: 94%

---

## 📊 Premium Formula

```
Premium = (Coverage / 1000) × 12.5 × Zone_Multiplier
```

---

## 🔗 API

- POST /auth/register  
- POST /auth/login  
- GET /plans  
- POST /plans/activate  
- GET /payouts  
- POST /evaluate  

---

## 📋 Setup

### Clone
```
git clone https://github.com/0deepak2873/DEVTRAILS_HACKATHON.git
cd DEVTRAILS_HACKATHON
```

### Backend
```
cd backend
./mvnw spring-boot:run
```

### AI
```
cd ai
python -m venv venv
pip install -r requirements.txt
python main.py
```

### Frontend
```
cd frontend
npm install
npm run dev
```

### DB
```
CREATE DATABASE delivershield;
```

---

## 🚀 Deployment

- Backend: Render  
- AI: Render  
- Frontend: Vercel  

---

## 📈 Results

- <60 sec payouts  
- 87.5% accuracy  
- 94% fraud detection  
- <500ms API  

---

## 🔮 Future

- Traffic API  
- Regional languages  
- Platform integration  
- LSTM forecasting   

---

## 🔗 Links

Live: https://devtrails-frontend-main.vercel.app  
GitHub: https://github.com/0deepak2873/DEVTRAILS_HACKATHON  
Backend: https://delivershield-backend.onrender.com  
AI: https://devtrails-ai.onrender.com  

---

<div align="center">

🛡️ Protecting India’s Delivery Workers

</div>
