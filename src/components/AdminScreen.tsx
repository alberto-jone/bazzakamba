
import React, { useEffect, useState } from 'react';
import { LogOut, Download, Users, Activity, Star, Lock, AlertCircle, UserPlus, X, Car, MapPin } from 'lucide-react';
import { db } from '../services/db';
import { User, DriverFeedback, PrototypeFeedback } from '../types';

interface AdminScreenProps {
  onBack: () => void;
  onGoToMap?: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ onBack, onGoToMap }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [simCount, setSimCount] = useState(0);
  const [driverFeedbacks, setDriverFeedbacks] = useState<DriverFeedback[]>([]);
  const [appFeedbacks, setAppFeedbacks] = useState<PrototypeFeedback[]>([]);
  const [totalRides, setTotalRides] = useState(0);
  const [avgAppRating, setAvgAppRating] = useState(0);

  // Driver Form State
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', email: '', phone: '', plate: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    const user = db.getLoggedInUser();
    setCurrentUser(user);

    // Se não for passageiro, carrega os dados
    if (user && user.role !== 'passenger') {
      loadData();
    }
  }, []);

  const loadData = () => {
    setUsers(db.getUsers());
    setSimCount(db.getSimulationCount());
    setDriverFeedbacks(db.getDriverFeedback());
    setAppFeedbacks(db.getPrototypeFeedback());
    setTotalRides(db.getTotalRidesCount());
    setAvgAppRating(db.getAverageAppRating());
  };

  // Bloqueio de Segurança
  if (!currentUser || currentUser.role === 'passenger') {
    return (
      <div className="h-full w-full bg-gray-50 flex flex-col items-center justify-center text-center p-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Acesso Negado</h2>
        <p className="text-gray-500 mb-8 mt-2 max-w-[250px]">Esta área é restrita para administradores e motoristas.</p>
        <button
          onClick={onBack}
          className="bg-[#007FF0] text-white font-bold py-3 px-8 rounded-xl shadow-lg active:scale-95 transition-transform"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'admin';
  const isDriver = currentUser.role === 'driver';

  // Stats Calculations
  const avgDriverRating = driverFeedbacks.length
    ? (driverFeedbacks.reduce((acc, curr) => acc + curr.rideRating, 0) / driverFeedbacks.length).toFixed(1)
    : '0.0';

  const handleRegisterDriver = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      db.registerDriver(newDriver);
      setFormSuccess('Motorista cadastrado com sucesso!');
      setNewDriver({ name: '', email: '', phone: '', plate: '' });
      loadData(); // Refresh lists
      setTimeout(() => {
        setShowDriverForm(false);
        setFormSuccess('');
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao cadastrar motorista');
    }
  };

  return (
    <div className="h-full w-full bg-gray-50 flex flex-col relative">

      {/* MODAL CADASTRO MOTORISTA */}
      {showDriverForm && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Novo Motorista</h3>
              <button onClick={() => setShowDriverForm(false)} className="p-2 hover:bg-gray-100 rounded-full" title="Fechar" aria-label="Fechar">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {formSuccess && <div className="bg-green-100 text-green-700 text-xs p-3 rounded-lg mb-4 font-bold">{formSuccess}</div>}
            {formError && <div className="bg-red-100 text-red-700 text-xs p-3 rounded-lg mb-4 font-bold">{formError}</div>}

            <form onSubmit={handleRegisterDriver} className="space-y-3">
              <input
                required placeholder="Nome do Motorista"
                value={newDriver.name} onChange={e => setNewDriver({ ...newDriver, name: e.target.value })}
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-900 font-medium focus:border-[#007FF0] outline-none"
              />
              <input
                required placeholder="Email" type="email"
                value={newDriver.email} onChange={e => setNewDriver({ ...newDriver, email: e.target.value })}
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-900 font-medium focus:border-[#007FF0] outline-none"
              />
              <input
                required placeholder="Telefone" type="tel"
                value={newDriver.phone} onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })}
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-900 font-medium focus:border-[#007FF0] outline-none"
              />
              <input
                required placeholder="Matrícula do Carro"
                value={newDriver.plate} onChange={e => setNewDriver({ ...newDriver, plate: e.target.value })}
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-900 font-medium focus:border-[#007FF0] outline-none"
              />

              <div className="text-[10px] text-gray-500 mt-2 mb-4">
                * A senha padrão será: <span className="font-mono font-bold text-gray-800">vamu@2025</span>
              </div>

              <button type="submit" className="w-full bg-[#007FF0] text-white font-bold py-3 rounded-xl hover:bg-[#0066CC] shadow-lg">
                Cadastrar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header Dinâmico - AGORA SEMPRE #007FF0 */}
      <div className="bg-[#007FF0] text-white p-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-xl transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

        <div className="flex items-center justify-between mb-6 relative z-10">
          <button onClick={onBack} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors flex items-center gap-2 pr-4">
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-bold">Sair</span>
          </button>
          <div className="flex flex-col items-end">
            <h1 className="font-bold text-lg">{isAdmin ? 'Painel Admin' : 'Área do Motorista'}</h1>
            <span className="text-[10px] opacity-80 uppercase tracking-wider font-medium">{currentUser.name}</span>
          </div>
        </div>

        {/* --- KEY METRICS GRID --- */}
        <div className="grid grid-cols-2 gap-3 relative z-10">
          {isAdmin && (
            <>
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-white" />
                  <span className="text-[10px] font-bold uppercase opacity-80">Usuários</span>
                </div>
                <div className="text-2xl font-bold">{users.length}</div>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-white" />
                  <span className="text-[10px] font-bold uppercase opacity-80">Corridas</span>
                </div>
                <div className="text-2xl font-bold">{totalRides}</div>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-white" />
                  <span className="text-[10px] font-bold uppercase opacity-80">App</span>
                </div>
                <div className="text-2xl font-bold">{avgAppRating.toFixed(1)}</div>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-white" />
                  <span className="text-[10px] font-bold uppercase opacity-80">Motorista</span>
                </div>
                <div className="text-2xl font-bold">{driverFeedbacks.length > 0 ? (driverFeedbacks.reduce((acc, curr) => acc + curr.rideRating, 0) / driverFeedbacks.length).toFixed(1) : '0.0'}</div>
              </div>
            </>
          )}          {isDriver && (
            <>
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20 col-span-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg text-white"><Star className="w-5 h-5 fill-white" /></div>
                  <div>
                    <div className="text-sm font-bold">Sua Nota Média</div>
                    <div className="text-[10px] opacity-80">{driverFeedbacks.length} corridas avaliadas</div>
                  </div>
                </div>
                <div className="text-3xl font-bold">{avgDriverRating}</div>
              </div>

              {/* BOTÃO INICIAR TURNO (PARA MOTORISTAS) */}
              <button
                onClick={onGoToMap}
                className="col-span-2 bg-white text-[#007FF0] p-4 rounded-2xl font-bold shadow-lg flex items-center justify-between hover:bg-gray-50 transition-all active:scale-[0.98] group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#007FF0]/10 p-2 rounded-full group-hover:bg-[#007FF0]/20 transition-colors">
                    <Car className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black uppercase">Iniciar Turno</div>
                    <div className="text-[10px] text-gray-500">Ir para o Mapa e Aceitar Corridas</div>
                  </div>
                </div>
                <MapPin className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden flex flex-col">

        {/* --- ADMIN SECTION: USER LIST & REGISTER DRIVER --- */}
        {isAdmin && (
          <div className="mb-6 flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-[#007FF0] text-sm uppercase tracking-wide">Base de Usuários</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDriverForm(true)}
                  className="flex items-center gap-1.5 text-[10px] font-bold bg-[#007FF0] text-white px-3 py-1.5 rounded-lg hover:bg-[#0066CC] transition-colors shadow-sm"
                >
                  <UserPlus className="w-3 h-3" /> Novo Motorista
                </button>
                <button
                  onClick={() => db.exportDataToCSV()}
                  className="flex items-center gap-1.5 text-[10px] font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-black transition-colors shadow-sm"
                >
                  <Download className="w-3 h-3" /> CSV
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 overflow-y-auto">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                    <tr>
                      <th className="p-3 text-[10px] font-bold text-gray-500 uppercase">Nome / Email</th>
                      <th className="p-3 text-[10px] font-bold text-gray-500 uppercase text-right">Perfil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.slice().reverse().map((user) => (
                      <tr key={user.id} className="hover:bg-[#007FF0]/5 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-xs text-gray-900">{user.name}</div>
                          <div className="text-[10px] text-gray-400">{user.email || user.phone}</div>
                        </td>
                        <td className="p-3 text-right">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                            user.role === 'driver' ? 'bg-[#007FF0]/10 text-[#007FF0] border-[#007FF0]/20' :
                              'bg-gray-100 text-gray-500 border-gray-200'
                            }`}>
                            {user.role === 'driver' ? 'Motorista' : user.role === 'admin' ? 'Admin' : 'Passageiro'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- COMMON SECTION: DRIVER FEEDBACK --- */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-[#007FF0] text-sm uppercase tracking-wide">
              {isAdmin ? 'Todos os Feedbacks' : 'Avaliações Recebidas'}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto flex-1 p-2">
            {driverFeedbacks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                <AlertCircle className="w-8 h-8 opacity-20" />
                <span className="text-xs">Nenhuma avaliação registrada ainda.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {driverFeedbacks.slice().reverse().map((feedback, idx) => (
                  <div key={feedback.id || idx} className="p-3 rounded-xl bg-gray-50 hover:bg-white hover:shadow-sm border border-transparent hover:border-[#007FF0]/20 transition-all">
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < feedback.rideRating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                          />
                        ))}
                      </div>
                      <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded ${feedback.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                        feedback.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                        {feedback.sentiment || 'Neutro'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-800 italic mb-2 font-medium">"{feedback.comment}"</p>
                    <div className="text-[9px] text-gray-400 text-right border-t border-gray-100 pt-1.5">
                      Recebido em: {new Date(feedback.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
