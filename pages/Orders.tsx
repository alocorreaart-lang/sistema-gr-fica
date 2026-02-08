
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Pencil, Trash2, X, ShoppingCart, 
  PlusCircle, User, DollarSign, Eye, Printer, Save, 
  UserPlus, PackagePlus, Box, Settings2, Minus, Calendar, CreditCard,
  CheckCircle2, MessageSquare, ClipboardList, FileText, Landmark, Keyboard, List,
  AlertCircle, History, Paperclip, Upload, Phone, Truck, Trash, ChevronDown, ChevronUp, Package,
  MapPin, Tag
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
    paymentMethod: 'Dinheiro',
    entry: 0,
    shippingCost: 0,
    discount: 0,
    shippingCompany: '',
    trackingNumber: '',
    shippingType: 'Retirada',
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
      
      // Se estiver abrindo o modal de novo pedido e tiver métodos, define o primeiro como padrão
      if (!editingOrderId && methods.length > 0 && formData.paymentMethod === 'Dinheiro') {
        setFormData(prev => ({ ...prev, paymentMethod: methods[0].name }));
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
      // Logística
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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex-1 w-full lg:max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar pedido..." 
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => { setEditingOrderId(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-6 py-3.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 font-black text-xs uppercase shadow-lg shadow-blue-100 transition-all active:scale-95">
          <Plus size={18} /> Novo Pedido
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-black text-gray-500 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Nº</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.length > 0 ? filteredOrders.map(o => (
              <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-xs">#{o.orderNumber}</td>
                <td className="px-6 py-4 font-bold text-xs uppercase">{o.clientName}</td>
                <td className="px-6 py-4 font-black text-xs">R$ {o.total.toFixed(2)}</td>
                <td className="px-6 py-4 text-center">
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 uppercase">{o.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center gap-4">
                    <button onClick={() => handleOpenDetails(o)} className="text-slate-500 hover:scale-110 transition-transform"><Eye size={18} /></button>
                    <button onClick={() => { if(confirm('Excluir?')) saveOrders(orders.filter(ord => ord.id !== o.id)) }} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Nenhum pedido encontrado para o período ou busca selecionados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in duration-200 my-4 border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg text-white">
                  <PlusCircle size={20} />
                </div>
                <h3 className="text-xl font-black text-[#1e293b] tracking-tight">Novo Pedido</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={28} /></button>
            </div>

            <form onSubmit={handleSubmitOrder} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700">Cliente</label>
                  <button 
                    type="button" 
                    onClick={() => setIsClientModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-[#2563eb] text-[#2563eb] bg-white rounded-lg text-xs font-bold hover:bg-blue-50 transition-all shadow-sm"
                  >
                    <UserPlus size={16} /> Novo Cliente
                  </button>
                </div>
                <div className="relative">
                  <select 
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl outline-none bg-white focus:border-blue-400 text-sm font-medium text-slate-500 appearance-none shadow-sm"
                    value={formData.clientId}
                    onChange={e => {
                      const client = clients.find(c => c.id === e.target.value);
                      setFormData({...formData, clientId: e.target.value, clientName: client?.name || 'Consumidor Final', clientPhone: client?.phone || ''});
                    }}
                  >
                    <option value="">Selecione um cliente existente</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Bloco de Produtos */}
              <div className="bg-[#f8fafc] p-6 rounded-2xl border border-gray-100 space-y-4">
                <h4 className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">PRODUTOS / SERVIÇOS</h4>
                
                <div className="flex flex-col md:flex-row items-end gap-3">
                  <div className="flex-1 w-full space-y-1.5">
                    <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">ITEM (BUSCA OU MANUAL)</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search size={16} />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Procure um produto ou digite..."
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 bg-white text-xs font-medium text-slate-700 placeholder:text-slate-400 shadow-sm transition-all"
                        value={currentItem.serviceName}
                        onFocus={() => setShowProductDropdown(true)}
                        onChange={e => {
                          setCurrentItem({...currentItem, serviceName: e.target.value, serviceId: ''});
                          setShowProductDropdown(true);
                        }}
                      />
                      
                      {showProductDropdown && currentItem.serviceName.length > 0 && filteredProductsBySearch.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                           {filteredProductsBySearch.map(p => (
                             <div 
                               key={p.id} 
                               className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-none"
                               onClick={() => {
                                 setCurrentItem({
                                   ...currentItem,
                                   serviceId: p.id,
                                   serviceName: p.name,
                                   price: p.salePrice
                                 });
                                 setShowProductDropdown(false);
                               }}
                             >
                               <span className="text-xs font-bold text-slate-700 uppercase">{p.name}</span>
                               <span className="text-[10px] font-black text-blue-600">R$ {p.salePrice.toFixed(2)}</span>
                             </div>
                           ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full md:w-28 space-y-1.5">
                    <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">QTD</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 bg-white text-xs font-bold text-slate-700 text-center shadow-sm"
                      value={currentItem.quantity}
                      onChange={e => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})}
                    />
                  </div>

                  <div className="w-full md:w-36 space-y-1.5">
                    <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">PREÇO UNIT.</label>
                    <div className="relative">
                      <input 
                        type="number" step="0.01"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 bg-white text-xs font-bold text-slate-700 shadow-sm"
                        value={currentItem.price || ''}
                        onChange={e => setCurrentItem({...currentItem, price: parseFloat(e.target.value) || 0})}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col text-slate-400 pointer-events-none scale-75">
                         <ChevronUp size={14} />
                         <ChevronDown size={14} />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleAddItem} 
                    className="w-full md:w-16 h-12 bg-[#0f172a] text-white rounded-xl flex items-center justify-center hover:bg-[#1e293b] transition-all active:scale-95 shadow-md shrink-0"
                  >
                    <Plus size={24} />
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mt-4">
                  <table className="w-full text-left">
                    <thead className="bg-[#f1f5f9] border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-wider">ITEM NO CARRINHO</th>
                        <th className="px-6 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-wider text-center">QTD</th>
                        <th className="px-6 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-wider text-right pr-12">SUBTOTAL</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {formData.items.length > 0 ? formData.items.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-xs font-black text-slate-700 uppercase">{item.serviceName}</td>
                          <td className="px-6 py-4 text-xs font-black text-slate-700 text-center">{item.quantity}</td>
                          <td className="px-6 py-4 text-xs font-black text-slate-700 text-right pr-12">R$ {(item.price * item.quantity).toFixed(2)}</td>
                          <td className="px-6 py-4 text-center">
                            <button type="button" onClick={() => setFormData({...formData, items: formData.items.filter(i => i.id !== item.id)})} className="text-red-300 hover:text-red-500 p-2"><Trash size={16} /></button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-10 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest italic opacity-50">Nenhum item adicionado ao pedido</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CARD DE TRANSPORTADORA / LOGÍSTICA */}
              <div className="bg-[#f8fafc] p-6 rounded-2xl border border-gray-100 space-y-4">
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-blue-600" />
                  <h4 className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">LOGÍSTICA / TRANSPORTADORA</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">TRANSPORTADORA</label>
                    <input 
                      type="text" 
                      placeholder="Nome da empresa..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 bg-white text-xs font-bold text-slate-700 shadow-sm transition-all"
                      value={formData.shippingCompany}
                      onChange={e => setFormData({...formData, shippingCompany: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">TIPO DE ENVIO</label>
                    <div className="relative">
                      <select 
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 bg-white text-xs font-bold text-slate-700 shadow-sm appearance-none"
                        value={formData.shippingType}
                        onChange={e => setFormData({...formData, shippingType: e.target.value})}
                      >
                        <option value="Retirada">Retirada na Loja</option>
                        <option value="Sedex">Correios (SEDEX)</option>
                        <option value="PAC">Correios (PAC)</option>
                        <option value="Motoboy">Motoboy / Delivery</option>
                        <option value="Transportadora">Transportadora Privada</option>
                        <option value="Outros">Outros</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">CÓD. RASTREIO</label>
                    <div className="relative">
                      <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="text" 
                        placeholder="Ex: BR123456789"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 bg-white text-xs font-bold text-slate-700 shadow-sm"
                        value={formData.trackingNumber}
                        onChange={e => setFormData({...formData, trackingNumber: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">VALOR DO FRETE (R$)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
                      <input 
                        type="number" step="0.01" 
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-xs font-bold text-slate-700 shadow-sm" 
                        value={formData.shippingCost || ''} 
                        onChange={e => setFormData({...formData, shippingCost: parseFloat(e.target.value) || 0})} 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">VALOR DO DESCONTO (R$)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
                      <input 
                        type="number" step="0.01" 
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-xs font-bold text-slate-700 shadow-sm" 
                        value={formData.discount || ''} 
                        onChange={e => setFormData({...formData, discount: parseFloat(e.target.value) || 0})} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pagamento e Parcelas */}
              <div className="grid grid-cols-12 gap-6 items-end">
                <div className="col-span-12 md:col-span-4 space-y-2">
                  <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">FORMA DE PAGAMENTO</label>
                  <div className="relative">
                    <select 
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-white focus:border-blue-400 text-xs font-bold text-slate-700 appearance-none shadow-sm" 
                      value={formData.paymentMethod} 
                      onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                    >
                      {systemPaymentMethods.length > 0 ? (
                        systemPaymentMethods.map(m => (
                          <option key={m.id} value={m.name}>{m.name}</option>
                        ))
                      ) : (
                        <>
                          <option value="Dinheiro">Dinheiro</option>
                          <option value="PIX">PIX</option>
                          <option value="Cartão">Cartão</option>
                          <option value="Boleto">Boleto</option>
                        </>
                      )}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="col-span-6 md:col-span-4 space-y-2">
                  <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">Nº DE PARCELAS (SALDO)</label>
                  <input type="number" min="1" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-xs font-bold text-slate-700 shadow-sm" value={formData.installmentsCount} onChange={e => setFormData({...formData, installmentsCount: parseInt(e.target.value) || 1})} />
                </div>
                <div className="col-span-6 md:col-span-4 space-y-2">
                  <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">DATA DA 1ª PARCELA</label>
                  <input type="date" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-xs font-bold text-slate-700 shadow-sm" value={formData.firstInstallmentDate} onChange={e => setFormData({...formData, firstInstallmentDate: e.target.value})} />
                </div>
              </div>

              {/* Resumo Azul Final */}
              <div className="bg-[#f0f7ff] p-8 rounded-3xl border border-[#dbeafe] flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm">
                <div className="w-full md:w-auto space-y-2">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">VALOR DE ENTRADA / SINAL</label>
                  <div className="bg-white border-2 border-blue-200 rounded-2xl flex items-center px-6 py-4 w-full md:w-64">
                    <span className="text-blue-500 font-black mr-4 text-xl">$</span>
                    <input type="number" step="0.01" className="w-full outline-none text-2xl font-black text-blue-700 bg-transparent" value={formData.entry || ''} onChange={e => setFormData({...formData, entry: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
                <div className="text-center md:text-right space-y-1">
                  <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">TOTAL DO PEDIDO</p>
                  <p className="text-5xl font-black text-[#0f172a] tracking-tighter">R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs font-black text-red-500 uppercase mt-1">FALTA RECEBER: R$ {(calculateTotal() - (formData.entry || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="flex justify-center md:justify-end gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-12 py-4 border border-gray-200 text-[#64748b] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">CANCELAR</button>
                <button type="submit" className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95 hover:bg-blue-700 transition-all"><ClipboardList size={18} /> CONFIRMAR PEDIDO</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cadastro Rápido de Cliente */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-200 my-8">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-xl font-bold text-[#1e293b]">Novo Cliente</h3>
              <button 
                onClick={() => setIsClientModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleQuickAddClient} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Nome Completo *</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Nome do cliente"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-colors placeholder:text-gray-300" 
                    value={clientFormData.name} 
                    onChange={e => setClientFormData({...clientFormData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Telefone</label>
                  <input 
                    type="text" 
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-colors placeholder:text-gray-300" 
                    value={clientFormData.phone} 
                    onChange={e => setClientFormData({...clientFormData, phone: formatPhone(e.target.value)})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Email</label>
                  <input 
                    type="email" 
                    placeholder="email@exemplo.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-colors placeholder:text-gray-300" 
                    value={clientFormData.email} 
                    onChange={e => setClientFormData({...clientFormData, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">CPF/CNPJ</label>
                  <input 
                    type="text" 
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-colors placeholder:text-gray-300" 
                    value={clientFormData.document} 
                    onChange={e => setClientFormData({...clientFormData, document: e.target.value})} 
                  />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Responsável</label>
                  <input 
                    type="text" 
                    placeholder="Nome do responsável pelo cliente"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-colors placeholder:text-gray-300" 
                    value={clientFormData.responsible} 
                    onChange={e => setClientFormData({...clientFormData, responsible: e.target.value})} 
                  />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Endereço</label>
                  <input 
                    type="text" 
                    placeholder="Rua e número"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-colors placeholder:text-gray-300" 
                    value={clientFormData.address} 
                    onChange={e => setClientFormData({...clientFormData, address: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Bairro</label>
                  <input 
                    type="text" 
                    placeholder="Bairro"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-colors placeholder:text-gray-300" 
                    value={clientFormData.neighborhood} 
                    onChange={e => setClientFormData({...clientFormData, neighborhood: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Cidade</label>
                  <input 
                    type="text" 
                    placeholder="Cidade"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-colors placeholder:text-gray-300" 
                    value={clientFormData.city} 
                    onChange={e => setClientFormData({...clientFormData, city: e.target.value})} 
                  />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Observações</label>
                  <textarea 
                    rows={4}
                    placeholder="Informações adicionais sobre o cliente"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-colors resize-none placeholder:text-gray-400" 
                    value={clientFormData.observations} 
                    onChange={e => setClientFormData({...clientFormData, observations: e.target.value})} 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsClientModalOpen(false)} 
                  className="px-8 py-3 border border-gray-300 text-slate-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-3 bg-[#82cf9e] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#6fb98d] transition-all flex items-center gap-2"
                >
                  <Save size={18} />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detalhes do Pedido */}
      {isDetailsOpen && viewingOrder && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#f8fafc] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300 relative flex flex-col max-h-[95vh]">
            <div className="px-8 py-6 bg-white border-b border-gray-100 flex justify-between items-start sticky top-0 z-10">
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold text-[#1e293b]">{viewingOrder.clientName}</h3>
                <div className="flex items-center gap-1.5 text-gray-400 text-sm mt-1 font-medium">
                  <Phone size={14} />
                  <span>{viewingOrder.clientPhone || '(00) 00000-0000'}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nº PEDIDO</p>
                  <p className="text-xs font-mono font-bold text-slate-500">#{viewingOrder.orderNumber}</p>
                </div>
                <span className="bg-green-100 text-green-700 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border border-green-200">
                  {viewingOrder.status}
                </span>
              </div>
              <button onClick={() => setIsDetailsOpen(false)} className="absolute top-4 right-4 text-gray-400 p-1"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              <div className="bg-[#fff7ed] border border-[#ffedd5] rounded-xl p-5 flex justify-between items-center shadow-sm">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[#9a3412] uppercase tracking-wide">Status do Pagamento</p>
                  <h4 className="text-2xl font-black text-[#7c2d12]">
                    {(viewingOrder.total - viewingOrder.entry) <= 0.01 ? 'Pago' : viewingOrder.entry > 0 ? 'Parcial' : 'Pendente'}
                  </h4>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-[#9a3412] uppercase tracking-wide">Valor Total</p>
                  <p className="text-2xl font-black text-[#7c2d12]">R$ {viewingOrder.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-xl p-4 shadow-sm">
                  <p className="text-[10px] font-bold text-[#166534] uppercase tracking-wide">Valor Pago</p>
                  <p className="text-xl font-black text-[#15803d] mt-1">R$ {viewingOrder.entry.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-[#fef2f2] border border-[#fee2e2] rounded-xl p-4 shadow-sm">
                  <p className="text-[10px] font-bold text-[#991b1b] uppercase tracking-wide">Valor Restante</p>
                  <p className="text-xl font-black text-[#b91c1c] mt-1">R$ {(viewingOrder.total - viewingOrder.entry).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              
              {/* Info Logística Detalhes */}
              {(viewingOrder.shippingCompany || viewingOrder.trackingNumber) && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-blue-600" />
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Informações de Logística</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase">Empresa / Tipo</p>
                      <p className="text-xs font-bold text-slate-700">{viewingOrder.shippingCompany || viewingOrder.shippingType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase">Rastreio</p>
                      <p className="text-xs font-mono font-bold text-blue-600">{viewingOrder.trackingNumber || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <ShoppingCart size={16} />
                  <h4 className="text-[11px] font-black uppercase tracking-widest">Itens do Pedido</h4>
                </div>
                <div className="space-y-2">
                  {viewingOrder.items?.map((item: any) => (
                    <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#1e293b]">{item.serviceName}</span>
                        <span className="text-[10px] text-gray-400 font-medium">Qtd: {item.quantity} | R$ {item.price.toFixed(2)} un</span>
                      </div>
                      <span className="text-sm font-black text-blue-600">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
