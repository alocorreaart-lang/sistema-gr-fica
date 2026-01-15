
import React, { useState } from 'react';
import { 
  Layers, Search, Plus, X, Trash2, Edit, AlertTriangle, 
  Archive, Save, ArrowDown, ArrowUp 
} from 'lucide-react';
import { Supply } from '../types';

const Supplies: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [supplies, setSupplies] = useState<Supply[]>([
    { id: '1', name: 'Papel Couché 300g A3', unit: 'Folhas', stock: 250, minStock: 100, costPrice: 0.85, provider: 'Papelaria Central' },
    { id: '2', name: 'Toner Preto HP', unit: 'Un', stock: 2, minStock: 3, costPrice: 450.00, provider: 'Suprimentos Info' },
    { id: '3', name: 'Lona 440g Fosca', unit: 'M²', stock: 50, minStock: 20, costPrice: 12.00, provider: 'Sign Supplies' },
    { id: '4', name: 'Vinil Adesivo Branco', unit: 'M²', stock: 15, minStock: 25, costPrice: 8.50, provider: 'Sign Supplies' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    unit: 'Un',
    stock: 0,
    minStock: 0,
    costPrice: 0,
    provider: ''
  });

  const handleOpenCreateModal = () => {
    setEditingSupply(null);
    setFormData({ name: '', unit: 'Un', stock: 0, minStock: 0, costPrice: 0, provider: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (s: Supply) => {
    setEditingSupply(s);
    setFormData({
      name: s.name,
      unit: s.unit,
      stock: s.stock,
      minStock: s.minStock,
      costPrice: s.costPrice,
      provider: s.provider
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
      setSupplies(supplies.map(s => s.id === editingSupply.id ? supplyData : s));
    } else {
      setSupplies([supplyData, ...supplies]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir este insumo permanentemente?')) {
      setSupplies(supplies.filter(s => s.id !== id));
    }
  };

  const filteredSupplies = supplies.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-700 text-white rounded-lg shadow-lg">
            <Layers size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Gestão de Insumos</h2>
        </div>
        <button 
          onClick={handleOpenCreateModal} 
          className="bg-slate-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-slate-800 font-bold shadow-md transition-all active:scale-95"
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
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-black text-gray-500 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Insumo</th>
              <th className="px-6 py-4">Unidade</th>
              <th className="px-6 py-4">Estoque Atual</th>
              <th className="px-6 py-4">Custo Unit.</th>
              <th className="px-6 py-4">Fornecedor</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredSupplies.map(supply => {
              const isLowStock = supply.stock <= supply.minStock;
              return (
                <tr key={supply.id} className={`hover:bg-slate-50 transition-colors ${isLowStock ? 'bg-amber-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">{supply.name}</span>
                      {isLowStock && (
                        <div className="text-amber-500" title="Estoque Baixo">
                          <AlertTriangle size={16} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{supply.unit}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`font-black ${isLowStock ? 'text-red-600' : 'text-slate-700'}`}>
                        {supply.stock}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Mín: {supply.minStock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">R$ {supply.costPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{supply.provider}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleOpenEditModal(supply)} className="p-2 text-gray-400 hover:text-slate-800 transition-colors"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(supply.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredSupplies.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                  Nenhum insumo encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-800 text-white">
              <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                <Archive size={20} />
                {editingSupply ? 'Editar Insumo' : 'Novo Insumo'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:text-gray-300 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Nome do Insumo *</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: Papel Couché 300g"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-500/20" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Unidade de Medida</label>
                  <select 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-500/20 bg-white"
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                  >
                    <option value="Un">Unidade</option>
                    <option value="Folhas">Folhas</option>
                    <option value="M²">M²</option>
                    <option value="Kg">Kg</option>
                    <option value="Ml">Ml</option>
                    <option value="Pac">Pacote</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Preço de Custo (Unit.)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">R$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-500/20" 
                      value={formData.costPrice || ''} 
                      onChange={e => setFormData({...formData, costPrice: parseFloat(e.target.value) || 0})} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Estoque Atual</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-500/20" 
                    value={formData.stock || 0} 
                    onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Estoque Mínimo (Alerta)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-500/20" 
                    value={formData.minStock || 0} 
                    onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})} 
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Fornecedor Preferencial</label>
                  <input 
                    type="text" 
                    placeholder="Nome da empresa fornecedora"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-500/20" 
                    value={formData.provider} 
                    onChange={e => setFormData({...formData, provider: e.target.value})} 
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={16} />
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
