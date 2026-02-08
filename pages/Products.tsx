
import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, X, Trash2, Edit, Save } from 'lucide-react';
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
      const sorted = parsed.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'accent' }));
      setProducts(sorted);
    } else {
      const initial: Product[] = [
        { id: 'p1', name: 'Adesivo Fotográfico A4', category: 'Impressão', basePrice: 1.90, salePrice: 7.00, margin: 268.42, unit: 'Unidade', size: 'A4', material: 'Fotográfico', description: '' },
        { id: 'p2', name: 'Adesivo Fotográfico A4 - Atacado', category: 'Impressão', basePrice: 1.90, salePrice: 5.50, margin: 189.47, unit: 'Unidade', size: 'A4', material: 'Fotográfico', description: '' },
        { id: 'p3', name: 'Adesivo Marmitex 220gr', category: 'Impressão', basePrice: 0.51, salePrice: 0.90, margin: 76.47, unit: 'Unidade', size: '', material: 'Papel 220g', description: '' },
        { id: 'p4', name: 'Adesivo Vinil - 1 - 3x1,5cm + meio corte', category: 'Adesivo', basePrice: 0.10, salePrice: 0.25, margin: 150.00, unit: 'Unidade', size: '3x1,5cm', material: 'Vinil', description: '' },
        { id: 'p5', name: 'Adesivo Vinil - 2 - 4x2cm + meio corte', category: 'Adesivo', basePrice: 0.10, salePrice: 0.35, margin: 250.00, unit: 'Unidade', size: '4x2cm', material: 'Vinil', description: '' },
        { id: 'p6', name: 'Adesivo Vinil - 3 - 6,5x3,5cm + meio corte', category: 'Adesivo', basePrice: 0.15, salePrice: 0.50, margin: 233.33, unit: 'Unidade', size: '6,5x3,5cm', material: 'Vinil', description: '' },
        { id: 'p7', name: 'Adesivo Vinil - 4 - 7x3cm + meio corte', category: 'Adesivo', basePrice: 0.15, salePrice: 0.65, margin: 333.33, unit: 'Unidade', size: '7x3cm', material: 'Vinil', description: '' },
        { id: 'p8', name: 'Adesivo Vinil - 5 - 8,8x5,8cm + meio corte', category: 'Adesivo', basePrice: 0.15, salePrice: 0.70, margin: 366.67, unit: 'Unidade', size: '8,8x5,8cm', material: 'Vinil', description: '' },
        { id: 'p9', name: 'Adesivo Vinil - 6 - 10x7cm + meio corte', category: 'Adesivo', basePrice: 0.51, salePrice: 1.97, margin: 286.27, unit: 'Unidade', size: '10x7cm', material: 'Vinil', description: '' },
        { id: 'p10', name: 'Adesivo Vinil - 7 - 20x10+ meio corte', category: 'Adesivo', basePrice: 1.90, salePrice: 10.00, margin: 426.32, unit: 'Unidade', size: '20x10cm', material: 'Vinil', description: '' },
        { id: 'p11', name: 'Adesivo Vinil - Metro 60cm', category: 'Impressão', basePrice: 36.00, salePrice: 95.00, margin: 163.89, unit: 'M. Linear', size: '60cm', material: 'Vinil', description: '' },
        { id: 'p12', name: 'Agenda 2025 - A5 - 2DPP - Promoção', category: 'Impressão', basePrice: 26.00, salePrice: 50.00, margin: 92.31, unit: 'Unidade', size: 'A5', material: '', description: '' },
        { id: 'p13', name: 'Agenda 2026 - A5 - 2DPP', category: 'Impressão', basePrice: 26.00, salePrice: 60.00, margin: 130.77, unit: 'Unidade', size: 'A5', material: '', description: '' },
        { id: 'p14', name: 'Agenda Escolar A6', category: 'Impressão', basePrice: 0.00, salePrice: 30.00, margin: 0, unit: 'Unidade', size: 'A6', material: '', description: '' },
        { id: 'p15', name: 'Bandeirola até 10 letras', category: 'Personalizados', basePrice: 10.24, salePrice: 25.00, margin: 144.14, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p16', name: 'Banner 60x90 - Com bastão e cordão', category: 'Impressão', basePrice: 60.00, salePrice: 115.00, margin: 91.67, unit: 'Unidade', size: '60x90cm', material: 'Lona', description: '' },
        { id: 'p17', name: 'Bloco A5 - 1 via papel 75g', category: 'Impressão', basePrice: 5.70, salePrice: 14.00, margin: 145.61, unit: 'Unidade', size: 'A5', material: 'Papel 75g', description: '' },
        { id: 'p18', name: 'Bloco A6 - 1 via - 10 un.', category: 'Impressão', basePrice: 41.00, salePrice: 110.00, margin: 168.29, unit: 'Pacote', size: 'A6', material: '', description: '' },
        { id: 'p19', name: 'Bloco A6 - 1 via - 20 un.', category: 'Impressão', basePrice: 82.00, salePrice: 180.00, margin: 119.51, unit: 'Pacote', size: 'A6', material: '', description: '' },
        { id: 'p20', name: 'Bloco de comanda Garçon - 7,5x11 2 vias + Carbono', category: 'Impressão', basePrice: 2.40, salePrice: 4.50, margin: 87.50, unit: 'Unidade', size: '7,5x11cm', material: '', description: '' },
        { id: 'p21', name: 'Bloco10x14 - 100 Folhas - Wire-o - Capa 180', category: 'Impressão', basePrice: 0.00, salePrice: 7.60, margin: 0, unit: 'Unidade', size: '10x14cm', material: '', description: '' },
        { id: 'p22', name: 'Bloco10x14 - 50 Folhas - Wire-o - Capa 180', category: 'Impressão', basePrice: 0.00, salePrice: 5.60, margin: 0, unit: 'Unidade', size: '10x14cm', material: '', description: '' },
        { id: 'p23', name: 'Bombonieri', category: 'Impressão', basePrice: 5.46, salePrice: 13.90, margin: 154.58, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p24', name: 'Caderneta de Vacinação - 15x21 - Espiral - Promoção', category: 'Personalizados', basePrice: 23.00, salePrice: 50.00, margin: 117.39, unit: 'Unidade', size: '15x21cm', material: '', description: '' },
        { id: 'p25', name: 'Caderno Escolar A5 - Brochura', category: 'Impressão', basePrice: 10.97, salePrice: 30.00, margin: 173.47, unit: 'Unidade', size: 'A5', material: '', description: '' },
        { id: 'p26', name: 'Caderno Escolar A5 - Wire-o', category: 'Impressão', basePrice: 16.35, salePrice: 45.00, margin: 175.23, unit: 'Unidade', size: 'A5', material: '', description: '' },
        { id: 'p27', name: 'Caderno Escolar Universitário - Brochura', category: 'Impressão', basePrice: 25.00, salePrice: 45.00, margin: 80.00, unit: 'Unidade', size: 'Universitário', material: '', description: '' },
        { id: 'p28', name: 'Caderno Espiral - 25x18', category: 'Impressão', basePrice: 0.00, salePrice: 80.00, margin: 0, unit: 'Unidade', size: '25x18cm', material: '', description: '' },
        { id: 'p29', name: 'Caixa Granada Exército', category: 'Impressão', basePrice: 2.50, salePrice: 6.00, margin: 140.00, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p30', name: 'Caixa Kit Lanche', category: 'Impressão', basePrice: 9.82, salePrice: 17.60, margin: 79.23, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p31', name: 'Caixa Milk Básica', category: 'Personalizados', basePrice: 1.58, salePrice: 4.20, margin: 165.82, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p32', name: 'Caixa Milk Semi-Luxo', category: 'Personalizados', basePrice: 0.00, salePrice: 4.70, margin: 0, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p33', name: 'Caixa Mochila do Exército', category: 'Impressão', basePrice: 2.50, salePrice: 6.00, margin: 140.00, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p34', name: 'Caixa Personalizada', category: 'Impressão', basePrice: 0.00, salePrice: 4.70, margin: 0, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p35', name: 'Caixa Regador', category: 'Personalizados', basePrice: 3.00, salePrice: 8.00, margin: 166.67, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p36', name: 'Caixa Roda Gigante', category: 'Personalizados', basePrice: 3.00, salePrice: 8.00, margin: 166.67, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p37', name: 'Caneca', category: 'Impressão', basePrice: 0.00, salePrice: 50.00, margin: 0, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p38', name: 'Cardápio A4 -Plastificado 8 pág. Frente e Verso', category: 'Impressão', basePrice: 0.00, salePrice: 28.00, margin: 0, unit: 'Unidade', size: 'A4', material: '', description: '' },
        { id: 'p39', name: 'Cartão de Visita - 4x1 - 250g Verniz Frente - 1000 Un.', category: 'Impressão', basePrice: 64.87, salePrice: 110.00, margin: 69.57, unit: 'Milheiro', size: '9x5cm', material: '250g', description: '' },
        { id: 'p40', name: 'Cartão de Visita - 4x4 - 250g Verniz Frente - 1000 Un.', category: 'Impressão', basePrice: 72.69, salePrice: 125.00, margin: 71.96, unit: 'Milheiro', size: '9x5cm', material: '250g', description: '' },
        { id: 'p41', name: 'Centro de Mesa Sextavado', category: 'Personalizados', basePrice: 4.73, salePrice: 8.00, margin: 69.13, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p42', name: 'Chaveiro de Acrílico 3x4', category: 'Personalizados', basePrice: 3.65, salePrice: 10.00, margin: 173.97, unit: 'Unidade', size: '3x4cm', material: 'Acrílico', description: '' },
        { id: 'p43', name: 'Chaveiro Fio de Malha com tag', category: 'Impressão', basePrice: 0.00, salePrice: 10.00, margin: 0, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p44', name: 'Convite Digital Cortesia', category: 'Impressão', basePrice: 0.00, salePrice: 0.01, margin: 0, unit: 'Unidade', size: 'Digital', material: '', description: '' },
        { id: 'p45', name: 'Diario de Oração', category: 'Impressão', basePrice: 0.00, salePrice: 50.00, margin: 0, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p46', name: 'Display de Mesa', category: 'Personalizados', basePrice: 2.50, salePrice: 8.00, margin: 220.00, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p47', name: 'Encadernação até 150 folhas', category: 'Encadernação', basePrice: 2.00, salePrice: 10.00, margin: 400.00, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p48', name: 'Esfera de Natal - Bolinha Avulsa', category: 'Impressão', basePrice: 2.00, salePrice: 6.00, margin: 200.00, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p49', name: 'Etiquetas Escolares Kit 1 - 43 un.', category: 'Adesivo', basePrice: 4.93, salePrice: 25.00, margin: 407.10, unit: 'Kit', size: '', material: 'Adesivo', description: '' },
        { id: 'p50', name: 'Etiquetas Escolares Kit 2 - 86 un.', category: 'Adesivo', basePrice: 6.81, salePrice: 35.00, margin: 413.95, unit: 'Kit', size: '', material: 'Adesivo', description: '' },
        { id: 'p51', name: 'Etiquetas Escolares Kit 3 - 120 un.', category: 'Adesivo', basePrice: 8.95, salePrice: 45.00, margin: 402.79, unit: 'Kit', size: '', material: 'Adesivo', description: '' },
        { id: 'p52', name: 'Kit Agenda + Caderno', category: 'Impressão', basePrice: 45.00, salePrice: 90.00, margin: 100.00, unit: 'Kit', size: '', material: '', description: '' },
        { id: 'p53', name: 'Kit Esfera de Natal - Bolinha', category: 'Impressão', basePrice: 6.00, salePrice: 18.00, margin: 200.00, unit: 'Kit', size: '', material: '', description: '' },
        { id: 'p54', name: 'Kit M Festa na Mesa', category: 'Impressão', basePrice: 25.00, salePrice: 106.25, margin: 325.00, unit: 'Kit', size: '', material: '', description: '' },
        { id: 'p55', name: 'Kit P Festa na Mesa', category: 'Impressão', basePrice: 20.00, salePrice: 60.00, margin: 200.00, unit: 'Kit', size: '', material: '', description: '' },
        { id: 'p56', name: 'Kit pegue e monte 30 peças', category: 'Impressão', basePrice: 0.00, salePrice: 90.00, margin: 0, unit: 'Kit', size: '', material: '', description: '' },
        { id: 'p57', name: 'Mini Caderno A6', category: 'Impressão', basePrice: 6.00, salePrice: 18.00, margin: 200.00, unit: 'Unidade', size: 'A6', material: '', description: '' },
        { id: 'p58', name: 'Nossa Senhora de Vidro tam. 30cm', category: 'Personalizados', basePrice: 6.65, salePrice: 15.00, margin: 125.56, unit: 'Unidade', size: '30cm', material: 'Vidro', description: '' },
        { id: 'p59', name: 'Painel 60x40', category: 'Personalizados', basePrice: 0.00, salePrice: 60.00, margin: 0, unit: 'Unidade', size: '60x40cm', material: '', description: '' },
        { id: 'p60', name: 'Planner Mensal', category: 'Impressão', basePrice: 0.00, salePrice: 50.00, margin: 0, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p61', name: 'Planner Semanal', category: 'Impressão', basePrice: 0.00, salePrice: 50.00, margin: 0, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p62', name: 'Porta Bis', category: 'Impressão', basePrice: 0.00, salePrice: 2.70, margin: 0, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p63', name: 'Quadro de Parede A4', category: 'Personalizados', basePrice: 1.78, salePrice: 8.00, margin: 349.44, unit: 'Unidade', size: 'A4', material: '', description: '' },
        { id: 'p64', name: 'Quadro infantil ilustrado 21x28cm em papel 180g', category: 'Impressão', basePrice: 2.35, salePrice: 7.25, margin: 208.51, unit: 'Unidade', size: '21x28cm', material: '180g', description: '' },
        { id: 'p65', name: 'Sacola Personalizada 15x20,5x5', category: 'Personalizados', basePrice: 2.50, salePrice: 7.00, margin: 180.00, unit: 'Unidade', size: '15x20,5x5cm', material: '', description: '' },
        { id: 'p66', name: 'Saquinho de Suspiro', category: 'Impressão', basePrice: 2.30, salePrice: 7.15, margin: 210.87, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p67', name: 'Serviço de Corte e Vinco A4 - Colaborador', category: 'Outros', basePrice: 0.80, salePrice: 1.30, margin: 62.50, unit: 'Unidade', size: 'A4', material: '', description: '' },
        { id: 'p68', name: 'Tag 10x7 - Papel 180g - 450 un.', category: 'Impressão', basePrice: 0.00, salePrice: 98.00, margin: 0, unit: 'Pacote', size: '10x7cm', material: '180g', description: '' },
        { id: 'p69', name: 'Tag para Canetas 18x5,5', category: 'Personalizados', basePrice: 0.32, salePrice: 0.85, margin: 165.63, unit: 'Unidade', size: '18x5,5cm', material: '', description: '' },
        { id: 'p70', name: 'Tobolata 7x10 cm', category: 'Personalizados', basePrice: 4.40, salePrice: 11.00, margin: 150.00, unit: 'Unidade', size: '7x10cm', material: '', description: '' },
        { id: 'p71', name: 'Topo de bolo Simples', category: 'Personalizados', basePrice: 0.00, salePrice: 15.00, margin: 0, unit: 'Unidade', size: '', material: '', description: '' },
        { id: 'p72', name: 'Topper de Docinho 35x35cm com palito', category: 'Impressão', basePrice: 0.00, salePrice: 0.90, margin: 0, unit: 'Unidade', size: '35x35cm', material: '', description: '' },
        { id: 'p73', name: 'Topper para Cupcake - 4x4cm com palito', category: 'Impressão', basePrice: 0.00, salePrice: 0.98, margin: 0, unit: 'Unidade', size: '4x4cm', material: '', description: '' },
        { id: 'p74', name: 'Tubete 13cm', category: 'Personalizados', basePrice: 0.00, salePrice: 2.70, margin: 0, unit: 'Unidade', size: '13cm', material: '', description: '' },
        { id: 'p75', name: 'Vela Aromatizada', category: 'Personalizados', basePrice: 8.80, salePrice: 19.00, margin: 115.91, unit: 'Unidade', size: '', material: '', description: '' }
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
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button onClick={handleOpenCreateModal} className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 font-bold text-xs shadow-lg shadow-indigo-100 active:scale-95 transition-all">
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
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-inner"
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                {editingProduct ? 'Editar Serviço' : 'Novo Serviço'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-50 rounded-full">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Nome do Serviço */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Serviço *</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: Impressão Colorida A4"
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>

                {/* Categoria */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria *</label>
                  <div className="relative">
                    <select 
                      required
                      className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700 appearance-none"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="Impressão">Impressão</option>
                      <option value="Adesivo">Adesivo</option>
                      <option value="Personalizados">Personalizados</option>
                      <option value="Encadernação">Encadernação</option>
                      <option value="Acabamento">Acabamento</option>
                      <option value="Design">Design</option>
                      <option value="Comunicação Visual">Comunicação Visual</option>
                      <option value="Outros">Outros</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>

                {/* Custo */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custo (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700" 
                    value={formData.basePrice} 
                    onChange={e => handleCalculation('basePrice', e.target.value)} 
                  />
                </div>

                {/* Margem de Lucro */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Margem de Lucro (%)</label>
                  <input 
                    type="number" 
                    step="1"
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700" 
                    value={formData.margin} 
                    onChange={e => handleCalculation('margin', e.target.value)} 
                  />
                </div>

                {/* Preço Unitário */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço Unitário (R$) *</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700" 
                    value={formData.salePrice} 
                    onChange={e => handleCalculation('salePrice', e.target.value)} 
                  />
                </div>

                {/* Unidade de Medida */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidade de Medida</label>
                  <div className="relative">
                    <select 
                      className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700 appearance-none"
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
                      <option value="Kit">Kit</option>
                      <option value="Pacote">Pacote</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</label>
                  <textarea 
                    rows={4}
                    placeholder="Descreva os detalhes do serviço"
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-700 resize-none" 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                  />
                </div>

              </div>

              {/* Ações */}
              <div className="flex justify-end gap-4 pt-6 border-t border-slate-50">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-10 py-4 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3"
                >
                  <Save size={18} />
                  Salvar Produto
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
