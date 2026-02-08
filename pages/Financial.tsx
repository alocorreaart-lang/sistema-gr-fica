
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
      setAccounts(settings.accounts || []);
      setSystemPaymentMethods(settings.paymentMethods || []);
    }
  };

  const saveEntries = (newEntries: FinancialEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('quickprint_financial', JSON.stringify(newEntries));
  };

  const filterByRange = (date: string) => {
    return date >= startDate && date <= endDate;
  };

  const handleOpenModal = (type: 'INCOME' | 'EXPENSE') => {
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
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Fluxo de Caixa</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gestão financeira e lançamentos</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleOpenModal('INCOME')} className="bg-green-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-100 flex items-center gap-2 active:scale-95"><ArrowUpCircle size={18} /> Nova Receita</button>
          <button onClick={() => handleOpenModal('EXPENSE')} className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-100 flex items-center gap-2 active:scale-95"><ArrowDownCircle size={18} /> Nova Despesa</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Entradas Realizadas</p>
          <p className="text-2xl font-black text-green-600">R$ {totalIncomeRealized.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase">A RECEBER: R$ {totalIncomePending.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Saídas Realizadas</p>
          <p className="text-2xl font-black text-red-500">R$ {totalExpenseRealized.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase">A PAGAR: R$ {totalExpensePending.toFixed(2)}</p>
        </div>
        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 shadow-sm">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Lucro Líquido</p>
          <p className={`text-2xl font-black ${balancePeriod >= 0 ? 'text-blue-700' : 'text-red-700'}`}>R$ {balancePeriod.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Saldo Projetado</p>
          <p className="text-2xl font-black text-slate-800">R$ {(balancePeriod + totalIncomePending - totalExpensePending).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/30">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="text" 
              placeholder="Filtrar lançamentos..." 
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldos atuais:</span>
             {accounts.slice(0, 2).map(acc => {
                const accBal = entries.filter(e => e.accountId === acc.id && e.status === 'PAID').reduce((sum, e) => sum + (e.type === 'INCOME' ? e.amount : -e.amount), 0);
                return (
                  <div key={acc.id} className="px-4 py-2 bg-white rounded-xl border border-gray-100 flex flex-col shadow-sm">
                    <span className="text-[8px] font-black text-slate-300 uppercase leading-none mb-1">{acc.name}</span>
                    <span className={`text-[11px] font-black leading-none ${accBal >= 0 ? 'text-blue-600' : 'text-red-500'}`}>R$ {accBal.toFixed(2)}</span>
                  </div>
                );
             })}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f8fafc] text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 text-center">STATUS</th>
                <th className="px-6 py-5">DESCRIÇÃO / CATEGORIA</th>
                <th className="px-6 py-5 text-center">DATA</th>
                <th className="px-6 py-5">CARTEIRA</th>
                <th className="px-6 py-5 text-right">VALOR</th>
                <th className="px-6 py-5 text-center">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEntries.map(entry => {
                const isPaid = entry.status === 'PAID';
                const isIncome = entry.type === 'INCOME';
                const account = accounts.find(a => a.id === entry.accountId);
                return (
                  <tr key={entry.id} className={`hover:bg-blue-50/20 transition-colors ${!isPaid ? 'bg-amber-50/5' : ''}`}>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        {isPaid ? (
                          <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100 text-[9px] font-black uppercase tracking-widest">Liquidado</div>
                        ) : (
                          <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100 text-[9px] font-black uppercase tracking-widest">Pendente</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`font-black text-xs uppercase tracking-tight ${!isPaid ? 'text-slate-700' : 'text-slate-900'}`}>{entry.description}</span>
                      <p className="text-[9px] text-slate-300 font-bold uppercase mt-0.5">{entry.category || 'Geral'}</p>
                    </td>
                    <td className="px-6 py-5 text-center text-xs font-bold text-slate-500">{new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{account?.name || 'A DEFINIR'}</span>
                    </td>
                    <td className={`px-6 py-5 text-right font-black text-sm tracking-tighter ${isIncome ? 'text-green-600' : (isPaid ? 'text-red-500' : 'text-amber-600')}`}>
                      {isIncome ? '+' : '-'} R$ {entry.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleViewDetails(entry)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Ver Detalhes"><Eye size={18} /></button>
                        {!isPaid && (
                          <button onClick={() => handleOpenDetails(entry)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all" title="Liquidar"><Check size={20} /></button>
                        )}
                        <button onClick={() => handleDeleteEntry(entry.id)} className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Excluir"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <Banknote size={48} className="text-slate-400" />
                      <p className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] italic">Nenhum lançamento no período</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modais mantidos conforme original para funcionalidade completa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200 border border-gray-100">
            <div className={`p-8 text-white flex justify-between items-center ${modalType === 'INCOME' ? 'bg-green-600' : 'bg-red-600'}`}>
              <div className="flex items-center gap-3">
                 {modalType === 'INCOME' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                 <h3 className="text-xl font-black uppercase tracking-widest">{modalType === 'INCOME' ? 'Nova Receita' : 'Nova Despesa'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-all"><X size={28} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-white">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Descrição do Lançamento</label>
                <input required type="text" className="w-full px-5 py-4 bg-slate-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Valor (R$)</label>
                  <input required type="number" step="0.01" className="w-full px-5 py-4 bg-slate-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-black text-slate-800 text-lg" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Data</label>
                  <input required type="date" className="w-full px-5 py-4 bg-slate-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Carteira / Conta</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-xs uppercase" value={formData.accountId} onChange={e => setFormData({...formData, accountId: e.target.value})}>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Forma Pagto</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-xs uppercase" value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
                    {systemPaymentMethods.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className={`w-full py-5 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${modalType === 'INCOME' ? 'bg-green-600 shadow-green-100 hover:bg-green-700' : 'bg-red-600 shadow-red-100 hover:bg-red-700'}`}>Confirmar Lançamento</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Liquidação */}
      {isDetailsOpen && selectedEntry && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200 border border-gray-100">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-amber-500 text-white">
              <h3 className="text-xl font-black uppercase tracking-widest">Liquidar Agora</h3>
              <button onClick={() => setIsDetailsOpen(false)}><X size={28} /></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="text-center space-y-2">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Valor a Confirmar</p>
                <p className="text-5xl font-black text-slate-800 tracking-tighter">R$ {selectedEntry.amount.toFixed(2)}</p>
                <p className="text-xs font-black text-amber-600 uppercase pt-2">{selectedEntry.description}</p>
              </div>
              <div className="space-y-5 pt-6 border-t border-gray-100">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Data do Recebimento</label>
                  <input type="date" className="w-full px-5 py-4 bg-slate-50 border border-gray-200 rounded-2xl outline-none font-bold" value={quittanceDate} onChange={e => setQuittanceDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Forma Recebida</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border border-gray-200 rounded-2xl outline-none font-bold text-xs uppercase" value={quittanceMethod} onChange={e => setQuittanceMethod(e.target.value)}>
                    {systemPaymentMethods.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleQuittance} className="w-full py-5 bg-[#10a34a] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center gap-3 active:scale-95"><CheckCircle2 size={24} /> Confirmar Baixa</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualização Detalhes */}
      {isViewModalOpen && selectedEntry && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border border-gray-100">
            <div className={`p-8 border-b border-gray-50 flex justify-between items-center ${selectedEntry.type === 'INCOME' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
              <div className="flex items-center gap-3">
                <Eye size={24} />
                <h3 className="text-xl font-black uppercase tracking-widest">Detalhes</h3>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="hover:rotate-90 transition-all"><X size={28} /></button>
            </div>
            <div className="p-10 space-y-10">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                   <Hash size={14} /> ID: {selectedEntry.id}
                </div>
                <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-tight">{selectedEntry.description}</h4>
                <div className="mt-6 flex flex-col items-center">
                   <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Valor do Lançamento</span>
                   <p className={`text-5xl font-black ${selectedEntry.type === 'INCOME' ? 'text-green-600' : 'text-red-600'} tracking-tighter mt-1`}>
                     {selectedEntry.type === 'INCOME' ? '+' : '-'} R$ {selectedEntry.amount.toFixed(2)}
                   </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-10 gap-y-8">
                 <div className="space-y-1.5">
                   <span className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                     <Calendar size={14} className="text-blue-500" /> Data
                   </span>
                   <p className="text-sm font-black text-slate-700">{new Date(selectedEntry.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                 </div>
                 <div className="space-y-1.5">
                   <span className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                     <AlertCircle size={14} className="text-amber-500" /> Status
                   </span>
                   <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${selectedEntry.status === 'PAID' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                     {selectedEntry.status === 'PAID' ? 'LIQUIDADO' : 'PENDENTE'}
                   </span>
                 </div>
                 <div className="space-y-1.5">
                   <span className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                     <Tag size={14} className="text-indigo-500" /> Categoria
                   </span>
                   <p className="text-sm font-black text-slate-700 uppercase">{selectedEntry.category || 'Geral'}</p>
                 </div>
                 <div className="space-y-1.5">
                   <span className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                     <Wallet size={14} className="text-cyan-500" /> Carteira
                   </span>
                   <p className="text-sm font-black text-slate-700 uppercase">{accounts.find(a => a.id === selectedEntry.accountId)?.name || 'N/A'}</p>
                 </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  onClick={() => setIsViewModalOpen(false)} 
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
                >
                  Fechar
                </button>
                {selectedEntry.status === 'PENDING' && (
                  <button 
                    onClick={() => { setIsViewModalOpen(false); handleOpenDetails(selectedEntry); }} 
                    className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-amber-100 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Check size={16} /> Liquidar
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
