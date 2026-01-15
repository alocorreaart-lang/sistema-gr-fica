
import React, { useState, useEffect } from 'react';
import { 
  ArrowUpCircle, ArrowDownCircle, Wallet, Calendar, 
  Search, Filter, Plus, X, Save, TrendingUp, TrendingDown,
  ShoppingCart
} from 'lucide-react';
import { FinancialEntry } from '../types';

const Financial: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('quickprint_financial');
    if (stored) {
      setEntries(JSON.parse(stored));
    } else {
      const initial: FinancialEntry[] = [
        { id: '1', description: 'Venda: João Silva (Entrada)', amount: 215.60, type: 'INCOME', date: new Date().toISOString().split('T')[0], category: 'Vendas' },
        { id: '2', description: 'Compra de Papel Couché', amount: 350.00, type: 'EXPENSE', date: new Date().toISOString().split('T')[0], category: 'Insumos' },
      ];
      setEntries(initial);
      localStorage.setItem('quickprint_financial', JSON.stringify(initial));
    }
  }, []);

  const saveEntries = (newEntries: FinancialEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('quickprint_financial', JSON.stringify(newEntries));
  };

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    date: new Date().toISOString().split('T')[0],
    category: 'Vendas'
  });

  const handleOpenModal = (type: 'INCOME' | 'EXPENSE') => {
    setFormData({
      description: '',
      amount: '',
      type: type,
      date: new Date().toISOString().split('T')[0],
      category: type === 'INCOME' ? 'Vendas' : 'Insumos'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: FinancialEntry = {
      id: Math.random().toString(36).substr(2, 9),
      description: formData.description,
      amount: parseFloat(formData.amount) || 0,
      type: formData.type,
      date: formData.date,
      category: formData.category
    };

    saveEntries([newEntry, ...entries]);
    setIsModalOpen(false);
  };

  const totalIncome = entries
    .filter(e => e.type === 'INCOME')
    .reduce((acc, e) => acc + e.amount, 0);

  const totalExpense = entries
    .filter(e => e.type === 'EXPENSE')
    .reduce((acc, e) => acc + e.amount, 0);

  const balance = totalIncome - totalExpense;

  const filteredEntries = entries.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Fluxo Financeiro</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => handleOpenModal('EXPENSE')}
            className="bg-white text-red-600 border border-red-200 px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-all shadow-sm flex items-center gap-2 active:scale-95"
          >
            <ArrowDownCircle size={18} /> Nova Despesa
          </button>
          <button 
            onClick={() => handleOpenModal('INCOME')}
            className="bg-green-600 text-white px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-md flex items-center gap-2 active:scale-95"
          >
            <Plus size={18} /> Nova Receita
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Receitas Totais</p>
            <p className="text-2xl font-black text-green-600">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]">
          <div className="p-4 bg-red-50 text-red-500 rounded-2xl">
            <TrendingDown size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Despesas Totais</p>
            <p className="text-2xl font-black text-red-500">R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]">
          <div className={`p-4 rounded-2xl ${balance >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
            <Wallet size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Saldo em Caixa</p>
            <p className={`text-2xl font-black ${balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
              R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Extrato de Movimentações</h3>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Filtrar movimentações..." 
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredEntries.map(entry => {
                const isOrder = entry.description.toLowerCase().includes('pedido') || entry.description.includes(':');
                return (
                  <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 text-xs font-medium text-gray-400">
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-2">
                      {isOrder && <ShoppingCart size={14} className="text-blue-400" />}
                      {entry.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        isOrder ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {entry.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-black ${entry.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                      {entry.type === 'INCOME' ? '+' : '-'} R$ {entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic text-sm">Nenhuma movimentação encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for New Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className={`p-6 flex justify-between items-center text-white ${formData.type === 'INCOME' ? 'bg-green-600' : 'bg-red-500'}`}>
              <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                {formData.type === 'INCOME' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                {formData.type === 'INCOME' ? 'Nova Receita' : 'Nova Despesa'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição do Lançamento *</label>
                <input 
                  required
                  type="text" 
                  placeholder="Ex: Venda de Cartões de Visita"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor (R$)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    placeholder="0,00"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none font-bold"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-white font-medium"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  {formData.type === 'INCOME' ? (
                    <>
                      <option value="Vendas">Vendas de Serviços</option>
                      <option value="Produtos">Venda de Produtos</option>
                      <option value="Arte">Criação de Arte</option>
                      <option value="Outros">Outros</option>
                    </>
                  ) : (
                    <>
                      <option value="Insumos">Compra de Insumos</option>
                      <option value="Contas Fixas">Contas Fixas (Luz, Água, Aluguel)</option>
                      <option value="Equipamentos">Equipamentos e Manutenção</option>
                      <option value="Marketing">Marketing e Ads</option>
                      <option value="Salários">Salários e Pró-labore</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-3.5 border border-gray-200 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={`flex-1 py-3.5 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 ${
                    formData.type === 'INCOME' ? 'bg-green-600 hover:bg-green-700 shadow-green-100' : 'bg-red-500 hover:bg-red-600 shadow-red-100'
                  }`}
                >
                  <Save size={18} />
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financial;
