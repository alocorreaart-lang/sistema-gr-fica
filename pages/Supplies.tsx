
import React, { useState, useEffect } from 'react';
import { 
  Layers, Search, Plus, X, Trash2, Edit, AlertTriangle, 
  Archive, Save, Calendar, Phone, Info
} from 'lucide-react';
import { Supply } from '../types';

const Supplies: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [supplies, setSupplies] = useState<Supply[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('quickprint_supplies');
    if (stored) {
      setSupplies(JSON.parse(stored));
    } else {
      const initial: Supply[] = [
        { id: '1', name: 'Papel A4 Sulfite 75g', description: 'Papel sulfite padrão para escritório', category: 'Papel', unit: 'Pacote', stock: 10, minStock: 5, costPrice: 25.90, provider: 'Papelaria Central', providerPhone: '(11) 98888-7777', purchaseDate: '2025-01-15' },
        { id: '2', name: 'Lona 440g Brilho', description: 'Lona para banners e faixas', category: 'Lona', unit: 'M²', stock: 50, minStock: 10, costPrice: 15.00, provider: 'Sign Digital', providerPhone: '(11) 97777-6666', purchaseDate: '2025-02-01' }
      ];
      setSupplies(initial);
      localStorage.setItem('quickprint_supplies', JSON.stringify(initial));
    }
  }, []);

  const saveSupplies = (newSupplies: Supply[]) => {
    setSupplies(newSupplies);
    localStorage.setItem('quickprint_supplies', JSON.stringify(newSupplies));
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
      saveSupplies([supplyData, ...supplies]);
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
            placeholder="Buscar insumos por nome ou fornecedor..." 
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
                <th className="px-6 py-4">Insumo / Categoria</th>
                <th className="px-6 py-4 text-center">Estoque Atual</th>
                <th className="px-6 py-4">Custo Unit.</th>
                <th className="px-6 py-4">Fornecedor</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSupplies.map(supply => {
                const isLowStock = supply.stock <= supply.minStock;
                return (
                  <tr key={supply.id} className={`hover:bg-slate-50 transition-colors ${isLowStock ? 'bg-amber-50/20' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">{supply.name}</span>
                          {isLowStock && <AlertTriangle size={14} className="text-amber-500" />}
                        </div>
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{supply.category} • {supply.unit}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`font-black ${isLowStock ? 'text-red-600' : 'text-slate-700'}`}>
                          {supply.stock}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">Mín: {supply.minStock}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">R$ {supply.costPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600 font-medium">{supply.provider}</span>
                        <span className="text-[10px] text-gray-400">{supply.providerPhone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleOpenEditModal(supply)} className="p-2 text-gray-400 hover:text-slate-800 transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(supply.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Reestruturado conforme Imagem */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
                {editingSupply ? 'Editar Insumo' : 'Novo Insumo'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white">
              {/* Informações Principais */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome do Insumo *</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: Papel A4 Sulfite 75g"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-600" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descrição</label>
                  <input 
                    type="text" 
                    placeholder="Descrição detalhada do insumo"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-600" 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Categoria *</label>
                    <select 
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none bg-white text-gray-600"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="Papel">Papel</option>
                      <option value="Lona">Lona</option>
                      <option value="Vinil">Vinil</option>
                      <option value="Tinta">Tinta</option>
                      <option value="Insumo Acabamento">Insumo Acabamento</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Unidade de Medida *</label>
                    <select 
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none bg-white text-gray-600"
                      value={formData.unit}
                      onChange={e => setFormData({...formData, unit: e.target.value})}
                    >
                      <option value="Unidade">Unidade</option>
                      <option value="Folhas">Folhas</option>
                      <option value="M²">M²</option>
                      <option value="Pacote">Pacote</option>
                      <option value="Kg">Kg</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Custo Unitário (R$) *</label>
                    <input 
                      required 
                      type="number" 
                      step="0.01"
                      placeholder="0"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-600" 
                      value={formData.costPrice || ''} 
                      onChange={e => setFormData({...formData, costPrice: parseFloat(e.target.value) || 0})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantidade em Estoque</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-600" 
                      value={formData.stock || ''} 
                      onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} 
                    />
                  </div>
                </div>

                <div className="w-1/2 pr-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estoque Mínimo</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-600" 
                    value={formData.minStock || ''} 
                    onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})} 
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100">
                <h4 className="text-lg font-bold text-slate-800 mb-6">Informações de Compra</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Data da Compra</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-600 appearance-none" 
                        value={formData.purchaseDate} 
                        onChange={e => setFormData({...formData, purchaseDate: e.target.value})} 
                      />
                      <Calendar size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome do Fornecedor</label>
                    <input 
                      type="text" 
                      placeholder="Nome do fornecedor"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-600" 
                      value={formData.provider} 
                      onChange={e => setFormData({...formData, provider: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefone do Fornecedor</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="(00) 00000-0000"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-600" 
                        value={formData.providerPhone} 
                        onChange={e => setFormData({...formData, providerPhone: e.target.value})} 
                      />
                      <Phone size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Observações</label>
                  <textarea 
                    rows={3}
                    placeholder="Observações sobre o insumo"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-600 resize-none" 
                    value={formData.observations} 
                    onChange={e => setFormData({...formData, observations: e.target.value})} 
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-8">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-3.5 border border-gray-200 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3.5 bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Salvar Insumo
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
