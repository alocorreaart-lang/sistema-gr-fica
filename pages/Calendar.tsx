
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Package, Calendar as CalendarIcon, 
  Clock, User, X, ShoppingCart, CreditCard, Banknote, Timer, 
  ListOrdered, CheckCircle2, DollarSign 
} from 'lucide-react';
import { Order, OrderStatus, FinancialEntry } from '../types';

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = localStorage.getItem('quickprint_orders');
    if (stored) {
      setOrders(JSON.parse(stored));
    }
  }, []);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getOrdersForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return orders.filter(o => !o.archived && o.deliveryDate === dateStr);
  };

  const selectedOrders = orders.filter(o => !o.archived && o.deliveryDate === selectedDate);

  const statusColors: any = {
    [OrderStatus.OPEN]: 'bg-blue-500',
    [OrderStatus.ART]: 'bg-orange-500',
    [OrderStatus.PRODUCTION]: 'bg-indigo-600',
    [OrderStatus.SHIPPING]: 'bg-amber-600',
    [OrderStatus.COMPLETED]: 'bg-green-500'
  };

  const handleOpenDetails = (order: Order) => {
    setViewingOrder(order);
    setIsDetailsOpen(true);
  };

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('quickprint_orders', JSON.stringify(newOrders));
  };

  const handlePayInstallment = (orderId: string, index: number, value: number) => {
    const method = (paymentMethods[`${orderId}-${index}`] || 'PIX') as any;
    
    // Fetch default account ID from settings
    const storedSettings = localStorage.getItem('quickprint_settings');
    const defaultAccountId = storedSettings ? (JSON.parse(storedSettings).accounts?.[0]?.id || 'default-cash') : 'default-cash';

    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        const paidIndices = o.paidInstallmentIndices || [];
        if (paidIndices.includes(index)) return o;

        const newEntry = o.entry + value;
        const isPaid = (o.total - newEntry) <= 0.01;
        const archived = o.status === OrderStatus.COMPLETED && isPaid;

        const updatedOrder = { 
          ...o, 
          entry: newEntry, 
          paidInstallmentIndices: [...paidIndices, index],
          archived 
        };
        
        if (viewingOrder && viewingOrder.id === orderId) {
          setViewingOrder(updatedOrder);
        }

        const storedFinancial = localStorage.getItem('quickprint_financial');
        const financial: FinancialEntry[] = storedFinancial ? JSON.parse(storedFinancial) : [];
        // Fix missing accountId property
        const newFinancialEntry: FinancialEntry = {
          id: Math.random().toString(36).substr(2, 9),
          description: `Parc. ${index} quitada: ${o.clientName}`,
          amount: value,
          type: 'INCOME',
          date: new Date().toISOString().split('T')[0],
          category: 'Vendas',
          method: method,
          accountId: defaultAccountId,
          status: 'PAID'
        };
        localStorage.setItem('quickprint_financial', JSON.stringify([newFinancialEntry, ...financial]));

        return updatedOrder;
      }
      return o;
    });
    saveOrders(updatedOrders);
  };

  const getInstallmentSchedule = (order: Order) => {
    if (!order.firstInstallmentDate || !order.installmentsCount || !order.installmentIntervalDays) return [];
    
    const schedule = [];
    const startDate = new Date(order.firstInstallmentDate + 'T12:00:00');
    const paidIndices = order.paidInstallmentIndices || [];
    
    for (let i = 0; i < order.installmentsCount; i++) {
      const nextDate = new Date(startDate);
      nextDate.setDate(startDate.getDate() + (i * order.installmentIntervalDays));
      schedule.push({
        index: i + 1,
        date: nextDate.toLocaleDateString('pt-BR'),
        value: order.installmentValue || 0,
        paid: paidIndices.includes(i + 1)
      });
    }
    return schedule;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500 pb-10">
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <CalendarIcon className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
              {monthNames[month]} <span className="text-blue-600">{year}</span>
            </h2>
          </div>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-colors shadow-sm"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 hover:bg-white rounded-lg border border-gray-200 text-xs font-bold uppercase tracking-widest transition-colors shadow-sm">Hoje</button>
            <button onClick={nextMonth} className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-colors shadow-sm"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-7 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="text-center py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-lg overflow-hidden shadow-inner">
            {days.map((day, idx) => {
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
              const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
              const isSelected = selectedDate === dateStr;
              const dayOrders = day ? getOrdersForDay(day) : [];

              return (
                <div 
                  key={idx} 
                  onClick={() => day && setSelectedDate(dateStr)}
                  className={`min-h-[110px] bg-white p-2 transition-all cursor-pointer relative group ${!day ? 'bg-gray-50/50' : 'hover:bg-blue-50/30'} ${isSelected ? 'ring-2 ring-blue-500 ring-inset z-10' : ''}`}
                >
                  {day && (
                    <>
                      <span className={`text-sm font-bold ${isToday ? 'bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full shadow-md' : 'text-gray-400'}`}>
                        {day}
                      </span>
                      <div className="mt-2 space-y-1">
                        {dayOrders.slice(0, 3).map(o => (
                          <div 
                            key={o.id} 
                            onClick={(e) => { e.stopPropagation(); handleOpenDetails(o); }}
                            className="flex items-center gap-1.5 overflow-hidden p-1 rounded hover:bg-white/80 transition-colors border border-transparent hover:border-blue-100"
                          >
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColors[o.status] || 'bg-gray-400'}`}></div>
                            <span className="text-[9px] font-bold text-gray-700 truncate">{o.clientName}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-96 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Entregas do Dia</h3>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg uppercase tracking-wider">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')}
            </span>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {selectedOrders.length > 0 ? selectedOrders.map(order => (
              <div 
                key={order.id} 
                onClick={() => handleOpenDetails(order)}
                className="p-4 border border-gray-100 rounded-xl hover:shadow-lg transition-all group cursor-pointer relative bg-white border-l-4" 
                style={{ borderColor: (statusColors[order.status] || 'bg-gray-400').replace('bg-', '') }}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">#PED{order.orderNumber}</span>
                  <div className={`px-2 py-0.5 rounded text-[8px] font-black text-white uppercase ${statusColors[order.status]}`}>
                    {order.status}
                  </div>
                </div>
                <h4 className="font-bold text-slate-800 leading-tight mb-1 group-hover:text-blue-600 transition-colors">{order.clientName}</h4>
                <p className="text-xs text-slate-400 mb-3 truncate font-medium">{order.productName}</p>
                
                <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                   <div className="flex items-center gap-1.5 text-slate-500">
                     <Clock size={12} className="text-blue-500" />
                     <span className="text-[9px] font-black uppercase tracking-wider">Ver Detalhes</span>
                   </div>
                   <div className="text-right">
                     <p className="text-[9px] text-gray-400 font-bold uppercase">Saldo</p>
                     <p className={`text-sm font-black ${(order.total - order.entry) > 0.01 ? 'text-red-500' : 'text-green-600'}`}>
                       R$ {(order.total - order.entry).toFixed(2)}
                     </p>
                   </div>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center space-y-3">
                <div className="inline-flex p-3 bg-gray-50 text-gray-300 rounded-full">
                  <Package size={32} />
                </div>
                <p className="text-sm text-gray-400 italic">Nenhuma entrega para este dia.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-xl">
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-50 border-b border-white/10 pb-2">Legenda de Status</h4>
          <div className="space-y-4">
            {Object.entries(statusColors).map(([status, colorClass]: any) => (
              <div key={status} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shadow-lg ${colorClass}`}></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">{status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL DE VISUALIZAÇÃO IGUAL À IMAGEM */}
      {isDetailsOpen && viewingOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-in zoom-in duration-200">
            {/* Cabeçalho do Modal */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-white">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#ff7d1a] rounded-xl text-white">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">PEDIDO #{viewingOrder.orderNumber}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{viewingOrder.status}</p>
                </div>
              </div>
              <button onClick={() => setIsDetailsOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Seção Cliente e Datas */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">CLIENTE</p>
                  <p className="text-xl font-bold text-slate-800">{viewingOrder.clientName}</p>
                  <div className="flex items-center gap-2 mt-2 text-blue-600 cursor-pointer hover:underline">
                    <User size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">ID: {viewingOrder.clientId === 'manual' ? 'MANUAL' : viewingOrder.clientId}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-right">DATAS</p>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800 uppercase">PEDIDO: <span className="font-black">{viewingOrder.date}</span></p>
                    <p className="text-xs font-black text-blue-600 uppercase">ENTREGA: <span>{viewingOrder.deliveryDate ? new Date(viewingOrder.deliveryDate + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}</span></p>
                  </div>
                </div>
              </div>

              {/* Resumo Financeiro */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800">
                  <Banknote size={16} className="text-blue-600" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">RESUMO FINANCEIRO</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-8 rounded-2xl border border-gray-100">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ENTRADA / SINAL</p>
                      <p className="text-2xl font-black text-green-600">R$ {viewingOrder.entry.toFixed(2)}</p>
                    </div>
                    {viewingOrder.installmentsCount && viewingOrder.installmentsCount > 1 && (
                      <div className="pt-4 border-t border-gray-200 space-y-2">
                        <div className="flex items-center gap-2 text-blue-700">
                          <CreditCard size={16} />
                          <p className="text-sm font-black">{viewingOrder.installmentsCount}x de R$ {(viewingOrder.installmentValue || 0).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Timer size={14} />
                          <p className="text-[10px] font-bold uppercase tracking-tighter">INTERVALO: {viewingOrder.installmentIntervalDays} DIAS</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right flex flex-col justify-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">VALOR TOTAL DO PEDIDO</p>
                    <p className="text-5xl font-black text-[#2b59c3]">R$ {viewingOrder.total.toFixed(2)}</p>
                    <p className="text-[10px] font-black text-red-500 uppercase mt-4">Saldo Restante: R$ {(viewingOrder.total - viewingOrder.entry).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Cronograma de Vencimentos */}
              {viewingOrder.installmentsCount && viewingOrder.installmentsCount > 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-800">
                    <ListOrdered size={16} className="text-blue-600" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">CRONOGRAMA DE VENCIMENTOS</h4>
                  </div>
                  <div className="space-y-3">
                    {getInstallmentSchedule(viewingOrder).map((inst) => (
                      <div key={inst.index} className={`flex items-center justify-between p-4 bg-white border rounded-2xl shadow-sm transition-all ${inst.paid ? 'border-green-100 bg-green-50/20' : 'border-gray-100 hover:border-blue-100'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${inst.paid ? 'bg-green-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                            {inst.paid ? <CheckCircle2 size={20} /> : inst.index}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">VENCIMENTO DA PARCELA</p>
                            <p className="text-sm font-bold text-slate-700">{inst.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">VALOR</p>
                            <p className="text-sm font-black text-blue-700">R$ {inst.value.toFixed(2)}</p>
                          </div>
                          {!inst.paid ? (
                            <button 
                              onClick={() => handlePayInstallment(viewingOrder.id, inst.index, inst.value)} 
                              className="px-6 py-2 bg-[#16a34a] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 shadow-md transition-all active:scale-95 flex items-center gap-2"
                            >
                              <DollarSign size={14} /> QUITAR
                            </button>
                          ) : (
                            <div className="px-6 py-2 bg-white border border-green-200 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                              <CheckCircle2 size={14} /> PAGO
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-gray-100 flex justify-center bg-gray-50/30">
              <button 
                onClick={() => setIsDetailsOpen(false)} 
                className="w-full max-w-sm py-4 bg-[#2b2d42] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all active:scale-95"
              >
                FECHAR VISUALIZAÇÃO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
