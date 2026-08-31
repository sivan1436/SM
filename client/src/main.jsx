import { createRoot } from 'react-dom/client'
import  { BrowserRouter} from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/react'

const PUBLIC_ISHAMBLE = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLIC_ISHAMBLE) {
  throw new Error('Missing PUBLIC_ISHAMBLE environment variable')
}

createRoot(document.getElementById('root')).render(
<BrowserRouter>
  <App />
</BrowserRouter>
)