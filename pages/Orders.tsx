
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Pencil, Trash2, X, ShoppingCart, 
  PlusCircle, User, DollarSign, Eye, Printer, Save, 
  UserPlus, PackagePlus, Box, Settings2, Minus, Calendar, CreditCard,
  CheckCircle2, MessageSquare, ClipboardList, FileText, Landmark, Keyboard, List,
  AlertCircle, History, Paperclip, Upload, Phone, Truck, Trash, ChevronDown, ChevronUp, Package,
  MapPin, Tag, ArrowUpCircle, ArrowDownCircle, UserCheck
} from 'lucide-react';
import { Order, OrderStatus, Client, Product, FinancialEntry, Account, SystemSettings, PaymentMethod } from '../types';
import { generatePDF } from '../pdfService';
import { useDateFilter, getLocalDateString } from '../App';

interface OrderItem {
  id: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  observations: string;
  price: number;
  isManual?: boolean;
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
  const { startDate, endDate } = useDateFilter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [systemPaymentMethods, setSystemPaymentMethods] = useState<PaymentMethod[]>([]);
  const [history, setHistory] = useState<FinancialEntry[]>([]);
  
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const [currentItem, setCurrentItem] = useState<OrderItem>({
    id: '', serviceId: '', serviceName: '', quantity: 1, observations: '', price: 0, isManual: false
  });

  const [formData, setFormData] = useState({
    clientId: '',
    clientName: 'Consumidor Final',
    clientPhone: '',
    deliveryDate: getLocalDateString(),
    status: OrderStatus.OPEN,
    priority: 'Normal',
    paymentMethod: 'DINHEIRO',
    entry: 0,
    shippingCost: 0,
    discount: 0,
    shippingCompany: '',
    trackingNumber: '',
    shippingType: 'Retirada na Loja',
    accountId: '',
    generalObservations: '',
    items: [] as OrderItem[],
    installmentsCount: 1,
    installmentIntervalDays: 30,
    firstInstallmentDate: getLocalDateString(),
  });

  const [clientFormData, setClientFormData] = useState({
    name: '', email: '', phone: '', document: '', responsible: '', 
    address: '', neighborhood: '', city: '', observations: ''
  });

  useEffect(() => {
    loadData();
  }, [isModalOpen, isDetailsOpen]);

