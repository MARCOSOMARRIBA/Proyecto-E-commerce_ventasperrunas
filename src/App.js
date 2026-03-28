import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; // <-- 1. IMPORTA EL CARRITO
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Perfil from './pages/Perfil';
import Carrito from './pages/Carrito'; // <-- 2. IMPORTA LA PÁGINA

function App() {
  return (
    <AuthProvider>
      <CartProvider> {/* <-- 3. ENVUELVE CON EL CARRITO */}
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/tienda/*" element={<h1 className="text-center mt-5 pt-5 pb-5">Catálogo</h1>} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/carrito" element={<Carrito />} /> {/* <-- 4. AGREGA LA RUTA */}
          </Routes>
          <Footer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;