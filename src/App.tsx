import { Routes, Route, Navigate, NavLink } from 'react-router-dom'
import letraS from '@/assets/WordS.png'
import letraG from '@/assets/WordG.png'
import letraI from '@/assets/Wordi.png'
import { useAuthStore } from '@/shared/stores/auth.store'
import { LoginPage } from './pages/LoginPage/LoginPage'
import { TablerosPage } from './pages/ProductividadPage/TablerosPage/TablerosPage'
import { TicketsPage } from './pages/ProductividadPage/TicketsPage/TicketsPage'
import { TicketDetail } from './pages/ProductividadPage/TicketDetail/TicketDetail'

function App() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="w-full px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-0">
              <img src={letraS} alt="S" className="h-8 w-auto" />
              <img src={letraG} alt="G" className="h-8 w-auto" />
              <img src={letraI} alt="I" className="h-8 w-auto" />
            </div>
            <nav className="flex gap-4">
              <NavLink
                to="/tickets"
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600 hover:text-gray-900'}`
                }
              >
                Tickets
              </NavLink>
              <NavLink
                to="/tableros"
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600 hover:text-gray-900'}`
                }
              >
                Tableros
              </NavLink>
            </nav>
          </div>
          <button
            onClick={() => useAuthStore.getState().logout()}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/tickets" replace />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="/tableros" element={<TablerosPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
