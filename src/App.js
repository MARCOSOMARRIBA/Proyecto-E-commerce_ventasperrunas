import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Perfil from "./pages/Perfil";
import Carrito from "./pages/Carrito";
import BusquedaProductos from "./pages/BusquedaProductos";
import DetalleProducto from "./pages/DetalleProducto";
import Catalogo from "./pages/Catalogo";
import { MessageProvider } from "./context/MessageContext";
import Configuracion from "./pages/Configuracion";
import SeccionesDinamicas from "./pages/SeccionesDinamicas";
import DashboardIntranet from "./pages/DashboardIntranet";
import Nosotros from "./pages/Nosotros";
import Servicios from "./pages/Servicios";
import Contacto from "./pages/Contacto";
import { FavoritesProvider } from "./context/FavoritesContext";
import Favoritos from "./pages/Favoritos";
import DashboardEmpleado from "./pages/DashboardEmpleado";

// 1. IMPORTAMOS EL CONTENEDOR PRINCIPAL DE LA EXTRANET
// Ajusta la ruta si no metiste el archivo dentro de una carpeta 'extranet'
import AdminExtranet from "./pages/AdminExtranet";

function App() {
  return (
    <MessageProvider>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <Router>
              <Navbar />
              <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/tienda/*" element={<Catalogo />} />
                <Route path="/buscar" element={<BusquedaProductos />} />
                <Route path="/login" element={<Login />} />
                <Route path="/producto/:id" element={<DetalleProducto />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/configuracion" element={<Configuracion />} />
                <Route path="/ajustes" element={<Configuracion />} />
                <Route path="/nosotros" element={<Nosotros />} />
                <Route path="/servicios" element={<Servicios />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/favoritos" element={<Favoritos />} />

                <Route path="/empleado" element={<DashboardEmpleado />} />

                {/* Ruta pública para ver los banners y promociones dinámicas */}
                <Route path="/novedades" element={<SeccionesDinamicas />} />

                {/* Ruta privada para la administración (Empleados) */}
                <Route path="/intranet" element={<DashboardIntranet />} />

                {/* 2. RUTA DE LA EXTRANET (Proveedores) */}
                <Route path="/extranet" element={<AdminExtranet />} />
              </Routes>
              <Footer />
            </Router>
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </MessageProvider>
  );
}

export default App;
