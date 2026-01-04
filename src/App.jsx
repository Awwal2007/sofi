import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
// import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import TransferMoney from './pages/TransferMoney'
import AccountSettings from './pages/AccountSettings'
import { BankingProvider } from './contexts/BankingContext'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <BankingProvider>
      <Router>
        {/* <Layout> */}
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transfer" element={<TransferMoney />} />
            <Route path="/settings" element={<AccountSettings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-6">Page not found</p>
                  <a href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
                    Go to Dashboard
                  </a>
                </div>
              </div>
            } />
          </Routes>
        {/* </Layout> */}
      </Router>
    </BankingProvider>
  )
}

export default App