
import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  DollarSign, 
  BarChart3, 
  Activity, 
  Settings, 
  UserCircle,
  Layers,
  Archive
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Clients from './pages/Clients';
import Products from './pages/Products';
import Supplies from './pages/Supplies';
import Financial from './pages/Financial';
import ArchivePage from './pages/Archive';
import SystemSettingsPage from './pages/SystemSettings';

const SidebarItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={18} />
      <span>{label.toUpperCase()}</span>
    </Link>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-[#2b2d42] text-white flex flex-col fixed h-full shadow-xl">
          <div className="p-6 border-b border-slate-700">
            <h1 className="text-xl font-bold tracking-tight">GRÁFICO</h1>
          </div>
          
          <nav className="flex-1 mt-4">
            <SidebarItem to="/" icon={LayoutDashboard} label="Painel" />
            <SidebarItem to="/pedidos" icon={ShoppingCart} label="Pedidos" />
            <SidebarItem to="/clientes" icon={Users} label="Clientes" />
            <SidebarItem to="/produtos" icon={Package} label="Produtos" />
            <SidebarItem to="/insumos" icon={Layers} label="Insumos" />
            <SidebarItem to="/financeiro" icon={DollarSign} label="Financeiros" />
            <SidebarItem to="/arquivo" icon={Archive} label="Arquivo Morto" />
            
            <div className="mt-8 border-t border-slate-700 pt-4">
              <SidebarItem to="/config-sistema" icon={Settings} label="Configuração do Sistema" />
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pedidos" element={<Orders />} />
            <Route path="/clientes" element={<Clients />} />
            <Route path="/produtos" element={<Products />} />
            <Route path="/insumos" element={<Supplies />} />
            <Route path="/financeiro" element={<Financial />} />
            <Route path="/arquivo" element={<ArchivePage />} />
            <Route path="/config-sistema" element={<SystemSettingsPage />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
