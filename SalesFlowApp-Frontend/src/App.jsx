import { BrowserRouter } from 'react-router-dom'
import './App.css'
import AppRouter from './router/AppRouter'
import { AuthProvider } from './context/authContext'

function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
