
import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, User, Edit2, Trash, X, Save, FileText, MoreHorizontal, MapPin, UserCheck, Check } from 'lucide-react';
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

  useEffect(() => {
    const stored = localStorage.getItem('quickprint_clients');
    if (stored) {
      const parsed: Client[] = JSON.parse(stored);
      const sorted = parsed.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'accent' }));
      setClients(sorted);
    } else {
      const initial = [
        { id: '1', name: 'Gráfica Digital LTDA', email: 'contato@graficadigital.com', phone: '(11) 99999-9999', document: '12.345.678/0001-00', responsible: 'João Silva', city: 'São Paulo', address: 'Rua das Artes, 150', neighborhood: 'Centro' },
        { id: '2', name: 'Ana Costa Designer', email: 'ana@email.com', phone: '(11) 88888-8888', document: '987.654.321-11', responsible: 'Ana Costa', city: 'São Bernardo', address: 'Av Principal, 10', neighborhood: 'Jardim' },
      ];
      saveClients(initial);
    }
  }, []);

  const saveClients = (newClients: Client[]) => {
    const sorted = [...newClients].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'accent' }));
    setClients(sorted);
    localStorage.setItem('quickprint_clients', JSON.stringify(sorted));
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

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.document.includes(searchTerm) ||
    (c.responsible && c.responsible.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-600 text-white rounded-lg shadow-lg">
            <User size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Base de Clientes</h2>
        </div>
        <button onClick={handleOpenCreateModal} className="bg-green-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-green-700 font-bold shadow-md active:scale-95 transition-all">
          <Plus size={20} /> NOVO CLIENTE
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome, email ou CPF/CNPJ..." 
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500/20 bg-gray-50/50"
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
                <th className="px-6 py-4">Cliente / Responsável</th>
                <th className="px-6 py-4">Documento</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Localização</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-green-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 uppercase text-xs">{client.name}</span>
                      {client.responsible && <span className="text-[10px] text-blue-600 font-bold uppercase">{client.responsible}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">{client.document}</td>
                  <td className="px-6 py-4 text-xs text-gray-600">{formatPhone(client.phone)}</td>
                  <td className="px-6 py-4 text-xs text-gray-600">{client.city}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleOpenEditModal(client)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(client.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Nenhum cliente encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="text-2xl font-semibold text-slate-800">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Nome Completo */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Nome Completo *</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Nome do cliente"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors placeholder:text-gray-300" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>

                {/* Telefone */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Telefone</label>
                  <input 
                    type="text" 
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors placeholder:text-gray-300" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: formatPhone(e.target.value)})} 
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Email</label>
                  <input 
                    type="email" 
                    placeholder="email@exemplo.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors placeholder:text-gray-300" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                </div>

                {/* CPF/CNPJ */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">CPF/CNPJ</label>
                  <input 
                    type="text" 
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors placeholder:text-gray-300" 
                    value={formData.document} 
                    onChange={e => setFormData({...formData, document: e.target.value})} 
                  />
                </div>

                {/* Responsável */}
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Responsável</label>
                  <input 
                    type="text" 
                    placeholder="Nome do responsável pelo cliente"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors placeholder:text-gray-300" 
                    value={formData.responsible} 
                    onChange={e => setFormData({...formData, responsible: e.target.value})} 
                  />
                </div>

                {/* Endereço */}
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Endereço</label>
                  <input 
                    type="text" 
                    placeholder="Rua e número"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors placeholder:text-gray-300" 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                  />
                </div>

                {/* Bairro */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Bairro</label>
                  <input 
                    type="text" 
                    placeholder="Bairro"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors placeholder:text-gray-300" 
                    value={formData.neighborhood} 
                    onChange={e => setFormData({...formData, neighborhood: e.target.value})} 
                  />
                </div>

                {/* Cidade */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Cidade</label>
                  <input 
                    type="text" 
                    placeholder="Cidade"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors placeholder:text-gray-300" 
                    value={formData.city} 
                    onChange={e => setFormData({...formData, city: e.target.value})} 
                  />
                </div>

                {/* Observações */}
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Observações</label>
                  <textarea 
                    rows={4}
                    placeholder="Informações adicionais sobre o cliente"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-slate-500 transition-colors resize-none placeholder:text-gray-400" 
                    value={formData.observations} 
                    onChange={e => setFormData({...formData, observations: e.target.value})} 
                  />
                </div>

              </div>

              {/* Botões Ações */}
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

export default Clients;
