
import React, { useState, useEffect, useRef } from 'react';
import { Package, Search, Plus, X, Trash2, Edit, Calculator, Ruler, Layers, Save, Upload } from 'lucide-react';
import { Product } from '../types';
import * as XLSX from 'xlsx';

const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('quickprint_products');
    if (stored) {
      const parsed: Product[] = JSON.parse(stored);
      const sorted = parsed.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'accent' }));
      setProducts(sorted);
    } else {
      const initial: Product[] = [
        { id: '1', name: 'Impressão Colorida A4', category: 'Impressão', basePrice: 0.50, salePrice: 2.50, margin: 400, unit: 'Unidade', size: 'A4', material: 'Papel 75g', description: 'Impressão laser colorida papel 75g' },
        { id: '2', name: 'Banner Lona 440g', category: 'Comunicação Visual', basePrice: 25.00, salePrice: 65.00, margin: 160, unit: 'M²', size: 'Variável', material: 'Lona 440g', description: 'Banner com acabamento em madeira e cordão' },
      ];
      saveProducts(initial);
    }
  }, []);

  const saveProducts = (newProducts: Product[]) => {
    const sorted = [...newProducts].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'accent' }));
    setProducts(sorted);
    localStorage.setItem('quickprint_products', JSON.stringify(sorted));
  };

  const [formData, setFormData] = useState({
    name: '',
    category: 'Impressão',
    basePrice: '',
    salePrice: '',
    margin: '',
    unit: 'Unidade',
    description: ''
  });

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({ 
      name: '', 
      category: 'Impressão', 
      basePrice: '0.00', 
      salePrice: '0', 
      margin: '0', 
      unit: 'Unidade', 
      description: '' 
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category || 'Impressão',
      basePrice: p.basePrice.toFixed(2),
      salePrice: p.salePrice.toFixed(2),
      margin: p.margin.toFixed(0),
      unit: p.unit || 'Unidade',
      description: p.description
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const importedData = XLSX.utils.sheet_to_json(sheet);

        if (Array.isArray(importedData)) {
          const validImported = importedData.map((obj: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: obj.Nome || obj.name || obj.Produto || 'Sem Nome',
            category: obj.Categoria || obj.category || 'Geral',
            basePrice: parseFloat(obj.Custo || obj.custo || obj.basePrice) || 0,
            salePrice: parseFloat(obj.Venda || obj.venda || obj.salePrice) || 0,
            margin: parseFloat(obj.Margem || obj.margem || obj.margin) || 0,
            unit: obj.Unidade || obj.unit || 'Unidade',
            description: obj.Descricao || obj.descricao || obj.description || '',
            size: '',
            material: ''
          }));
          saveProducts([...products, ...validImported]);
          alert(`${validImported.length} produtos importados com sucesso!`);
        }
      } catch (err) {
        console.error(err);
        alert('Erro ao processar arquivo. Certifique-se de que é um arquivo Excel (.xlsx, .xls) ou CSV válido.');
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCalculation = (field: 'basePrice' | 'salePrice' | 'margin', value: string) => {
    const numValue = parseFloat(value) || 0;
    let base = field === 'basePrice' ? numValue : parseFloat(formData.basePrice) || 0;
    let sale = field === 'salePrice' ? numValue : parseFloat(formData.salePrice) || 0;
    let margin = field === 'margin' ? numValue : parseFloat(formData.margin) || 0;

    let updatedData = { ...formData, [field]: value };

    if (field === 'basePrice' || field === 'margin') {
      if (base > 0) {
        const calculatedSale = base + (base * (margin / 100));
        updatedData.salePrice = calculatedSale.toFixed(2);
      }
    } else if (field === 'salePrice') {
      if (base > 0 && sale > 0) {
        const calculatedMargin = ((sale - base) / base) * 100;
        updatedData.margin = calculatedMargin.toFixed(0);
      }
    }
    setFormData(updatedData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData: Product = {
      id: editingProduct ? editingProduct.id : Math.random().toString(36).substr(2, 9),
      name: formData.name,
      category: formData.category,
      basePrice: parseFloat(formData.basePrice) || 0,
      salePrice: parseFloat(formData.salePrice) || 0,
      margin: parseFloat(formData.margin) || 0,
      unit: formData.unit,
      size: '',
      material: '',
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg"><Package size={24} /></div>
          <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Produtos & Serviços</h2>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx,.xls,.csv" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 md:flex-none border-2 border-slate-200 text-slate-600 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-100 font-bold transition-all"
          >
            <Upload size={18} /> IMPORTAR EXCEL
          </button>
          <button onClick={handleOpenCreateModal} className="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 font-bold shadow-md active:scale-95 transition-all">
            <Plus size={20} /> NOVO PRODUTO
          </button>
        </div>
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
              <th className="px-6 py-4">Produto / Serviço</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4 text-right">Preço Custo</th>
              <th className="px-6 py-4 text-right">Preço Venda</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800 uppercase text-xs">{product.name}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{product.unit}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase tracking-tighter">
                    {product.category || 'Geral'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-xs font-semibold text-gray-400 italic">R$ {product.basePrice.toFixed(2)}</td>
                <td className="px-6 py-4 text-right font-black text-indigo-700">R$ {product.salePrice.toFixed(2)}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => handleOpenEditModal(product)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Nenhum produto cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="text-2xl font-semibold text-slate-800">
                {editingProduct ? 'Editar Serviço' : 'Novo Serviço'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Nome do Serviço */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Nome do Serviço *</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: Impressão Colorida A4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors placeholder:text-gray-300" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>

                {/* Categoria */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Categoria *</label>
                  <div className="relative">
                    <select 
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none bg-white focus:border-slate-500 transition-colors appearance-none"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="Impressão">Impressão</option>
                      <option value="Acabamento">Acabamento</option>
                      <option value="Design">Design</option>
                      <option value="Comunicação Visual">Comunicação Visual</option>
                      <option value="Outros">Outros</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>

                {/* Custo */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Custo (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors" 
                    value={formData.basePrice} 
                    onChange={e => handleCalculation('basePrice', e.target.value)} 
                  />
                </div>

                {/* Margem de Lucro */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Margem de Lucro (%)</label>
                  <input 
                    type="number" 
                    step="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors" 
                    value={formData.margin} 
                    onChange={e => handleCalculation('margin', e.target.value)} 
                  />
                </div>

                {/* Preço Unitário */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Preço Unitário (R$) *</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors" 
                    value={formData.salePrice} 
                    onChange={e => handleCalculation('salePrice', e.target.value)} 
                  />
                </div>

                {/* Unidade de Medida */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Unidade de Medida</label>
                  <div className="relative">
                    <select 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none bg-white focus:border-slate-500 transition-colors appearance-none"
                      value={formData.unit}
                      onChange={e => setFormData({...formData, unit: e.target.value})}
                    >
                      <option value="Unidade">Unidade</option>
                      <option value="Cento">Cento</option>
                      <option value="Milheiro">Milheiro</option>
                      <option value="M²">M²</option>
                      <option value="M. Linear">M. Linear</option>
                      <option value="Bloco">Bloco</option>
                      <option value="Hora">Hora</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Descrição</label>
                  <textarea 
                    rows={4}
                    placeholder="Descreva os detalhes do serviço"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors resize-none placeholder:text-gray-400" 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                  />
                </div>

              </div>

              {/* Ações */}
              <div className="flex justify-end gap-4 pt-4">
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

export default Products;
