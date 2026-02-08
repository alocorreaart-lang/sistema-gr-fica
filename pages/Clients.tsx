
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, User, Edit2, X, Save, MapPin, UserCheck, Trash2 } from 'lucide-react';
import { Client } from '../types';

const formatPhone = (value: string) => {
  if (!value) return "";
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 2) return numbers.replace(/(\d{2})/, "($1");
  if (numbers.length <= 6) return numbers.replace(/(\d{2})(\d{0,4})/, "($1) $2");
  if (numbers.length <= 10) return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return numbers.substring(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

const Clients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadClients = useCallback(() => {
    const stored = localStorage.getItem('quickprint_clients');
    if (stored) {
      const parsed: Client[] = JSON.parse(stored);
      const sorted = parsed.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'accent' }));
      setClients(sorted);
    } else {
      const initial: Client[] = [
        { id: 'c1', name: 'Adaliana Souza', email: '', phone: '', document: '' },
        { id: 'c2', name: 'Adriely Balieiro Ribeiro', email: '', phone: '(12) 99757-9771', document: '' },
        { id: 'c3', name: 'Alexandra - Emo', email: '', phone: '', document: '' },
        { id: 'c21', name: 'Gera Som', email: 'feitoamao.impressos@gmail.com', phone: '(12) 99619-3794', document: '' },
        { id: 'c26', name: 'IRM SENHOR DOS PASSOS E STA CASA DE MISERICORDIA DE GUARATINGUETA', email: 'compras@santacasaguara.com.br', phone: '(12) 99628-3943', document: '' },
        { id: 'c56', name: 'Santa Casa de Misericórdia de Guaratinguetá', email: '', phone: '(12) 2131-1900', document: '' }
      ];
      const sortedInitial = initial.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'accent' }));
      setClients(sortedInitial);
      localStorage.setItem('quickprint_clients', JSON.stringify(sortedInitial));
    }
  }, []);

  useEffect(() => {
    loadClients();
    
    // Listener para atualizar se o localStorage mudar em outra parte do app
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'quickprint_clients') {
        loadClients();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Evento customizado para mudanças na mesma aba
    window.addEventListener('clientsUpdated', loadClients);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('clientsUpdated', loadClients);
    };
  }, [loadClients]);

  const saveClients = (newClients: Client[]) => {
    const sorted = [...newClients].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'accent' }));
    setClients(sorted);
    localStorage.setItem('quickprint_clients', JSON.stringify(sorted));
    setSelectedIds(new Set());
    // Dispara evento para outras partes do app
    window.dispatchEvent(new Event('clientsUpdated'));
  };

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', document: '', responsible: '', address: '', neighborhood: '', city: '', observations: ''
  });

  const handleOpenCreateModal = () => {
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', document: '', responsible: '', address: '', neighborhood: '', city: '', observations: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({ 
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      document: client.document || '',
      responsible: client.responsible || '',
      address: client.address || '',
      neighborhood: client.neighborhood || '',
      city: client.city || '',
      observations: client.observations || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      saveClients(clients.map(c => c.id === editingClient.id ? { ...c, ...formData } : c));
    } else {
      const newClient: Client = { id: Math.random().toString(36).substr(2, 9), ...formData };
      saveClients([...clients, newClient]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja remover este cliente?')) {
      saveClients(clients.filter(c => c.id !== id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Deseja excluir permanentemente os ${selectedIds.size} clientes selecionados?`)) {
      saveClients(clients.filter(c => !selectedIds.has(c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredClients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredClients.map(c => c.id)));
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.document && c.document.includes(searchTerm)) ||
    (c.responsible && c.responsible.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-600 text-white rounded-lg shadow-lg">
            <User size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Base de Clientes</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Total: {clients.length} cadastrados</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button onClick={handleOpenCreateModal} className="bg-green-600 text-white px-6 py-2.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-green-700 font-bold text-xs shadow-lg shadow-green-100 active:scale-95 transition-all">
            <Plus size={20} /> NOVO CLIENTE
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome, email ou CPF/CNPJ..." 
            className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 bg-white shadow-sm text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 animate-in slide-in-from-right-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{selectedIds.size} selecionados</span>
            <button 
              onClick={handleDeleteSelected}
              className="bg-red-600 text-white px-4 py-3 rounded-2xl flex items-center gap-2 hover:bg-red-700 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100 transition-all active:scale-95"
            >
              <Trash2 size={16} /> Excluir Selecionados
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-gray-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 w-12">
                   <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" 
                    checked={selectedIds.size === filteredClients.length && filteredClients.length > 0}
                    onChange={toggleSelectAll}
                   />
                </th>
                <th className="px-6 py-4">Cliente / Responsável</th>
                <th className="px-6 py-4">Documento</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Localização</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClients.map(client => (
                <tr key={client.id} className={`hover:bg-slate-50 transition-colors group ${selectedIds.has(client.id) ? 'bg-green-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" 
                      checked={selectedIds.has(client.id)}
                      onChange={() => toggleSelect(client.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 uppercase text-xs">{client.name}</span>
                      {client.responsible && <span className="text-[10px] text-blue-600 font-bold uppercase">{client.responsible}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">{client.document || '-'}</td>
                  <td className="px-6 py-4 text-xs text-slate-600">{client.phone ? formatPhone(client.phone) : '-'}</td>
                  <td className="px-6 py-4 text-xs text-slate-600">{client.city || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleOpenEditModal(client)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Editar"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(client.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Excluir"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <User size={48} className="text-slate-300" />
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Nenhum cliente encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                    <UserCheck size={24} />
                 </div>
                 <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                   {editingClient ? 'Editar Cadastro' : 'Novo Cliente'}
                 </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-slate-50 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo *</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: João da Silva"
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-slate-700" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone de Contato</label>
                  <input 
                    type="text" 
                    placeholder="(00) 00000-0000"
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-slate-700" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: formatPhone(e.target.value)})} 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Principal</label>
                  <input 
                    type="email" 
                    placeholder="email@empresa.com"
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-slate-700" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPF / CNPJ</label>
                  <input 
                    type="text" 
                    placeholder="000.000.000-00"
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-slate-700" 
                    value={formData.document} 
                    onChange={e => setFormData({...formData, document: e.target.value})} 
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Responsável (Opcional)</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-slate-700" 
                    value={formData.responsible} 
                    onChange={e => setFormData({...formData, responsible: e.target.value})} 
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço de Cobrança / Entrega</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder="Rua, Número, Complemento"
                      className="w-full pl-12 pr-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-slate-700" 
                      value={formData.address} 
                      onChange={e => setFormData({...formData, address: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bairro</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-slate-700" 
                    value={formData.neighborhood} 
                    onChange={e => setFormData({...formData, neighborhood: e.target.value})} 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cidade</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-slate-700" 
                    value={formData.city} 
                    onChange={e => setFormData({...formData, city: e.target.value})} 
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observações Importantes</label>
                  <textarea 
                    rows={4}
                    placeholder="Informações relevantes para o atendimento..."
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-slate-700 resize-none" 
                    value={formData.observations} 
                    onChange={e => setFormData({...formData, observations: e.target.value})} 
                  />
                </div>

              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-50">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-10 py-4 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                >
                  Descartar
                </button>
                <button 
                  type="submit" 
                  className="px-12 py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-100 hover:bg-green-700 transition-all active:scale-95 flex items-center gap-3"
                >
                  <Save size={18} />
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
