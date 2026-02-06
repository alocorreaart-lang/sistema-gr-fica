
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Pencil, Trash2, X, ShoppingCart, 
  FileText, PlusCircle, MinusCircle, User, Banknote, Calculator, CreditCard, Calendar,
  Eye, Timer, ListOrdered, CheckCircle2 as CheckIcon, DollarSign, Smartphone, ArrowLeftRight, Landmark, AlertCircle,
  Receipt, MessageSquare, Save, Activity, CalendarDays, ClipboardList, Download, Printer
} from 'lucide-react';
import { Order, OrderStatus, Client, Product, FinancialEntry, Account, SystemSettings, PaymentMethod } from '../types';
import { generatePDF } from '../pdfService';

interface OrderItem {
  id: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  observations: string;
  price: number;
}

const formatPhone = (value: string) => {
  if (!value) return "";
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 2) return numbers.replace(/(\d{2})/, "($1");
  if (numbers.length <= 6) return numbers.replace(/(\d{2})(\d{0,4})/, "($1) $2");
  if (numbers.length <= 10) return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return numbers.substring(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

const Orders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  
  const [quickPayment, setQuickPayment] = useState({ amount: 0, method: '', accountId: '', date: new Date().toISOString().split('T')[0] });

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [systemPaymentMethods, setSystemPaymentMethods] = useState<PaymentMethod[]>([]);

  // Form State for New Order
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    deliveryDate: '',
    status: OrderStatus.OPEN,
    entry: 0,
    entryMethod: 'PIX',
    accountId: '',
    installmentsCount: 1,
    installmentIntervalDays: 30,
    firstInstallmentDate: new Date().toISOString().split('T')[0],
    items: [] as OrderItem[]
  });

  useEffect(() => {
    const storedOrders = localStorage.getItem('quickprint_orders');
    if (storedOrders) setOrders(JSON.parse(storedOrders));
    const storedClients = localStorage.getItem('quickprint_clients');
    if (storedClients) setClients(JSON.parse(storedClients));
    const storedProducts = localStorage.getItem('quickprint_products');
    if (storedProducts) setProducts(JSON.parse(storedProducts));
    const storedSettings = localStorage.getItem('quickprint_settings');
    if (storedSettings) {
      const settings: SystemSettings = JSON.parse(storedSettings);
      setSystemSettings(settings);
      const availableAccounts = settings.accounts || [];
      setAccounts(availableAccounts);
      const methods = settings.paymentMethods || [{ id: 'pix', name: 'PIX' }];
      setSystemPaymentMethods(methods);
      
      const defaultAccountId = availableAccounts[0]?.id || '';
      const defaultMethod = methods[0]?.name || 'PIX';
      
      if (!editingOrderId) {
        setFormData(prev => ({ 
          ...prev, 
          accountId: defaultAccountId,
          entryMethod: defaultMethod
        }));
      }
      setQuickPayment(prev => ({ ...prev, accountId: defaultAccountId, method: defaultMethod }));
    }
  }, [isModalOpen, isDetailsOpen, editingOrderId]);

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('quickprint_orders', JSON.stringify(newOrders));
  };

  const handleAddItem = () => {
    const newItem: OrderItem = {
      id: Math.random().toString(36).substr(2, 9),
      serviceId: '',
      serviceName: '',
      quantity: 1,
      observations: '',
      price: 0
    };
    setFormData({ ...formData, items: [...formData.items, newItem] });
  };

  const handleRemoveItem = (id: string) => {
    setFormData({ ...formData, items: formData.items.filter(i => i.id !== id) });
  };

  const handleUpdateItem = (id: string, field: keyof OrderItem, value: any) => {
    const updatedItems = formData.items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'serviceId') {
          const product = products.find(p => p.id === value);
          if (product) {
            updatedItem.serviceName = product.name;
            updatedItem.price = product.salePrice;
          }
        }
        return updatedItem;
      }
      return item;
    });
    setFormData({ ...formData, items: updatedItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrderId(order.id);
    setFormData({
      clientId: order.clientId,
      clientName: order.clientName,
      deliveryDate: order.deliveryDate || '',
      status: order.status,
      entry: order.entry,
      entryMethod: order.entryMethod || (systemPaymentMethods[0]?.name || 'PIX'),
      accountId: accounts[0]?.id || '',
      installmentsCount: order.installmentsCount || 1,
      installmentIntervalDays: order.installmentIntervalDays || 30,
      firstInstallmentDate: order.firstInstallmentDate || new Date().toISOString().split('T')[0],
      items: order.items || []
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOrderId(null);
    setFormData({
      clientId: '',
      clientName: '',
      deliveryDate: '',
      status: OrderStatus.OPEN,
      entry: 0,
      entryMethod: systemPaymentMethods[0]?.name || 'PIX',
      accountId: accounts[0]?.id || '',
      installmentsCount: 1,
      installmentIntervalDays: 30,
      firstInstallmentDate: new Date().toISOString().split('T')[0],
      items: []
    });
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || formData.items.length === 0) {
      alert("Por favor, selecione um cliente e adicione pelo menos um item.");
      return;
    }

    const total = calculateTotal();
    
    if (editingOrderId) {
      const updatedOrders = orders.map(o => {
        if (o.id === editingOrderId) {
          return {
            ...o,
            clientId: formData.clientId,
            clientName: clients.find(c => c.id === formData.clientId)?.name || o.clientName,
            productId: formData.items[0]?.serviceId || '',
            productName: formData.items[0]?.serviceName || '',
            status: formData.status,
            total,
            entry: formData.entry,
            entryMethod: formData.entryMethod,
            deliveryDate: formData.deliveryDate,
            items: formData.items,
            installmentsCount: formData.installmentsCount,
            installmentIntervalDays: formData.installmentIntervalDays,
            installmentValue: formData.installmentsCount > 1 ? (total - formData.entry) / formData.installmentsCount : 0,
            firstInstallmentDate: formData.installmentsCount > 1 ? formData.firstInstallmentDate : undefined,
          };
        }
        return o;
      });
      saveOrders(updatedOrders);
    } else {
      const orderNumber = (orders.length + 1).toString().padStart(4, '0');
      const newOrder: Order = {
        id: Math.random().toString(36).substr(2, 9),
        orderNumber,
        clientId: formData.clientId,
        clientName: clients.find(c => c.id === formData.clientId)?.name || 'Cliente Desconhecido',
        productId: formData.items[0]?.serviceId || '', 
        productName: formData.items[0]?.serviceName || '', 
        status: formData.status,
        total,
        entry: formData.entry,
        entryMethod: formData.entryMethod,
        date: new Date().toISOString().split('T')[0],
        deliveryDate: formData.deliveryDate,
        items: formData.items,
        installmentsCount: formData.installmentsCount,
        installmentIntervalDays: formData.installmentIntervalDays,
        installmentValue: formData.installmentsCount > 1 ? (total - formData.entry) / formData.installmentsCount : 0,
        firstInstallmentDate: formData.installmentsCount > 1 ? formData.firstInstallmentDate : undefined,
        paidInstallmentIndices: []
      };

      const updatedOrders = [newOrder, ...orders];
      saveOrders(updatedOrders);

      if (formData.entry > 0) {
        const storedFinancial = localStorage.getItem('quickprint_financial');
        const financial: FinancialEntry[] = storedFinancial ? JSON.parse(storedFinancial) : [];
        const newEntry: FinancialEntry = {
          id: Math.random().toString(36).substr(2, 9),
          description: `Sinal Pedido #${orderNumber}: ${newOrder.clientName}`,
          amount: formData.entry,
          type: 'INCOME',
          date: new Date().toISOString().split('T')[0],
          category: 'Vendas',
          method: formData.entryMethod,
          accountId: formData.accountId,
          status: 'PAID'
        };
        localStorage.setItem('quickprint_financial', JSON.stringify([newEntry, ...financial]));
      }
    }

    handleCloseModal();
  };

  const handleOpenDetails = (order: Order) => {
    setViewingOrder(order);
    const balanceValue = order.total - order.entry;
    setQuickPayment({ amount: balanceValue > 0 ? balanceValue : 0, method: systemPaymentMethods[0]?.name || 'PIX', accountId: accounts[0]?.id || '', date: new Date().toISOString().split('T')[0] });
    setIsDetailsOpen(true);
  };

  const sendWhatsApp = () => {
    if (!viewingOrder) return;
    const client = clients.find(c => c.id === viewingOrder.clientId);
    const phone = client?.phone.replace(/\D/g, '') || '';
    if (!phone) return alert('Telefone não encontrado.');
    const message = `Olá *${viewingOrder.clientName}*! Seu pedido *#${viewingOrder.orderNumber}* mudou de status para: *${viewingOrder.status}*. Valor pendente: R$ ${(viewingOrder.total - viewingOrder.entry).toFixed(2)}.`;
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDeleteOrder = (id: string) => {
    if (confirm('Deseja excluir este pedido permanentemente?')) {
      saveOrders(orders.filter(o => o.id !== id));
    }
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
    
    setIsDetailsOpen(false);
    alert('Pagamento registrado com sucesso!');
  };

  const filteredOrders = orders.filter(o => 
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.orderNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-lg shadow-lg">
            <ShoppingCart size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Gestão de Pedidos</h2>
        </div>
        <button onClick={() => { setEditingOrderId(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 font-bold shadow-md">
          <Plus size={20} /> NOVO PEDIDO
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por cliente ou número do pedido..." 
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Nº Pedido</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-gray-400 font-bold uppercase tracking-tighter">#{order.orderNumber}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 uppercase text-xs tracking-tight">{order.clientName}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">{new Date(order.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 text-right font-black text-blue-700">R$ {order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase ${
                        order.status === OrderStatus.COMPLETED ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleOpenDetails(order)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Ver Detalhes">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => generatePDF('OS', order, 'print', false)} className="p-2 text-gray-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all" title="Imprimir OS Produção (Sem Valores)">
                        <ClipboardList size={16} />
                      </button>
                      <button onClick={() => handleEditOrder(order)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Editar Pedido">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => generatePDF('PEDIDO', order, 'save')} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Baixar Financeiro PDF">
                        <FileText size={16} />
                      </button>
                      <button onClick={() => generatePDF('PEDIDO', order, 'print')} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all" title="Imprimir Comprovante Venda">
                        <Printer size={16} />
                      </button>
                      <button onClick={() => handleDeleteOrder(order.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Excluir Pedido">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic text-sm">Nenhum pedido encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New/Edit Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl my-8 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
              <div className="flex items-center gap-3">
                <ShoppingCart size={24} />
                <h3 className="text-xl font-black uppercase tracking-tight">{editingOrderId ? 'Editar Pedido' : 'Novo Pedido de Venda'}</h3>
              </div>
              <button onClick={handleCloseModal} className="hover:bg-blue-700 p-2 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitOrder} className="p-8 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente *</label>
                  <select 
                    required 
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 bg-slate-50 font-bold"
                    value={formData.clientId}
                    onChange={e => setFormData({...formData, clientId: e.target.value})}
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data de Entrega</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 bg-slate-50 font-bold"
                    value={formData.deliveryDate}
                    onChange={e => setFormData({...formData, deliveryDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                    <ListOrdered size={14} /> Itens do Pedido
                  </h4>
                  <button type="button" onClick={handleAddItem} className="text-[10px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase">
                    <PlusCircle size={14} /> Adicionar Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group animate-in slide-in-from-right-2">
                      <div className="col-span-12 md:col-span-3 space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Produto / Serviço</label>
                        <select 
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs font-bold uppercase"
                          value={item.serviceId}
                          onChange={e => handleUpdateItem(item.id, 'serviceId', e.target.value)}
                        >
                          <option value="">Escolha...</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="col-span-3 md:col-span-1 space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-tighter text-center block">Qtd</label>
                        <input 
                          type="number" min="1" 
                          className="w-full px-2 py-2 border border-gray-200 rounded-xl bg-white text-xs font-bold text-center"
                          value={item.quantity}
                          onChange={e => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2 space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Valor Unit. (R$)</label>
                        <input 
                          type="number" step="0.01"
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs font-bold"
                          value={item.price}
                          onChange={e => handleUpdateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-5 md:col-span-2 space-y-1">
                        <label className="text-[8px] font-black text-blue-600 uppercase tracking-tighter">Total do Item</label>
                        <div className="w-full px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl text-xs font-black text-blue-700">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-4 space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Observações</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs font-bold"
                          placeholder="Ex: Cor Azul, Sem verniz"
                          value={item.observations}
                          onChange={e => handleUpdateItem(item.id, 'observations', e.target.value)}
                        />
                      </div>
                      <button type="button" onClick={() => handleRemoveItem(item.id)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-sm">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-6">
                 <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <DollarSign size={14} /> Condições de Pagamento
                    </h4>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase">Valor Total do Pedido</p>
                      <p className="text-3xl font-black text-blue-700">R$ {calculateTotal().toFixed(2)}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sinal de Entrada (R$)</label>
                      <input 
                        type="number" step="0.01"
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none bg-white font-black text-green-600"
                        value={formData.entry}
                        onChange={e => setFormData({...formData, entry: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Meio do Sinal</label>
                      <select 
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none bg-white font-bold text-xs"
                        value={formData.entryMethod}
                        onChange={e => setFormData({...formData, entryMethod: e.target.value})}
                      >
                        {systemPaymentMethods.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Conta de Recebimento</label>
                      <select 
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none bg-white font-bold text-xs text-blue-600"
                        value={formData.accountId}
                        onChange={e => setFormData({...formData, accountId: e.target.value})}
                      >
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Saldo Devedor</label>
                      <p className="text-xl font-black text-red-500 py-3">R$ {(calculateTotal() - formData.entry).toFixed(2)}</p>
                    </div>
                 </div>

                 {(calculateTotal() - formData.entry) > 0 && (
                   <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Parcelas (Saldo)</label>
                        <input 
                          type="number" min="1" max="12"
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none bg-white font-bold"
                          value={formData.installmentsCount}
                          onChange={e => setFormData({...formData, installmentsCount: parseInt(e.target.value) || 1})}
                        />
                      </div>
                      {formData.installmentsCount > 1 && (
                        <>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Intervalo (Dias)</label>
                            <input 
                              type="number" step="1"
                              className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none bg-white font-bold"
                              value={formData.installmentIntervalDays}
                              onChange={e => setFormData({...formData, installmentIntervalDays: parseInt(e.target.value) || 30})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">1ª Parcela em</label>
                            <input 
                              type="date"
                              className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none bg-white font-bold"
                              value={formData.firstInstallmentDate}
                              onChange={e => setFormData({...formData, firstInstallmentDate: e.target.value})}
                            />
                          </div>
                        </>
                      )}
                   </div>
                 )}
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-4 border border-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700">Salvar Pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsOpen && viewingOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
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
                <button onClick={() => generatePDF('OS', viewingOrder, 'print', false)} className="p-3 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-colors border border-slate-200" title="Imprimir OS Produção (Sem Valores)">
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
            
            <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
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

               {/* Itens do Pedido no Detalhe */}
               <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Itens do Pedido</p>
                  <div className="bg-slate-50 rounded-2xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 font-black text-gray-500 uppercase">
                        <tr>
                          <th className="px-4 py-2">Descrição</th>
                          <th className="px-4 py-2 text-center">Qtd</th>
                          <th className="px-4 py-2 text-right">Preço Unit.</th>
                          <th className="px-4 py-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {viewingOrder.items?.map((item: any) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 font-bold text-slate-700 uppercase">{item.serviceName}</td>
                            <td className="px-4 py-3 text-center">{item.quantity}</td>
                            <td className="px-4 py-3 text-right">R$ {item.price.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-black">R$ {(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                      className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 flex items-center justify-center gap-3"
                    >
                      <CheckIcon size={18} /> Confirmar Recebimento e Atualizar
                    </button>
                 </div>
               )}

               <button 
                onClick={() => setIsDetailsOpen(false)} 
                className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
               >
                 Voltar para Pedidos
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
