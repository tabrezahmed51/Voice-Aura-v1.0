<img width="1536" height="651" alt="Logo" src="https://github.com/user-attachments/assets/f63a1efe-4616-4de2-9a09-fb0c32b8b203" />


# 🎙️ Voice Aura v1.0

**A real-time voice AI web app powered by Google Gemini API**  
Built with Vite + TypeScript · Deployed via Google AI Studio

[![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](https://github.com/tabrezahmed51/Voice-Aura-v1.0)
[![Version](https://img.shields.io/badge/version-1.0-orange?style=flat-square)](https://github.com/tabrezahmed51/Voice-Aura-v1.0/releases)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Stars](https://img.shields.io/github/stars/tabrezahmed51/Voice-Aura-v1.0?style=social)](https://github.com/tabrezahmed51/Voice-Aura-v1.0/stargazers)
[![TypeScript](https://img.shields.io/badge/TypeScript-98.4%25-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

[🔗 Live Preview](https://ai.studio/apps/ef5ab480-df21-431e-8981-0a4588886a40) · [🐛 Report Bug](https://github.com/tabrezahmed51/Voice-Aura-v1.0/issues) · [✨ Request Feature](https://github.com/tabrezahmed51/Voice-Aura-v1.0/issues)

</div>

---

## 📌 Overview

**Voice Aura v1.0** is a browser-native voice interaction application built inside [Google AI Studio](https://aistudio.google.com/). It connects directly to the **Gemini API** to deliver real-time, low-latency conversational AI — with no backend server required.

Designed as a production-ready starter for developers building voice AI experiences, Voice Aura ships with a modular TypeScript architecture, secure environment-based API key management, and a fully customisable UI.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎤 **Voice Interaction** | Speak naturally and receive instant AI-generated responses |
| ⚡ **Gemini-Powered** | Backed by Google's latest multimodal large language model |
| 🌐 **100% Web-Based** | Zero installs — runs entirely in the browser |
| 🔧 **Vite + TypeScript** | Lightning-fast HMR dev environment with strict typing |
| 🎨 **Themeable UI** | Fully customisable colour palette and layout system |
| 🔒 **Secure Config** | API keys managed via `.env.local` — never hard-coded |
| 📊 **Analytics Ready** | Built-in hooks for usage tracking and performance metrics |
| 🚀 **One-Click Deploy** | Native Google AI Studio deployment support |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | TypeScript 5.x, Vite 5.x |
| **AI Engine** | Google Gemini API |
| **Voice Capture** | Web Speech API (browser-native) |
| **Runtime** | Node.js ≥ 18 |
| **Deployment** | Google AI Studio |

---

## 📐 System Architecture

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────┐     ┌──────────────────────┐
│   Browser Client    │────▶│   Web Speech API      │────▶│   Gemini API    │────▶│  Google AI Studio    │
│  Vite + TypeScript  │     │  (Voice Capture)      │     │  (AI Response)  │     │  (Deployment Host)   │
└─────────────────────┘     └──────────────────────┘     └─────────────────┘     └──────────────────────┘
```

---

## ⚙️ Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A valid **Gemini API key** — [Get one free here](https://aistudio.google.com/app/apikey)

---

## 🚀 Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/tabrezahmed51/Voice-Aura-v1.0.git
cd Voice-Aura-v1.0

# 2. Install dependencies
npm install

# 3. Configure your Gemini API key
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# 4. Start the development server
npm run dev

# 5. Build for production
npm run build
```

> ⚠️ **Never commit your `.env.local` file.** Ensure it is listed in `.gitignore`.

---

## 🌍 Deployment

Voice Aura is optimised for **Google AI Studio** deployment. The production build is also fully compatible with any static hosting platform:

| Platform | Status |
|---|---|
| Google AI Studio | ✅ Native support |
| Vercel | ✅ Compatible |
| Netlify | ✅ Compatible |
| Cloudflare Pages | ✅ Compatible |

**[🔗 View Live Preview on AI Studio](https://ai.studio/apps/ef5ab480-df21-431e-8981-0a4588886a40)**

---

## 📂 Project Structure

```
Voice-Aura-v1.0/
├── src/
│   ├── components/       # UI components
│   ├── services/         # Gemini API integration
│   ├── utils/            # Helper utilities
│   └── main.ts           # App entry point
├── public/               # Static assets
├── .env.local            # API key (not committed)
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json
```

---

## 🤝 Contributing

Contributions are welcome and appreciated!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 🐛 Issues & Support

Found a bug or have a feature request? [Open an issue](https://github.com/tabrezahmed51/Voice-Aura-v1.0/issues) with a clear description and reproduction steps.

---

## 👨‍💻 Author

**Tabrez Ahmed**

[![GitHub](https://img.shields.io/badge/GitHub-@tabrezahmed51-181717?style=flat-square&logo=github)](https://github.com/tabrezahmed51)

---

## 📜 License

This project is licensed under the **MIT License** — free to use, fork, modify, and distribute.  
See the [LICENSE](LICENSE) file for full details.

---

<div align="center">

Made with ❤️ using [Google Gemini API](https://ai.google.dev/) · **Voice Aura v1.0**

</div>
