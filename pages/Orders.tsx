
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Pencil, Trash2, X, ShoppingCart, 
  FileText, Printer, UserPlus, PackagePlus, Upload, 
  PlusCircle, LayoutGrid, Layers, Settings2, List,
  MinusCircle, Archive, Banknote, Save, Check
} from 'lucide-react';
import { Order, OrderStatus, SystemSettings, Client, Product, FinancialEntry } from '../types';

type DocType = 'PEDIDO' | 'ORCAMENTO' | 'OS';

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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocType>('PEDIDO');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);

  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    phone: '',
    deliveryDate: '',
    status: OrderStatus.OPEN,
    priority: 'Normal',
    paymentMethod: 'Dinheiro',
    generalObservations: '',
    entry: 0
  });

  const [formItems, setFormItems] = useState<OrderItem[]>([]);

  const [newItem, setNewItem] = useState({
    serviceId: '',
    manualServiceName: '',
    quantity: 1,
    observations: '',
    price: 0
  });
  
  const [sysSettings, setSysSettings] = useState<SystemSettings>({
    companyName: 'QuickPrint Pro',
    companyTagline: 'SOLUÇÕES EM GRÁFICA RÁPIDA E DESIGN',
    cnpj: '00.000.000/0001-00',
    address: 'Rua da Gráfica, 123 - Centro',
    phone: '(11) 99999-9999',
    email: 'contato@quickprint.com',
    website: 'www.quickprint.com',
    primaryColor: '#2563eb',
    estimateValidityDays: 7,
    defaultFooterNote: 'QuickPrint Pro - Sistema de Gestão Gráfica'
  });

  const [clients] = useState<Client[]>([
    { id: 'c1', name: 'João Silva', email: 'joao@email.com', phone: '(11) 99999-9999', document: '123.456.789-00' },
    { id: 'c2', name: 'Ana Costa', email: 'ana@email.com', phone: '(11) 88888-8888', document: '987.654.321-11' }
  ]);

  const [products] = useState<Product[]>([
    { id: 'p1', name: 'Cartão de Visita 4x4', basePrice: 25, salePrice: 45, margin: 80, size: '9x5', material: 'Couché', description: '' },
    { id: 'p2', name: 'Banner Lona 440g', basePrice: 150, salePrice: 300, margin: 100, size: '1x1m', material: 'Lona', description: '' }
  ]);

  const [orders, setOrders] = useState<Order[]>([]);

  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'Dinheiro',
    account: '',
    observations: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem('quickprint_orders');
    if (stored) {
      setOrders(JSON.parse(stored));
    } else {
      const initial: Order[] = [
        { id: '1', orderNumber: '469638', clientId: 'c1', clientName: 'João Silva', productId: 'p1', productName: 'Cartão de Visita 4x4', status: OrderStatus.OPEN, total: 323.41, entry: 215.60, date: new Date().toLocaleDateString('pt-BR') },
      ];
      setOrders(initial);
      localStorage.setItem('quickprint_orders', JSON.stringify(initial));
    }
  }, []);

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('quickprint_orders', JSON.stringify(newOrders));
  };

  const handleOpenPaymentModal = (order: Order) => {
    setActiveOrder(order);
    setPaymentData({
      amount: '',
      method: 'Dinheiro',
      account: '',
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

    // Update orders with auto-archive check
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

  const handleOpenCreateModal = () => {
    setFormItems([]);
    setIsManualMode(false);
    setNewItem({ serviceId: '', manualServiceName: '', quantity: 1, observations: '', price: 0 });
    setFormData({
      clientId: '',
      clientName: '',
      phone: '',
      deliveryDate: '',
      status: OrderStatus.OPEN,
      priority: 'Normal',
      paymentMethod: 'Dinheiro',
      generalObservations: '',
      entry: 0
    });
    setIsModalOpen(true);
  };

  const handleAddOrderItem = () => {
    let item: OrderItem;
    if (isManualMode) {
      if (!newItem.manualServiceName || newItem.price <= 0) {
          alert("Preencha o nome e preço do serviço manual.");
          return;
      }
      item = {
        id: Math.random().toString(36).substr(2, 9),
        serviceId: 'manual',
        serviceName: newItem.manualServiceName,
        quantity: Math.max(1, newItem.quantity),
        observations: newItem.observations,
        price: newItem.price
      };
    } else {
      if (!newItem.serviceId) {
          alert("Selecione um serviço da lista.");
          return;
      }
      const product = products.find(p => p.id === newItem.serviceId);
      if (!product) return;
      item = {
        id: Math.random().toString(36).substr(2, 9),
        serviceId: product.id,
        serviceName: product.name,
        quantity: Math.max(1, newItem.quantity),
        observations: newItem.observations,
        price: product.salePrice
      };
    }
    setFormItems([...formItems, item]);
    setNewItem({ serviceId: '', manualServiceName: '', quantity: 1, observations: '', price: 0 });
  };

  const handleUpdateItemQuantity = (id: string, delta: number) => {
    setFormItems(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const handleRemoveOrderItem = (id: string) => {
    setFormItems(formItems.filter(item => item.id !== id));
  };

  const calculateTotal = () => formItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleSubmitNewOrder = (e: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (formItems.length === 0) {
      alert("Adicione pelo menos um item ao pedido.");
      return;
    }

    if (!formData.clientName) {
      alert("Informe o nome do cliente.");
      return;
    }

    const total = calculateTotal();
    const orderNumber = (469638 + orders.length + 1).toString();
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      orderNumber: orderNumber,
      clientId: formData.clientId || 'manual',
      clientName: formData.clientName,
      productId: formItems[0]?.serviceId || 'manual',
      productName: formItems.length > 1 ? `${formItems[0].serviceName} (+${formItems.length - 1})` : formItems[0].serviceName,
      status: formData.status,
      total: total, 
      entry: formData.entry,
      date: new Date().toLocaleDateString('pt-BR'),
      archived: false
    };
    
    const newOrders = [newOrder, ...orders];
    saveOrders(newOrders);

    if (formData.entry > 0) {
      const storedFinancial = localStorage.getItem('quickprint_financial') || '[]';
      const financial: FinancialEntry[] = JSON.parse(storedFinancial);
      const newEntry: FinancialEntry = {
        id: Math.random().toString(36).substr(2, 9),
        description: `Entrada: ${formData.clientName}`,
        amount: formData.entry,
        type: 'INCOME',
        date: new Date().toISOString().split('T')[0],
        category: 'Vendas'
      };
      localStorage.setItem('quickprint_financial', JSON.stringify([newEntry, ...financial]));
    }

    setIsModalOpen(false);
  };

  const handleArchive = (id: string) => {
    if (confirm('Este pedido será movido para o Arquivo Morto. Confirmar?')) {
      const updated = orders.map(o => o.id === id ? { ...o, archived: true } : o);
      saveOrders(updated);
    }
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm('Deseja excluir este pedido permanentemente?')) {
      saveOrders(orders.filter(o => o.id !== id));
    }
  };

  const filteredOrders = orders.filter(o => 
    !o.archived && (
      o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.orderNumber.includes(searchTerm)
    )
  );

  const handlePrint = () => {
    setTimeout(() => window.print(), 100);
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: fixed; left: 0; top: 0; width: 100%; height: auto; margin: 0; padding: 15mm; background: white; z-index: 9999; }
          .no-print { display: none !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Gerenciar Pedidos</h2>
        <button 
          onClick={handleOpenCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 font-medium transition-all shadow-md active:scale-95"
        >
          <Plus size={20} /> Novo Pedido
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4 items-center no-print">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por cliente ou pedido..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden no-print">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Total</th>
              <th className="px-6 py-4 text-right">Vlr. Aberto</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.map((order) => {
              const pendingValue = order.total - order.entry;
              const isPaid = pendingValue <= 0.01;
              const canArchive = order.status === OrderStatus.COMPLETED && isPaid;

              return (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">#{order.orderNumber}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">{order.clientName}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-700">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-600">R$ {order.total.toFixed(2)}</td>
                  <td className={`px-6 py-4 text-right font-black ${!isPaid ? 'text-red-500' : 'text-green-600'}`}>
                    {!isPaid ? `R$ ${pendingValue.toFixed(2)}` : 'QUITADO'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1">
                      <button title="Ver Detalhes" onClick={() => { setActiveOrder(order); setIsPreviewOpen(true); }} className="text-gray-400 hover:text-blue-600 p-2"><FileText size={18} /></button>
                      {!isPaid && (
                        <button title="Registrar Pagamento" onClick={() => handleOpenPaymentModal(order)} className="text-gray-400 hover:text-green-600 p-2">
                          <Banknote size={18} />
                        </button>
                      )}
                      {canArchive && (
                        <button title="Arquivar Pedido" onClick={() => handleArchive(order.id)} className="text-gray-400 hover:text-slate-700 p-2">
                          <Archive size={18} />
                        </button>
                      )}
                      <button title="Excluir" onClick={() => handleDeleteOrder(order.id)} className="text-gray-400 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400 italic text-sm">Nenhum pedido ativo encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] animate-in zoom-in duration-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
              <h3 className="text-xl font-bold text-slate-800">Novo Pedido</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={28} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-bold text-gray-700">Cliente</label>
                  <button type="button" className="flex items-center gap-2 text-blue-600 border border-gray-200 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    <UserPlus size={16} /> Novo Cliente
                  </button>
                </div>
                <select 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.clientId}
                  onChange={(e) => {
                    const client = clients.find(c => c.id === e.target.value);
                    if (client) {
                      setFormData({...formData, clientId: client.id, clientName: client.name, phone: formatPhone(client.phone)});
                    } else {
                      setFormData({...formData, clientId: '', clientName: '', phone: ''});
                    }
                  }}
                >
                  <option value="">Selecione um cliente existente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nome do Cliente *</label>
                    <input 
                      required type="text" placeholder="Nome completo"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Telefone</label>
                    <input type="text" placeholder="(00) 00000-0000"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={formData.phone} onChange={e => setFormData({...formData, phone: formatPhone(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              {/* ... (rest of the code stays the same) */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h4 className="text-lg font-bold text-slate-800">Adicionar Itens</h4>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setIsManualMode(false); setNewItem({...newItem, manualServiceName: '', price: 0}); }}
                      className={`flex items-center gap-1.5 px-4 py-1.5 border rounded-lg text-xs font-bold transition-all ${!isManualMode ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                      <List size={14} /> Carregar Modelo
                    </button>
                    <button type="button" onClick={() => { setIsManualMode(true); setNewItem({...newItem, serviceId: ''}); }}
                      className={`flex items-center gap-1.5 px-4 py-1.5 border rounded-lg text-xs font-bold transition-all ${isManualMode ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                      <Pencil size={14} /> Modo Manual
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className={isManualMode ? "md:col-span-4" : "md:col-span-5"}>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Serviço / Produto</label>
                    {isManualMode ? (
                      <input type="text" placeholder="Ex: Arte Logotipo" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                        value={newItem.manualServiceName} onChange={e => setNewItem({...newItem, manualServiceName: e.target.value})}
                      />
                    ) : (
                      <select className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                        value={newItem.serviceId} onChange={e => setNewItem({...newItem, serviceId: e.target.value})}>
                        <option value="">Selecione um serviço</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 text-center">Quantidade</label>
                    <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                        <button type="button" onClick={() => setNewItem(prev => ({...prev, quantity: Math.max(1, prev.quantity - 1)}))} className="px-2 py-2 hover:bg-gray-100 text-gray-500">-</button>
                        <input type="number" className="w-full px-1 py-2 text-sm text-center bg-white outline-none border-x border-gray-100"
                            value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                        />
                        <button type="button" onClick={() => setNewItem(prev => ({...prev, quantity: prev.quantity + 1}))} className="px-2 py-2 hover:bg-gray-100 text-gray-500">+</button>
                    </div>
                  </div>
                  {isManualMode && (
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Preço Unit. R$</label>
                      <input type="number" step="0.01" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none"
                        value={newItem.price || ''} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  )}
                  <div className={isManualMode ? "md:col-span-3" : "md:col-span-4"}>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Observações</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none"
                      value={newItem.observations} onChange={e => setNewItem({...newItem, observations: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <button type="button" onClick={handleAddOrderItem} className="w-full flex items-center justify-center py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg">
                      <PlusCircle size={24} />
                    </button>
                  </div>
                </div>
                {formItems.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {formItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-lg animate-in slide-in-from-top duration-200">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-blue-900">{item.serviceName}</p>
                          <p className="text-xs text-blue-700 italic">{item.observations || 'Sem observações'}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-full px-2 py-1">
                            <button type="button" onClick={() => handleUpdateItemQuantity(item.id, -1)} className="text-blue-600 hover:text-blue-800"><MinusCircle size={16} /></button>
                            <span className="text-xs font-black min-w-[20px] text-center">{item.quantity}</span>
                            <button type="button" onClick={() => handleUpdateItemQuantity(item.id, 1)} className="text-blue-600 hover:text-blue-800"><PlusCircle size={16} /></button>
                          </div>
                          <div className="text-right min-w-[80px]">
                            <p className="text-[10px] text-blue-400 uppercase font-bold leading-none">Subtotal</p>
                            <p className="text-sm font-black text-blue-900">R$ {(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <button type="button" onClick={() => handleRemoveOrderItem(item.id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Entrega</label>
                  <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.deliveryDate} onChange={e => setFormData({...formData, deliveryDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as OrderStatus})}>
                    {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Prioridade</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="Baixa">Baixa</option>
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pagamento</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Pix">Pix</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Observações Gerais do Pedido</label>
                <textarea rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  value={formData.generalObservations} onChange={e => setFormData({...formData, generalObservations: e.target.value})}
                ></textarea>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor de Entrada (R$)</label>
                    <input type="number" step="0.01" className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-base font-black text-green-700 bg-white outline-none"
                        value={formData.entry} onChange={e => setFormData({...formData, entry: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="h-12 w-px bg-gray-300 hidden md:block"></div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Total Líquido</p>
                    <p className="text-3xl font-black text-blue-700">R$ {calculateTotal().toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 border border-gray-300 text-gray-600 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-gray-100 transition-all">Cancelar</button>
                    <button type="button" onClick={handleSubmitNewOrder} className="px-10 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">Criar Pedido</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ... (rest of the code stays the same) */}
      {isPaymentModalOpen && activeOrder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 pb-0 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Registrar Pagamento</h3>
                <p className="text-sm text-slate-400 font-medium">Pedido #PED{activeOrder.orderNumber}</p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleRegisterPayment} className="p-6 space-y-6">
              <div className="bg-slate-50/80 rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 font-medium">Valor Total:</span>
                  <span className="text-lg font-bold text-slate-800">R$ {activeOrder.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 font-medium">Já Pago:</span>
                  <span className="text-lg font-bold text-green-600">R$ {activeOrder.entry.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-sm text-slate-500 font-medium">Restante:</span>
                  <span className="text-xl font-bold text-red-500">R$ {(activeOrder.total - activeOrder.entry).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Valor do Pagamento *</label>
                <div className="relative">
                  <input required type="number" step="0.01" className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500/20 text-lg font-medium"
                    value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Forma de Pagamento</label>
                <select className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-white outline-none"
                  value={paymentData.method} onChange={e => setPaymentData({...paymentData, method: e.target.value})}>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Pix">Pix</option>
                  <option value="Cartão">Cartão</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-3 border border-slate-200 rounded-lg font-bold text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-[1.5] py-3 bg-[#8cd0a8] text-white rounded-lg font-bold text-sm shadow-lg hover:bg-[#7bc097] transition-all active:scale-95">
                  <Save size={18} /> Registrar Pagamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isPreviewOpen && activeOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[95vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 no-print">
              <div className="flex gap-2 p-1 bg-gray-200 rounded-lg">
                {(['PEDIDO', 'ORCAMENTO', 'OS'] as DocType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedDocType(type)}
                    className={`px-4 py-1.5 rounded-md text-[10px] font-black tracking-widest transition-all ${
                      selectedDocType === type 
                        ? 'bg-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={selectedDocType === type ? { color: sysSettings.primaryColor } : {}}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrint} 
                  className="text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-xs transition-all active:scale-95 shadow-md"
                  style={{ backgroundColor: sysSettings.primaryColor }}
                >
                  <Printer size={16} /> IMPRIMIR / PDF
                </button>
                <button 
                  onClick={() => setIsPreviewOpen(false)} 
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-100 flex justify-center">
              <div id="print-area" className="bg-white w-full md:w-[210mm] min-h-[297mm] p-6 md:p-[20mm] shadow-2xl flex flex-col text-slate-800 font-sans">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex-1">
                    <div className="pb-4" style={{ borderBottom: `4px solid ${sysSettings.primaryColor}` }}>
                      <h1 className="text-3xl font-black tracking-tighter uppercase mb-1" style={{ color: sysSettings.primaryColor }}>
                        {sysSettings.companyName}
                      </h1>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                        {sysSettings.companyTagline}
                      </p>
                    </div>
                    <div className="mt-4 text-[10px] text-gray-500 leading-relaxed font-medium">
                      <p>{sysSettings.address}</p>
                      <p><span className="font-bold">CNPJ:</span> {sysSettings.cnpj}</p>
                      <p><span className="font-bold">Tel:</span> {sysSettings.phone} | <span className="font-bold">Email:</span> {sysSettings.email}</p>
                      {sysSettings.website && <p className="font-bold underline">{sysSettings.website}</p>}
                    </div>
                  </div>
                  <div className="text-right pl-8">
                    <div className="inline-block px-4 py-1 rounded text-white font-black text-sm mb-2" style={{ backgroundColor: sysSettings.primaryColor }}>{selectedDocType}</div>
                    <p className="text-xl font-bold">Nº {activeOrder.orderNumber}</p>
                    <p className="text-xs text-gray-400">Emissão: {activeOrder.date}</p>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 p-4 rounded mb-8">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase mb-1">Cliente</h4>
                    <p className="font-bold">{activeOrder.clientName}</p>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 text-[10px] uppercase font-bold text-gray-400">
                        <th className="text-left py-2">Serviço</th>
                        <th className="text-right py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-4 font-medium">{activeOrder.productName}</td>
                        <td className="py-4 text-right font-bold">R$ {activeOrder.total.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-8 pt-6 border-t">
                  <div className="flex justify-end gap-10">
                    <p className="font-black text-xl">TOTAL: R$ {activeOrder.total.toFixed(2)}</p>
                  </div>
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
