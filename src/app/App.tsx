import { Router } from './router/Router'
import { QueryProvider } from './providers/QueryProvider'

function App() {
  return (
    <QueryProvider>
      <Router />
    </QueryProvider>
  )
}

export default App

