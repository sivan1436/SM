# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Scrink client

## Local development

```bash
npm install
npm run dev
```

The Vite proxy sends `/api` requests to `http://localhost:4000`.

## Vercel deployment

Set the Vercel project root directory to `SM/client`, use the default Vite build settings, and add:

```env
VITE_SOCKET_URL=https://your-service.onrender.com
```

The root `vercel.json` forwards `/api/*` to Render and preserves React Router routes.
