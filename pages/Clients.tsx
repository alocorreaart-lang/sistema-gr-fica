
import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, User, Edit2, Trash, X, Save, FileText, MoreHorizontal, MapPin, UserCheck } from 'lucide-react';
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
      setClients(JSON.parse(stored));
    } else {
      const initial = [
        { id: '1', name: 'Gráfica Digital LTDA', email: 'contato@graficadigital.com', phone: '(11) 99999-9999', document: '12.345.678/0001-00', responsible: 'João Silva', city: 'São Paulo', address: 'Rua das Artes', addressNumber: '150' },
        { id: '2', name: 'Ana Costa Designer', email: 'ana@email.com', phone: '(11) 88888-8888', document: '987.654.321-11', responsible: 'Ana Costa', city: 'São Bernardo', address: 'Av Principal', addressNumber: '10' },
      ];
      setClients(initial);
      localStorage.setItem('quickprint_clients', JSON.stringify(initial));
    }
  }, []);

  const saveClients = (newClients: Client[]) => {
    setClients(newClients);
    localStorage.setItem('quickprint_clients', JSON.stringify(newClients));
  };

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', document: '', responsible: '', address: '', addressNumber: '', neighborhood: '', city: '', observations: ''
  });

  const handleOpenCreateModal = () => {
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', document: '', responsible: '', address: '', addressNumber: '', neighborhood: '', city: '', observations: '' });
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
      addressNumber: client.addressNumber || '',
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
      saveClients([newClient, ...clients]);
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
    <div className="space-y-6 animate-in fade-in duration-500">
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
            placeholder="Buscar por nome, responsável, e-mail ou documento..." 
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
              {filteredClients.length > 0 ? filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-green-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">{client.name}</span>
                      {client.responsible && (
                        <div className="flex items-center gap-1 text-[10px] text-blue-600 font-black uppercase tracking-tight">
                          <UserCheck size={10} /> {client.responsible}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{client.document}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                        <Phone size={12} className="text-gray-400" />
                        {formatPhone(client.phone)}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                        <Mail size={12} />
                        {client.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5 text-xs text-gray-500">
                      <span className="font-bold text-slate-700">{client.city || '-'}</span>
                      {client.address && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 italic">
                          <MapPin size={10} /> {client.address}, {client.addressNumber}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleOpenEditModal(client)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(client.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic text-sm">Nenhum cliente encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className={`p-5 flex justify-between items-center text-white ${editingClient ? 'bg-blue-600' : 'bg-green-600'}`}>
              <h3 className="text-xl font-bold uppercase tracking-tight">{editingClient ? 'Editar Cadastro' : 'Novo Cliente'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Razão Social / Nome Fantasia *</label>
                  <input required type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-green-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Responsável (Contato Direto)</label>
                  <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-green-500 outline-none" value={formData.responsible} onChange={e => setFormData({...formData, responsible: e.target.value})} />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Telefone</label>
                  <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-green-500 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: formatPhone(e.target.value)})} />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Email</label>
                  <input type="email" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-green-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">CPF/CNPJ</label>
                  <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-green-500 outline-none" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Cidade</label>
                  <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-green-500 outline-none" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <div className="col-span-1 md:col-span-1 flex gap-4">
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Endereço (Rua/Av)</label>
                        <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-green-500 outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                </div>
                <div className="col-span-1 md:col-span-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Número</label>
                    <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-green-500 outline-none" value={formData.addressNumber} onChange={e => setFormData({...formData, addressNumber: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-2.5 border border-gray-300 text-gray-500 rounded-lg font-bold text-xs uppercase tracking-widest">Cancelar</button>
                <button type="submit" className={`px-10 py-3 text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-xl ${editingClient ? 'bg-blue-600' : 'bg-green-600'}`}>Salvar Cadastro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
