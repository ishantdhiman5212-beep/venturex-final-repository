# PingME Queue: One Gateway to Essential Services

> **Team**: [ 404 team not found ] · Open Innovation  
> **Category**: Super App Expansion / Digital Public Services  
> **Live Web Application**: Fully Functional Replica & Expansion of the Lovable Prototype + PDF Architecture

---

## 🎯 Executive Overview & Problem Statement

Public and private civic services (Hospitals, District Collectorates, Citizen Service Centres, State Education Offices) suffer from three critical bottlenecks:
1. **Inefficient physical queues**: Citizens wait for hours with zero visibility into their position, true wait times, or serving counters.
2. **Complicated documentation**: Unclear prerequisites, missing documents, or incorrect forms cause repeated visits and rejection.
3. **Fragmented verification**: Document review is disconnected from the queue journey, resulting in counter-level rejections after waiting for hours.

**PingME Queue** solves this by unifying:
- **App-free QR entry**: Zero app installation required; scan the QR at the entrance or access online.
- **Guided AI document drafting**: Prepares formal petitions, applications, and OPD slips automatically.
- **Privacy-first OCR & completeness check**: Multi-modal vision AI verifies required documents *before* citizens join the queue.
- **Live digital tokens**: Real-time position tracking, countdowns, counter assignments, audio chimes, voice announcements, and simulated SMS notifications.
- **Live officer administration dashboard**: Real-time counter calling, queue controls, document review desk, and multi-tab synchronization.

---

## 🚀 The 6-Step Citizen Journey (From the Deck)

1. **01 Discover**: Unified portal across **Healthcare** (*City General Hospital*), **Citizen Services** (*District Citizen Service Centre*), and **Education** (*State Education Facilitation Office*).
2. **02 Prepare**: AI-assisted forms with dynamic inputs tailored to each service (symptoms, income, guardian details, certificate types).
3. **03 Verify**: Built-in OCR & Gemini Vision Engine validates required documents (Aadhaar, address proof, marksheets) and calculates completeness score.
4. **04 Queue**: Instant digital token issuance (`GM-046`, `IC-021`, etc.) with estimated wait time and live position.
5. **05 Serve**: Audible airport/hospital chimes + spoken voice announcements ("Token IC-021, please proceed to Counter 2!") and officer counter calls.
6. **06 Track**: Permanent tracking ID (`PMQ-XXXXXX`), timeline history log, document repository, and live status updates.

---

## 🛠️ Complete Feature Matrix

| Feature | Description | Status |
| :--- | :--- | :---: |
| **Hero & Landing Page** | Exact typography (Sora, Plus Jakarta Sans, JetBrains Mono), hero grid, metrics, preview card | ✅ 100% Complete |
| **Interactive QR Scanner** | Device camera scanner + simulated laser viewfinder + manual code entry (`CGH`, `DCSC`, `SEFO`) + printable entrance posters | ✅ 100% Complete |
| **Service Catalog** | 11 sample services across 3 sectors with live wait times, queue counts, document lists, and search filters | ✅ 100% Complete |
| **Guided Application Wizard** | 4-step wizard: Details (with "Fill sample answers") ➔ Draft letter ➔ Document upload & OCR ➔ Readiness gate | ✅ 100% Complete |
| **Digital Token Pass** | Real-time queue position, dynamic countdown, ahead count, progress bar, and "Call next token" demo control | ✅ 100% Complete |
| **Audio & Voice Alerts** | Dual-frequency Web Audio chime + Web Speech API voice synthesis ("Token X, proceed to Counter Y") | ✅ 100% Complete |
| **Officer Admin Dashboard** | Counter console, queue caller, document review desk (Approve / Request Correction), analytics, and Gemini API settings | ✅ 100% Complete |
| **Multi-Tab Live Sync** | BroadcastChannel + window storage sync: calling a token in `/admin` updates `/token` in another tab in real-time | ✅ 100% Complete |
| **Backend & Persistence** | Node.js Express server + SQLite / persistent JSON database + Server-Sent Events (SSE) API | ✅ 100% Complete |

---

## 💻 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Styling**: Exact OKLCH color system, custom animations (`scan-line`, `pulse-ring`, etc.)
- **Backend & DB**: Node.js, Express, SQLite / JSON persistence, Server-Sent Events (SSE)
- **AI & Vision**: Google Gemini API integration + fallback intelligent OCR Engine
- **Audio**: Web Audio API (Synthesizer Chime) + Web Speech API (Voice announcements)

---

## 🏃 Running the Application

### 1. Start the Server & Web App
```bash
# In the project directory:
node server.js
```
Open your browser to: **`http://localhost:5000`**

### 2. Run in Development Mode (Optional)
```bash
npm run dev
```
Open: **`http://localhost:3000`**

### 3. Build for Production
```bash
npm run build
```

---

## 🧪 Demo Walkthrough for Judges

1. **Gate Entrance**:
   - Go to **`http://localhost:5000/scan`**
   - Click **"Simulate QR scan"** or tap any of the 3 entrance posters.
2. **Explore Services**:
   - Select **"Income Certificate"** under District Citizen Service Centre.
   - Click **"Start guided application"**.
3. **Guided Form & OCR**:
   - Click **"Fill sample answers"** to populate applicant details instantly.
   - Click **"Continue"** to view the auto-generated petition letter.
   - On the upload step, click **"Autofill demo files"** to watch the OCR Engine verify documents with a 98% score.
   - Click **"Issue Digital Token"** to receive your token pass (`IC-021`)!
4. **Live Token & Voice Chime**:
   - View your live position, countdown, and progress.
   - Click **"Call next token"** on the card to hear the chime and spoken announcement!
5. **Officer Admin Console**:
   - In a second tab or window, open **`http://localhost:5000/admin`**.
   - Notice that both tabs stay in sync live!
   - From the admin panel, switch counters, call tokens, and review/approve citizen documents.
