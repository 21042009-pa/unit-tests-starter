import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Produtos from './pages/Produtos.jsx';
import Clientes from './pages/Clientes.jsx';
import Pedidos from './pages/Pedidos.jsx';

export default function App() {
  return (
    <>
      <nav>
        <span className="marca">Lanchonete</span>
        <NavLink to="/produtos">Produtos</NavLink>
        <NavLink to="/clientes">Clientes</NavLink>
        <NavLink to="/pedidos">Pedidos</NavLink>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/produtos" replace />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/pedidos" element={<Pedidos />} />
        </Routes>
      </main>
    </>
  );
}
