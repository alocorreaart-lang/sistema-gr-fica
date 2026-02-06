
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, Palette, Hammer, Truck, CheckCircle2,
  Eye, DollarSign, ChevronDown, ChevronRight,
  Clock, AlertCircle, MessageSquare, X, Wallet, ShoppingBag, Plus, FileText, Printer, ClipboardList
} from 'lucide-react';
import { Order, OrderStatus, FinancialEntry, Account, PaymentMethod, SystemSettings, Client } from '../types';
import { generatePDF } from '../pdfService';
import { useDateFilter } from '../App';

const StatusCounter = ({ label, count, icon: Icon, colorClass }: { label: string, count: number, icon: any, colorClass: string }) => (
  <div className={`bg-white p-3 rounded-xl border-l-4 ${colorClass} shadow-sm flex items-center justify-between`}>
    <div className="flex flex-col">
      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</span>
      <span className="text-xl font-black text-slate-800 leading-none">{count}</span>
    </div>
    <div className={`p-1.5 rounded-lg opacity-20 ${colorClass.replace('border-l-', 'text-')}`}>
      <Icon size={18} />
    </div>
  </div>
);

const StatusCard = ({ label, value, variant }: { label: string, value: string, variant: 'green' | 'red' | 'blue' }) => {
  const variants = {
    green: 'bg-green-50/50 border-green-100 text-green-700',
    red: 'bg-red-50/50 border-red-100 text-red-700',
    blue: 'bg-blue-50/50 border-blue-100 text-blue-700'
  };

  return (
    <div className={`p-6 rounded-2xl shadow-sm border ${variants[variant]} flex-1`}>
      <span className="text-xs font-semibold text-slate-500 block mb-3">{label}</span>
      <p className="text-3xl font-black text-slate-900 leading-none">{value}</p>
    </div>
  );
};

