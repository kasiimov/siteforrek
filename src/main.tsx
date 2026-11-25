import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initTracking } from './lib/analytics'
import './styles.css'

initTracking()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
