<div align="center">

# 🎓 Campus OS

### *The ultimate localized productivity workspace and AI-powered companion for modern university life.*

> A unified student operating system that combines class routines, CGPA tracking, attendance monitoring, secure messaging, and an AI-powered Campus Copilot into one seamless experience.

<img src="https://i.imgur.com/YOUR_IMAGE_ID.png" alt="Campus OS Banner" width="1200"/>

</div>

---

## ✨ Features

- 📅 Automatic class routine synchronization from Google Sheets
- 🎯 Real-time CGPA and attendance tracking
- 🤖 Gemini-powered Campus Copilot
- 💬 Secure one-to-one and group messaging
- 📝 Smart notes and document assistance
- 📱 Fully responsive mobile-first interface
- 📦 Installable Progressive Web App (PWA)
- 🌐 Offline-first experience with local caching
- ⚡ Fast and modern UI built with React + Vite

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Animation:** Motion
- **AI:** Google Gemini SDK
- **PWA:** vite-plugin-pwa
- **Data Source:** Google Sheets
- **Deployment:** AI Studio

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Gemini API Key

### Installation

1. Clone the repository

```bash
git clone <your-repository-url>
cd campus-os
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env.local` file and add your Gemini API key

```env
GEMINI_API_KEY=your_api_key_here
```

4. Start the development server

```bash
npm run dev
```

---

## 📁 Project Structure

```
src/
├── components/
├── pages/
├── hooks/
├── services/
├── types/
├── utils/
└── App.tsx
```

---

## 🎯 Inspiration

Campus OS was inspired by the everyday challenges university students face while managing academics across multiple disconnected platforms. Instead of switching between Google Sheets, messaging apps, GPA calculators, attendance trackers, and note-taking tools, we envisioned one intelligent workspace that brings everything together into a single, seamless experience.

---

## 💡 What it does

Campus OS centralizes the entire university experience into one AI-powered platform. It automatically syncs class routines from Google Sheets, tracks CGPA and attendance in real time, provides secure messaging, and features a Gemini-powered Campus Copilot that helps students summarize notes, answer questions, generate study materials, and format documents.

As an offline-first Progressive Web App, Campus OS remains accessible even with limited internet connectivity.

---

## 🏗️ How we built it

Campus OS was built using **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS** for a fast and responsive frontend. Motion powers smooth transitions and micro-interactions.

Google Sheets serves as the source for routine synchronization, while the Gemini SDK powers the AI Campus Copilot through a secure server-side API. Offline functionality is enabled through **vite-plugin-pwa** and custom service workers, allowing students to continue accessing important resources without an internet connection.

---

## ⚙️ Challenges

- Designing a feature-rich workspace that remains intuitive on mobile devices.
- Synchronizing Google Sheets efficiently without unnecessary re-renders.
- Managing a growing codebase through modular architecture.
- Building a responsive offline-first experience while maintaining high performance.
- Integrating AI securely using server-side API routes.

---

## 🏆 Accomplishments

- Built an all-in-one student productivity platform.
- Integrated automatic Google Sheets routine synchronization.
- Developed a Gemini-powered AI Campus Copilot.
- Implemented secure student messaging.
- Created real-time CGPA and attendance tracking.
- Delivered a responsive offline-first PWA.
- Designed a clean and modern UI optimized for students.

---

## 📚 What we learned

This project reinforced the importance of user-centered design, modular architecture, offline-first development, and secure AI integration. We learned that thoughtful UI decisions, performance optimization, and seamless feature integration significantly improve the student experience.

---

## 🔮 What's Next

- 📖 AI-generated personalized study plans
- 📝 Assignment and deadline management
- 🎤 Smart lecture transcription
- 👨‍🏫 Faculty dashboards
- 📢 Campus announcements
- 🤝 Collaborative workspaces
- ☁️ Cloud synchronization
- 📊 Learning analytics
- 🏫 Multi-university support

---

## 🚀 Deployment

You can deploy Campus OS directly through **Google AI Studio** or any modern hosting platform supporting Vite applications.

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

Made with ❤️ for students.

</div>
