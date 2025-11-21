
import React, { useState } from 'react';
import { ShieldCheck, UserCircle, ArrowRight, KeyRound, Lock } from 'lucide-react';
import { db } from '../services/db';

interface RegistrationScreenProps {
  onRegister: () => void;
  onAdminRequest: () => void;
}

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onRegister }) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado para Cadastro (Passageiro)
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Estado para Login (Admin/Motorista)
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: ''
  });

  const handlePassengerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.name || !registerData.phone) return;

    setLoading(true);
    setError('');

    try {
      // Verifica se usuário já existe
      const existingUser = await db.checkUserExists(registerData.phone, registerData.email);

      if (existingUser) {
        // Login automático se já existe
        db.loginUser(existingUser);
        onRegister();
      } else {
        // Cria novo usuário
        const user = await db.registerUser(registerData);
        db.loginUser(user);
        onRegister();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Autenticação real com senha
    const user = db.authenticate(loginData.identifier, loginData.password);

    if (user) {
      db.loginUser(user);
      onRegister();
    } else {
      setError('Credenciais inválidas. Tente admin@vamu.ao / vamu@2025');
    }

    setLoading(false);
  };

  return (
    <div className="h-full w-full bg-white flex flex-col relative">

      {/* Navigation Tabs */}
      <div className="m-4 p-1 bg-gray-100 rounded-xl flex">
        <button
          onClick={() => { setMode('register'); setError(''); }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${mode === 'register' ? 'bg-white shadow-sm text-[#E63121]' : 'text-gray-400'
            }`}
        >
          <UserCircle className="w-4 h-4" />
          Passageiro
        </button>
        <button
          onClick={() => { setMode('login'); setError(''); }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${mode === 'login' ? 'bg-white shadow-sm text-[#E63121]' : 'text-gray-400'
            }`}
        >
          <KeyRound className="w-4 h-4" />
          Login
        </button>
      </div>

      <div className="flex-1 p-6 flex flex-col overflow-y-auto">

        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8 mt-4">
          <div className="mb-4 flex justify-center">
            <img src="/logo.jpg" alt="vamu Logo" className="h-20 object-contain rounded-lg shadow-md" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-[#E63121]">
            VAMU
          </h1>          <p className="text-gray-500 text-xs text-center mt-1 max-w-[250px] font-medium">
            {mode === 'register'
              ? 'Crie sua conta para solicitar viagens e testar o protótipo.'
              : 'Área restrita para gestão e motoristas parceiros.'}
          </p>
        </div>

        {mode === 'register' ? (
          // --- FORMULÁRIO PASSAGEIRO ---
          <form onSubmit={handlePassengerRegister} className="space-y-4 flex-1 flex flex-col">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Nome Completo</label>
              <input
                required
                type="text"
                placeholder="Ex: João Paulo"
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#E63121] focus:bg-white outline-none transition-all text-sm font-bold text-gray-900 placeholder-gray-400"
                value={registerData.name}
                onChange={e => setRegisterData({ ...registerData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Telefone</label>
              <input
                required
                type="tel"
                placeholder="9XX XXX XXX"
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#E63121] focus:bg-white outline-none transition-all text-sm font-bold text-gray-900 placeholder-gray-400"
                value={registerData.phone}
                onChange={e => setRegisterData({ ...registerData, phone: e.target.value })}
              />
            </div>

            <div className="mt-auto pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E63121] hover:bg-[#0066CC] disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Processando...' : <>Criar Conta e Entrar <ArrowRight className="w-4 h-4" /></>}
              </button>
              <p className="text-[10px] text-center text-gray-400 mt-4">
                Ao continuar, você concorda com os Termos de Uso do protótipo VAMU.
              </p>
            </div>
          </form>
        ) : (
          // --- FORMULÁRIO ADMIN / MOTORISTA ---
          <form onSubmit={handleStaffLogin} className="space-y-4 flex-1 flex flex-col">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Email ou Telefone</label>
              <input
                required
                type="text"
                placeholder="Ex: admin@vamu.ao"
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-gray-900 focus:bg-white outline-none transition-all text-sm font-bold text-gray-900 placeholder-gray-400"
                value={loginData.identifier}
                onChange={e => setLoginData({ ...loginData, identifier: e.target.value })}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Senha</label>
              <div className="relative">
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-gray-900 focus:bg-white outline-none transition-all text-sm font-bold text-gray-900 placeholder-gray-400"
                  value={loginData.password}
                  onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                />
                <Lock className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            <div className="mt-auto pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E63121] hover:bg-[#E63121] disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                {loading ? 'Validando...' : 'Acessar Painel'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
