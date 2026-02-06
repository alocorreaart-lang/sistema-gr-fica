
import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Building2, Phone, Mail, MapPin, Globe, 
  FileText, CheckCircle2, Palette, Type, Landmark, 
  Plus, Trash2, Wallet, Banknote, PiggyBank, CreditCard, Smartphone, ArrowLeftRight,
  Info, X
} from 'lucide-react';
import { SystemSettings, Account, PaymentMethod } from '../types';

const SystemSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    companyName: 'QUICKPRINT PRO',
    companyTagline: 'SOLUÇÕES EM GRÁFICA RÁPIDA E DESIGN',
    cnpj: '00.000.000/0001-00',
    address: 'Rua da Gráfica, 123 - Centro, Cidade/UF',
    phone: '(11) 99999-9999',
    email: 'contato@quickprint.com.br',
    website: 'www.quickprint.com.br',
    pixKey: '62.287.343/0001-36',
    pdfIntroText: 'Este texto irá aparecer no início da proposta enviada para o cliente, caso não queira inserir uma introdução basta deixar este espaço em branco.',
    primaryColor: '#2563eb',
    estimateValidityDays: 7,
    defaultFooterNote: 'QuickPrint Pro - Sistema de Gestão Gráfica - Gerado Digitalmente',
    accounts: [
      { id: 'default-cash', name: 'Caixa Local', initialBalance: 0, type: 'CASH', color: '#16a34a' }
    ],
    paymentMethods: [
      { id: 'pix', name: 'PIX' },
      { id: 'card', name: 'Cartão' },
      { id: 'cash', name: 'Dinheiro' },
      { id: 'transfer', name: 'Transferência' }
    ]
  });

  const [saved, setSaved] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', initialBalance: '', type: 'BANK' as 'BANK' | 'CASH' });
  const [newPaymentMethod, setNewPaymentMethod] = useState('');

  useEffect(() => {
    const storedSettings = localStorage.getItem('quickprint_settings');
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      // Fallback para novos campos se não existirem no localStorage antigo
      if (!parsed.pixKey) parsed.pixKey = '62.287.343/0001-36';
      if (!parsed.pdfIntroText) parsed.pdfIntroText = 'Este texto irá aparecer no início da proposta enviada para o cliente...';
      if (!parsed.accounts) parsed.accounts = [{ id: 'default-cash', name: 'Caixa Local', initialBalance: 0, type: 'CASH', color: '#16a34a' }];
      if (!parsed.paymentMethods) parsed.paymentMethods = [
        { id: 'pix', name: 'PIX' },
        { id: 'card', name: 'Cartão' },
        { id: 'cash', name: 'Dinheiro' },
        { id: 'transfer', name: 'Transferência' }
      ];
      setSettings(parsed);
    }
  }, []);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    localStorage.setItem('quickprint_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const addAccount = () => {
    if (!newAccount.name) return;
    const account: Account = {
      id: Math.random().toString(36).substr(2, 9),
      name: newAccount.name,
      initialBalance: parseFloat(newAccount.initialBalance) || 0,
      type: newAccount.type,
      color: newAccount.type === 'BANK' ? '#2563eb' : '#16a34a'
    };
    const updatedSettings = { ...settings, accounts: [...settings.accounts, account] };
    setSettings(updatedSettings);
    setNewAccount({ name: '', initialBalance: '', type: 'BANK' });
    localStorage.setItem('quickprint_settings', JSON.stringify(updatedSettings));
  };

  const removeAccount = (id: string) => {
    if (settings.accounts.length <= 1) {
      alert("O sistema precisa de pelo menos uma conta ativa.");
      return;
    }
    if (confirm('Deseja remover esta conta?')) {
      const updatedSettings = { ...settings, accounts: settings.accounts.filter(a => a.id !== id) };
      setSettings(updatedSettings);
      localStorage.setItem('quickprint_settings', JSON.stringify(updatedSettings));
    }
  };

  const addPaymentMethod = () => {
    if (!newPaymentMethod) return;
    const method: PaymentMethod = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPaymentMethod
    };
    const updatedSettings = { ...settings, paymentMethods: [...settings.paymentMethods, method] };
    setSettings(updatedSettings);
    setNewPaymentMethod('');
    localStorage.setItem('quickprint_settings', JSON.stringify(updatedSettings));
  };

  const removePaymentMethod = (id: string) => {
    if (settings.paymentMethods.length <= 1) {
      alert("O sistema precisa de pelo menos uma forma de pagamento.");
      return;
    }
    if (confirm('Deseja remover esta forma de pagamento?')) {
      const updatedSettings = { ...settings, paymentMethods: settings.paymentMethods.filter(m => m.id !== id) };
      setSettings(updatedSettings);
      localStorage.setItem('quickprint_settings', JSON.stringify(updatedSettings));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 text-white rounded-lg shadow-lg">
            <Settings size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Configurações Gerais</h2>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-full border border-green-100 animate-bounce">
            <CheckCircle2 size={18} /> SALVO!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna de Configurações do Sistema */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center gap-2">
                <Building2 size={18} className="text-blue-600" />
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Identidade da Empresa</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Razão Social / Nome Fantasia</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={settings.companyName} onChange={e => setSettings({...settings, companyName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">CNPJ / CPF</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={settings.cnpj} onChange={e => setSettings({...settings, cnpj: e.target.value})} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Slogan / Linha de Apoio (Tagline)</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={settings.companyTagline} onChange={e => setSettings({...settings, companyTagline: e.target.value})} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Endereço Completo</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Telefone de Contato</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">E-mail Comercial</label>
                  <input type="email" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Configurações de PDF Customizadas */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-blue-600 text-white border-b border-blue-700 flex items-center gap-2">
                <FileText size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest">Personalização dos Documentos (PDF)</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-2">
                    Chave PIX (Aparecerá no Cabeçalho) <Info size={12} className="text-blue-500" />
                  </label>
                  <input type="text" className="w-full px-4 py-2.5 bg-blue-50/30 border border-blue-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-blue-700 font-bold" value={settings.pixKey} onChange={e => setSettings({...settings, pixKey: e.target.value})} placeholder="CPF, CNPJ, Celular ou Aleatória" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Texto de Introdução / Boas-vindas do PDF</label>
                  <textarea rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-xs" value={settings.pdfIntroText} onChange={e => setSettings({...settings, pdfIntroText: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Nota de Rodapé Padrão</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-xs" value={settings.defaultFooterNote} onChange={e => setSettings({...settings, defaultFooterNote: e.target.value})} />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
              <Save size={20} /> SALVAR ALTERAÇÕES
            </button>
          </form>
        </div>

        {/* Coluna de Contas e Métodos */}
        <div className="space-y-6">
           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-4 bg-slate-800 text-white border-b border-slate-900 flex items-center gap-2">
               <Landmark size={18} />
               <h3 className="text-xs font-black uppercase tracking-widest">Carteiras e Caixas</h3>
             </div>
             <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <input type="text" placeholder="Nome do Banco/Caixa" className="w-full px-3 py-2 border rounded-lg text-xs" value={newAccount.name} onChange={e => setNewAccount({...newAccount, name: e.target.value})} />
                  <div className="flex gap-2">
                    <input type="number" placeholder="Saldo Inicial" className="flex-1 px-3 py-2 border rounded-lg text-xs" value={newAccount.initialBalance} onChange={e => setNewAccount({...newAccount, initialBalance: e.target.value})} />
                    <button onClick={addAccount} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase"><Plus size={14} /></button>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {settings.accounts.map(acc => (
                    <div key={acc.id} className="py-3 flex justify-between items-center group">
                      <div>
                        <p className="text-xs font-bold text-slate-700">{acc.name}</p>
                        <p className="text-[10px] text-green-600 font-bold">R$ {acc.initialBalance.toFixed(2)}</p>
                      </div>
                      <button onClick={() => removeAccount(acc.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
             </div>
           </div>

           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-4 bg-indigo-600 text-white border-b border-indigo-700 flex items-center gap-2">
               <CreditCard size={18} />
               <h3 className="text-xs font-black uppercase tracking-widest">Meios de Pagamento</h3>
             </div>
             <div className="p-4 space-y-4">
                <div className="flex gap-2">
                  <input type="text" placeholder="Ex: Boleto, Cheque" className="flex-1 px-3 py-2 border rounded-lg text-xs" value={newPaymentMethod} onChange={e => setNewPaymentMethod(e.target.value)} />
                  <button onClick={addPaymentMethod} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase"><Plus size={14} /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {settings.paymentMethods.map(m => (
                    <div key={m.id} className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg flex justify-between items-center group">
                      <span className="text-[10px] font-black text-indigo-700 uppercase">{m.name}</span>
                      <button onClick={() => removePaymentMethod(m.id)} className="text-indigo-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={12} /></button>
                    </div>
                  ))}
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
