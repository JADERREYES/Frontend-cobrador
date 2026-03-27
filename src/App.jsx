import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Clientes from "./pages/Clientes";
import ClienteDetalle from "./pages/ClienteDetalle";
import PagarCredito from "./pages/PagarCredito";
import NuevoCredito from "./pages/NuevoCredito";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* RUTAS PROTEGIDAS */}
        <Route 
          path="/menu"
          element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/clientes"
          element={
            <ProtectedRoute>
              <Clientes />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/clientes/:id"
          element={
            <ProtectedRoute>
              <ClienteDetalle />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/nuevo-credito/:clienteId"
          element={
            <ProtectedRoute>
              <NuevoCredito />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/pagar/:prestamoId"
          element={
            <ProtectedRoute>
              <PagarCredito />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;