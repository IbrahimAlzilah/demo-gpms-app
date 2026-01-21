import { RootRouter } from './routes'
import { ThemeProvider } from './context/theme-provider.tsx'
import { DirectionProvider } from './context/direction-provider.tsx'
import { Toaster } from '@/components/common'

function App() {
  return (
    <ThemeProvider>
      <DirectionProvider>
        <RootRouter />
        <Toaster />
      </DirectionProvider>
    </ThemeProvider>
  )
}

export default App

