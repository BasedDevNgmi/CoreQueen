import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { getTheme } from '@/lib/settings'
import { I18nProvider } from '@/lib/i18n'
import './index.css'
import App from './App.tsx'

document.documentElement.classList.add(getTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
)
