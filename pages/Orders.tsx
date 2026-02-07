
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Pencil, Trash2, X, ShoppingCart, 
  FileText, PlusCircle, MinusCircle, User, Banknote, Calculator, CreditCard, Calendar,
  Eye, Timer, ListOrdered, CheckCircle2 as CheckIcon, DollarSign, Smartphone, ArrowLeftRight, Landmark, AlertCircle,
  Receipt, MessageSquare, Save, Activity, CalendarDays, ClipboardList, Download, Printer, Filter
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
}

const Orders: React.FC = () => {
  const { startDate, endDate } = useDateFilter();
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  
  const [quickPayment, setQuickPayment] = useState({ amount: 0, method: '', accountId: '', date: new Date().toISOString().split('T')[0] });

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [systemPaymentMethods, setSystemPaymentMethods] = useState<PaymentMethod[]>([]);

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
    const loadData = () => {
      const storedOrders = localStorage.getItem('quickprint_orders');
      if (storedOrders) setOrders(JSON.parse(storedOrders));
      
      const storedClients = localStorage.getItem('quickprint_clients');
      if (storedClients) {
        const parsed: Client[] = JSON.parse(storedClients);
        // Garante ordenação alfabética na seleção de clientes do pedido
        setClients(parsed.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'accent' })));
      }
      
      const storedProducts = localStorage.getItem('quickprint_products');
      if (storedProducts) {
        const parsed: Product[] = JSON.parse(storedProducts);
        // Garante ordenação alfabética na seleção de produtos do pedido
        setProducts(parsed.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'accent' })));
      }
      
      const storedSettings = localStorage.getItem('quickprint_settings');
      if (storedSettings) {
        const settings: SystemSettings = JSON.parse(storedSettings);
        const availableAccounts = settings.accounts || [];
        setAccounts(availableAccounts.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
        const methods = settings.paymentMethods || [{ id: 'pix', name: 'PIX' }];
        setSystemPaymentMethods(methods.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
        
        if (!editingOrderId) {
          setFormData(prev => ({ 
            ...prev, 
            accountId: availableAccounts[0]?.id || '',
            entryMethod: methods[0]?.name || 'PIX'
          }));
        }
      }
    };
    loadData();
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
    const balance = total - formData.entry;
    const orderNumber = editingOrderId 
      ? orders.find(o => o.id === editingOrderId)?.orderNumber || '0000'
      : (orders.length + 1).toString().padStart(4, '0');

    const newOrder: Order = {
      id: editingOrderId || Math.random().toString(36).substr(2, 9),
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
      installmentValue: formData.installmentsCount > 1 ? balance / formData.installmentsCount : 0,
      firstInstallmentDate: formData.installmentsCount > 1 ? formData.firstInstallmentDate : undefined,
      paidInstallmentIndices: editingOrderId ? orders.find(o => o.id === editingOrderId)?.paidInstallmentIndices || [] : []
    };

    const updatedOrders = editingOrderId 
      ? orders.map(o => o.id === editingOrderId ? newOrder : o)
      : [newOrder, ...orders];
      
    saveOrders(updatedOrders);

    // FINANCEIRO
    const storedFinancial = localStorage.getItem('quickprint_financial');
    let financial: FinancialEntry[] = storedFinancial ? JSON.parse(storedFinancial) : [];
    financial = financial.filter(f => !f.description.includes(`Pedido #${orderNumber}`));

    if (formData.entry > 0) {
      financial.push({
        id: Math.random().toString(36).substr(2, 9),
        description: `Sinal Pedido #${orderNumber}: ${newOrder.clientName}`,
        amount: formData.entry,
        type: 'INCOME',
        date: new Date().toISOString().split('T')[0],
        category: 'Vendas',
        method: formData.entryMethod,
        accountId: formData.accountId,
        status: 'PAID'
      });
    }

    if (formData.installmentsCount > 1 && balance > 0) {
      const instValue = balance / formData.installmentsCount;
      const startDate = new Date(formData.firstInstallmentDate + 'T12:00:00');
      for (let i = 0; i < formData.installmentsCount; i++) {
        const dueDate = new Date(startDate);
        dueDate.setDate(startDate.getDate() + (i * formData.installmentIntervalDays));
        financial.push({
          id: Math.random().toString(36).substr(2, 9),
          description: `Parc. ${i+1}/${formData.installmentsCount} Pedido #${orderNumber}: ${newOrder.clientName}`,
          amount: instValue,
          type: 'INCOME',
          date: dueDate.toISOString().split('T')[0],
          category: 'Vendas',
          method: 'Boleto/Cartão',
          accountId: formData.accountId,
          status: 'PENDING'
        });
      }
    } else if (balance > 0) {
      financial.push({
        id: Math.random().toString(36).substr(2, 9),
        description: `Saldo Restante Pedido #${orderNumber}: ${newOrder.clientName}`,
        amount: balance,
        type: 'INCOME',
        date: formData.deliveryDate || new Date().toISOString().split('T')[0],
        category: 'Vendas',
        method: 'A DEFINIR',
        accountId: formData.accountId,
        status: 'PENDING'
      });
    }

    localStorage.setItem('quickprint_financial', JSON.stringify(financial));
    handleCloseModal();
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
      description: `Recebimento Saldo Pedido #${viewingOrder.orderNumber}`,
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
  };

  // Added missing handleDeleteOrder function to fix "Cannot find name 'handleDeleteOrder'" error.
  const handleDeleteOrder = (id: string) => {
    if (window.confirm('Deseja realmente excluir este pedido? Esta ação não pode ser desfeita.')) {
      const orderToDelete = orders.find(o => o.id === id);
      const updatedOrders = orders.filter(o => o.id !== id);
      saveOrders(updatedOrders);

      // Clean up associated financial entries
      const storedFinancial = localStorage.getItem('quickprint_financial');
      if (storedFinancial && orderToDelete) {
        let financial: FinancialEntry[] = JSON.parse(storedFinancial);
        financial = financial.filter(f => !f.description.includes(`Pedido #${orderToDelete.orderNumber}`));
        localStorage.setItem('quickprint_financial', JSON.stringify(financial));
      }
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || o.orderNumber.includes(searchTerm);
    const matchesPeriod = o.date >= startDate && o.date <= endDate;
    return matchesSearch && matchesPeriod;
  });

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
                  <td className="px-6 py-4 font-mono text-xs font-bold">#{order.orderNumber}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 uppercase text-xs">{order.clientName}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">{new Date(order.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 text-right font-black text-slate-600">R$ {order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase bg-blue-50 text-blue-600 border-blue-100">{order.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleOpenDetails(order)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Ver Detalhes"><Eye size={16} /></button>
                      <button onClick={() => handleEditOrder(order)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Editar"><Pencil size={16} /></button>
                      <button onClick={() => generatePDF('PEDIDO', order, 'print')} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all" title="Imprimir"><Printer size={16} /></button>
                      <button onClick={() => handleDeleteOrder(order.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Excluir"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic text-sm font-medium">Nenhum pedido encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl my-8 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
              <h3 className="text-xl font-black uppercase tracking-tight">{editingOrderId ? 'Editar Pedido' : 'Novo Pedido'}</h3>
              <button onClick={handleCloseModal}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmitOrder} className="p-8 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente *</label>
                  <select required className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none font-bold" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                    <option value="">Selecione...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Previsão Entrega</label>
                  <input type="date" className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none font-bold" value={formData.deliveryDate} onChange={e => setFormData({...formData, deliveryDate: e.target.value})} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="text-[10px] font-black text-blue-600 uppercase">Itens do Pedido</h4>
                  <button type="button" onClick={handleAddItem} className="text-[10px] font-black text-blue-600 flex items-center gap-1 uppercase"><PlusCircle size={14} /> Adicionar Item</button>
                </div>
                {formData.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 p-4 bg-slate-50 rounded-2xl border relative animate-in slide-in-from-right-2">
                    <div className="col-span-4">
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold" value={item.serviceId} onChange={e => handleUpdateItem(item.id, 'serviceId', e.target.value)}>
                        <option value="">Produto...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="col-span-1"><input type="number" className="w-full px-2 py-2 border border-gray-200 rounded-xl text-xs font-bold text-center" value={item.quantity} onChange={e => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 1)} /></div>
                    <div className="col-span-2"><input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold" value={item.price} onChange={e => handleUpdateItem(item.id, 'price', parseFloat(e.target.value) || 0)} /></div>
                    <div className="col-span-5"><input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold" placeholder="Obs..." value={item.observations} onChange={e => handleUpdateItem(item.id, 'observations', e.target.value)} /></div>
                    <button type="button" onClick={() => handleRemoveItem(item.id)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-4 border rounded-2xl font-black text-[10px] uppercase text-gray-500">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-blue-100">Salvar Pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