  const loadData = () => {
    const storedOrders = localStorage.getItem('quickprint_orders');
    if (storedOrders) setOrders(JSON.parse(storedOrders));
    
    const storedClients = localStorage.getItem('quickprint_clients');
    if (storedClients) {
      const parsedClients = JSON.parse(storedClients);
      setClients(parsedClients.sort((a: Client, b: Client) => a.name.localeCompare(b.name)));
    }
    
    const storedProducts = localStorage.getItem('quickprint_products');
    if (storedProducts) {
      const parsedProducts = JSON.parse(storedProducts);
      setProducts(parsedProducts.sort((a: Product, b: Product) => a.name.localeCompare(b.name)));
    }

    const storedFinancial = localStorage.getItem('quickprint_financial');
    if (storedFinancial) setHistory(JSON.parse(storedFinancial));
    
    const storedSettings = localStorage.getItem('quickprint_settings');
    if (storedSettings) {
      const settings: SystemSettings = JSON.parse(storedSettings);
      setAccounts(settings.accounts || []);
      const methods = settings.paymentMethods || [];
      setSystemPaymentMethods(methods);
      
      if (!editingOrderId && methods.length > 0) {
        setFormData(prev => ({ ...prev, paymentMethod: methods[0].name.toUpperCase() }));
      }
    }
  };

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('quickprint_orders', JSON.stringify(newOrders));
  };

  const filterByRange = (date: string) => {
    return date >= startDate && date <= endDate;
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         o.orderNumber.includes(searchTerm);
    const matchesPeriod = filterByRange(o.date);
    const isNotArchived = !o.archived;
    return matchesSearch && matchesPeriod && isNotArchived;
  });

  const totalPaidInRange = filteredOrders.reduce((acc, o) => acc + o.entry, 0);
  const totalPendingInRange = filteredOrders.reduce((acc, o) => acc + (o.total - o.entry), 0);

  const handleAddItem = () => {
    if (!currentItem.serviceName) return;
    const finalItem = {
      ...currentItem,
      id: Math.random().toString(36).substr(2, 9),
      isManual: !currentItem.serviceId
    };
    setFormData({ ...formData, items: [...formData.items, finalItem] });
    setCurrentItem({ id: '', serviceId: '', serviceName: '', quantity: 1, observations: '', price: 0, isManual: false });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  };

  const calculateTotal = () => {
    return (calculateSubtotal() + (formData.shippingCost || 0)) - (formData.discount || 0);
  };

  const handleOpenDetails = (order: Order) => {
    setViewingOrder(order);
    setIsDetailsOpen(true);
  };

  const handleQuickAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientFormData.name) return;
    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      ...clientFormData
    };
    const updatedClients = [...clients, newClient];
    localStorage.setItem('quickprint_clients', JSON.stringify(updatedClients));
    setClients(updatedClients.sort((a, b) => a.name.localeCompare(b.name)));
    setFormData({ ...formData, clientId: newClient.id, clientName: newClient.name, clientPhone: newClient.phone });
    setIsClientModalOpen(false);
    setClientFormData({ name: '', email: '', phone: '', document: '', responsible: '', address: '', neighborhood: '', city: '', observations: '' });
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const total = calculateTotal();
    const balance = total - formData.entry;
    
    const storedOrders = localStorage.getItem('quickprint_orders');
    const allOrders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
    
    const orderNum = editingOrderId 
      ? allOrders.find(o => o.id === editingOrderId)?.orderNumber 
      : (allOrders.length + 1).toString().padStart(4, '0');
    
    const installmentsCount = Math.max(1, formData.installmentsCount || 1);
    const installmentValue = balance / installmentsCount;

    const orderData: Order = {
      id: editingOrderId || Math.random().toString(36).substr(2, 9),
      orderNumber: orderNum!,
      clientId: formData.clientId || 'manual',
      clientName: formData.clientName,
      productId: formData.items[0]?.serviceId || '',
      productName: formData.items[0]?.serviceName || '',
      status: formData.status,
      total,
      entry: formData.entry,
      entryMethod: formData.paymentMethod,
      date: getLocalDateString(), 
      deliveryDate: formData.deliveryDate,
      items: formData.items,
      paidInstallmentIndices: [],
      installmentsCount: installmentsCount,
      installmentValue: installmentValue,
      firstInstallmentDate: formData.firstInstallmentDate,
      installmentIntervalDays: formData.installmentIntervalDays || 30,
      archived: false,
      shippingCost: formData.shippingCost,
      discount: formData.discount,
      shippingCompany: formData.shippingCompany,
      trackingNumber: formData.trackingNumber,
      shippingType: formData.shippingType,
      generalObservations: formData.generalObservations
    };

    let newOrders = [];
    if (editingOrderId) newOrders = allOrders.map(o => o.id === editingOrderId ? orderData : o);
    else newOrders = [orderData, ...allOrders];
    saveOrders(newOrders);

    let financialUpdates: FinancialEntry[] = [...history];
    if (formData.entry > 0) {
      financialUpdates.unshift({
        id: Math.random().toString(36).substr(2, 9),
        description: `Entrada Pedido #${orderNum} - ${formData.clientName}`,
        amount: formData.entry,
        type: 'INCOME',
        date: getLocalDateString(),
        category: 'Vendas',
        method: formData.paymentMethod,
        accountId: formData.accountId || accounts[0]?.id || 'default',
        status: 'PAID'
      });
    }

    if (balance > 0.01) {
      const startDateInst = new Date(formData.firstInstallmentDate + 'T12:00:00');
      const interval = formData.installmentIntervalDays || 30;
      for (let i = 0; i < installmentsCount; i++) {
        const dueDate = new Date(startDateInst);
        dueDate.setDate(startDateInst.getDate() + (i * interval));
        financialUpdates.unshift({
          id: Math.random().toString(36).substr(2, 9),
          description: `Parc. ${i + 1}/${installmentsCount} Pedido #${orderNum} - ${formData.clientName}`,
          amount: installmentValue,
          type: 'INCOME',
          date: getLocalDateString(dueDate),
          category: 'Vendas',
          method: 'A DEFINIR',
          accountId: formData.accountId || accounts[0]?.id || 'default',
          status: 'PENDING'
        });
      }
    }
    localStorage.setItem('quickprint_financial', JSON.stringify(financialUpdates));
    setHistory(financialUpdates);
    setIsModalOpen(false);
  };

  const filteredProductsBySearch = products.filter(p => 
    p.name.toLowerCase().includes(currentItem.serviceName.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border-l-8 border-green-500 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Total Recebido (Período)</span>
            <span className="text-3xl font-black text-slate-800 leading-none">R$ {totalPaidInRange.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
            <ArrowUpCircle size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border-l-8 border-red-500 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Total a Receber (Saldo Pendente)</span>
            <span className="text-3xl font-black text-slate-800 leading-none">R$ {totalPendingInRange.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
            <ArrowDownCircle size={32} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex-1 w-full lg:max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar pedido por cliente ou número..." 
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 bg-gray-50/50 text-sm font-medium"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => { setEditingOrderId(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl flex items-center gap-3 hover:bg-blue-700 font-black text-xs uppercase shadow-xl shadow-blue-100 transition-all active:scale-95">
          <Plus size={18} /> Novo Pedido
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-gray-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">Nº Pedido</th>
                <th className="px-6 py-5">Cliente</th>
                <th className="px-6 py-5 text-right">Valor Total</th>
                <th className="px-6 py-5 text-right">Saldo Devedor</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? filteredOrders.map(o => {
                const balance = o.total - o.entry;
                return (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5 font-mono font-bold text-xs text-slate-400">#{o.orderNumber}</td>
                    <td className="px-6 py-5 font-bold text-xs uppercase text-slate-700">{o.clientName}</td>
                    <td className="px-6 py-5 font-bold text-xs text-right text-slate-600">R$ {o.total.toFixed(2)}</td>
                    <td className={`px-6 py-5 font-black text-xs text-right ${balance > 0.01 ? 'text-red-500' : 'text-green-600'}`}>
                      R$ {balance.toFixed(2)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-widest">{o.status}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center items-center gap-2">
                        <button onClick={() => handleOpenDetails(o)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Ver Detalhes"><Eye size={18} /></button>
                        <button onClick={() => generatePDF('PEDIDO', o, 'print')} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all" title="Imprimir PDF"><Printer size={18} /></button>
                        <button onClick={() => { if(confirm('Excluir pedido permanentemente?')) saveOrders(orders.filter(ord => ord.id !== o.id)) }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Excluir"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                       <ShoppingCart size={48} className="text-slate-300" />
                       <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Nenhum pedido encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in duration-200 my-4 border border-gray-100 flex flex-col max-h-[98vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-100">
                  <PlusCircle size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Novo Pedido</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-300 hover:text-gray-600 transition-colors p-2 hover:bg-slate-50 rounded-full">
                <X size={32} />
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-white">
              
              {/* Seção Cliente */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Cliente</label>
                   <button 
                    type="button" 
                    onClick={() => setIsClientModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 shadow-sm"
                  >
                    <UserPlus size={14} /> Novo Cliente
                  </button>
                </div>
                <div className="relative group">
                  <select 
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none bg-white focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-slate-700 appearance-none shadow-sm transition-all"
                    value={formData.clientId}
                    onChange={e => {
                      const client = clients.find(c => c.id === e.target.value);
                      setFormData({...formData, clientId: e.target.value, clientName: client?.name || 'Consumidor Final', clientPhone: client?.phone || ''});
                    }}
                  >
                    <option value="">Selecione um cliente existente</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors" />
                </div>
              </div>

              {/* Seção Produtos / Serviços */}
              <div className="bg-white p-8 rounded-[2rem] border border-gray-200 space-y-6 shadow-sm">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Produtos / Serviços</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-7 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Item (Busca ou Manual)</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Procure um produto ou digite..."
                        className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
                        value={currentItem.serviceName}
                        onFocus={() => setShowProductDropdown(true)}
                        onChange={e => {
                          setCurrentItem({...currentItem, serviceName: e.target.value, serviceId: ''});
                          setShowProductDropdown(true);
                        }}
                      />
                      {showProductDropdown && currentItem.serviceName.length > 0 && filteredProductsBySearch.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                           {filteredProductsBySearch.map(p => (
                             <div 
                               key={p.id} 
                               className="px-5 py-4 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-none"
                               onClick={() => {
                                 setCurrentItem({...currentItem, serviceId: p.id, serviceName: p.name, price: p.salePrice});
                                 setShowProductDropdown(false);
                               }}
                             >
                               <span className="text-[11px] font-black text-slate-700 uppercase">{p.name}</span>
                               <span className="text-[11px] font-black text-blue-600">R$ {p.salePrice.toFixed(2)}</span>
                             </div>
                           ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">QTD</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-4 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-black text-slate-700 text-center shadow-sm"
                      value={currentItem.quantity}
                      onChange={e => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço Unit.</label>
                    <div className="relative">
                      <input 
                        type="number" step="0.01"
                        className="w-full px-4 py-4 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-black text-slate-700 pr-8 shadow-sm"
                        value={currentItem.price || ''}
                        onChange={e => setCurrentItem({...currentItem, price: parseFloat(e.target.value) || 0})}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col text-slate-300">
                        <ChevronUp size={12} />
                        <ChevronDown size={12} />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <button 
                      type="button" 
                      onClick={handleAddItem} 
                      className="w-full h-[58px] bg-[#0f172a] text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
                    >
                      <Plus size={28} />
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-[#f8fafc] border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item no Carrinho</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">QTD</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 min-h-[120px]">
                      {formData.items.length > 0 ? formData.items.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5 text-xs font-black text-slate-700 uppercase flex items-center gap-3">
                            <button type="button" onClick={() => setFormData({...formData, items: formData.items.filter(i => i.id !== item.id)})} className="text-red-300 hover:text-red-500 transition-colors"><Trash size={14} /></button>
                            {item.serviceName}
                          </td>
                          <td className="px-6 py-5 text-xs font-black text-slate-600 text-center">{item.quantity}</td>
                          <td className="px-6 py-5 text-xs font-black text-slate-800 text-right">R$ {(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-16 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Nenhum item adicionado ao pedido</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Seção Logística */}
              <div className="bg-white p-8 rounded-[2rem] border border-gray-200 space-y-6 shadow-sm">
                <div className="flex items-center gap-2 text-blue-600">
                  <Truck size={20} />
                  <h4 className="text-[11px] font-black uppercase tracking-widest">Logística / Transportadora</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transportadora</label>
                    <input 
                      type="text" 
                      placeholder="Nome da empresa..."
                      className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-slate-700 placeholder:text-slate-300 shadow-sm" 
                      value={formData.shippingCompany} 
                      onChange={e => setFormData({...formData, shippingCompany: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Envio</label>
                    <div className="relative">
                      <select 
                        className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none bg-white focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-slate-700 appearance-none shadow-sm"
                        value={formData.shippingType}
                        onChange={e => setFormData({...formData, shippingType: e.target.value})}
                      >
                        <option value="Retirada na Loja">Retirada na Loja</option>
                        <option value="Motoboy">Motoboy</option>
                        <option value="Correios SEDEX">Correios SEDEX</option>
                        <option value="Correios PAC">Correios PAC</option>
                        <option value="Transportadora">Transportadora</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cód. Rastreio</label>
                    <div className="relative">
                      <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="text" 
                        placeholder="Ex: BR123456789"
                        className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-slate-700 placeholder:text-slate-300 shadow-sm" 
                        value={formData.trackingNumber} 
                        onChange={e => setFormData({...formData, trackingNumber: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor do Frete (R$)</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
                      <input 
                        type="number" step="0.01" 
                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-black text-slate-700 shadow-sm" 
                        value={formData.shippingCost || ''} 
                        onChange={e => setFormData({...formData, shippingCost: parseFloat(e.target.value) || 0})} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor do Desconto (R$)</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
                      <input 
                        type="number" step="0.01" 
                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-black text-slate-700 shadow-sm" 
                        value={formData.discount || ''} 
                        onChange={e => setFormData({...formData, discount: parseFloat(e.target.value) || 0})} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção Pagamento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Forma de Pagamento</label>
                  <div className="relative">
                    <select 
                      className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none bg-white focus:ring-4 focus:ring-blue-500/10 text-xs font-black text-slate-700 appearance-none uppercase shadow-sm"
                      value={formData.paymentMethod}
                      onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                    >
                      {systemPaymentMethods.length > 0 ? (
                        systemPaymentMethods.map(m => <option key={m.id} value={m.name.toUpperCase()}>{m.name.toUpperCase()}</option>)
                      ) : (
                        <option value="DINHEIRO">DINHEIRO</option>
                      )}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nº de Parcelas (Saldo)</label>
                  <input 
                    type="number" 
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-black text-slate-700 shadow-sm"
                    value={formData.installmentsCount}
                    onChange={e => setFormData({...formData, installmentsCount: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data da 1ª Parcela</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-slate-700 shadow-sm appearance-none"
                      value={formData.firstInstallmentDate}
                      onChange={e => setFormData({...formData, firstInstallmentDate: e.target.value})}
                    />
                    <Calendar size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Resumo Final (Painel Azul igual à imagem) */}
              <div className="bg-[#f0f7ff] p-10 rounded-[2.5rem] border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm">
                <div className="w-full md:max-w-xs space-y-4">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">Valor de Entrada / Sinal</label>
                  <div className="bg-white border-2 border-blue-200 rounded-2xl flex items-center px-6 py-4 shadow-sm">
                    <span className="text-blue-500 font-black mr-4 text-2xl">$</span>
                    <input 
                      type="number" step="0.01" 
                      className="w-full outline-none text-2xl font-black text-slate-500 bg-transparent placeholder:text-slate-300" 
                      value={formData.entry || ''} 
                      placeholder="0,00"
                      onChange={e => setFormData({...formData, entry: parseFloat(e.target.value) || 0})} 
                    />
                  </div>
                </div>
                <div className="text-center md:text-right space-y-1">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total do Pedido</p>
                  <p className="text-7xl font-black text-[#0f172a] tracking-tighter leading-none">R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-[11px] font-black text-red-500 uppercase mt-4 tracking-widest text-center md:text-right">Falta Receber: R$ {(calculateTotal() - (formData.entry || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              {/* Footer Ações */}
              <div className="flex flex-col md:flex-row justify-center gap-4 pt-10">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-16 py-4 border border-gray-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all bg-white shadow-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-16 py-4 bg-[#2563eb] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-95"
                >
                  <FileText size={20} /> Confirmar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO CLIENTE (RE-ESTILIZADO IGUAL À IMAGEM) */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200 my-8 border border-gray-100 flex flex-col">
            {/* Header Estilizado */}
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                  <UserCheck size={28} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-black text-[#1e293b] uppercase tracking-tight">NOVO CLIENTE</h3>
              </div>
              <button 
                onClick={() => setIsClientModalOpen(false)}
                className="text-gray-300 hover:text-gray-600 transition-colors p-2 hover:bg-slate-50 rounded-full"
              >
                <X size={32} />
              </button>
            </div>
            
            <form onSubmit={handleQuickAddClient} className="p-10 space-y-10 bg-white">
              {/* Grid 1: Nome e Telefone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">NOME COMPLETO *</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: João da Silva"
                    className="w-full px-6 py-4.5 bg-slate-50/50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm" 
                    value={clientFormData.name} 
                    onChange={e => setClientFormData({...clientFormData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">TELEFONE DE CONTATO</label>
                  <input 
                    type="text" 
                    placeholder="(00) 00000-0000"
                    className="w-full px-6 py-4.5 bg-slate-50/50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm" 
                    value={clientFormData.phone} 
                    onChange={e => setClientFormData({...clientFormData, phone: formatPhone(e.target.value)})} 
                  />
                </div>
              </div>

              {/* Grid 2: Email e CPF/CNPJ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">EMAIL PRINCIPAL</label>
                  <input 
                    type="email" 
                    placeholder="email@empresa.com"
                    className="w-full px-6 py-4.5 bg-slate-50/50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm" 
                    value={clientFormData.email} 
                    onChange={e => setClientFormData({...clientFormData, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">CPF / CNPJ</label>
                  <input 
                    type="text" 
                    placeholder="000.000.000-00"
                    className="w-full px-6 py-4.5 bg-slate-50/50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm" 
                    value={clientFormData.document} 
                    onChange={e => setClientFormData({...clientFormData, document: e.target.value})} 
                  />
                </div>
              </div>

              {/* Linha: Responsável */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">NOME DO RESPONSÁVEL (OPCIONAL)</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4.5 bg-slate-50/50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-slate-700 shadow-sm" 
                  value={clientFormData.responsible} 
                  onChange={e => setClientFormData({...clientFormData, responsible: e.target.value})} 
                />
              </div>

              {/* Linha: Endereço com Ícone */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">ENDEREÇO DE COBRANÇA / ENTREGA</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
                    <MapPin size={20} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Rua, Número, Complemento"
                    className="w-full pl-14 pr-6 py-4.5 bg-slate-50/50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm" 
                    value={clientFormData.address} 
                    onChange={e => setClientFormData({...clientFormData, address: e.target.value})} 
                  />
                </div>
              </div>

              {/* Grid 3: Bairro e Cidade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">BAIRRO</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4.5 bg-slate-50/50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-slate-700 shadow-sm" 
                    value={clientFormData.neighborhood} 
                    onChange={e => setClientFormData({...clientFormData, neighborhood: e.target.value})} 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">CIDADE</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4.5 bg-slate-50/50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-slate-700 shadow-sm" 
                    value={clientFormData.city} 
                    onChange={e => setClientFormData({...clientFormData, city: e.target.value})} 
                  />
                </div>
              </div>

              {/* Linha: Observações */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">OBSERVAÇÕES IMPORTANTES</label>
                <textarea 
                  rows={4}
                  placeholder="Informações relevantes para o atendimento..."
                  className="w-full px-6 py-5 bg-slate-50/50 border border-gray-200 rounded-[2rem] outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-slate-700 resize-none shadow-sm placeholder:text-slate-300" 
                  value={clientFormData.observations} 
                  onChange={e => setClientFormData({...clientFormData, observations: e.target.value})} 
                />
              </div>

              {/* Footer de Ações Estilizado */}
              <div className="flex flex-col md:flex-row justify-end items-center gap-10 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsClientModalOpen(false)} 
                  className="text-slate-400 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:text-slate-600 transition-all active:scale-95"
                >
                  DESCARTAR
                </button>
                <button 
                  type="submit" 
                  className="w-full md:w-auto px-16 py-5 bg-[#10a34a] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-green-100 hover:bg-[#0e8a3e] transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Save size={20} />
                  SALVAR CADASTRO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailsOpen && viewingOrder && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#f8fafc] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300 relative flex flex-col max-h-[95vh] border border-gray-200">
            <div className="px-8 py-6 bg-white border-b border-gray-100 flex justify-between items-start sticky top-0 z-10">
              <div className="flex flex-col">
                <h3 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight">{viewingOrder.clientName}</h3>
                <div className="flex items-center gap-1.5 text-gray-400 text-sm mt-1 font-bold">
                  <Phone size={14} className="text-blue-500" />
                  <span>{viewingOrder.clientPhone || 'Sem telefone'}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">PEDIDO Nº</p>
                  <p className="text-sm font-mono font-black text-slate-500">#{viewingOrder.orderNumber}</p>
                </div>
                <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blue-500 shadow-lg shadow-blue-100">
                  {viewingOrder.status}
                </span>
              </div>
              <button onClick={() => setIsDetailsOpen(false)} className="absolute top-4 right-4 text-gray-300 p-2 hover:bg-slate-50 rounded-full transition-all"><X size={28} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              <div className="bg-[#fff7ed] border border-[#ffedd5] rounded-3xl p-6 flex justify-between items-center shadow-inner">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-[#9a3412] uppercase tracking-widest">SITUAÇÃO FINANCEIRA</p>
                  <h4 className="text-2xl font-black text-[#7c2d12] uppercase">
                    {(viewingOrder.total - viewingOrder.entry) <= 0.01 ? 'QUITADO' : viewingOrder.entry > 0 ? 'PARCIALMENTE PAGO' : 'AGUARDANDO PAGTO'}
                  </h4>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-[#9a3412] uppercase tracking-widest">VALOR DO PEDIDO</p>
                  <p className="text-2xl font-black text-[#7c2d12]">R$ {viewingOrder.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50/50 border border-green-100 rounded-3xl p-5 shadow-sm text-center">
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">AMORTIZADO</p>
                  <p className="text-xl font-black text-green-700 mt-1">R$ {viewingOrder.entry.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-red-50/50 border border-red-100 rounded-3xl p-5 shadow-sm text-center">
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">SALDO DEVEDOR</p>
                  <p className="text-xl font-black text-red-700 mt-1">R$ {(viewingOrder.total - viewingOrder.entry).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
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

              <div className="flex gap-4 pt-6 border-t border-gray-100">
                <button 
                  onClick={() => generatePDF('PEDIDO', viewingOrder, 'print')}
                  className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-100 flex items-center justify-center gap-2 hover:bg-orange-700 transition-all active:scale-95"
                >
                  <Printer size={18} /> Imprimir Comprovante
                </button>
                <button 
                  onClick={() => setIsDetailsOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
