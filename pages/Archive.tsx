
import React, { useState, useEffect } from 'react';
import { Search, Archive, RotateCcw, Eye, FileText, Trash2 } from 'lucide-react';
import { Order, OrderStatus } from '../types';

const ArchivePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [archivedOrders, setArchivedOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Carregar pedidos marcados como arquivados do localStorage ou estado global
    const stored = localStorage.getItem('quickprint_orders');
    if (stored) {
      const allOrders: Order[] = JSON.parse(stored);
      setArchivedOrders(allOrders.filter(o => o.archived === true));
    }
  }, []);

  const handleRestore = (id: string) => {
    const stored = localStorage.getItem('quickprint_orders');
    if (stored) {
      const allOrders: Order[] = JSON.parse(stored);
      const updated = allOrders.map(o => o.id === id ? { ...o, archived: false } : o);
      localStorage.setItem('quickprint_orders', JSON.stringify(updated));
      setArchivedOrders(updated.filter(o => o.archived === true));
    }
  };

  const filtered = archivedOrders.filter(o => 
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.orderNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-600 text-white rounded-lg shadow-lg">
            <Archive size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Arquivo Morto</h2>
            <p className="text-xs text-gray-400 font-medium">Pedidos finalizados e quitados para consulta histórica</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar no histórico por cliente ou número do pedido..." 
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 outline-none focus:ring-2 focus:ring-slate-500/20"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-black text-gray-500 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Pedido</th>
              <th className="px-6 py-4">Data Original</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4 text-right">Valor Total</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(order => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-slate-400">#{order.orderNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                <td className="px-6 py-4">
                  <span className="font-bold text-gray-800">{order.clientName}</span>
                </td>
                <td className="px-6 py-4 text-right font-black text-slate-700">
                  R$ {order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button 
                      title="Restaurar Pedido"
                      onClick={() => handleRestore(order.id)} 
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <RotateCcw size={18} />
                    </button>
                    <button 
                      title="Visualizar"
                      className="p-2 text-slate-400 hover:text-slate-800 transition-colors"
                    >
                      <FileText size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic text-sm">
                  O arquivo morto está vazio.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArchivePage;
