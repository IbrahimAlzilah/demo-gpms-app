import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './app/App.tsx'
import { ThemeProvider } from './app/providers/ThemeProvider'
import { I18nProvider } from './app/providers/I18nProvider'
import { DirectionProvider } from './app/providers/DirectionProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <ThemeProvider>
        <DirectionProvider>
          <App />
        </DirectionProvider>
      </ThemeProvider>
    </I18nProvider>
  </StrictMode>,
)
