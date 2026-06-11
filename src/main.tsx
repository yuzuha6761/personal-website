import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import 'virtual:uno.css'
import 'remixicon/fonts/remixicon.css'

document.addEventListener('contextmenu', (event) => {
  event.preventDefault()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
