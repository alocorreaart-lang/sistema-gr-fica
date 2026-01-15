
import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, CreditCard, TrendingUp, CircleDollarSign, 
  Palette, Hammer, Truck, ArrowRightCircle, CheckCircle2,
  Banknote, X, Save
} from 'lucide-react';
import { Order, OrderStatus, FinancialEntry } from '../types';

const MetricCard = ({ title, value, color, icon: Icon }: { title: string, value: string, color: string, icon: any }) => {
  const colorMap: any = {
    blue: 'border-blue-500 text-blue-600 bg-white shadow-sm border-2',
    red: 'border-red-400 text-red-500 bg-white shadow-sm border-2',
    green: 'border-green-500 text-green-600 bg-white shadow-sm border-2',
    yellow: 'border-yellow-400 text-yellow-600 bg-white shadow-sm border-2'
  };

  return (
    <div className={`p-6 rounded-lg flex flex-col items-center justify-center text-center ${colorMap[color]}`}>
      <Icon className="mb-2" size={32} />
      <span className="text-xs font-bold text-gray-500 mb-1">{title.toUpperCase()}</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
};

interface OrderTableProps {
  title: string;
  icon: any;
  orders: Order[];
  iconColor: string;
  onAdvance: (id: string) => void;
  onPay: (order: Order) => void;
}

const OrderTable = ({ title, icon: Icon, orders, iconColor, onAdvance, onPay }: OrderTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center gap-2">
        <Icon className={iconColor} size={20} />
        <h3 className="text-sm font-bold text-gray-700">{title.toUpperCase()}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] text-gray-400 border-b border-gray-100 uppercase font-black tracking-widest">
              <th className="px-4 py-3">PEDIDO</th>
              <th className="px-4 py-3">CLIENTE</th>
              <th className="px-4 py-3 text-right">VALOR</th>
              <th className="px-4 py-3 text-right">PAGO</th>
              <th className="px-4 py-3 text-right">RESTANTE</th>
              <th className="px-4 py-3 text-center">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length > 0 ? orders.map((order) => {
              const pendingValue = order.total - order.entry;
              const isPaid = pendingValue <= 0.01;
              return (
                <tr key={order.id} className="text-sm hover:bg-gray-50 group">
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{order.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-800 font-bold truncate max-w-[120px]">{order.clientName}</td>
                  <td className="px-4 py-3 text-right text-gray-600 font-medium">
                    R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600 font-bold">
                    R$ {order.entry.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`px-4 py-3 text-right font-black ${!isPaid ? 'text-red-500' : 'text-green-600'}`}>
                    R$ {pendingValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {!isPaid && (
                        <button 
                          onClick={() => onPay(order)}
                          className="text-green-500 hover:text-green-700 transition-transform hover:scale-110 active:scale-90"
                          title="Pagamento Parcial"
                        >
                          <Banknote size={20} />
                        </button>
                      )}
                      {order.status !== OrderStatus.COMPLETED ? (
                        <button 
                          onClick={() => onAdvance(order.id)}
                          className="text-blue-500 hover:text-blue-700 transition-transform hover:scale-110 active:scale-90"
                          title="Avançar Etapa"
                        >
                          <ArrowRightCircle size={22} />
                        </button>
                      ) : (
                        <span className="text-green-500"><CheckCircle2 size={20} /></span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 italic text-xs uppercase tracking-widest">Nenhum pedido nesta fase</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'Dinheiro',
    account: 'Caixa',
    observations: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem('quickprint_orders');
    if (stored) {
      setOrders(JSON.parse(stored));
    }
  }, []);

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('quickprint_orders', JSON.stringify(newOrders));
  };

  const handleAdvanceStatus = (id: string) => {
    const updated = orders.map(order => {
      if (order.id === id) {
        let nextStatus = order.status;
        switch (order.status) {
          case OrderStatus.OPEN: nextStatus = OrderStatus.ART; break;
          case OrderStatus.ART: nextStatus = OrderStatus.PRODUCTION; break;
          case OrderStatus.PRODUCTION: nextStatus = OrderStatus.SHIPPING; break;
          case OrderStatus.SHIPPING: nextStatus = OrderStatus.COMPLETED; break;
        }
        
        // Auto-archive check: Completed and Paid
        const isPaid = (order.total - order.entry) <= 0.01;
        const archived = nextStatus === OrderStatus.COMPLETED && isPaid;

        return { ...order, status: nextStatus, archived };
      }
      return order;
    });
    saveOrders(updated);
  };

  const handleOpenPaymentModal = (order: Order) => {
    setActiveOrder(order);
    setPaymentData({
      amount: '',
      method: 'Dinheiro',
      account: 'Caixa',
      observations: ''
    });
    setIsPaymentModalOpen(true);
  };

  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;

    const payAmount = parseFloat(paymentData.amount) || 0;
    const remaining = activeOrder.total - activeOrder.entry;

    if (payAmount <= 0) {
      alert("Informe um valor válido para o pagamento.");
      return;
    }

    if (payAmount > remaining + 0.01) {
      alert("O valor do pagamento não pode ser maior que o saldo restante.");
      return;
    }

    // Update Order with auto-archive logic
    const updatedOrders = orders.map(o => {
      if (o.id === activeOrder.id) {
        const newEntry = o.entry + payAmount;
        const isPaid = (o.total - newEntry) <= 0.01;
        const archived = o.status === OrderStatus.COMPLETED && isPaid;
        return { ...o, entry: newEntry, archived };
      }
      return o;
    });
    saveOrders(updatedOrders);

    // Update Financial
    const storedFinancial = localStorage.getItem('quickprint_financial') || '[]';
    const financial: FinancialEntry[] = JSON.parse(storedFinancial);
    const newEntry: FinancialEntry = {
      id: Math.random().toString(36).substr(2, 9),
      description: `Pagamento: ${activeOrder.clientName}`,
      amount: payAmount,
      type: 'INCOME',
      date: new Date().toISOString().split('T')[0],
      category: 'Vendas'
    };
    localStorage.setItem('quickprint_financial', JSON.stringify([newEntry, ...financial]));

    setIsPaymentModalOpen(false);
  };

  const activeOrdersList = orders.filter(o => !o.archived);

  // Simplified stats for dashboard cards
  const stats = {
    totalOrders: activeOrdersList.reduce((acc, o) => acc + o.total, 0),
    totalExpenses: 712.20,
    totalProfit: activeOrdersList.reduce((acc, o) => acc + o.total, 0) - 712.20,
    accountBalance: activeOrdersList.reduce((acc, o) => acc + o.entry, 0)
  };

  const getOrdersByStatus = (status: OrderStatus) => activeOrdersList.filter(o => o.status === status);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Faturamento Atual</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Controle de Produção e Fluxo de Caixa</p>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Valor Pedidos Ativos" value={`R$ ${stats.totalOrders.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} color="blue" icon={ShoppingCart} />
        <MetricCard title="Despesas Mês" value={`R$ ${stats.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} color="red" icon={CreditCard} />
        <MetricCard title="Lucro Bruto" value={`R$ ${stats.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} color="green" icon={TrendingUp} />
        <MetricCard title="Entradas Totais" value={`R$ ${stats.accountBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} color="yellow" icon={CircleDollarSign} />
      </div>

      {/* Order Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <OrderTable 
          title="Pedidos em Aberto" 
          icon={ShoppingCart} 
          iconColor="text-blue-500" 
          orders={getOrdersByStatus(OrderStatus.OPEN)} 
          onAdvance={handleAdvanceStatus}
          onPay={handleOpenPaymentModal}
        />
        <OrderTable 
          title="Criando Arte" 
          icon={Palette} 
          iconColor="text-orange-500" 
          orders={getOrdersByStatus(OrderStatus.ART)} 
          onAdvance={handleAdvanceStatus}
          onPay={handleOpenPaymentModal}
        />
        <OrderTable 
          title="Pedidos em Produção" 
          icon={Hammer} 
          iconColor="text-blue-600" 
          orders={getOrdersByStatus(OrderStatus.PRODUCTION)} 
          onAdvance={handleAdvanceStatus}
          onPay={handleOpenPaymentModal}
        />
        <OrderTable 
          title="Pedidos em Transporte" 
          icon={Truck} 
          iconColor="text-orange-600" 
          orders={getOrdersByStatus(OrderStatus.SHIPPING)} 
          onAdvance={handleAdvanceStatus}
          onPay={handleOpenPaymentModal}
        />
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && activeOrder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 pb-0 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Pagamento Rápido</h3>
                <p className="text-sm text-slate-400 font-medium">Cliente: {activeOrder.clientName}</p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleRegisterPayment} className="p-6 space-y-6">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Valor Total:</span>
                  <span className="font-bold text-slate-800">R$ {activeOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Saldo Devedor:</span>
                  <span className="font-black text-red-500 text-lg">R$ {(activeOrder.total - activeOrder.entry).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Valor a Pagar *</label>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500/20 text-lg font-medium"
                  value={paymentData.amount}
                  onChange={e => setPaymentData({...paymentData, amount: e.target.value})}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Método</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none"
                    value={paymentData.method}
                    onChange={e => setPaymentData({...paymentData, method: e.target.value})}
                  >
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Pix">Pix</option>
                    <option value="Cartão">Cartão</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Conta</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none"
                    value={paymentData.account}
                    onChange={e => setPaymentData({...paymentData, account: e.target.value})}
                  >
                    <option value="Caixa">Caixa</option>
                    <option value="Banco">Banco</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsPaymentModalOpen(false)} 
                  className="flex-1 py-3 border border-slate-200 rounded-lg font-bold text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-[1.5] py-3 bg-green-600 text-white rounded-lg font-bold text-sm shadow-lg flex items-center justify-center gap-2 hover:bg-green-700 active:scale-95 transition-all"
                >
                  <Save size={18} />
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
