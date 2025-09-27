<a href="https://docs.letta.com/">
  <img alt="Stateful AI agent chatbot template built with Letta and Next.js." src="/assets/chatbot_template_header_2x.png">
  <h1 align="center">Letta Chatbot Example</h1>
</a>

<p align="center">
  A production-ready AI chatbot template using <a href="https://docs.letta.com/">Letta</a> with Supabase authentication, real-time streaming, and reasoning display.
</p>

<div align="center">
|
  <a href="#-features">Features</a> ·
  <a href="#-whats-included">What's included</a> ·
  <a href="#%EF%B8%8F-quickstart">Quickstart</a> ·
  <a href="#-running-the-app-locally">Running the app locally</a>
|
</div>

###

<div align="center">
<h3>One-click deploy with Vercel</h3>
<a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fletta-ai%2Fletta-chatbot-template&env=LETTA_API_KEY,LETTA_BASE_URL&envDescription=(Optional)%20Your%20Letta%20access%20token%3A%20set%20it%20to%20any%20arbitrary%20value%20if%20none%20is%20provided.%20Default%20server%20url%20is%20http%3A%2F%2Flocalhost%3A3000&envLink=https%3A%2F%2Fgithub.com%2Fletta-ai%2Fletta-chatbot-template&project-name=my-letta-chatbot&repository-name=my-letta-chatbot"><img src="https://vercel.com/button" alt="Deploy with Vercel"/></a></div>
</div>

> [!NOTE]
> You must have a Letta server running to use this template. Follow this [quickstart guide](https://docs.letta.com/quickstart) to run your local Letta server.

## 📺 Video overview (watch on YouTube)

[![Build your own ChatGPT with memory using Letta](https://img.youtube.com/vi/JI8ioW2_iAU/0.jpg)](https://www.youtube.com/watch?v=JI8ioW2_iAU)

## ✨ Features

- **Real-time streaming** - Token-by-token message streaming with reasoning display
- **Supabase authentication** - Secure user authentication and session management
- **Reasoning visualization** - Display AI reasoning process in real-time
- **Backend proxy** - Secure API calls through authenticated backend
- **Modern UI** - Built with Next.js 15, React, TypeScript, and Shadcn UI
- **Production ready** - Clean code, proper error handling, and optimized performance

## 📦 What's included

- [Letta TypeScript SDK](https://github.com/letta-ai/letta-node)

  - The Letta TypeScript library provides convenient access to the Letta API.

- [Vercel AI SDK](https://ai-sdk.dev/docs/introduction)
-
  - The Vercel AI SDK is used to interact with the **Letta API**, allowing us to do things like send and receive messages, create and manage agents, and more.

- [Next.js 15+](https://nextjs.org)

  - We leverage Next.js for its **server-side rendering (SSR)** and other performance optimizations, ensuring a fast and seamless user experience.

- [React](https://reactjs.org)

  - React provides a **component-based architecture**, enabling us to build **interactive and dynamic UIs** with reusable elements.

- [TypeScript](https://www.typescriptlang.org)

  - TypeScript enhances our codebase with **static typing, improved maintainability, and better developer tooling**, reducing potential runtime errors.

- [Shadcn UI](https://ui.shadcn.com)

  - Shadcn UI, built on [Tailwind CSS](https://tailwindcss.com), offers a collection of **modern, accessible UI components**, ensuring a cohesive and polished design.

- [React Markdown](https://github.com/remarkjs/react-markdown)
  - React Markdown allows us to **render Markdown content seamlessly**, making it easier to display formatted text within our application.

---

# ⚡️ Quickstart

### 📋 Prerequisites

- [Node.js](https://nodejs.org/en/download/) (v18 or higher)
- [npm](https://www.npmjs.com/get-npm) or [yarn](https://yarnpkg.com/)
- A Supabase project with authentication enabled
- A backend server that proxies Letta API requests with JWT authentication
- A running Letta server (see [Letta quickstart](https://docs.letta.com/quickstart))

## 🚀 Running the app locally

#### 🔸 Set up your Supabase project

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Enable authentication in your Supabase dashboard
3. Note down your project URL and anon key

#### 🔸 Set up your backend server

Your backend should:
- Support Supabase JWT authentication
- Have an endpoint `/api/v1/me` that returns user info including `agents` array
- Proxy all Letta API requests under `/api/v1/letta/{path}` with JWT validation
- Support streaming endpoints for real-time message delivery

#### 🔸 Setup and run the app

1️⃣ Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/your-username/letta-chatbot-example.git

# Navigate to the project directory
cd letta-chatbot-example

# Install dependencies
npm install
```

2️⃣ Set up environment variables:

```bash
# Copy the example environment file
cp env.example .env.local
```

3️⃣ Update the `.env.local` file with your configurations:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

4️⃣ Run the app

```bash
npm run dev
```

### Environment variables

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key  
- `NEXT_PUBLIC_BACKEND_URL` - URL of your backend server (default: `http://localhost:8000`)

> **Note**: Make sure your backend server is running and accessible at the specified URL before starting the frontend.

#### 🔸 See the app in action

Once the app is running, open your web browser and navigate to [http://localhost:3000](http://localhost:3000).

## 🔧 Backend Requirements

Your backend server should implement the following endpoints:

### Authentication
- Validate Supabase JWT tokens
- Return user information including `agents` array

### API Endpoints
- `GET /api/v1/me` - Returns current user info with `agents` array
- `GET /api/v1/letta/agents/{agentId}` - Proxy to Letta agent details
- `PATCH /api/v1/letta/agents/{agentId}` - Proxy to Letta agent updates
- `GET /api/v1/letta/agents/{agentId}/messages` - Proxy to Letta messages
- `POST /api/v1/letta/agents/{agentId}/messages/stream` - Proxy to Letta streaming messages
- `GET /api/v1/letta/agents/{agentId}/passages` - Proxy to Letta archival memory

## 🏗️ Architecture

This template implements a production-ready architecture with:

- **Supabase Authentication** - Secure user authentication and session management
- **Backend Proxy** - All Letta API calls go through authenticated backend
- **Real-time Streaming** - Token-by-token message streaming with reasoning display
- **Modern Stack** - Next.js 15, React, TypeScript, and Shadcn UI
- **Clean Code** - No debug logs, proper error handling, optimized performance

## 🚀 Deployment

### Railway (Recommended)

1. Fork this repository
2. Connect your GitHub account to [Railway](https://railway.app)
3. Create a new project and import the forked repository
4. Set environment variables in Railway dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_BACKEND_URL`
5. Deploy!

### Vercel

1. Fork this repository
2. Connect your GitHub account to Vercel
3. Import the forked repository
4. Set environment variables in Vercel dashboard
5. Deploy!

### Other Platforms

This is a standard Next.js application and can be deployed to any platform that supports Node.js:
- Netlify
- DigitalOcean App Platform
- AWS Amplify
- Docker containers

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
