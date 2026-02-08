
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown
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

// Helper para formatar data local YYYY-MM-DD
export const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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

  const showGlobalFilter = ['/', '/pedidos', '/financeiro'].includes(location.pathname);

  const currentMonthName = useMemo(() => {
    const date = new Date(startDate + 'T12:00:00');
    const formatted = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    // Ajuste para deixar apenas a primeira letra em maiúscula (ex: Fevereiro de 2026)
    // Isso evita que a classe 'capitalize' do Tailwind transforme o 'de' em 'De'
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [startDate]);

  const handleMonthChange = (direction: number) => {
    const current = new Date(startDate + 'T12:00:00');
    const newDate = new Date(current.getFullYear(), current.getMonth() + direction, 1);
    
    const firstDay = getLocalDateString(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    const lastDay = getLocalDateString(new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0));
    
    setStartDate(firstDay);
    setEndDate(lastDay);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
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

      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="bg-white border-b border-gray-200 h-20 sticky top-0 z-10 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
              {location.pathname === '/' ? 'Dashboard' : 
               location.pathname === '/pedidos' ? 'Pedidos' : 
               location.pathname === '/financeiro' ? 'Fluxo Financeiro' : ''}
            </h2>
          </div>

          {showGlobalFilter && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
              <button 
                onClick={() => handleMonthChange(-1)}
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-[2rem] px-5 py-2.5 shadow-sm hover:shadow-md transition-shadow cursor-default">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <CalendarIcon size={20} />
                </div>
                <div className="flex flex-col pr-4">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Visualizando Mês</span>
                  <span className="text-sm font-black text-slate-700 leading-none">{currentMonthName}</span>
                </div>
                <div className="text-slate-300">
                  <ChevronDown size={18} />
                </div>
              </div>

              <button 
                onClick={() => handleMonthChange(1)}
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all active:scale-95"
              >
                <ChevronRight size={20} />
              </button>
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
  const firstDay = getLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1));
  const lastDay = getLocalDateString(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  
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