interface OrderTableProps {
  title: string;
  icon: any;
  orders: Order[];
  colorTheme: string;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onView: (order: Order) => void;
  onQuickPay: (order: Order) => void;
  isSpecial?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const OrderColumn = ({ title, icon: Icon, orders, colorTheme, onStatusChange, onView, onQuickPay, isSpecial, isExpanded, onToggleExpand }: OrderTableProps) => {
  return (
    <div className={`flex flex-col h-full w-full ${isSpecial ? 'md:col-span-2' : ''}`}>
      {isSpecial ? (
        <div 
          onClick={onToggleExpand}
          className="bg-[#fffaf5] p-4 rounded-xl flex items-center justify-between border border-orange-100 shadow-sm mb-2 cursor-pointer hover:bg-orange-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#ff7d1a] rounded-xl text-white shadow-lg shadow-orange-100">
              <DollarSign size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1e293b] uppercase tracking-tighter">{title}</h3>
              <p className="text-[10px] text-orange-600 font-bold uppercase">{orders.length} pedidos pendentes</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <Link to="/financeiro" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#ff7d1a] text-[#ff7d1a] rounded-lg text-[10px] font-bold hover:bg-orange-50 transition-colors">
                <Wallet size={14} /> Financeiro
              </Link>
            </div>
            {isExpanded ? <ChevronDown size={20} className="text-orange-500" /> : <ChevronRight size={20} className="text-orange-500" />}
          </div>
        </div>
      ) : (
        <div className={`p-4 rounded-t-xl flex items-center justify-between border-b-2 ${colorTheme} bg-white shadow-sm`}>
          <div className="flex items-center gap-2 min-w-0">
            <Icon size={16} className={colorTheme.replace('border-', 'text-').split(' ')[0]} />
            <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest truncate">{title}</h3>
          </div>
          <span className="bg-slate-200 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
            {orders.length}
          </span>
        </div>
      )}
      
      <div className={`bg-white/60 rounded-b-xl border border-t-0 border-gray-200 overflow-hidden shadow-sm transition-all duration-300 ${isSpecial && !isExpanded ? 'h-0 border-none overflow-hidden' : 'flex-1 flex flex-col'}`}>
        {isSpecial ? (
          <div className="overflow-x-auto p-2">
            <table className="w-full text-left border-collapse">
              <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Pedido</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Saldo</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.length > 0 ? orders.map((order) => {
                  const pendingValue = order.total - order.entry;
                  return (
                    <tr key={order.id} className="hover:bg-orange-50/30 transition-colors group">
                      <td className="px-4 py-3 font-mono text-[10px] text-gray-400 font-bold">#{order.orderNumber}</td>
                      <td className="px-4 py-3 text-xs font-black text-slate-700 uppercase">{order.clientName}</td>
                      <td className="px-4 py-3 text-right text-xs text-gray-500">R$ {order.total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-xs font-black text-red-500">R$ {pendingValue.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">{order.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => onView(order)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"><Eye size={14} /></button>
                          <button onClick={() => generatePDF('OS', order, 'print', false)} className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg" title="Imprimir OS Produção"><ClipboardList size={14} /></button>
                          <button onClick={() => generatePDF('PEDIDO', order, 'print')} className="p-1.5 text-slate-400 hover:text-orange-600 rounded-lg"><Printer size={14} /></button>
                          <button onClick={() => onQuickPay(order)} className="p-1.5 text-slate-400 hover:text-green-600 rounded-lg"><DollarSign size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[10px] text-gray-400 font-black uppercase tracking-widest opacity-50 italic">Nenhum recebimento pendente</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[400px] custom-scrollbar p-3 space-y-3">
            {orders.length > 0 ? orders.map((order) => {
              const pendingValue = order.total - order.entry;
              const isPaid = pendingValue <= 0.01;
              return (
                <div key={order.id} className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all group animate-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-start mb-2 gap-1">
                    <span className="text-[9px] font-mono text-gray-400 font-bold uppercase tracking-tighter">Pedido #{order.orderNumber}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg whitespace-nowrap ${isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {isPaid ? 'PAGO' : `FALTA R$ ${pendingValue.toFixed(2)}`}
                    </span>
                  </div>
                  <p className="text-sm font-black text-slate-800 truncate leading-tight mb-3 uppercase tracking-tight">{order.clientName}</p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex gap-2">
                      <button onClick={() => onView(order)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Ver Detalhes">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => generatePDF('OS', order, 'print', false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all" title="Imprimir OS Produção">
                        <ClipboardList size={16} />
                      </button>
                      <button onClick={() => generatePDF('PEDIDO', order, 'save')} className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Baixar Pedido PDF">
                        <FileText size={16} />
                      </button>
                      <button onClick={() => generatePDF('PEDIDO', order, 'print')} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all" title="Imprimir Pedido">
                        <Printer size={16} />
                      </button>
                      {!isPaid && (
                        <button onClick={() => onQuickPay(order)} className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Registrar Pagamento">
                          <DollarSign size={16} />
                        </button>
                      )}
                    </div>
                    
                    <div className="relative">
                      <select 
                        className="appearance-none bg-slate-50 text-[10px] font-black uppercase text-blue-600 pl-3 pr-8 py-2 rounded-xl outline-none cursor-pointer hover:bg-blue-50 transition-colors border border-slate-100"
                        value={order.status}
                        onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                      >
                        {Object.values(OrderStatus).map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" />
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="py-8 text-center bg-white/30 rounded-xl border border-dashed border-gray-200">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest opacity-50 italic">Nenhum pedido nesta fase</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { startDate, endDate } = useDateFilter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [financialEntries, setFinancialEntries] = useState<FinancialEntry[]>([]);
  const [systemPaymentMethods, setSystemPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [isReceivablesExpanded, setIsReceivablesExpanded] = useState(false);

  const [quickPayment, setQuickPayment] = useState({ amount: 0, method: '', accountId: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    const loadData = () => {
      const storedOrders = localStorage.getItem('quickprint_orders');
      if (storedOrders) setOrders(JSON.parse(storedOrders));
      
      const storedFinancial = localStorage.getItem('quickprint_financial');
      if (storedFinancial) setFinancialEntries(JSON.parse(storedFinancial));
      
      const storedClients = localStorage.getItem('quickprint_clients');
      if (storedClients) setClients(JSON.parse(storedClients));
      
      const storedSettings = localStorage.getItem('quickprint_settings');
      if (storedSettings) {
        const settings: SystemSettings = JSON.parse(storedSettings);
        setAccounts(settings.accounts || []);
        setSystemPaymentMethods(settings.paymentMethods || []);
      }
    };
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [isDetailsOpen]);

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('quickprint_orders', JSON.stringify(newOrders));
  };

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    const updated = orders.map(order => {
      if (order.id === id) {
        const isPaid = (order.total - order.entry) <= 0.01;
        const archived = newStatus === OrderStatus.COMPLETED && isPaid;
        return { ...order, status: newStatus, archived };
      }
      return order;
    });
    saveOrders(updated);
  };

  const handleOpenDetails = (order: Order) => {
    setViewingOrder(order);
    const balanceValue = order.total - order.entry;
    setQuickPayment({ 
      amount: balanceValue > 0 ? balanceValue : 0, 
      method: systemPaymentMethods[0]?.name || 'PIX', 
      accountId: accounts[0]?.id || '', 
      date: new Date().toISOString().split('T')[0] 
    });
    setIsDetailsOpen(true);
  };

  const handleRegisterPayment = () => {
    if (!viewingOrder || quickPayment.amount <= 0) return;
    const newEntry = viewingOrder.entry + quickPayment.amount;
    const isPaid = (viewingOrder.total - newEntry) <= 0.01;
    
    const updatedOrders = orders.map(o => {
      if (o.id === viewingOrder.id) {
        const archived = o.status === OrderStatus.COMPLETED && isPaid;
        return { ...o, entry: newEntry, archived };
      }
      return o;
    });
    
    saveOrders(updatedOrders);
    
    const storedFinancial = localStorage.getItem('quickprint_financial');
    const financial: FinancialEntry[] = storedFinancial ? JSON.parse(storedFinancial) : [];
    const newFinEntry: FinancialEntry = {
      id: Math.random().toString(36).substr(2, 9),
      description: `Pagamento Pedido #${viewingOrder.orderNumber}`,
      amount: quickPayment.amount,
      type: 'INCOME',
      date: quickPayment.date,
      category: 'Vendas',
      method: quickPayment.method,
      accountId: quickPayment.accountId,
      status: 'PAID'
    };
    localStorage.setItem('quickprint_financial', JSON.stringify([newFinEntry, ...financial]));
    setFinancialEntries([newFinEntry, ...financial]);
    
    setIsDetailsOpen(false);
    alert('Pagamento registrado com sucesso!');
  };

  const sendWhatsApp = () => {
    if (!viewingOrder) return;
    const client = clients.find(c => c.id === viewingOrder.clientId);
    const phone = client?.phone.replace(/\D/g, '') || '';
    if (!phone) return alert('Telefone não encontrado.');
    const message = `Olá *${viewingOrder.clientName}*! Seu pedido *#${viewingOrder.orderNumber}* mudou de status para: *${viewingOrder.status}*. Valor pendente: R$ ${(viewingOrder.total - viewingOrder.entry).toFixed(2)}.`;
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const activeOrders = orders.filter(o => !o.archived);
  
  const filterByRange = (date: string) => {
    return date >= startDate && date <= endDate;
  };

  const totalInFlow = activeOrders
    .filter(o => filterByRange(o.date))
    .reduce((acc, o) => acc + o.total, 0);

  const totalReceivable = activeOrders
    .filter(o => filterByRange(o.date))
    .reduce((acc, o) => acc + (o.total - o.entry), 0);

  const receivableInRange = financialEntries
    .filter(e => e.type === 'INCOME' && e.status === 'PENDING' && filterByRange(e.date))
    .reduce((acc, e) => acc + e.amount, 0);

  const payableInRange = financialEntries
    .filter(e => e.type === 'EXPENSE' && e.status === 'PENDING' && filterByRange(e.date))
    .reduce((acc, e) => acc + e.amount, 0);

  const getOrdersByStatus = (status: OrderStatus) => activeOrders.filter(o => o.status === status);
  
  const openOrders = getOrdersByStatus(OrderStatus.OPEN);
  const artOrders = getOrdersByStatus(OrderStatus.ART);
  const prodOrders = getOrdersByStatus(OrderStatus.PRODUCTION);
  const shipOrders = getOrdersByStatus(OrderStatus.SHIPPING);
  const receivableOrders = activeOrders.filter(o => (o.total - o.entry) > 0.01);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard 
          label="A receber no período" 
          value={`R$ ${receivableInRange.toFixed(2)}`} 
          variant="green" 
        />
        <StatusCard 
          label="A pagar no período" 
          value={`R$ ${payableInRange.toFixed(2)}`} 
          variant="red" 
        />
        <StatusCard 
          label="Vendas do período" 
          value={`R$ ${totalInFlow.toFixed(2)}`} 
          variant="blue" 
        />
        <StatusCard 
          label="Saldo a receber" 
          value={`R$ ${totalReceivable.toFixed(2)}`} 
          variant="blue" 
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatusCounter label="Em Aberto" count={openOrders.length} icon={ShoppingCart} colorClass="border-l-blue-500" />
        <StatusCounter label="Criando Arte" count={artOrders.length} icon={Palette} colorClass="border-l-purple-500" />
        <StatusCounter label="Em Produção" count={prodOrders.length} icon={Hammer} colorClass="border-l-orange-500" />
        <StatusCounter label="Em Transporte" count={shipOrders.length} icon={Truck} colorClass="border-l-cyan-500" />
        <StatusCounter label="A Receber" count={receivableOrders.length} icon={AlertCircle} colorClass="border-l-red-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OrderColumn 
          title="PEDIDOS EM ABERTO" 
          icon={ShoppingCart} 
          colorTheme="border-blue-500" 
          orders={openOrders} 
          onStatusChange={handleStatusChange} 
          onView={handleOpenDetails} 
          onQuickPay={handleOpenDetails} 
        />
        <OrderColumn 
          title="CRIANDO ARTE" 
          icon={Palette} 
          colorTheme="border-purple-500" 
          orders={artOrders} 
          onStatusChange={handleStatusChange} 
          onView={handleOpenDetails} 
          onQuickPay={handleOpenDetails} 
        />
        <OrderColumn 
          title="EM PRODUÇÃO" 
          icon={Hammer} 
          colorTheme="border-orange-500" 
          orders={prodOrders} 
          onStatusChange={handleStatusChange} 
          onView={handleOpenDetails} 
          onQuickPay={handleOpenDetails} 
        />
        <OrderColumn 
          title="EM TRANSPORTE" 
          icon={Truck} 
          colorTheme="border-cyan-500" 
          orders={shipOrders} 
          onStatusChange={handleStatusChange} 
          onView={handleOpenDetails} 
          onQuickPay={handleOpenDetails} 
        />
        <OrderColumn 
          title="PEDIDOS A RECEBER" 
          icon={AlertCircle} 
          colorTheme="border-red-500" 
          orders={receivableOrders} 
          onStatusChange={handleStatusChange} 
          onView={handleOpenDetails} 
          onQuickPay={handleOpenDetails} 
          isSpecial={true}
          isExpanded={isReceivablesExpanded}
          onToggleExpand={() => setIsReceivablesExpanded(!isReceivablesExpanded)}
        />
      </div>

      {isDetailsOpen && viewingOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-slate-50/80">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-100">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">PEDIDO #{viewingOrder.orderNumber}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-blue-100">{viewingOrder.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => generatePDF('OS', viewingOrder, 'print', false)} className="p-3 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-colors border border-slate-200" title="Imprimir OS Produção">
                  <ClipboardList size={20} />
                </button>
                <button onClick={() => generatePDF('PEDIDO', viewingOrder, 'print')} className="p-3 bg-orange-50 text-orange-600 rounded-2xl hover:bg-orange-100 transition-colors border border-orange-100" title="Imprimir Pedido Financeiro">
                  <Printer size={20} />
                </button>
                <button onClick={() => generatePDF('PEDIDO', viewingOrder, 'save')} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors border border-blue-100" title="Baixar Pedido PDF">
                  <FileText size={20} />
                </button>
                <button onClick={sendWhatsApp} className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-colors border border-green-100" title="Avisar no WhatsApp">
                  <MessageSquare size={20} />
                </button>
                <button onClick={() => setIsDetailsOpen(false)} className="p-3 text-slate-400 hover:bg-white rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-8">
               <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CLIENTE</p>
                    <p className="text-2xl font-black text-slate-800 tracking-tight">{viewingOrder.clientName}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">VALOR TOTAL</p>
                    <p className="text-3xl font-black text-blue-700">R$ {viewingOrder.total.toFixed(2)}</p>
                  </div>
               </div>
               
               <div className="p-6 bg-slate-50 rounded-3xl border border-gray-100 grid grid-cols-2 gap-6 shadow-inner">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Valor Amortizado</span>
                    <p className="text-xl font-black text-green-600 mt-1">R$ {viewingOrder.entry.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Saldo Devedor</span>
                    <p className={`text-xl font-black mt-1 ${(viewingOrder.total - viewingOrder.entry) > 0.01 ? 'text-red-500' : 'text-green-600'}`}>
                      R$ {(viewingOrder.total - viewingOrder.entry).toFixed(2)}
                    </p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => generatePDF('OS', viewingOrder, 'print', false)} className="flex-1 py-3 px-4 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg flex items-center justify-center gap-2">
                    <ClipboardList size={16} /> IMPRIMIR OS PRODUÇÃO
                 </button>
                 <button onClick={() => generatePDF('PEDIDO', viewingOrder, 'print')} className="flex-1 py-3 px-4 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg flex items-center justify-center gap-2">
                    <Printer size={16} /> IMPRIMIR COMPROVANTE
                 </button>
               </div>

               {(viewingOrder.total - viewingOrder.entry) > 0.01 && (
                 <div className="space-y-5 pt-4 border-t border-gray-100 animate-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign size={16} className="text-blue-600" />
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Registrar Pagamento de Saldo</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Quantia Recebida</label>
                        <input 
                          type="number" step="0.01"
                          className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl outline-none font-black text-slate-700 focus:ring-4 focus:ring-blue-50 bg-slate-50/50"
                          value={quickPayment.amount}
                          onChange={e => setQuickPayment({...quickPayment, amount: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Meio de Pagamento</label>
                        <select 
                          className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl outline-none text-xs font-black bg-white focus:ring-4 focus:ring-blue-50"
                          value={quickPayment.method}
                          onChange={e => setQuickPayment({...quickPayment, method: e.target.value})}
                        >
                          {systemPaymentMethods.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <button 
                      onClick={handleRegisterPayment}
                      className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 flex items-center justify-center gap-3"
                    >
                      <CheckCircle2 size={18} /> Confirmar Recebimento e Atualizar
                    </button>
                 </div>
               )}

               <button 
                onClick={() => setIsDetailsOpen(false)} 
                className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
               >
                 Voltar para o Painel
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
