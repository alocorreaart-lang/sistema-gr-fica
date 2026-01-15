
import React, { useState } from 'react';
import { Plus, Search, Mail, Phone, User, Edit2, Trash, X, Save } from 'lucide-react';
import { Client } from '../types';

const Clients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([
    { id: '1', name: 'João Silva', email: 'joao@email.com', phone: '(11) 99999-9999', document: '123.456.789-00' },
    { id: '2', name: 'Ana Costa', email: 'ana@email.com', phone: '(11) 88888-8888', document: '987.654.321-11' },
    { id: '3', name: 'Restaurante Sabor', email: 'contato@sabor.com', phone: '(11) 77777-7777', document: '12.345.678/0001-99' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    responsible: '',
    address: '',
    neighborhood: '',
    city: '',
    observations: ''
  });

  const handleOpenCreateModal = () => {
    setEditingClient(null);
    setFormData({ 
      name: '', 
      email: '', 
      phone: '', 
      document: '',
      responsible: '',
      address: '',
      neighborhood: '',
      city: '',
      observations: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      document: client.document,
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
      setClients(clients.map(c => c.id === editingClient.id ? { ...c, ...formData } : c));
    } else {
      const newClient: Client = { id: Math.random().toString(36).substr(2, 9), ...formData };
      setClients([newClient, ...clients]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja remover este cliente?')) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.document.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Cadastro de Clientes</h2>
        <button onClick={handleOpenCreateModal} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 font-medium shadow-md active:scale-95">
          <Plus size={20} /> Novo Cliente
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar clientes..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500/20"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all relative group animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-50 rounded-lg text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors"><User size={24} /></div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenEditModal(client)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(client.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash size={16} /></button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{client.name}</h3>
            <p className="text-xs text-gray-400 font-mono mb-4">{client.document}</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600"><Mail size={14} className="text-gray-400" /><span className="truncate">{client.email}</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><Phone size={14} className="text-gray-400" /><span>{client.phone}</span></div>
            </div>
            <button 
              onClick={() => alert(`Histórico de ${client.name} em desenvolvimento...`)}
              className="mt-6 w-full py-2 bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
            >
              Ver Histórico
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-2xl font-semibold text-gray-900">{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                {/* Nome Completo */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Nome Completo *</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Nome do cliente"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:ring-0 outline-none transition-all placeholder:text-gray-400" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>

                {/* Telefone */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Telefone</label>
                  <input 
                    type="text" 
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:ring-0 outline-none transition-all placeholder:text-gray-400" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                  />
                </div>

                {/* Email */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Email</label>
                  <input 
                    type="email" 
                    placeholder="email@exemplo.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:ring-0 outline-none transition-all placeholder:text-gray-400" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                </div>

                {/* CPF/CNPJ */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-800 mb-2">CPF/CNPJ</label>
                  <input 
                    type="text" 
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:ring-0 outline-none transition-all placeholder:text-gray-400" 
                    value={formData.document} 
                    onChange={e => setFormData({...formData, document: e.target.value})} 
                  />
                </div>

                {/* Responsável */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Responsável</label>
                  <input 
                    type="text" 
                    placeholder="Nome do responsável pelo cliente"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:ring-0 outline-none transition-all placeholder:text-gray-400" 
                    value={formData.responsible} 
                    onChange={e => setFormData({...formData, responsible: e.target.value})} 
                  />
                </div>

                {/* Endereço */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Endereço</label>
                  <input 
                    type="text" 
                    placeholder="Rua e número"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:ring-0 outline-none transition-all placeholder:text-gray-400" 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                  />
                </div>

                {/* Bairro */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Bairro</label>
                  <input 
                    type="text" 
                    placeholder="Bairro"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:ring-0 outline-none transition-all placeholder:text-gray-400" 
                    value={formData.neighborhood} 
                    onChange={e => setFormData({...formData, neighborhood: e.target.value})} 
                  />
                </div>

                {/* Cidade */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Cidade</label>
                  <input 
                    type="text" 
                    placeholder="Cidade"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:ring-0 outline-none transition-all placeholder:text-gray-400" 
                    value={formData.city} 
                    onChange={e => setFormData({...formData, city: e.target.value})} 
                  />
                </div>

                {/* Observações */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Observações</label>
                  <textarea 
                    rows={4}
                    placeholder="Informações adicionais sobre o cliente"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:ring-0 outline-none transition-all resize-none placeholder:text-gray-400" 
                    value={formData.observations} 
                    onChange={e => setFormData({...formData, observations: e.target.value})} 
                  />
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex justify-end items-center gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-8 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-2.5 bg-[#8cd0a8] text-white rounded-lg font-medium hover:bg-[#7bc097] transition-all flex items-center gap-2"
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
