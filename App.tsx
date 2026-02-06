
import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  DollarSign, 
  Settings, 
  Archive,
  Calendar as CalendarIcon,
  Layers,
  CalendarDays,
  Filter
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Clients from './pages/Clients';
import Products from './pages/Products';
import Supplies from './pages/Supplies';
import Financial from './pages/Financial';
import ArchivePage from './pages/Archive';
import CalendarPage from './pages/Calendar';
import SystemSettingsPage from './pages/SystemSettings';

// Contexto para o filtro de data global
interface DateFilterContextType {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
}

export const DateFilterContext = createContext<DateFilterContextType>({
  startDate: '',
  endDate: '',
  setStartDate: () => {},
  setEndDate: () => {},
});

export const useDateFilter = () => useContext(DateFilterContext);

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

const AppContent = () => {
  const { startDate, setStartDate, endDate, setEndDate } = useDateFilter();
  const location = useLocation();

  // Esconder filtro global em páginas que não fazem sentido (ex: Configurações ou Cadastro de Produtos)
  const showGlobalFilter = ['/', '/pedidos', '/financeiro'].includes(location.pathname);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2b2d42] text-white flex flex-col fixed h-full shadow-xl z-20">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-tight">GRÁFICA PRO</h1>
        </div>
        
        <nav className="flex-1 mt-4">
          <SidebarItem to="/" icon={LayoutDashboard} label="Painel" />
          <SidebarItem to="/pedidos" icon={ShoppingCart} label="Pedidos" />
          <SidebarItem to="/calendario" icon={CalendarIcon} label="Calendário" />
          <SidebarItem to="/clientes" icon={Users} label="Clientes" />
          <SidebarItem to="/produtos" icon={Package} label="Produtos" />
          <SidebarItem to="/insumos" icon={Layers} label="Insumos" />
          <SidebarItem to="/financeiro" icon={DollarSign} label="Financeiro" />
          <SidebarItem to="/arquivo" icon={Archive} label="Arquivo Morto" />
          
          <div className="mt-8 border-t border-slate-700 pt-4">
            <SidebarItem to="/config-sistema" icon={Settings} label="Configurações" />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Global Top Bar com Filtro */}
        <header className="bg-white border-b border-gray-200 h-16 sticky top-0 z-10 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
              {location.pathname === '/' ? 'Dashboard' : 
               location.pathname === '/pedidos' ? 'Pedidos' : 
               location.pathname === '/financeiro' ? 'Fluxo Financeiro' : ''}
            </h2>
          </div>

          {showGlobalFilter && (
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2 px-3">
                <CalendarDays size={14} className="text-blue-600" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Filtrar Período</span>
              </div>
              <div className="flex items-center gap-1">
                <input 
                  type="date" 
                  className="text-[10px] font-bold text-slate-700 bg-white px-2 py-1.5 rounded-lg outline-none border border-gray-200 focus:border-blue-400 transition-colors" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)}
                />
                <span className="text-gray-300 text-xs">até</span>
                <input 
                  type="date" 
                  className="text-[10px] font-bold text-slate-700 bg-white px-2 py-1.5 rounded-lg outline-none border border-gray-200 focus:border-blue-400 transition-colors" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
              <div className="px-2">
                <button 
                  onClick={() => {
                    const now = new Date();
                    setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
                    setEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]);
                  }}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Resetar para mês atual"
                >
                  <Filter size={14} />
                </button>
              </div>
            </div>
          )}
        </header>

        <div className="p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pedidos" element={<Orders />} />
            <Route path="/calendario" element={<CalendarPage />} />
            <Route path="/clientes" element={<Clients />} />
            <Route path="/produtos" element={<Products />} />
            <Route path="/insumos" element={<Supplies />} />
            <Route path="/financeiro" element={<Financial />} />
            <Route path="/arquivo" element={<ArchivePage />} />
            <Route path="/config-sistema" element={<SystemSettingsPage />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  return (
    <DateFilterContext.Provider value={{ startDate, endDate, setStartDate, setEndDate }}>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </DateFilterContext.Provider>
  );
};

export default App;
