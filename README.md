<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6a11cb,50:2575fc,100:00ffcc&height=220&section=header&text=🎙️%20Voice%20Aura%20v2.0&fontSize=52&fontColor=ffffff&animation=fadeIn&fontAlignY=40&desc=Agentic%20Voice%20AI%20%7C%20Universal%20API%20Provider%20Support%20%7C%20Vite%20%2B%20TypeScript&descAlignY=62&descSize=15&descColor=ccddff" width="100%"/>

<br/>

[![Build](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge&logo=github)](https://github.com/tabrezahmed51/Voice-Aura-v2.0)
[![Version](https://img.shields.io/badge/version-2.0-00ffcc?style=for-the-badge&logoColor=white)](#)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-98.4%25-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Providers](https://img.shields.io/badge/API%20Providers-9%2B%20Supported-bf5fff?style=for-the-badge)](#-supported-api-providers)
[![Stars](https://img.shields.io/github/stars/tabrezahmed51/Voice-Aura-v2.0?style=for-the-badge&logo=github)](https://github.com/tabrezahmed51/Voice-Aura-v2.0/stargazers)

<br/>

**[🔗 Live Preview](https://ai.studio/apps/ef5ab480-df21-431e-8981-0a4588886a40)&nbsp;&nbsp;·&nbsp;&nbsp;[🐛 Report Bug](https://github.com/tabrezahmed51/Voice-Aura-v2.0/issues)&nbsp;&nbsp;·&nbsp;&nbsp;[✨ Request Feature](https://github.com/tabrezahmed51/Voice-Aura-v2.0/issues)**

</div>

---

## 📌 Overview

**Voice Aura v2.0** is a fully agentic, browser-native voice AI application built with **Vite + TypeScript** and developed in **Google AI Studio**.

This version introduces **Universal API Provider Support** — any user can open the app, add their own API key from any major AI provider, and access all features instantly. No code changes. No hardcoded keys. No restrictions.

Powered by a centralized `apiAdapter` that normalizes requests across all providers, Voice Aura's agentic brain (**MOLTBOT**) can now run on any LLM backend the user chooses.

---

## 🆕 What's New in v2.0

| # | Upgrade | Description |
|---|---|---|
| 1 | ⚙️ **Multi-API Provider Modal** | Gear icon in header opens full settings modal for any provider |
| 2 | 🔌 **Universal API Adapter** | Centralized `apiAdapter.ts` normalizes all provider request formats |
| 3 | 💾 **Persistent Config** | Keys, base URLs & models saved in `localStorage` — survive page refreshes |
| 4 | 🟢 **Real-time Status Chip** | Header badge shows active AI kernel + model name live |
| 5 | 🧪 **Connection Testing** | Test any key with real-time latency feedback before saving |
| 6 | 🤖 **Agentic Brain (MOLTBOT)** | Floating assistant now runs on any provider via universal adapter |
| 7 | 🎛️ **Dynamic UI Feedback** | Vocal Fingerprint displays the active neural kernel in real time |
| 8 | 🔓 **Zero Restrictions** | No provider blocked, no cap, no forced defaults |

---

## 🔌 Supported API Providers

> Open ⚙️ API Settings in the app → Select your provider → Paste your key → Save & Apply

| Provider | Model Default | Key Format |
|---|---|---|
| 🟦 Google Gemini | `gemini-2.0-flash` | `AIza...` |
| 🟩 OpenAI | `gpt-4o` | `sk-...` |
| 🟧 Anthropic Claude | `claude-3-5-sonnet-20241022` | `sk-ant-...` |
| 🟪 Mistral AI | `mistral-medium` | — |
| ⚡ Groq | `llama3-8b-8192` | `gsk_...` |
| 🤝 Together AI | `meta-llama/Llama-3-8b` | — |
| 🤗 Hugging Face | `mistralai/Mixtral-8x7B` | `hf_...` |
| 🔀 OpenRouter | `mistralai/mixtral-8x7b` | `sk-or-...` |
| 🏠 Ollama (Local) | `llama3` | *(no key needed)* |
| ➕ Custom Provider | user-defined | user-defined |

---

## ✨ Core Features

| Feature | Description |
|---|---|
| 🎤 **Voice Interaction** | Speak naturally — get instant AI responses |
| 🤖 **MOLTBOT Agent** | Autonomous floating assistant powered by your chosen LLM |
| 🎙️ **Pronunciation Diagnostics** | Multimodal audio analysis via universal adapter |
| 🧬 **Vocal Fingerprint** | Spectral analysis with active neural kernel display |
| 🔊 **Voice Command Interpretation** | Intent detection routed through the API adapter |
| 🌐 **100% Web-Based** | Runs entirely in the browser — zero installs |
| 🔒 **Secure Key Handling** | Keys stored only in `localStorage` — never transmitted or logged |
| 🎨 **Themeable UI** | Fully customisable colour palette and layout |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vite 5.x + TypeScript 5.x |
| **AI Routing** | Universal `apiAdapter.ts` (custom) |
| **Voice Capture** | Web Speech API (browser-native) |
| **State / Config** | `localStorage` via `useApiConfig` hook |
| **AI Providers** | 9+ via REST API (OpenAI-compatible + native adapters) |
| **Runtime** | Node.js ≥ 18 |
| **Deployment** | Google AI Studio / Vercel / Netlify / Cloud Run |

---

## 📐 System Architecture

```
┌──────────────┐    ┌─────────────────┐    ┌───────────────────────────┐
│   Browser    │───▶│ Web Speech API  │───▶│     apiAdapter.ts         │
│ Vite + TS    │    │  Voice Capture  │    │  Universal API Router     │
└──────────────┘    └─────────────────┘    └────────────┬──────────────┘
                                                        │
       ┌────────────────────────────────────────────────┼───────────────────────────┐
       ▼                 ▼                ▼                ▼                         ▼
┌──────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐
│ Google Gemini│  │  OpenAI    │  │ OpenRouter │  │ Hugging Face │  │ Ollama / Custom │
│  Native API  │  │ /v1/chat   │  │ /v1/chat   │  │  Inference   │  │  Self-Hosted    │
└──────────────┘  └────────────┘  └────────────┘  └──────────────┘  └─────────────────┘
```

---

## 📂 Folder Structure

```
Voice-Aura-v2.0/
│
├── index.html                       # HTML entry shell
│
├── src/
│   ├── index.tsx                    # App entry point
│   ├── App.tsx                      # Root — wires modal + status chip
│   ├── types.ts                     # Shared TypeScript interfaces
│   │
│   ├── components/
│   │   ├── ApiSettingsModal.tsx     # ⚙️ Multi-provider settings modal
│   │   ├── ProviderStatusChip.tsx   # 🟢 Active provider header badge
│   │   ├── VoiceButton.tsx          # 🎤 Mic trigger & recording control
│   │   ├── Waveform.tsx             # 〰️ Animated audio waveform
│   │   ├── ResponseCard.tsx         # 💬 AI response output card
│   │   ├── VocalFingerprint.tsx     # 🧬 Spectral analysis display
│   │   └── FloatingAssistant.tsx    # 🤖 MOLTBOT agentic assistant
│   │
│   ├── services/
│   │   ├── apiAdapter.ts            # 🔌 Universal provider router
│   │   ├── providerConfig.ts        # 📋 Provider list, URLs & defaults
│   │   ├── geminiService.ts         # Google Gemini native client
│   │   └── speechService.ts        # Web Speech API wrapper
│   │
│   ├── hooks/
│   │   ├── useApiConfig.ts          # 💾 localStorage config hook
│   │   ├── useVoice.ts              # 🎙️ Voice recording logic
│   │   └── useGemini.ts             # Gemini response handler
│   │
│   ├── utils/
│   │   ├── config.ts                # Env vars loader
│   │   └── analytics.ts             # Usage tracking helpers
│   │
│   └── styles/
│       ├── globals.css              # Global styles
│       └── theme.css                # Colour palette variables
│
├── public/
│   ├── header-image-16x9.png        # Hero banner
│   └── favicon.ico
│
├── metadata.json                    # AI Studio app metadata
├── vite.config.ts                   # Vite build configuration
├── tsconfig.json                    # TypeScript compiler config
├── package.json                     # Dependencies & scripts
├── package-lock.json
├── .env.local                       # 🔒 Fallback API key (not committed)
├── .env.example                     # Safe env template for contributors
├── .gitignore
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- API key from **any supported provider** — [Get Gemini free →](https://aistudio.google.com/app/apikey)

---

## 🚀 Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/tabrezahmed51/Voice-Aura-v2.0.git
cd Voice-Aura-v2.0

# 2. Install dependencies
npm install

# 3. (Optional) Set a fallback Gemini key
echo "GEMINI_API_KEY=your_key_here" > .env.local

# 4. Start the development server
npm run dev

# 5. Open the app → click ⚙️ API Settings → add your key → Save & Apply
```

> ✅ No API key in code required. Users configure their own key directly in the app UI.

---

## 🔑 First-Time User Flow

```
1. Open the app
2. See prompt → "Welcome! Add your API key to get started → ⚙️ API Settings"
3. Click the ⚙️ gear icon in the header
4. Select your AI provider from the dropdown
5. Paste your API key
6. Click "Test Connection" → verify latency
7. Click "Save & Apply"
8. Status chip shows: ⚡ OpenRouter · mixtral-8x7b
9. All features are now fully active
```

---

## 🌍 Deployment

| Platform | Status | Notes |
|---|---|---|
| Google AI Studio | ✅ Native | Recommended — zero config |
| Google Cloud Run | ✅ Supported | One-click from AI Studio |
| Vercel | ✅ Compatible | `npm run build` → deploy `dist/` |
| Netlify | ✅ Compatible | Drag & drop `dist/` folder |
| Cloudflare Pages | ✅ Compatible | Connect repo, auto-build |

> ⚠️ On Vercel/Netlify: keys are entered by users in the UI modal — no server-side key needed.

**[🔗 View Live Preview on AI Studio →](https://ai.studio/apps/ef5ab480-df21-431e-8981-0a4588886a40)**

---

## 🤝 Contributing

```bash
git checkout -b feature/your-feature-name
git commit -m "feat: describe your change"
git push origin feature/your-feature-name
```

- Follow [Conventional Commits](https://www.conventionalcommits.org/)
- Open an issue before submitting large PRs

---

## 👨‍💻 Author

**Tabrez Ahmed** — [@tabrezahmed51](https://github.com/tabrezahmed51)

Built with ❤️ in [Google AI Studio](https://aistudio.google.com) · Upgraded with universal AI provider support.

---

## 📜 License

Released under the **[MIT License](LICENSE)** — free to fork, modify, and distribute.

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00ffcc,50:2575fc,100:6a11cb&height=120&section=footer" width="100%"/>

<sub>Voice Aura v2.0 · Universal AI · Made with ❤️ by <a href="https://github.com/tabrezahmed51">Tabrez Ahmed</a></sub>

</div>
