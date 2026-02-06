
import React, { useState, useEffect } from 'react';
import { 
  ArrowUpCircle, ArrowDownCircle, Wallet, Calendar, 
  Search, Filter, Plus, X, Save, TrendingUp, TrendingDown,
  ShoppingCart, Banknote, DollarSign, User, CheckCircle2,
  Smartphone, CreditCard, ArrowLeftRight, Landmark, Trash2,
  Eye, Pencil, AlertCircle, Check, RefreshCcw, Repeat, Clock,
  PiggyBank
} from 'lucide-react';
import { FinancialEntry, SystemSettings, Account, PaymentMethod } from '../types';

const Financial: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
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
    const storedSettings = localStorage.getItem('quickprint_settings');
    let systemAccounts: Account[] = [];
    let methods: PaymentMethod[] = [];
    
    if (storedSettings) {
      const settings: SystemSettings = JSON.parse(storedSettings);
      systemAccounts = settings.accounts || [];
      methods = settings.paymentMethods || [
        { id: 'pix', name: 'PIX' },
        { id: 'card', name: 'Cartão' },
        { id: 'cash', name: 'Dinheiro' },
        { id: 'transfer', name: 'Transferência' }
      ];
    } else {
      systemAccounts = [{ id: 'default-cash', name: 'Caixa Local', initialBalance: 0, type: 'CASH', color: '#16a34a' }];
      methods = [
        { id: 'pix', name: 'PIX' },
        { id: 'card', name: 'Cartão' },
        { id: 'cash', name: 'Dinheiro' },
        { id: 'transfer', name: 'Transferência' }
      ];
    }
    setAccounts(systemAccounts);
    setSystemPaymentMethods(methods);
    if (methods.length > 0) {
      setQuittanceMethod(methods[0].name);
    }

    const storedEntries = localStorage.getItem('quickprint_financial');
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    } else {
      const initial: FinancialEntry[] = [
        { id: '469639', description: 'Sinal de Entrada: João Silva', amount: 500.00, type: 'INCOME', date: '2026-01-22', category: 'Vendas', method: 'PIX', status: 'PAID', accountId: systemAccounts[0]?.id },
        { id: '469640', description: 'Aluguel da Loja', amount: 1500.00, type: 'EXPENSE', date: '2026-02-10', category: 'Contas Fixas', method: 'Transferência', status: 'PAID', isRecurring: true, recurrencePeriod: 'MONTHLY', accountId: systemAccounts[0]?.id },
      ];
      setEntries(initial);
      localStorage.setItem('quickprint_financial', JSON.stringify(initial));
    }
  }, []);

  const saveEntries = (newEntries: FinancialEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('quickprint_financial', JSON.stringify(newEntries));
  };

  const getAccountBalance = (accountId: string, initial: number) => {
    const accountEntries = entries.filter(e => e.accountId === accountId && e.status === 'PAID');
    const balance = accountEntries.reduce((acc, e) => {
      return acc + (e.type === 'INCOME' ? e.amount : -e.amount);
    }, initial);
    return balance;
  };

  const handleOpenModal = (type: 'INCOME' | 'EXPENSE', entry?: FinancialEntry) => {
    setModalType(type);
    if (entry) {
      setFormData({
        id: entry.id,
        description: entry.description,
        amount: entry.amount.toString(),
        type: entry.type,
        date: entry.date,
        category: entry.category,
        accountId: entry.accountId || accounts[0]?.id || '',
        method: entry.method || systemPaymentMethods[0]?.name || 'PIX',
        status: entry.status || 'PAID',
        isRecurring: entry.isRecurring || false,
        recurrencePeriod: entry.recurrencePeriod || 'MONTHLY'
      });
    } else {
      setFormData({
        id: '',
        description: '',
        amount: '',
        type: type,
        date: new Date().toISOString().split('T')[0],
        category: type === 'INCOME' ? 'Vendas' : 'Insumos',
        accountId: accounts[0]?.id || '',
        method: systemPaymentMethods[0]?.name || 'PIX',
        status: 'PAID',
        isRecurring: false,
        recurrencePeriod: 'MONTHLY'
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenDetails = (entry: FinancialEntry) => {
    setSelectedEntry(entry);
    setQuittanceMethod(entry.method || systemPaymentMethods[0]?.name || 'PIX');
    setQuittanceDate(new Date().toISOString().split('T')[0]);
    setIsDetailsOpen(true);
  };

  const handleQuittance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;
    
    const updated = entries.map(entry => 
      entry.id === selectedEntry.id ? { ...entry, status: 'PAID' as const, method: quittanceMethod, date: quittanceDate } : entry
    );
    
    saveEntries(updated);
    setIsDetailsOpen(false);
    setSelectedEntry(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entryData: FinancialEntry = {
      id: formData.id || Math.random().toString(10).substr(2, 6),
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
    if (formData.id) {
      saveEntries(entries.map(e => e.id === formData.id ? entryData : e));
    } else {
      saveEntries([entryData, ...entries]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Deseja excluir este registro?')) {
      saveEntries(entries.filter(e => e.id !== id));
    }
  };

  const totalIncome = entries.filter(e => e.type === 'INCOME' && e.status === 'PAID').reduce((acc, e) => acc + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'EXPENSE' && e.status === 'PAID').reduce((acc, e) => acc + e.amount, 0);
  const totalPendingExpense = entries.filter(e => e.type === 'EXPENSE' && e.status === 'PENDING').reduce((acc, e) => acc + e.amount, 0);
  const balanceCash = totalIncome - totalExpense;

  const filteredEntries = entries.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Fluxo Financeiro</h2>
        <div className="flex gap-3">
          <button onClick={() => handleOpenModal('INCOME')} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase hover:bg-green-700 transition-all shadow-md flex items-center gap-2"><ArrowUpCircle size={18} /> Registrar Receita</button>
          <button onClick={() => handleOpenModal('EXPENSE')} className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase hover:bg-red-700 transition-all shadow-md flex items-center gap-2"><ArrowDownCircle size={18} /> Registrar Despesa</button>
        </div>
      </div>

      {/* Cards de Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-gray-100">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><TrendingUp size={32} /></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Receitas Pagas</p><p className="text-2xl font-black text-green-600">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-red-50 text-red-500 rounded-2xl"><TrendingDown size={32} /></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Despesas Pagas</p><p className="text-2xl font-black text-red-500">R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-5 bg-amber-50/10">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><Clock size={32} /></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 text-amber-600">Despesas a Vencer</p><p className="text-2xl font-black text-amber-600">R$ {totalPendingExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className={`p-4 rounded-2xl ${balanceCash >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}><Wallet size={32} /></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Saldo Líquido</p><p className={`text-2xl font-black ${balanceCash >= 0 ? 'text-blue-700' : 'text-red-700'}`}>R$ {balanceCash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
        </div>
      </div>

      {/* Seção de Carteiras / Saldos por Conta */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
           <Landmark size={18} className="text-slate-400" />
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Saldos por Carteira</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {accounts.map(acc => {
            const currentBalance = getAccountBalance(acc.id, acc.initialBalance);
            return (
              <div key={acc.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 hover:border-blue-200 transition-colors">
                <div className="p-2.5 bg-slate-50 text-blue-600 rounded-lg">
                  {acc.type === 'BANK' ? <Landmark size={18} /> : <PiggyBank size={18} />}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-gray-500 uppercase truncate">{acc.name}</p>
                  <p className={`text-sm font-black truncate ${currentBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabela de Movimentações */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Extrato de Movimentações</h3>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Filtrar movimentações..." className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-center">STATUS</th>
                <th className="px-6 py-4">DESCRIÇÃO</th>
                <th className="px-6 py-4 text-center">DATA</th>
                <th className="px-6 py-4">CONTA / CARTEIRA</th>
                <th className="px-6 py-4 text-right">VALOR</th>
                <th className="px-6 py-4 text-center">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEntries.map(entry => {
                const isPaid = entry.status === 'PAID';
                const isIncome = entry.type === 'INCOME';
                const accountName = accounts.find(a => a.id === entry.accountId)?.name || 'NÃO DEFINIDA';
                return (
                  <tr key={entry.id} className={`hover:bg-gray-50 transition-colors ${!isPaid ? 'bg-amber-50/20' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {isPaid ? (
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-600 rounded-lg border border-green-100 text-[9px] font-black uppercase">Liquidado</div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-100 text-[9px] font-black uppercase">Pendente</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${!isPaid ? 'text-slate-700' : 'text-gray-800'}`}>{entry.description}</span>
                      <p className="text-[10px] text-gray-400 font-mono">#{entry.id} • {entry.method || 'A DEFINIR'}</p>
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-gray-500">{new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-black uppercase">{accountName}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-right font-black ${isIncome ? 'text-green-600' : (isPaid ? 'text-red-500' : 'text-amber-600')}`}>R$ {entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1">
                        {!isPaid && (
                          <button onClick={() => handleOpenDetails(entry)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Liquidar Conta">
                            <Check size={18} />
                          </button>
                        )}
                        <button onClick={() => handleDeleteEntry(entry.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Excluir">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">Nenhuma movimentação encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className={`p-6 flex justify-between items-center text-white ${modalType === 'INCOME' ? 'bg-green-600' : 'bg-red-500'}`}>
              <h3 className="text-xl font-bold uppercase">{formData.id ? 'Editar Registro' : (modalType === 'INCOME' ? 'Nova Receita' : 'Nova Despesa')}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição do Lançamento</label>
                <input required placeholder="Ex: Pagamento Fornecedor Lonas" type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor (R$)</label>
                  <input required placeholder="0,00" type="number" step="0.01" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vencimento / Data</label>
                  <input type="date" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Meio de Movimentação</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-white font-bold text-xs" value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
                    {systemPaymentMethods.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Inicial</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-white font-bold text-xs" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                    <option value="PAID">JÁ PAGO / RECEBIDO</option>
                    <option value="PENDING">PENDENTE (A VENCER)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Conta de Destino</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-white font-bold text-xs" value={formData.accountId} onChange={e => setFormData({...formData, accountId: e.target.value})}>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-white font-bold text-xs" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {modalType === 'INCOME' ? (
                      <>
                        <option value="Vendas">Vendas</option>
                        <option value="Serviços">Serviços</option>
                        <option value="Outros">Outros</option>
                      </>
                    ) : (
                      <>
                        <option value="Insumos">Insumos</option>
                        <option value="Contas Fixas">Contas Fixas</option>
                        <option value="Salários">Salários</option>
                        <option value="Impostos">Impostos</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <button type="submit" className={`w-full py-4 text-white rounded-xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${modalType === 'INCOME' ? 'bg-green-600' : 'bg-red-500'}`}>
                {formData.id ? 'Salvar Alterações' : 'Confirmar Lançamento'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Quitação (Pagar Conta Pendente) */}
      {isDetailsOpen && selectedEntry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-amber-500 text-white">
              <h3 className="text-xl font-black uppercase tracking-tight">Liquidar Lançamento</h3>
              <button onClick={() => setIsDetailsOpen(false)}><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">MOVIMENTAÇÃO</p>
                <p className="text-lg font-bold text-slate-800">{selectedEntry.description}</p>
                <p className="text-2xl font-black text-blue-700 mt-2">R$ {selectedEntry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>

              <form onSubmit={handleQuittance} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data do Pagamento / Recebimento</label>
                  <input type="date" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none" value={quittanceDate} onChange={e => setQuittanceDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Meio de Pagamento</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-white font-bold text-xs" value={quittanceMethod} onChange={e => setQuittanceMethod(e.target.value)}>
                    {systemPaymentMethods.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full py-4 bg-green-600 text-white rounded-xl font-black uppercase tracking-widest shadow-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> Confirmar Quitação
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financial;
