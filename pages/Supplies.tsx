
import React, { useState, useEffect } from 'react';
import { 
  Layers, Search, Plus, X, Trash2, Edit, AlertTriangle, 
  Archive, Save, Calendar, Phone, Info, ChevronDown
} from 'lucide-react';
import { Supply } from '../types';

const formatPhone = (value: string) => {
  if (!value) return "";
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 2) return numbers.replace(/(\d{2})/, "($1");
  if (numbers.length <= 6) return numbers.replace(/(\d{2})(\d{0,4})/, "($1) $2");
  if (numbers.length <= 10) return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return numbers.substring(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

const Supplies: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [supplies, setSupplies] = useState<Supply[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('quickprint_supplies');
    if (stored) {
      const parsed: Supply[] = JSON.parse(stored);
      const sorted = parsed.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'accent' }));
      setSupplies(sorted);
    } else {
      const initial: Supply[] = [
        { id: '1', name: 'Papel A4 Sulfite 75g', description: 'Papel sulfite padrão para escritório', category: 'Papel', unit: 'Pacote', stock: 10, minStock: 5, costPrice: 25.90, provider: 'Papelaria Central', providerPhone: '(11) 98888-7777', purchaseDate: '2025-01-15' },
        { id: '2', name: 'Lona 440g Brilho', description: 'Lona para banners e faixas', category: 'Lona', unit: 'M²', stock: 50, minStock: 10, costPrice: 15.00, provider: 'Sign Digital', providerPhone: '(11) 97777-6666', purchaseDate: '2025-02-01' }
      ];
      saveSupplies(initial);
    }
  }, []);

  const saveSupplies = (newSupplies: Supply[]) => {
    const sorted = [...newSupplies].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'accent' }));
    setSupplies(sorted);
    localStorage.setItem('quickprint_supplies', JSON.stringify(sorted));
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Papel',
    unit: 'Unidade',
    costPrice: 0,
    stock: 0,
    minStock: 0,
    purchaseDate: '',
    provider: '',
    providerPhone: '',
    observations: ''
  });

  const handleOpenCreateModal = () => {
    setEditingSupply(null);
    setFormData({ 
      name: '', description: '', category: 'Papel', unit: 'Unidade', 
      costPrice: 0, stock: 0, minStock: 0, purchaseDate: '', 
      provider: '', providerPhone: '', observations: '' 
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (s: Supply) => {
    setEditingSupply(s);
    setFormData({
      name: s.name,
      description: s.description || '',
      category: s.category || 'Papel',
      unit: s.unit || 'Unidade',
      costPrice: s.costPrice,
      stock: s.stock,
      minStock: s.minStock,
      purchaseDate: s.purchaseDate || '',
      provider: s.provider || '',
      providerPhone: s.providerPhone || '',
      observations: s.observations || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supplyData: Supply = {
      id: editingSupply ? editingSupply.id : Math.random().toString(36).substr(2, 9),
      ...formData
    };

    if (editingSupply) {
      saveSupplies(supplies.map(s => s.id === editingSupply.id ? supplyData : s));
    } else {
      saveSupplies([...supplies, supplyData]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir este insumo permanentemente?')) {
      saveSupplies(supplies.filter(s => s.id !== id));
    }
  };

  const filteredSupplies = supplies.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.provider && s.provider.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 text-white rounded-lg shadow-lg">
            <Layers size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Gestão de Insumos</h2>
        </div>
        <button 
          onClick={handleOpenCreateModal} 
          className="bg-slate-800 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-slate-900 font-bold shadow-md transition-all active:scale-95"
        >
          <Plus size={20} /> NOVO INSUMO
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar insumos..." 
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 outline-none focus:ring-2 focus:ring-slate-500/20"
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
                <th className="px-6 py-4">Insumo</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-center">Estoque</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSupplies.map(supply => (
                <tr key={supply.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4"><span className="font-bold text-gray-800 uppercase text-xs">{supply.name}</span></td>
                  <td className="px-6 py-4 text-xs text-gray-400 font-bold uppercase">{supply.category}</td>
                  <td className="px-6 py-4 text-center font-black text-slate-700">{supply.stock} {supply.unit}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleOpenEditModal(supply)} className="p-2 text-gray-400 hover:text-slate-800 transition-colors"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(supply.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl my-8 overflow-hidden animate-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="text-2xl font-semibold text-slate-800">
                {editingSupply ? 'Editar Insumo' : 'Novo Insumo'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
              <div className="space-y-6">
                
                {/* Nome do Insumo */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Nome do Insumo *</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: Papel A4 Sulfite 75g"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors placeholder:text-gray-400" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Descrição</label>
                  <input 
                    type="text" 
                    placeholder="Descrição detalhada do insumo"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors placeholder:text-gray-400" 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                  />
                </div>

                {/* Categoria e Unidade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Categoria *</label>
                    <div className="relative">
                      <select 
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none bg-white focus:border-slate-500 transition-colors appearance-none text-slate-600"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                      >
                        <option value="Papel">Papel</option>
                        <option value="Lona">Lona</option>
                        <option value="Vinil">Vinil</option>
                        <option value="Tinta">Tinta</option>
                        <option value="Acabamento">Acabamento</option>
                        <option value="Outros">Outros</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Unidade de Medida *</label>
                    <div className="relative">
                      <select 
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none bg-white focus:border-slate-500 transition-colors appearance-none text-slate-600"
                        value={formData.unit}
                        onChange={e => setFormData({...formData, unit: e.target.value})}
                      >
                        <option value="Unidade">Unidade</option>
                        <option value="M²">M²</option>
                        <option value="Kg">Kg</option>
                        <option value="Litro">Litro</option>
                        <option value="Pacote">Pacote</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custo e Estoque */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Custo Unitário (R$) *</label>
                    <input 
                      required 
                      type="number" 
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors" 
                      value={formData.costPrice || ''} 
                      onChange={e => setFormData({...formData, costPrice: parseFloat(e.target.value) || 0})} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Quantidade em Estoque</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors" 
                      value={formData.stock || ''} 
                      onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} 
                    />
                  </div>
                </div>

                {/* Estoque Mínimo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Estoque Mínimo</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors" 
                      value={formData.minStock || ''} 
                      onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})} 
                    />
                  </div>
                </div>

                {/* Informações de Compra Section */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xl font-semibold text-slate-800 mb-6">Informações de Compra</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-700">Data da Compra</label>
                      <div className="relative">
                        <input 
                          type="date" 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors text-slate-600 appearance-none" 
                          value={formData.purchaseDate} 
                          onChange={e => setFormData({...formData, purchaseDate: e.target.value})} 
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <Calendar size={18} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-700">Nome do Fornecedor</label>
                      <input 
                        type="text" 
                        placeholder="Nome do fornecedor"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors placeholder:text-gray-400" 
                        value={formData.provider} 
                        onChange={e => setFormData({...formData, provider: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-700">Telefone do Fornecedor</label>
                      <input 
                        type="text" 
                        placeholder="(00) 00000-0000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors placeholder:text-gray-400" 
                        value={formData.providerPhone} 
                        onChange={e => setFormData({...formData, providerPhone: formatPhone(e.target.value)})} 
                      />
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Observações</label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors resize-none" 
                    value={formData.observations} 
                    onChange={e => setFormData({...formData, observations: e.target.value})} 
                  />
                </div>

              </div>

              {/* Botões Ações */}
              <div className="flex justify-end gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-10 py-2.5 border border-gray-300 text-slate-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-10 py-2.5 bg-[#82cf9e] text-white rounded-lg font-medium shadow-md hover:bg-[#6fb98d] transition-all flex items-center gap-2"
                >
                  <Save size={18} />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Supplies;
