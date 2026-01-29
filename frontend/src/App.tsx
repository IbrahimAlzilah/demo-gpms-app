import { RootRouter } from './routes'
import { ThemeProvider } from './context/theme-provider.tsx'
import { DirectionProvider } from './context/direction-provider.tsx'
import { ErrorBoundary, Toaster } from '@/components/common'

function App() {
  return (
    // <ErrorBoundary> 
    <ThemeProvider>
      <DirectionProvider>
        <RootRouter />
        <Toaster />
      </DirectionProvider>
    </ThemeProvider>
    // </ErrorBoundary>
  )
}

export default App

