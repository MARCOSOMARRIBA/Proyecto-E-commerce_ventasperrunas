import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { MessageProvider } from "./context/MessageContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { AppearanceProvider } from "./context/AppearanceContext";
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
import Configuracion from "./pages/Configuracion";
import SeccionesDinamicas from "./pages/SeccionesDinamicas";
import DashboardIntranet from "./pages/DashboardIntranet";
import Nosotros from "./pages/Nosotros";
import Servicios from "./pages/Servicios";
import Contacto from "./pages/Contacto";
import Favoritos from "./pages/Favoritos";
import DashboardEmpleado from "./pages/DashboardEmpleado";
import AdminExtranet from "./pages/AdminExtranet";
import MisPedidos from "./pages/MisPedidos";
import Categorias from "./pages/Categoria";
import PedidoNotifier from "./components/PedidoNotifier";
import OlvidePassword from "./pages/OlvidePassword";

function App() {
  return (
    <MessageProvider>
      <AuthProvider>
        <FavoritesProvider>
          <AppearanceProvider>
            <CartProvider>
              <Router>
                <PedidoNotifier />
                <Navbar />
                <Routes>
                  <Route path="/" element={<Inicio />} />
                  <Route path="/tienda/*" element={<Catalogo />} />
                  <Route path="/buscar" element={<BusquedaProductos />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/olvide-password" element={<OlvidePassword />} />
                  <Route path="/producto/:id" element={<DetalleProducto />} />
                  <Route path="/registro" element={<Registro />} />
                  <Route path="/perfil" element={<Perfil />} />
                  <Route path="/carrito" element={<Carrito />} />
                  <Route path="/configuracion" element={<Configuracion />} />
                  <Route path="/ajustes" element={<Configuracion />} />
                  <Route path="/nosotros" element={<Nosotros />} />
                  <Route path="/servicios" element={<Servicios />} />
                  <Route path="/contacto" element={<Contacto />} />
                  <Route path="/categorias" element={<Categorias />} />
                  <Route path="/favoritos" element={<Favoritos />} />
                  
                  {/* RUTAS DEL EMPLEADO Y ADMIN (El dashboard ya controla las pestañas por dentro) */}
                  <Route path="/empleado" element={<DashboardEmpleado />} />
                  <Route path="/intranet" element={<DashboardIntranet />} />
                  
                  <Route path="/novedades" element={<SeccionesDinamicas />} />
                  <Route path="/mis-pedidos" element={<MisPedidos />} />
                  <Route path="/extranet" element={<AdminExtranet />} />
                </Routes>
                <Footer />
              </Router>
            </CartProvider>
          </AppearanceProvider>
        </FavoritesProvider>
      </AuthProvider>
    </MessageProvider>
  );
}

export default App;