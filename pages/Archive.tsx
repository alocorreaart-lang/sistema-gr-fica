
import React, { useState, useEffect } from 'react';
import { 
  Search, Archive, RotateCcw, Eye, FileText, Trash2, X, 
  ShoppingCart, Printer, ClipboardList, Phone, List, Landmark,
  Calendar, CheckCircle2, DollarSign
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { generatePDF } from '../pdfService';

const ArchivePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [archivedOrders, setArchivedOrders] = useState<Order[]>([]);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const loadArchived = () => {
    const stored = localStorage.getItem('quickprint_orders');
    if (stored) {
      const allOrders: Order[] = JSON.parse(stored);
      setArchivedOrders(allOrders.filter(o => o.archived === true));
    }
  };

  useEffect(() => {
    loadArchived();
  }, []);

  const handleRestore = (id: string) => {
    if (confirm('Deseja restaurar este pedido para a lista ativa?')) {
      const stored = localStorage.getItem('quickprint_orders');
      if (stored) {
        const allOrders: Order[] = JSON.parse(stored);
        const updated = allOrders.map(o => o.id === id ? { ...o, archived: false } : o);
        localStorage.setItem('quickprint_orders', JSON.stringify(updated));
        loadArchived();
      }
    }
  };

  const handleDeletePermanent = (id: string) => {
    if (confirm('ATENÇÃO: Esta ação excluirá o pedido permanentemente do banco de dados. Confirmar?')) {
      const stored = localStorage.getItem('quickprint_orders');
      if (stored) {
        const allOrders: Order[] = JSON.parse(stored);
        const updated = allOrders.filter(o => o.id !== id);
        localStorage.setItem('quickprint_orders', JSON.stringify(updated));
        loadArchived();
      }
    }
  };

  const handleOpenDetails = (order: Order) => {
    setViewingOrder(order);
    setIsDetailsOpen(true);
  };

  const filtered = archivedOrders.filter(o => 
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.orderNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-600 text-white rounded-lg shadow-lg">
            <Archive size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Arquivo Morto</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Histórico de pedidos finalizados e quitados</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar no histórico por cliente ou número do pedido..." 
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:ring-4 focus:ring-slate-500/10 transition-all font-medium"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-gray-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">Pedido</th>
                <th className="px-6 py-5">Data Finalização</th>
                <th className="px-6 py-5">Cliente</th>
                <th className="px-6 py-5 text-right">Valor Total</th>
                <th className="px-6 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-5 font-mono text-xs text-slate-400 font-bold">#{order.orderNumber}</td>
                  <td className="px-6 py-5 text-xs text-slate-500 font-bold">{order.deliveryDate ? new Date(order.deliveryDate + 'T12:00:00').toLocaleDateString('pt-BR') : order.date}</td>
                  <td className="px-6 py-5">
                    <span className="font-bold text-slate-700 uppercase text-xs">{order.clientName}</span>
                  </td>
                  <td className="px-6 py-5 text-right font-black text-slate-600 text-xs">
                    R$ {order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-1">
                      <button 
                        title="Visualizar Detalhes"
                        onClick={() => handleOpenDetails(order)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <FileText size={18} />
                      </button>
                      <button 
                        title="Restaurar Pedido"
                        onClick={() => handleRestore(order.id)} 
                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                      >
                        <RotateCcw size={18} />
                      </button>
                      <button 
                        title="Excluir Definitivamente"
                        onClick={() => handleDeletePermanent(order.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <Archive size={48} className="text-slate-400" />
                      <p className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] italic">O arquivo morto está vazio.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE VISUALIZAÇÃO (Igual ao de Pedidos/Dashboard) */}
      {isDetailsOpen && viewingOrder && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#f8fafc] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300 relative flex flex-col max-h-[95vh] border border-gray-200">
            <div className="px-8 py-6 bg-white border-b border-gray-100 flex justify-between items-start sticky top-0 z-10">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <Archive size={16} className="text-slate-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedido Arquivado</span>
                </div>
                <h3 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight">{viewingOrder.clientName}</h3>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">PEDIDO Nº</p>
                  <p className="text-sm font-mono font-black text-slate-500">#{viewingOrder.orderNumber}</p>
                </div>
                <span className="bg-slate-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-slate-500 shadow-lg shadow-slate-100">
                  {viewingOrder.status}
                </span>
              </div>
              <button onClick={() => setIsDetailsOpen(false)} className="absolute top-4 right-4 text-gray-300 p-2 hover:bg-slate-50 rounded-full transition-all"><X size={28} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              <div className="bg-green-50 border border-green-100 rounded-3xl p-6 flex justify-between items-center shadow-inner">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">SITUAÇÃO FINANCEIRA</p>
                  <h4 className="text-2xl font-black text-green-700 uppercase">PEDIDO QUITADO</h4>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">VALOR TOTAL PAGO</p>
                  <p className="text-2xl font-black text-green-700">R$ {viewingOrder.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-slate-800 mb-2">
                  <List size={18} className="text-blue-600" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">ITENS DESCRITIVOS</h4>
                </div>
                <div className="space-y-3">
                  {viewingOrder.items?.map((item: any) => (
                    <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex justify-between items-center group hover:border-blue-100 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-700 uppercase">{item.serviceName}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Qtd: {item.quantity} • Unit: R$ {item.price.toFixed(2)}</span>
                      </div>
                      <span className="text-sm font-black text-blue-600">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                <button 
                  onClick={() => generatePDF('PEDIDO', viewingOrder, 'print')}
                  className="py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-100 flex items-center justify-center gap-2 hover:bg-orange-700 transition-all active:scale-95"
                >
                  <Printer size={18} /> Pedido Financeiro
                </button>
                <button 
                  onClick={() => generatePDF('OS', viewingOrder, 'print', false)}
                  className="py-4 bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center justify-center gap-2 hover:bg-slate-900 transition-all active:scale-95"
                >
                  <ClipboardList size={18} /> OS de Produção
                </button>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => handleRestore(viewingOrder.id)}
                  className="flex-1 py-4 bg-green-50 text-green-600 border border-green-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} /> Restaurar para Ativos
                </button>
                <button 
                  onClick={() => setIsDetailsOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchivePage;
