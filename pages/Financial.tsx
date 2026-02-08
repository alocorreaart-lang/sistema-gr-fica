
import React, { useState, useEffect } from 'react';
import { 
  ArrowUpCircle, ArrowDownCircle, Wallet, Calendar, 
  Search, Filter, Plus, X, Save, TrendingUp, TrendingDown,
  ShoppingCart, Banknote, DollarSign, User, CheckCircle2,
  Smartphone, CreditCard, ArrowLeftRight, Landmark, Trash2,
  Eye, Pencil, AlertCircle, Check, RefreshCcw, Repeat, Clock,
  PiggyBank, Settings2, Tag, Hash
} from 'lucide-react';
import { FinancialEntry, SystemSettings, Account, PaymentMethod } from '../types';
import { useDateFilter } from '../App';

const Financial: React.FC = () => {
  const { startDate, endDate } = useDateFilter();
  const [activeTab, setActiveTab] = useState<'MOVIMENTACOES' | 'CARTEIRAS' | 'METODOS'>('MOVIMENTACOES');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<FinancialEntry | null>(null);
  const [quittanceMethod, setQuittanceMethod] = useState<string>('PIX');
  const [quittanceDate, setQuittanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [systemPaymentMethods, setSystemPaymentMethods] = useState<PaymentMethod[]>([]);

  const [formData, setFormData] = useState({
    id: '',
    description: '',
    amount: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    date: new Date().toISOString().split('T')[0],
    category: 'Insumos',
    accountId: '',
    method: 'PIX',
    status: 'PAID' as 'PAID' | 'PENDING',
    isRecurring: false,
    recurrencePeriod: 'MONTHLY' as 'MONTHLY' | 'WEEKLY' | 'YEARLY'
  });

  useEffect(() => {
    loadSettings();
    const storedEntries = localStorage.getItem('quickprint_financial');
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
  }, []);

  const loadSettings = () => {
    const storedSettings = localStorage.getItem('quickprint_settings');
    if (storedSettings) {
      const settings: SystemSettings = JSON.parse(storedSettings);
      const sortedAccounts = [...(settings.accounts || [])].sort((a, b) => a.name.localeCompare(b.name));
      const sortedMethods = [...(settings.paymentMethods || [])].sort((a, b) => a.name.localeCompare(b.name));
      setAccounts(sortedAccounts);
      setSystemPaymentMethods(sortedMethods);
    }
  };

  const saveSettings = (newAccounts: Account[], newMethods: PaymentMethod[]) => {
    const stored = localStorage.getItem('quickprint_settings');
    const settings: SystemSettings = stored ? JSON.parse(stored) : { companyName: 'QuickPrint' };
    
    const sortedAccounts = [...newAccounts].sort((a, b) => a.name.localeCompare(b.name));
    const sortedMethods = [...newMethods].sort((a, b) => a.name.localeCompare(b.name));
    
    const updated = { ...settings, accounts: sortedAccounts, paymentMethods: sortedMethods };
    localStorage.setItem('quickprint_settings', JSON.stringify(updated));
    setAccounts(sortedAccounts);
    setSystemPaymentMethods(sortedMethods);
  };

  const saveEntries = (newEntries: FinancialEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('quickprint_financial', JSON.stringify(newEntries));
  };

  const filterByRange = (date: string) => {
    return date >= startDate && date <= endDate;
  };

  const handleOpenModal = (type: 'INCOME' | 'EXPENSE', entry?: FinancialEntry) => {
    setModalType(type);
    setFormData({
      id: '',
      description: '',
      amount: '',
      type,
      date: new Date().toISOString().split('T')[0],
      category: type === 'INCOME' ? 'Vendas' : 'Insumos',
      accountId: accounts[0]?.id || '',
      method: systemPaymentMethods[0]?.name || 'PIX',
      status: 'PAID',
      isRecurring: false,
      recurrencePeriod: 'MONTHLY'
    });
    setIsModalOpen(true);
  };

  const handleOpenDetails = (entry: FinancialEntry) => {
    setSelectedEntry(entry);
    setQuittanceMethod(entry.method || systemPaymentMethods[0]?.name || 'PIX');
    setQuittanceDate(new Date().toISOString().split('T')[0]);
    setIsDetailsOpen(true);
  };

  const handleViewDetails = (entry: FinancialEntry) => {
    setSelectedEntry(entry);
    setIsViewModalOpen(true);
  };

  const handleQuittance = () => {
    if (!selectedEntry) return;
    const updatedEntries = entries.map(e => {
      if (e.id === selectedEntry.id) {
        return { ...e, status: 'PAID' as const, method: quittanceMethod, date: quittanceDate };
      }
      return e;
    });
    saveEntries(updatedEntries);
    setIsDetailsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entryData: FinancialEntry = {
      id: formData.id || Math.random().toString(36).substr(2, 6),
      description: formData.description,
      amount: parseFloat(formData.amount) || 0,
      type: modalType,
      date: formData.date,
      category: formData.category,
      accountId: formData.accountId || accounts[0]?.id || '',
      method: formData.method,
      status: formData.status,
      isRecurring: modalType === 'EXPENSE' ? formData.isRecurring : false,
      recurrencePeriod: formData.recurrencePeriod
    };
    saveEntries([entryData, ...entries]);
    setIsModalOpen(false);
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Deseja excluir este lançamento?')) {
      saveEntries(entries.filter(e => e.id !== id));
    }
  };

  const addAccount = () => {
    const name = prompt('Nome da Nova Carteira (ex: Banco Inter, Caixa Loja):');
    if (!name) return;
    const newAccount: Account = { id: Math.random().toString(36).substr(2, 6), name, initialBalance: 0, type: 'BANK' };
    saveSettings([...accounts, newAccount], systemPaymentMethods);
  };

  const removeAccount = (id: string) => {
    if (accounts.length <= 1) return alert('O sistema precisa de pelo menos uma carteira.');
    if (confirm('Remover esta carteira? Lançamentos vinculados podem ficar órfãos.')) {
      saveSettings(accounts.filter(a => a.id !== id), systemPaymentMethods);
    }
  };

  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || e.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPeriod = filterByRange(e.date);
    return matchesSearch && matchesPeriod;
  });

  const totalIncomeRealized = filteredEntries.filter(e => e.type === 'INCOME' && e.status === 'PAID').reduce((acc, e) => acc + e.amount, 0);
  const totalExpenseRealized = filteredEntries.filter(e => e.type === 'EXPENSE' && e.status === 'PAID').reduce((acc, e) => acc + e.amount, 0);
  const totalIncomePending = filteredEntries.filter(e => e.type === 'INCOME' && e.status === 'PENDING').reduce((acc, e) => acc + e.amount, 0);
  const totalExpensePending = filteredEntries.filter(e => e.type === 'EXPENSE' && e.status === 'PENDING').reduce((acc, e) => acc + e.amount, 0);
  const balancePeriod = totalIncomeRealized - totalExpenseRealized;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <button onClick={() => setActiveTab('MOVIMENTACOES')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'MOVIMENTACOES' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-slate-700'}`}>Movimentações</button>
          <button onClick={() => setActiveTab('CARTEIRAS')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'CARTEIRAS' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-slate-700'}`}>Carteiras</button>
          <button onClick={() => setActiveTab('METODOS')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'METODOS' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-slate-700'}`}>Métodos Pagto</button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleOpenModal('INCOME')} className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-md flex items-center gap-2"><ArrowUpCircle size={16} /> Receita</button>
          <button onClick={() => handleOpenModal('EXPENSE')} className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-md flex items-center gap-2"><ArrowDownCircle size={16} /> Despesa</button>
        </div>
      </div>

      {activeTab === 'MOVIMENTACOES' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Entradas Realizadas</p>
              <p className="text-2xl font-black text-green-600">R$ {totalIncomeRealized.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase">A RECEBER: R$ {totalIncomePending.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Saídas Realizadas</p>
              <p className="text-2xl font-black text-red-500">R$ {totalExpenseRealized.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase">A PAGAR: R$ {totalExpensePending.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm bg-blue-50/20">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Lucro Líquido</p>
              <p className={`text-2xl font-black ${balancePeriod >= 0 ? 'text-blue-700' : 'text-red-700'}`}>R$ {balancePeriod.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Saldo Projetado Período</p>
              <p className="text-2xl font-black text-slate-800">R$ {(balancePeriod + totalIncomePending - totalExpensePending).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" placeholder="Filtrar lançamentos..." className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Saldo por Carteira:</span>
                <div className="flex gap-2">
                  {accounts.map(acc => {
                    const accBal = entries.filter(e => e.accountId === acc.id && e.status === 'PAID').reduce((sum, e) => sum + (e.type === 'INCOME' ? e.amount : -e.amount), 0);
                    return (
                      <div key={acc.id} className="px-3 py-1 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{acc.name}</span>
                        <span className={`text-[10px] font-black ${accBal >= 0 ? 'text-blue-600' : 'text-red-500'}`}>R$ {accBal.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-center">STATUS</th>
                    <th className="px-6 py-4">DESCRIÇÃO</th>
                    <th className="px-6 py-4 text-center">DATA</th>
                    <th className="px-6 py-4">CARTEIRA</th>
                    <th className="px-6 py-4 text-right">VALOR</th>
                    <th className="px-6 py-4 text-center">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEntries.map(entry => {
                    const isPaid = entry.status === 'PAID';
                    const isIncome = entry.type === 'INCOME';
                    const account = accounts.find(a => a.id === entry.accountId);
                    return (
                      <tr key={entry.id} className={`hover:bg-slate-50 transition-colors ${!isPaid ? 'bg-amber-50/10' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            {isPaid ? (
                              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-600 rounded border border-green-100 text-[9px] font-black uppercase">Liquidado</div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-600 rounded border border-amber-100 text-[9px] font-black uppercase">Pendente</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold text-xs uppercase ${!isPaid ? 'text-slate-700' : 'text-gray-800'}`}>{entry.description}</span>
                          <p className="text-[9px] text-gray-400 font-mono">#{entry.id} • {entry.category || 'Vendas'}</p>
                        </td>
                        <td className="px-6 py-4 text-center text-xs text-gray-500">{new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-black uppercase">{account?.name || 'A DEFINIR'}</span>
                        </td>
                        <td className={`px-6 py-4 text-right font-black text-sm ${isIncome ? 'text-green-600' : (isPaid ? 'text-red-500' : 'text-amber-600')}`}>
                          {isIncome ? '+' : '-'} R$ {entry.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-1">
                            <button onClick={() => handleViewDetails(entry)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Ver Detalhes"><Eye size={16} /></button>
                            {!isPaid && (
                              <button onClick={() => handleOpenDetails(entry)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Liquidar"><Check size={18} /></button>
                            )}
                            <button onClick={() => handleDeleteEntry(entry.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Excluir"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'CARTEIRAS' && (
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Gestão de Carteiras (Contas)</h3>
              <button onClick={addAccount} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 flex items-center gap-2 shadow-md"><Plus size={14} /> Nova Carteira</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {accounts.map(acc => {
                const bal = entries.filter(e => e.accountId === acc.id && e.status === 'PAID').reduce((sum, e) => sum + (e.type === 'INCOME' ? e.amount : -e.amount), 0);
                return (
                  <div key={acc.id} className="p-6 border border-gray-100 rounded-2xl bg-slate-50 relative group">
                    <button onClick={() => removeAccount(acc.id)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={16} /></button>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Landmark size={20} /></div>
                      <h4 className="font-black text-slate-800 uppercase text-xs">{acc.name}</h4>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Saldo em Conta</p>
                    <p className={`text-xl font-black ${bal >= 0 ? 'text-blue-600' : 'text-red-500'}`}>R$ {bal.toFixed(2)}</p>
                  </div>
                );
             })}
           </div>
        </div>
      )}

      {activeTab === 'METODOS' && (
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm max-w-2xl">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Formas de Pagamento</h3>
              <button onClick={() => {
                const name = prompt('Nome da Forma de Pagamento:');
                if (name) saveSettings(accounts, [...systemPaymentMethods, { id: Math.random().toString(36).substr(2, 6), name }]);
              }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-md"><Plus size={14} /></button>
           </div>
           <div className="grid grid-cols-2 gap-3">
             {systemPaymentMethods.map(m => (
               <div key={m.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center group">
                 <div className="flex items-center gap-3">
                    <CreditCard size={16} className="text-blue-600" />
                    <span className="text-xs font-black text-slate-700 uppercase">{m.name}</span>
                 </div>
                 <button onClick={() => {
                   if (confirm('Remover esta forma de pagamento?')) saveSettings(accounts, systemPaymentMethods.filter(i => i.id !== m.id));
                 }} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Modal Novo Lançamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className={`p-6 text-white flex justify-between items-center ${modalType === 'INCOME' ? 'bg-green-600' : 'bg-red-600'}`}>
              <h3 className="text-lg font-black uppercase tracking-widest">{modalType === 'INCOME' ? 'Nova Receita' : 'Nova Despesa'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">Descrição</label>
                <input required type="text" className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-bold" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Valor (R$)</label>
                  <input required type="number" step="0.01" className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-black" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Data</label>
                  <input required type="date" className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Carteira / Conta</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-bold text-xs" value={formData.accountId} onChange={e => setFormData({...formData, accountId: e.target.value})}>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Forma Pagto</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-bold text-xs" value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
                    {systemPaymentMethods.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className={`w-full py-4 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all ${modalType === 'INCOME' ? 'bg-green-600 shadow-green-100 hover:bg-green-700' : 'bg-red-600 shadow-red-100 hover:bg-red-700'}`}>Salvar Lançamento</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Liquidação (Baixa) */}
      {isDetailsOpen && selectedEntry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-amber-500 text-white">
              <h3 className="text-lg font-black uppercase tracking-widest">Liquidar Lançamento</h3>
              <button onClick={() => setIsDetailsOpen(false)}><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor a Confirmar</p>
                <p className="text-4xl font-black text-slate-800">R$ {selectedEntry.amount.toFixed(2)}</p>
                <p className="text-xs font-bold text-slate-500 uppercase">{selectedEntry.description}</p>
              </div>
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Data da Liquidação</label>
                  <input type="date" className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none font-bold" value={quittanceDate} onChange={e => setQuittanceDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Forma Recebida</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none font-bold text-xs" value={quittanceMethod} onChange={e => setQuittanceMethod(e.target.value)}>
                    {systemPaymentMethods.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleQuittance} className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center gap-2"><CheckCircle2 size={20} /> Confirmar Recebimento</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização de Detalhes */}
      {isViewModalOpen && selectedEntry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className={`p-6 border-b border-gray-100 flex justify-between items-center ${selectedEntry.type === 'INCOME' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
              <div className="flex items-center gap-2">
                <Eye size={20} />
                <h3 className="text-lg font-black uppercase tracking-widest">Detalhes do Lançamento</h3>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="hover:rotate-90 transition-all"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="text-center pb-6 border-b border-slate-100">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                   <Hash size={12} /> ID: {selectedEntry.id}
                </div>
                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-tight">{selectedEntry.description}</h4>
                <div className="mt-4 flex flex-col items-center">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor do Lançamento</span>
                   <p className={`text-4xl font-black ${selectedEntry.type === 'INCOME' ? 'text-green-600' : 'text-red-600'} tracking-tighter`}>
                     {selectedEntry.type === 'INCOME' ? '+' : '-'} R$ {selectedEntry.amount.toFixed(2)}
                   </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                 <div className="space-y-1">
                   <span className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                     <Calendar size={12} /> Data
                   </span>
                   <p className="text-sm font-bold text-slate-700">{new Date(selectedEntry.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                 </div>
                 <div className="space-y-1">
                   <span className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                     <AlertCircle size={12} /> Status
                   </span>
                   <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${selectedEntry.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                     {selectedEntry.status === 'PAID' ? 'LIQUIDADO' : 'PENDENTE'}
                   </span>
                 </div>
                 <div className="space-y-1">
                   <span className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                     <Tag size={12} /> Categoria
                   </span>
                   <p className="text-sm font-bold text-slate-700 uppercase">{selectedEntry.category || 'Geral'}</p>
                 </div>
                 <div className="space-y-1">
                   <span className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                     <Wallet size={12} /> Carteira
                   </span>
                   <p className="text-sm font-bold text-slate-700 uppercase">{accounts.find(a => a.id === selectedEntry.accountId)?.name || 'N/A'}</p>
                 </div>
                 <div className="space-y-1">
                   <span className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                     <CreditCard size={12} /> Método
                   </span>
                   <p className="text-sm font-bold text-slate-700 uppercase">{selectedEntry.method || 'N/A'}</p>
                 </div>
                 <div className="space-y-1">
                   <span className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                     <RefreshCcw size={12} /> Tipo
                   </span>
                   <p className="text-sm font-bold text-slate-700 uppercase">{selectedEntry.type === 'INCOME' ? 'Receita' : 'Despesa'}</p>
                 </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setIsViewModalOpen(false)} 
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                >
                  Fechar
                </button>
                {selectedEntry.status === 'PENDING' && (
                  <button 
                    onClick={() => { setIsViewModalOpen(false); handleOpenDetails(selectedEntry); }} 
                    className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Check size={14} /> Liquidar Agora
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financial;
