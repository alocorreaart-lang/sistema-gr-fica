
import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, X, Trash2, Edit, Calculator, Ruler, Layers } from 'lucide-react';
import { Product } from '../types';

const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('quickprint_products');
    if (stored) {
      const parsed: Product[] = JSON.parse(stored);
      // Garante ordenação correta no carregamento
      const sorted = parsed.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'accent' }));
      setProducts(sorted);
    } else {
      const initial = [
        { id: '1', name: 'Cartão de Visita 4x4', basePrice: 25.00, salePrice: 45.00, margin: 80, size: '9x5cm', material: 'Couché 300g', description: 'Verniz Total Frente' },
        { id: '2', name: 'Panfleto A5', basePrice: 80.00, salePrice: 120.00, margin: 50, size: '15x21cm', material: 'Papel 90g', description: '1000 unidades, Colorido' },
      ];
      saveProducts(initial);
    }
  }, []);

  const saveProducts = (newProducts: Product[]) => {
    // Ordenação alfabética robusta antes de salvar em localStorage
    const sorted = [...newProducts].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'accent' }));
    setProducts(sorted);
    localStorage.setItem('quickprint_products', JSON.stringify(sorted));
  };

  const [formData, setFormData] = useState({
    name: '', basePrice: '', salePrice: '', margin: '', size: '', material: '', description: ''
  });

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', basePrice: '', salePrice: '', margin: '', size: '', material: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      basePrice: p.basePrice.toString(),
      salePrice: p.salePrice.toString(),
      margin: p.margin.toString(),
      size: p.size,
      material: p.material,
      description: p.description
    });
    setIsModalOpen(true);
  };

  const handleCalculation = (field: 'basePrice' | 'salePrice' | 'margin', value: string) => {
    const numValue = parseFloat(value) || 0;
    const base = field === 'basePrice' ? numValue : parseFloat(formData.basePrice) || 0;
    const sale = field === 'salePrice' ? numValue : parseFloat(formData.salePrice) || 0;
    const margin = field === 'margin' ? numValue : parseFloat(formData.margin) || 0;

    let updatedData = { ...formData, [field]: value };

    if (field === 'basePrice' || field === 'margin') {
      if (base > 0 && margin > 0) {
        const calculatedSale = base + (base * (margin / 100));
        updatedData.salePrice = calculatedSale.toFixed(2);
      }
    } else if (field === 'salePrice') {
      if (base > 0 && sale > 0) {
        const calculatedMargin = ((sale - base) / base) * 100;
        updatedData.margin = calculatedMargin.toFixed(2);
      }
    }
    setFormData(updatedData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData: Product = {
      id: editingProduct ? editingProduct.id : Math.random().toString(36).substr(2, 9),
      name: formData.name,
      basePrice: parseFloat(formData.basePrice) || 0,
      salePrice: parseFloat(formData.salePrice) || 0,
      margin: parseFloat(formData.margin) || 0,
      size: formData.size,
      material: formData.material,
      description: formData.description
    };

    if (editingProduct) {
      saveProducts(products.map(p => p.id === editingProduct.id ? productData : p));
    } else {
      saveProducts([...products, productData]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Excluir este produto permanentemente?')) {
      saveProducts(products.filter(p => p.id !== id));
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg"><Package size={24} /></div>
          <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Produtos & Serviços</h2>
        </div>
        <button onClick={handleOpenCreateModal} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-indigo-700 font-bold shadow-md">
          <Plus size={20} /> NOVO PRODUTO
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar produtos..." 
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-black text-gray-500 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Produto</th>
              <th className="px-6 py-4">Custo</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-bold text-gray-800 uppercase text-xs">{product.name}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 font-black">R$ {product.salePrice.toFixed(2)}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => handleOpenEditModal(product)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-600 text-white">
              <h3 className="text-xl font-bold uppercase tracking-tight">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nome do Produto / Serviço *</label>
                  <input required type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-50 font-bold uppercase" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Valor de Venda (R$)</label>
                  <input type="number" step="0.01" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-50 font-black text-indigo-700 bg-indigo-50/30" value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-gray-500 hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">Salvar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
