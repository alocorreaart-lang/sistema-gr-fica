
import React, { useState, useEffect } from 'react';
import { Settings, Save, Building2, Phone, Mail, MapPin, Globe, FileText, CheckCircle2, Palette, Type } from 'lucide-react';
import { SystemSettings } from '../types';

const SystemSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    companyName: 'QuickPrint Pro',
    companyTagline: 'SOLUÇÕES EM GRÁFICA RÁPIDA E DESIGN',
    cnpj: '00.000.000/0001-00',
    address: 'Rua da Gráfica, 123 - Centro, Cidade/UF',
    phone: '(11) 99999-9999',
    email: 'contato@quickprint.com.br',
    website: 'www.quickprint.com.br',
    primaryColor: '#2563eb', // Azul padrão
    estimateValidityDays: 7,
    defaultFooterNote: 'QuickPrint Pro - Sistema de Gestão Gráfica - Gerado Digitalmente'
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedSettings = localStorage.getItem('quickprint_settings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('quickprint_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-lg shadow-lg">
            <Settings size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Configurações do Sistema</h2>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-full border border-green-100 animate-in slide-in-from-right">
            <CheckCircle2 size={18} />
            CONFIGURAÇÕES SALVAS!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identidade e Visual */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <Building2 size={18} className="text-blue-600" />
            <h3 className="text-sm font-bold text-gray-700 uppercase">Identidade e Visual</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">Razão Social / Nome Fantasia</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={settings.companyName}
                  onChange={e => setSettings({...settings, companyName: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">CNPJ / CPF</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={settings.cnpj}
                  onChange={e => setSettings({...settings, cnpj: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                <Type size={10} /> Slogan / Linha de Apoio (Abaixo da Razão Social no PDF)
              </label>
              <input 
                type="text" 
                placeholder="Ex: SOLUÇÕES EM GRÁFICA RÁPIDA E DESIGN"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={settings.companyTagline}
                onChange={e => setSettings({...settings, companyTagline: e.target.value})}
              />
            </div>

            <div className="space-y-1 border-t pt-4">
              <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                <Palette size={10} /> Cor de Destaque dos Documentos (Linhas e Títulos)
              </label>
              <div className="flex items-center gap-4">
                <input 
                  type="color" 
                  className="w-12 h-10 rounded border border-gray-200 cursor-pointer"
                  value={settings.primaryColor}
                  onChange={e => setSettings({...settings, primaryColor: e.target.value})}
                />
                <input 
                  type="text" 
                  className="flex-1 max-w-[120px] px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono uppercase"
                  value={settings.primaryColor}
                  onChange={e => setSettings({...settings, primaryColor: e.target.value})}
                />
                <p className="text-[10px] text-gray-400 italic">Esta cor será aplicada à linha abaixo da razão social no PDF.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contato e Localização */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <MapPin size={18} className="text-blue-600" />
            <h3 className="text-sm font-bold text-gray-700 uppercase">Contato e Localização</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase">Endereço Completo</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={settings.address}
                onChange={e => setSettings({...settings, address: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={settings.phone}
                    onChange={e => setSettings({...settings, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">E-mail de Contato</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="email" 
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={settings.email}
                    onChange={e => setSettings({...settings, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">Website</label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={settings.website}
                    onChange={e => setSettings({...settings, website: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentos e Impressão */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            <h3 className="text-sm font-bold text-gray-700 uppercase">Termos e Documentos</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-1 max-w-xs">
              <label className="text-[10px] font-black text-gray-400 uppercase">Validade dos Orçamentos (Dias)</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={settings.estimateValidityDays}
                onChange={e => setSettings({...settings, estimateValidityDays: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase">Nota de Rodapé Padrão</label>
              <textarea 
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Ex: Não aceitamos devoluções de material personalizado..."
                value={settings.defaultFooterNote}
                onChange={e => setSettings({...settings, defaultFooterNote: e.target.value})}
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-blue-200"
        >
          <Save size={20} />
          Salvar Configurações
        </button>
      </form>
    </div>
  );
};

export default SystemSettingsPage;
