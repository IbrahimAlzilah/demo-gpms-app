import { RootRouter } from './routes/Router'
import { ThemeProvider } from './context/theme-provider.tsx'
import { DirectionProvider } from './context/direction-provider.tsx'

function App() {
  return (
    <ThemeProvider>
      <DirectionProvider>
        <RootRouter />
      </DirectionProvider>
    </ThemeProvider>
  )
}

export default App

