
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Pencil, Trash2, X, ShoppingCart, 
  PlusCircle, User, DollarSign, Eye, Printer, Save, 
  UserPlus, PackagePlus, Box, Settings2, Minus, Calendar, CreditCard,
  CheckCircle2, MessageSquare, ClipboardList, FileText, Landmark, Keyboard, List
} from 'lucide-react';
import { Order, OrderStatus, Client, Product, FinancialEntry, Account, SystemSettings, PaymentMethod } from '../types';
import { generatePDF } from '../pdfService';
import { useDateFilter } from '../App';

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

  // Estado para preenchimento manual
  const [isManualEntry, setIsManualEntry] = useState(false);

  const [currentItem, setCurrentItem] = useState<OrderItem>({
    id: '', serviceId: '', serviceName: '', quantity: 1, observations: '', price: 0, isManual: false
  });

  const [isInstallmentEnabled, setIsInstallmentEnabled] = useState(false);

  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    clientPhone: '',
    deliveryDate: '',
    status: OrderStatus.OPEN,
    priority: 'Normal',
    paymentMethod: 'Dinheiro',
    entry: 0,
    accountId: '',
    generalObservations: '',
    items: [] as OrderItem[],
    installmentsCount: 1,
    installmentIntervalDays: 30,
    firstInstallmentDate: '',
  });

  const [clientFormData, setClientFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    responsible: '',
    address: '',
    neighborhood: '',
    city: '',
    observations: ''
  });

  useEffect(() => {
    loadData();
  }, [isModalOpen]);

  const loadData = () => {
    const storedOrders = localStorage.getItem('quickprint_orders');
    if (storedOrders) setOrders(JSON.parse(storedOrders));
    const storedClients = localStorage.getItem('quickprint_clients');
    if (storedClients) setClients(JSON.parse(storedClients));
    const storedProducts = localStorage.getItem('quickprint_products');
    if (storedProducts) setProducts(JSON.parse(storedProducts));
    const storedSettings = localStorage.getItem('quickprint_settings');
    if (storedSettings) {
      const settings: SystemSettings = JSON.parse(storedSettings);
      const accs = settings.accounts || [];
      setAccounts(accs);
      setSystemPaymentMethods(settings.paymentMethods || []);
      
      if (!formData.accountId && accs.length > 0) {
        setFormData(prev => ({ ...prev, accountId: accs[0].id }));
      }
    }
  };

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('quickprint_orders', JSON.stringify(newOrders));
  };

  const handleAddItem = () => {
    if (isManualEntry) {
      if (!currentItem.serviceName) return;
      
      // SALVAMENTO AUTOMÁTICO NA BASE DE PRODUTOS
      const alreadyExists = products.some(p => p.name.toLowerCase() === currentItem.serviceName.toLowerCase());
      
      if (!alreadyExists) {
        const newProduct: Product = {
          id: Math.random().toString(36).substr(2, 9),
          name: currentItem.serviceName,
          category: 'Avulso',
          basePrice: currentItem.price * 0.5, // Estimativa de custo de 50%
          salePrice: currentItem.price,
          margin: 100,
          unit: 'Unidade',
          size: '',
          material: '',
          description: 'Cadastrado automaticamente via pedido manual.'
        };
        const updatedProducts = [...products, newProduct];
        setProducts(updatedProducts);
        localStorage.setItem('quickprint_products', JSON.stringify(updatedProducts));
      }

      setFormData({ 
        ...formData, 
        items: [...formData.items, { ...currentItem, id: Math.random().toString(36).substr(2, 9), isManual: true }] 
      });
    } else {
      if (!currentItem.serviceId) return;
      setFormData({ 
        ...formData, 
        items: [...formData.items, { ...currentItem, id: Math.random().toString(36).substr(2, 9), isManual: false }] 
      });
    }

    setCurrentItem({ id: '', serviceId: '', serviceName: '', quantity: 1, observations: '', price: 0, isManual: false });
    setIsManualEntry(false);
  };

  const calculateTotal = () => {
    return formData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const calculateInstallmentValue = () => {
    const balance = calculateTotal() - formData.entry;
    if (balance <= 0 || formData.installmentsCount <= 0) return 0;
    return balance / formData.installmentsCount;
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrderId(order.id);
    setFormData({
      clientId: order.clientId,
      clientName: order.clientName,
      clientPhone: '', 
      deliveryDate: order.deliveryDate || '',
      status: order.status,
      priority: 'Normal',
      paymentMethod: order.entryMethod || 'Dinheiro',
      entry: order.entry,
      accountId: accounts[0]?.id || '',
      generalObservations: '',
      items: order.items || [],
      installmentsCount: order.installmentsCount || 1,
      installmentIntervalDays: order.installmentIntervalDays || 30,
      firstInstallmentDate: order.firstInstallmentDate || '',
    });
    setIsInstallmentEnabled(!!order.installmentsCount && order.installmentsCount > 1);
    setIsModalOpen(true);
  };

  const handleDeleteOrder = (id: string) => {
    if (confirm('Deseja excluir este pedido permanentemente?')) {
      const updated = orders.filter(o => o.id !== id);
      saveOrders(updated);
    }
  };

  const handleOpenDetails = (order: Order) => {
    setViewingOrder(order);
    setIsDetailsOpen(true);
  };

  const handleCreateQuickClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientFormData.name) return;

    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name: clientFormData.name,
      email: clientFormData.email,
      phone: clientFormData.phone,
      document: clientFormData.document,
      responsible: clientFormData.responsible,
      address: clientFormData.address,
      neighborhood: clientFormData.neighborhood,
      city: clientFormData.city,
      observations: clientFormData.observations
    };

    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    localStorage.setItem('quickprint_clients', JSON.stringify(updatedClients));

    // Seleciona automaticamente o novo cliente no pedido
    setFormData({
      ...formData,
      clientId: newClient.id,
      clientName: newClient.name,
      clientPhone: newClient.phone
    });

    setIsClientModalOpen(false);
    setClientFormData({ 
      name: '', email: '', phone: '', document: '', 
      responsible: '', address: '', neighborhood: '', 
      city: '', observations: '' 
    });
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const total = calculateTotal();
    const installmentValue = calculateInstallmentValue();
    let orderNum = '';

    if (editingOrderId) {
      const updated = orders.map(o => {
        if (o.id === editingOrderId) {
          orderNum = o.orderNumber;
          return {
            ...o,
            clientId: formData.clientId,
            clientName: formData.clientName,
            status: formData.status,
            total,
            entry: formData.entry,
            entryMethod: formData.paymentMethod,
            deliveryDate: formData.deliveryDate,
            items: formData.items,
            installmentsCount: isInstallmentEnabled ? formData.installmentsCount : undefined,
            installmentValue: isInstallmentEnabled ? installmentValue : undefined,
            firstInstallmentDate: isInstallmentEnabled ? formData.firstInstallmentDate : undefined,
            installmentIntervalDays: isInstallmentEnabled ? formData.installmentIntervalDays : undefined,
          };
        }
        return o;
      });
      saveOrders(updated);
    } else {
      orderNum = (orders.length + 1).toString().padStart(4, '0');
      const newOrder: Order = {
        id: Math.random().toString(36).substr(2, 9),
        orderNumber: orderNum,
        clientId: formData.clientId || 'manual',
        clientName: formData.clientName,
        productId: formData.items[0]?.serviceId || '',
        productName: formData.items[0]?.serviceName || '',
        status: formData.status,
        total,
        entry: formData.entry,
        entryMethod: formData.paymentMethod,
        date: new Date().toISOString().split('T')[0],
        deliveryDate: formData.deliveryDate,
        items: formData.items,
        installmentsCount: isInstallmentEnabled ? formData.installmentsCount : undefined,
        installmentValue: isInstallmentEnabled ? installmentValue : undefined,
        firstInstallmentDate: isInstallmentEnabled ? formData.firstInstallmentDate : undefined,
        installmentIntervalDays: isInstallmentEnabled ? formData.installmentIntervalDays : undefined,
        paidInstallmentIndices: []
      };
      saveOrders([newOrder, ...orders]);
    }

    const storedFinancial = localStorage.getItem('quickprint_financial');
    const financial: FinancialEntry[] = storedFinancial ? JSON.parse(storedFinancial) : [];
    const newFinancialEntries: FinancialEntry[] = [];

    if (formData.entry > 0) {
      newFinancialEntries.push({
        id: Math.random().toString(36).substr(2, 9),
        description: `Entrada Pedido #${orderNum} - ${formData.clientName}`,
        amount: formData.entry,
        type: 'INCOME',
        date: new Date().toISOString().split('T')[0],
        category: 'Vendas',
        method: formData.paymentMethod,
        accountId: formData.accountId || accounts[0]?.id || 'default-cash',
        status: 'PAID'
      });
    }

    if (isInstallmentEnabled && formData.installmentsCount > 0 && formData.firstInstallmentDate) {
      const instValue = installmentValue;
      const startDate = new Date(formData.firstInstallmentDate + 'T12:00:00');
      
      for (let i = 0; i < formData.installmentsCount; i++) {
        const dueDate = new Date(startDate);
        dueDate.setDate(startDate.getDate() + (i * formData.installmentIntervalDays));
        
        newFinancialEntries.push({
          id: Math.random().toString(36).substr(2, 9),
          description: `Parc. ${i + 1}/${formData.installmentsCount} Pedido #${orderNum} - ${formData.clientName}`,
          amount: instValue,
          type: 'INCOME',
          date: dueDate.toISOString().split('T')[0],
          category: 'Vendas',
          method: 'A definir',
          accountId: formData.accountId || accounts[0]?.id || 'default-cash',
          status: 'PENDING'
        });
      }
    } else if (!isInstallmentEnabled && (total - formData.entry) > 0.01) {
      newFinancialEntries.push({
        id: Math.random().toString(36).substr(2, 9),
        description: `Saldo Restante Pedido #${orderNum} - ${formData.clientName}`,
        amount: total - formData.entry,
        type: 'INCOME',
        date: formData.deliveryDate || new Date().toISOString().split('T')[0],
        category: 'Vendas',
        method: 'A definir',
        accountId: formData.accountId || accounts[0]?.id || 'default-cash',
        status: 'PENDING'
      });
    }

    if (newFinancialEntries.length > 0) {
      localStorage.setItem('quickprint_financial', JSON.stringify([...newFinancialEntries, ...financial]));
    }
    
    setIsModalOpen(false);
    setEditingOrderId(null);
    setIsInstallmentEnabled(false);
  };

  const filteredOrders = orders.filter(o => 
    (o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || o.orderNumber.includes(searchTerm)) &&
    (o.date >= startDate && o.date <= endDate)
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
            {filteredOrders.map(o => (
              <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-xs">#{o.orderNumber}</td>
                <td className="px-6 py-4 font-bold text-xs uppercase">{o.clientName}</td>
                <td className="px-6 py-4 font-black text-xs">R$ {o.total.toFixed(2)}</td>
                <td className="px-6 py-4 text-center">
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 uppercase">{o.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center gap-4">
                    <button onClick={() => handleOpenDetails(o)} className="text-slate-500 hover:scale-110 transition-transform" title="Visualizar">
                      <Eye size={18} />
                    </button>
                    <button onClick={() => handleOpenDetails(o)} className="text-green-600 hover:scale-110 transition-transform" title="Financeiro">
                      <DollarSign size={18} />
                    </button>
                    <button onClick={() => handleEditOrder(o)} className="text-blue-500 hover:scale-110 transition-transform" title="Editar">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDeleteOrder(o.id)} className="text-red-500 hover:scale-110 transition-transform" title="Excluir">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in duration-200 my-4">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-slate-800">{editingOrderId ? 'Editar Pedido' : 'Novo Pedido'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700">Cliente</label>
                  <button 
                    type="button" 
                    onClick={() => setIsClientModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-600 bg-blue-50 rounded-md text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    <UserPlus size={14} /> Novo Cliente
                  </button>
                </div>
                <div className="relative">
                  <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none bg-white focus:border-slate-400 text-sm appearance-none text-slate-500"
                    value={formData.clientId}
                    onChange={e => {
                      const client = clients.find(c => c.id === e.target.value);
                      setFormData({...formData, clientId: e.target.value, clientName: client?.name || '', clientPhone: client?.phone || ''});
                    }}
                  >
                    <option value="">Selecione um cliente existente</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Nome do Cliente *</label>
                    <input 
                      type="text" 
                      placeholder="Nome completo"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-slate-400 text-sm placeholder:text-gray-300"
                      value={formData.clientName}
                      onChange={e => setFormData({...formData, clientName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Telefone</label>
                    <input 
                      type="text" 
                      placeholder="(00) 00000-0000"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-slate-400 text-sm placeholder:text-gray-300"
                      value={formData.clientPhone}
                      onChange={e => setFormData({...formData, clientPhone: formatPhone(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">ENTREGA</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-slate-400 text-sm text-slate-600"
                    value={formData.deliveryDate}
                    onChange={e => setFormData({...formData, deliveryDate: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">STATUS</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none bg-white focus:border-slate-400 text-sm text-slate-500"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as OrderStatus})}
                  >
                    {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">PRIORIDADE</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none bg-white focus:border-slate-400 text-sm text-slate-500"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">PAGAMENTO DA ENTRADA</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none bg-white focus:border-slate-400 text-sm text-slate-500"
                    value={formData.paymentMethod}
                    onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                  >
                    {systemPaymentMethods.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                 <div className="flex items-center gap-2 mb-2">
                    <Landmark size={14} className="text-blue-600" />
                    <label className="text-xs font-black text-blue-600 uppercase">Destino da Entrada (Carteira/Caixa)</label>
                 </div>
                 <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none bg-white focus:border-slate-400 text-sm text-slate-700 font-bold"
                    value={formData.accountId}
                    onChange={e => setFormData({...formData, accountId: e.target.value})}
                  >
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (R$ {acc.initialBalance.toFixed(2)})</option>)}
                  </select>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-semibold text-slate-800">Adicionar Itens</h4>
                  <button 
                    type="button" 
                    onClick={() => setIsManualEntry(!isManualEntry)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all border ${isManualEntry ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                  >
                    {isManualEntry ? <List size={14} /> : <Keyboard size={14} />}
                    {isManualEntry ? 'Seleção por Lista' : 'Preenchimento Manual'}
                  </button>
                </div>

                <div className="grid grid-cols-12 gap-3 items-end p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="col-span-12 md:col-span-3 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">SERVIÇO / PRODUTO</label>
                    {isManualEntry ? (
                      <input 
                        type="text" 
                        placeholder="Nome do serviço manual..."
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:border-orange-300 transition-colors"
                        value={currentItem.serviceName}
                        onChange={e => setCurrentItem({...currentItem, serviceName: e.target.value})}
                      />
                    ) : (
                      <select 
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg outline-none text-sm text-slate-400 bg-white"
                        value={currentItem.serviceId}
                        onChange={e => {
                          const p = products.find(prod => prod.id === e.target.value);
                          setCurrentItem({...currentItem, serviceId: e.target.value, serviceName: p?.name || '', price: p?.salePrice || 0});
                        }}
                      >
                        <option value="">Selecione um serviço</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    )}
                  </div>
                  <div className="col-span-6 md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">VR. UNITARIO (R$)</label>
                    <input 
                      type="number" step="0.01"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg outline-none text-sm font-bold text-slate-700 bg-white"
                      value={currentItem.price || ''}
                      onChange={e => setCurrentItem({...currentItem, price: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase text-center block">QUANTIDADE</label>
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <button type="button" onClick={() => setCurrentItem({...currentItem, quantity: Math.max(1, currentItem.quantity - 1)})} className="px-2 py-2 hover:bg-gray-50 text-slate-400 border-r"><Minus size={14} /></button>
                      <input type="number" className="w-full text-center text-sm font-medium outline-none" value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})} />
                      <button type="button" onClick={() => setCurrentItem({...currentItem, quantity: currentItem.quantity + 1})} className="px-2 py-2 hover:bg-gray-50 text-slate-400 border-l"><Plus size={14} /></button>
                    </div>
                  </div>
                  <div className="col-span-9 md:col-span-4 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">OBSERVAÇÕES</label>
                    <input type="text" placeholder="Detalhes" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg outline-none text-sm placeholder:text-gray-300 bg-white" value={currentItem.observations} onChange={e => setCurrentItem({...currentItem, observations: e.target.value})} />
                  </div>
                  <div className="col-span-3 md:col-span-1">
                    <button type="button" onClick={handleAddItem} className="w-full bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition-colors flex justify-center shadow-md shadow-blue-100"><Plus size={20} /></button>
                  </div>
                </div>

                <div className="space-y-3">
                  {formData.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm animate-in slide-in-from-left-2 transition-all hover:border-blue-200">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.serviceName}</span>
                          {item.isManual && <span className="text-[8px] font-black bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded uppercase">Manual</span>}
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">{item.quantity}x • R$ {item.price.toFixed(2)} un • {item.observations || 'Sem observações'}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-sm font-black text-blue-600">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        <button type="button" onClick={() => setFormData({...formData, items: formData.items.filter(i => i.id !== item.id)})} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4 border-t border-gray-100">
                <div className="w-full md:w-1/3 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">VALOR DE ENTRADA (R$)</label>
                  <input type="number" step="0.01" className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-slate-400 text-sm font-black bg-slate-50" value={formData.entry || ''} onChange={e => setFormData({...formData, entry: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="w-full md:w-auto text-center md:text-right space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">TOTAL LÍQUIDO DO PEDIDO</p>
                  <p className="text-4xl font-black text-blue-600 tracking-tighter">R$ {calculateTotal().toFixed(2)}</p>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-3 border border-gray-200 text-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-colors">CANCELAR</button>
                <button type="submit" className="px-10 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">FINALIZAR PEDIDO</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO CLIENTE (FIEL À IMAGEM) */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#1e293b]">Novo Cliente</h3>
              <button onClick={() => setIsClientModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateQuickClient} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                
                {/* Nome Completo */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-[#475569]">Nome Completo *</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Nome do cliente"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors placeholder:text-gray-300" 
                    value={clientFormData.name} 
                    onChange={e => setClientFormData({...clientFormData, name: e.target.value})} 
                  />
                </div>

                {/* Telefone */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-[#475569]">Telefone</label>
                  <input 
                    type="text" 
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors placeholder:text-gray-300" 
                    value={clientFormData.phone} 
                    onChange={e => setClientFormData({...clientFormData, phone: formatPhone(e.target.value)})} 
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-[#475569]">Email</label>
                  <input 
                    type="email" 
                    placeholder="email@exemplo.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors placeholder:text-gray-300" 
                    value={clientFormData.email} 
                    onChange={e => setClientFormData({...clientFormData, email: e.target.value})} 
                  />
                </div>

                {/* CPF/CNPJ */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-[#475569]">CPF/CNPJ</label>
                  <input 
                    type="text" 
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors placeholder:text-gray-300" 
                    value={clientFormData.document} 
                    onChange={e => setClientFormData({...clientFormData, document: e.target.value})} 
                  />
                </div>

                {/* Responsável */}
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="block text-sm font-bold text-[#475569]">Responsável</label>
                  <input 
                    type="text" 
                    placeholder="Nome do responsável pelo cliente"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors placeholder:text-gray-300" 
                    value={clientFormData.responsible} 
                    onChange={e => setClientFormData({...clientFormData, responsible: e.target.value})} 
                  />
                </div>

                {/* Endereço */}
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="block text-sm font-bold text-[#475569]">Endereço</label>
                  <input 
                    type="text" 
                    placeholder="Rua e número"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors placeholder:text-gray-300" 
                    value={clientFormData.address} 
                    onChange={e => setClientFormData({...clientFormData, address: e.target.value})} 
                  />
                </div>

                {/* Bairro */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-[#475569]">Bairro</label>
                  <input 
                    type="text" 
                    placeholder="Bairro"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors placeholder:text-gray-300" 
                    value={clientFormData.neighborhood} 
                    onChange={e => setClientFormData({...clientFormData, neighborhood: e.target.value})} 
                  />
                </div>

                {/* Cidade */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-[#475569]">Cidade</label>
                  <input 
                    type="text" 
                    placeholder="Cidade"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors placeholder:text-gray-300" 
                    value={clientFormData.city} 
                    onChange={e => setClientFormData({...clientFormData, city: e.target.value})} 
                  />
                </div>

                {/* Observações */}
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="block text-sm font-bold text-[#475569]">Observações</label>
                  <textarea 
                    rows={4}
                    placeholder="Informações adicionais sobre o cliente"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-gray-400" 
                    value={clientFormData.observations} 
                    onChange={e => setClientFormData({...clientFormData, observations: e.target.value})} 
                  />
                </div>

              </div>

              {/* Botões Ações */}
              <div className="flex justify-end gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsClientModalOpen(false)} 
                  className="px-8 py-3 border border-gray-200 text-[#1e293b] rounded-lg font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-3 bg-[#82cf9e] text-white rounded-lg font-bold shadow-md hover:bg-[#6fb98d] transition-all flex items-center gap-2"
                >
                  <Save size={18} />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailsOpen && viewingOrder && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-slate-50/80">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-100">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">PEDIDO #{viewingOrder.orderNumber}</h3>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-blue-100">{viewingOrder.status}</span>
                </div>
              </div>
              <button onClick={() => setIsDetailsOpen(false)} className="p-3 text-slate-400 hover:bg-white rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
               <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CLIENTE</p>
                    <p className="text-2xl font-black text-slate-800 tracking-tight uppercase">{viewingOrder.clientName}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">VALOR TOTAL</p>
                    <p className="text-3xl font-black text-blue-700">R$ {viewingOrder.total.toFixed(2)}</p>
                  </div>
               </div>
               
               <div className="p-6 bg-slate-50 rounded-3xl border border-gray-100 grid grid-cols-2 gap-6 shadow-inner">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Valor Pago</span>
                    <p className="text-xl font-black text-green-600 mt-1">R$ {viewingOrder.entry.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Saldo Restante</span>
                    <p className={`text-xl font-black mt-1 ${(viewingOrder.total - viewingOrder.entry) > 0.01 ? 'text-red-500' : 'text-green-600'}`}>
                      R$ {(viewingOrder.total - viewingOrder.entry).toFixed(2)}
                    </p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => generatePDF('OS', viewingOrder, 'print', false)} className="flex-1 py-3 px-4 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
                    <ClipboardList size={16} /> IMPRIMIR OS
                 </button>
                 <button onClick={() => generatePDF('PEDIDO', viewingOrder, 'print')} className="flex-1 py-3 px-4 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-700 transition-all flex items-center justify-center gap-2">
                    <Printer size={16} /> COMPROVANTE
                 </button>
               </div>
               
               <button onClick={() => setIsDetailsOpen(false)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200">
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
