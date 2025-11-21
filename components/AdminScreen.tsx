import React, { useEffect, useState, useMemo } from 'react';
import { 
  LogOut, Users, Activity, Star, UserPlus, X, 
  Car, MapPin, TrendingUp, DollarSign, LayoutDashboard, 
  History, Menu, Smartphone, RefreshCcw, Loader, Printer
} from 'lucide-react';
import { db, Ride } from '../services/db';
import { User, DriverFeedback, PrototypeFeedback } from '../types';
import { RIDE_OPTIONS } from '../constants';

// --- IMPORTANDO BIBLIOTECAS PDF ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AdminScreenProps {
  onBack: () => void;
  onGoToMap?: () => void;
}

// --- COMPONENTES VISUAIS ---

const StarDisplay = ({ rating, size = "w-4 h-4" }: { rating: number, size?: string }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = rating >= star;
        const isHalf = rating >= star - 0.5 && rating < star;
        return (
          <div key={star} className="relative">
            <Star className={`${size} ${isFull ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            {isHalf && <div className="absolute top-0 left-0 overflow-hidden w-1/2 h-full"><Star className={`${size} fill-yellow-400 text-yellow-400`} /></div>}
          </div>
        );
      })}
      <span className="ml-2 text-xs font-bold text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
};

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
    <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-110 ${colorClass} opacity-10`}></div>
    <div className="relative z-10 flex justify-between items-start">
      <div>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-800">{value}</h3>
        {subtext && <p className="text-[10px] font-medium text-gray-400 mt-1">{subtext}</p>}
      </div>
      <div className={`p-2.5 rounded-xl ${colorClass} text-white shadow-md`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

const TabButton = ({ active, label, icon: Icon, onClick }: any) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-sm font-bold ${active ? 'bg-[#E63121] text-white shadow-lg shadow-red-200' : 'text-gray-500 hover:bg-gray-100'}`}>
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </button>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = { completed: "bg-green-100 text-green-700 border-green-200", cancelled: "bg-red-100 text-red-700 border-red-200", ongoing: "bg-red-100 text-red-700 border-red-200", default: "bg-gray-100 text-gray-600 border-gray-200" };
  const key = status as keyof typeof styles || 'default';
  return <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${styles[key]}`}>{status === 'completed' ? 'Concluída' : status === 'ongoing' ? 'Em Curso' : status}</span>;
};

// --- COMPONENTE PRINCIPAL ---

export const AdminScreen: React.FC<AdminScreenProps> = ({ onBack, onGoToMap }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'drivers' | 'app_feedback'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userFilter, setUserFilter] = useState<'all' | 'passenger' | 'driver'>('all');
  
  // Dados
  const [users, setUsers] = useState<User[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [driverFeedbacks, setDriverFeedbacks] = useState<DriverFeedback[]>([]);
  const [appFeedbacks, setAppFeedbacks] = useState<PrototypeFeedback[]>([]);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', email: '', phone: '', plate: '' });
  const [formStatus, setFormStatus] = useState<{type: 'success' | 'error' | '', msg: ''}>({ type: '', msg: '' });

  useEffect(() => {
    const user = db.getLoggedInUser();
    setCurrentUser(user);
    if (user && user.role !== 'passenger') loadData();
  }, []);

  const loadData = async () => {
    setIsSyncing(true);
    let remoteData = null;
    if (typeof db.syncDashboardData === 'function') {
      remoteData = await db.syncDashboardData(); 
    }
    
    if (remoteData) {
      setUsers(remoteData.users);
      setRides(remoteData.rides);
      setDriverFeedbacks(remoteData.driverFeedbacks);
      setAppFeedbacks(remoteData.appFeedbacks);
    } else {
      setUsers(db.getUsers());
      setRides(db.getRides());
      setDriverFeedbacks(db.getDriverFeedback());
      setAppFeedbacks(db.getPrototypeFeedback());
    }
    setIsSyncing(false);
  };

  const stats = useMemo(() => {
    const totalPassengers = users.filter(u => u.role === 'passenger').length;
    const totalDrivers = users.filter(u => u.role === 'driver').length;
    const completedRides = rides.filter(r => r.completedAt);
    const estimatedRevenue = completedRides.reduce((acc, ride) => {
      const option = RIDE_OPTIONS.find(opt => opt.id === ride.rideType || opt.type === ride.rideType);
      return acc + (option ? option.price : 0);
    }, 0);
    const avgDriverRating = driverFeedbacks.length ? (driverFeedbacks.reduce((acc, curr) => acc + curr.rideRating, 0) / driverFeedbacks.length) : 0;
    const avgAppRating = appFeedbacks.length ? (appFeedbacks.reduce((acc, curr) => acc + curr.rating, 0) / appFeedbacks.length) : 0;
    
    const positive = driverFeedbacks.filter(f => f.rideRating >= 4).length;
    const neutral = driverFeedbacks.filter(f => f.rideRating === 3).length;
    const negative = driverFeedbacks.filter(f => f.rideRating < 3).length;

    return { 
      totalUsers: users.length, totalPassengers, totalDrivers, 
      totalRides: rides.length, completedCount: completedRides.length, 
      revenue: estimatedRevenue, avgDriverRating, avgAppRating,
      feedbackDist: { positive, neutral, negative }
    };
  }, [users, rides, driverFeedbacks, appFeedbacks]);

  const formatKz = (val: number) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(val);

  const handleRegisterDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ type: '', msg: '' });
    try {
      db.registerDriver(newDriver);
      setFormStatus({ type: 'success', msg: 'Motorista cadastrado com sucesso!' });
      setNewDriver({ name: '', email: '', phone: '', plate: '' });
      setTimeout(() => { loadData(); setShowDriverForm(false); setFormStatus({ type: '', msg: '' }); }, 1500);
    } catch (err: any) { setFormStatus({ type: 'error', msg: err.message || 'Erro ao cadastrar.' }); }
  };

  // --- FUNÇÃO GERAR PDF PROFISSIONAL COM LOGO E TRADUÇÃO ---
  const generatePDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // 1. CARREGAR LOGO (Base64)
    const logoUrl = '/logo.jpg';
    let logoData = null;
    try {
        const image = new Image();
        image.src = logoUrl;
        await new Promise((resolve) => {
            image.onload = resolve;
            image.onerror = resolve; // Segue mesmo se falhar
        });
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(image, 0, 0);
            logoData = canvas.toDataURL('image/jpeg');
        }
    } catch (e) {
        console.error("Erro ao carregar logo para PDF", e);
    }

    // 2. CABEÇALHO
    doc.setFillColor(230, 49, 33); // #E63121
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Adicionar Logo se carregou
    if (logoData) {
        // Borda branca arredondada simulada (opcional)
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(14, 10, 20, 20, 2, 2, 'F');
        doc.addImage(logoData, 'JPEG', 15, 11, 18, 18);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    // Ajusta posição do texto dependendo se tem logo ou não
    const textX = logoData ? 40 : 14;
    doc.text("VAMU", textX, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("RELATÓRIO EXECUTIVO ANALÍTICO", textX, 28);

    doc.text(`Gerado em: ${new Date().toLocaleString('pt-AO')}`, pageWidth - 14, 20, { align: 'right' });
    doc.text("Confidencial", pageWidth - 14, 28, { align: 'right' });

    let yPos = 50;

    // 3. KPIs (Cartões Resumo)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Indicadores Financeiros e Operacionais", 14, yPos);
    yPos += 10;

    const kpiWidth = 45;
    const kpiHeight = 25;
    const gap = 5;
    let xPos = 14;

    const kpis = [
      { label: "RECEITA TOTAL", value: formatKz(stats.revenue) },
      { label: "VIAGENS", value: stats.totalRides.toString() },
      { label: "USUÁRIOS", value: stats.totalUsers.toString() },
      { label: "FROTA", value: stats.totalDrivers.toString() },
    ];

    kpis.forEach(kpi => {
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(xPos, yPos, kpiWidth, kpiHeight, 2, 2, 'FD');
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(kpi.label, xPos + 5, yPos + 8);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(kpi.value, xPos + 5, yPos + 18);
      
      xPos += kpiWidth + gap;
    });

    yPos += 35;

    // 4. GRÁFICOS
    doc.setFontSize(14);
    doc.text("Análise de Qualidade", 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Feedback dos Motoristas (Sentimento)", 14, yPos);
    yPos += 5;
    
    const totalFb = driverFeedbacks.length || 1;
    const wPos = (stats.feedbackDist.positive / totalFb) * 100;
    const wNeu = (stats.feedbackDist.neutral / totalFb) * 100;
    const wNeg = (stats.feedbackDist.negative / totalFb) * 100;
    
    doc.setFillColor(34, 197, 94); // Verde
    doc.rect(14, yPos, wPos, 8, 'F');
    doc.setFillColor(234, 179, 8); // Amarelo
    doc.rect(14 + wPos, yPos, wNeu, 8, 'F');
    doc.setFillColor(239, 68, 68); // Vermelho
    doc.rect(14 + wPos + wNeu, yPos, wNeg, 8, 'F');
    
    yPos += 12;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Positivo: ${stats.feedbackDist.positive} | Neutro: ${stats.feedbackDist.neutral} | Negativo: ${stats.feedbackDist.negative}`, 14, yPos);

    yPos += 15;

    // 5. TABELA VIAGENS
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Histórico Recente de Viagens", 14, yPos);
    
    const rideRows = rides.slice().reverse().map(r => {
      const opt = RIDE_OPTIONS.find(o => o.id === r.rideType);
      return [
        new Date(r.startedAt).toLocaleDateString(),
        r.origin || 'N/A',
        r.destination,
        opt?.name || r.rideType,
        opt ? formatKz(opt.price) : '-',
        r.completedAt ? 'Concluída' : 'Em Curso'
      ];
    });

    autoTable(doc, {
      startY: yPos + 5,
      head: [['Data', 'Origem', 'Destino', 'Categoria', 'Valor', 'Status']],
      body: rideRows,
      theme: 'striped',
      headStyles: { fillColor: [33, 49, 33] },
      styles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 247, 250] }
    });

    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 15;

    // 6. TABELA USUÁRIOS (COM TRADUÇÃO)
    doc.setFontSize(14);
    doc.text("Base de Usuários Cadastrados", 14, yPos);

    // Mapa de Tradução
    const roleMap: Record<string, string> = {
        'passenger': 'Passageiro',
        'driver': 'Motorista',
        'admin': 'Administrador'
    };

    const userRows = users.map(u => [
      u.name,
      u.email || u.phone,
      (roleMap[u.role] || u.role).toUpperCase(), // Traduz e coloca em maiúsculas
      u.plate || '-',
      new Date(u.registeredAt).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: yPos + 5,
      head: [['Nome', 'Contato', 'Perfil', 'Matrícula', 'Data Reg.']],
      body: userRows,
      theme: 'grid',
      headStyles: { fillColor: [50, 50, 50] },
      styles: { fontSize: 8 }
    });

    // 7. RODAPÉ
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${i} de ${pageCount} - vamu aplicativo de táxi`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    doc.save(`Relatorio_vamu_${new Date().getTime()}.pdf`);
  };
  // --- FIM DA FUNÇÃO PDF ---

  const filteredUsers = users.filter(u => userFilter === 'all' ? true : u.role === userFilter);

  if (!currentUser || currentUser.role === 'passenger') return <div className="h-full flex items-center justify-center">Acesso Negado</div>;
  const isAdmin = currentUser.role === 'admin';
  const isDriver = currentUser.role === 'driver';

  return (
    <div className="h-full w-full bg-[#F3F4F6] flex overflow-hidden font-sans relative">
      {isSidebarOpen && <div className="absolute inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`absolute md:relative inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2"><img src="/logo.jpg" alt="vamu" className="h-8 rounded shadow-sm" /><span className="font-black text-lg tracking-tight text-gray-800">ADMIN</span></div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Navegação</p>
          <TabButton active={activeTab === 'overview'} label="Visão Geral" icon={LayoutDashboard} onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} />
          {isAdmin && <>
            <TabButton active={activeTab === 'users'} label="Gestão de Usuários" icon={Users} onClick={() => { setActiveTab('users'); setUserFilter('all'); setIsSidebarOpen(false); }} />
            <TabButton active={activeTab === 'drivers'} label="Frota (Motoristas)" icon={Car} onClick={() => { setActiveTab('drivers'); setIsSidebarOpen(false); }} />
            <TabButton active={activeTab === 'app_feedback'} label="Avaliações App" icon={Smartphone} onClick={() => { setActiveTab('app_feedback'); setIsSidebarOpen(false); }} />
          </>}
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#E63121] flex items-center justify-center text-white font-bold text-sm">{currentUser.name.charAt(0)}</div>
            <div className="overflow-hidden"><p className="text-sm font-bold text-gray-900 truncate">{currentUser.name}</p><p className="text-[10px] text-gray-500 uppercase font-bold">{currentUser.role}</p></div>
          </div>
          <button onClick={onBack} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-red-500 py-2 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors"><LogOut className="w-3 h-3" /> Sair</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden h-full w-full">
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600"><Menu className="w-6 h-6" /></button>
            <h1 className="text-lg font-bold text-gray-800 leading-tight">{activeTab === 'overview' ? 'Painel de Controle' : activeTab === 'users' ? 'Base de Dados' : activeTab === 'drivers' ? 'Gestão de Frota' : 'Feedback do Usuário'}</h1>
          </div>
          <div className="flex gap-2">
             {isAdmin && (
               <button onClick={generatePDF} className="flex items-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-lg font-bold text-xs shadow hover:bg-black transition-all" title="Baixar PDF">
                 <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Baixar Relatório</span>
               </button>
             )}
             <button onClick={loadData} disabled={isSyncing} className={`p-2 rounded-lg transition-colors ${isSyncing ? 'bg-gray-100 text-red-500' : 'text-gray-500 hover:bg-gray-100'}`} title="Sincronizar Dados"><RefreshCcw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} /></button>
             {isDriver && <button onClick={onGoToMap} className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg font-bold text-xs shadow hover:bg-green-700"><MapPin className="w-3 h-3" /> <span className="hidden sm:inline">IR PARA O MAPA</span></button>}
             {isAdmin && <button onClick={() => setShowDriverForm(true)} className="flex items-center gap-2 bg-[#E63121] text-white px-3 py-2 rounded-lg font-bold text-xs shadow hover:bg-[#0066CC]"><UserPlus className="w-3 h-3" /> <span className="hidden sm:inline">Novo Motorista</span></button>}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 pb-20 md:p-8 scroll-smooth">
          {isSyncing && users.length === 0 && <div className="flex flex-col items-center justify-center h-64"><Loader className="w-8 h-8 text-[#E63121] animate-spin mb-4" /><p className="text-sm text-gray-500 font-bold">Baixando dados do Supabase...</p></div>}
          
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <StatCard title="Viagens Totais" value={stats.totalRides} subtext={`${stats.completedCount} concluídas`} icon={Activity} colorClass="bg-red-500" />
                <StatCard title="Passageiros" value={stats.totalPassengers} subtext="Cadastrados" icon={Users} colorClass="bg-red-500" />
                <StatCard title="Receita Estimada" value={formatKz(stats.revenue)} subtext="Estimativa Total" icon={DollarSign} colorClass="bg-green-500" />
                <StatCard title="Nota App" value={stats.avgAppRating.toFixed(1)} subtext="Avaliação Média" icon={Smartphone} colorClass="bg-pink-500" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                   <h3 className="font-bold text-gray-800 text-sm uppercase flex items-center gap-2 mb-4"><History className="w-4 h-4 text-[#E63121]" /> Últimas Viagens</h3>
                   <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-50 text-[10px] uppercase text-gray-500"><tr><th className="p-3">Rota</th><th className="p-3">Tipo</th><th className="p-3 text-right">Valor</th><th className="p-3 text-right">Status</th></tr></thead><tbody className="divide-y divide-gray-50">{rides.length === 0 ? <tr><td colSpan={4} className="p-4 text-center text-xs text-gray-400">Sem dados.</td></tr> : rides.slice().reverse().slice(0, 6).map(ride => { const option = RIDE_OPTIONS.find(o => o.id === ride.rideType); return (<tr key={ride.id} className="hover:bg-gray-50"><td className="p-3"><div className="flex flex-col gap-1"><span className="text-[10px] text-gray-500">De: {ride.origin || 'N/A'}</span><span className="text-xs font-bold text-gray-800">Para: {ride.destination}</span></div></td><td className="p-3 text-xs text-gray-600 capitalize">{option?.name || ride.rideType}</td><td className="p-3 text-right font-mono text-xs font-bold text-gray-700">{option ? formatKz(option.price) : '-'}</td><td className="p-3 text-right"><StatusBadge status={ride.completedAt ? 'completed' : 'ongoing'} /></td></tr>)})}</tbody></table></div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
                   <h3 className="font-bold text-gray-800 text-sm uppercase flex items-center gap-2 mb-4"><Users className="w-4 h-4 text-red-500" /> Passageiros Recentes</h3>
                   <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                     {users.filter(u => u.role === 'passenger').length === 0 ? <p className="text-xs text-gray-400 text-center">Sem passageiros.</p> : users.filter(u => u.role === 'passenger').slice().reverse().slice(0, 8).map(u => (<div key={u.id} className="flex items-center gap-3 p-2 hover:bg-red-50 rounded-lg transition-colors"><div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-xs">{u.name.charAt(0)}</div><div className="overflow-hidden"><p className="text-xs font-bold text-gray-800 truncate">{u.name}</p><p className="text-[10px] text-gray-400">{u.email || u.phone}</p></div></div>))}
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* USERS */}
          {activeTab === 'users' && isAdmin && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in">
              <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div><h3 className="font-bold text-lg text-gray-800">Base de Usuários</h3><p className="text-xs text-gray-500">{filteredUsers.length} registros</p></div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button onClick={() => setUserFilter('all')} className={`px-4 py-1.5 text-xs font-bold rounded-md ${userFilter === 'all' ? 'bg-white text-[#E63121] shadow-sm' : 'text-gray-500'}`}>Todos</button>
                  <button onClick={() => setUserFilter('passenger')} className={`px-4 py-1.5 text-xs font-bold rounded-md ${userFilter === 'passenger' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}>Passageiros</button>
                  <button onClick={() => setUserFilter('driver')} className={`px-4 py-1.5 text-xs font-bold rounded-md ${userFilter === 'driver' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}>Motoristas</button>
                </div>
              </div>
              <div className="overflow-x-auto"><table className="w-full text-left min-w-[600px]"><thead className="bg-gray-50 text-gray-500 font-bold text-[10px] uppercase"><tr><th className="p-4">Nome</th><th className="p-4">Função</th><th className="p-4">Contato</th><th className="p-4">Matrícula</th><th className="p-4 text-right">Registro</th></tr></thead><tbody className="divide-y divide-gray-50 text-sm">{filteredUsers.map(user => (<tr key={user.id} className="hover:bg-red-50/30"><td className="p-4 font-bold text-gray-800">{user.name}</td><td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${user.role === 'driver' ? 'bg-red-50 text-red-700 border-red-100' : user.role === 'passenger' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-gray-100'}`}>{user.role}</span></td><td className="p-4 text-gray-600 text-xs">{user.email || user.phone}</td><td className="p-4 text-gray-400 text-xs font-mono">{user.plate || '-'}</td><td className="p-4 text-right text-gray-400 text-xs">{new Date(user.registeredAt).toLocaleDateString()}</td></tr>))}</tbody></table></div>
            </div>
          )}

          {/* DRIVERS */}
          {activeTab === 'drivers' && isAdmin && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-red-900 p-6 rounded-2xl text-white shadow-lg flex justify-between items-center">
                <div><h2 className="text-xl font-bold">Frota</h2><p className="text-red-200 text-xs mt-1">{users.filter(u => u.role === 'driver').length} motoristas.</p></div>
                <button onClick={() => setShowDriverForm(true)} className="bg-white text-red-900 px-4 py-2 rounded-lg text-xs font-bold shadow">+ Cadastrar</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.filter(u => u.role === 'driver').map(driver => (
                  <div key={driver.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-[#E63121]"><Car className="w-5 h-5" /></div><div><h4 className="font-bold text-gray-900 text-sm">{driver.name}</h4><p className="text-[10px] text-gray-500 font-mono">{driver.plate || 'S/ Matrícula'}</p></div></div>
                    <div className="bg-gray-50 p-3 rounded-xl mb-3"><div className="flex justify-between items-center mb-1"><span className="text-[10px] font-bold text-gray-500 uppercase">Desempenho</span><StarDisplay rating={stats.avgDriverRating} /></div><div className="w-full bg-gray-200 rounded-full h-1.5 mt-2"><div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${(stats.avgDriverRating / 5) * 100}%` }}></div></div></div>
                    <div className="flex justify-between items-center text-[10px] text-gray-500 border-t border-gray-100 pt-3"><span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> {driver.phone}</span><span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">ATIVO</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* APP FEEDBACK */}
          {activeTab === 'app_feedback' && isAdmin && (
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in">
               <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center"><div><h3 className="font-bold text-lg text-gray-800">Avaliações App</h3><p className="text-xs text-gray-500">Feedback geral</p></div><div className="text-right"><div className="text-2xl font-black text-gray-800">{stats.avgAppRating.toFixed(1)}</div><StarDisplay rating={stats.avgAppRating} size="w-3 h-3" /></div></div>
               <div className="divide-y divide-gray-100">
                 {appFeedbacks.length === 0 ? <div className="p-8 text-center text-gray-400 text-sm">Sem feedback.</div> : appFeedbacks.slice().reverse().map((fb, idx) => (
                     <div key={fb.id || idx} className="p-5 hover:bg-gray-50"><div className="flex justify-between items-start mb-2"><StarDisplay rating={fb.rating} /><span className="text-[10px] text-gray-400 font-bold">{new Date(fb.submittedAt).toLocaleDateString()}</span></div><p className="text-sm text-gray-700 leading-relaxed font-medium">"{fb.comment}"</p></div>
                 ))}
               </div>
             </div>
          )}
        </div>
      </main>

      {/* MODAL CADASTRO */}
      {showDriverForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 relative">
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-gray-900">Novo Motorista</h3><button onClick={() => setShowDriverForm(false)} className="p-2 bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button></div>
            {formStatus.msg && <div className={`mb-4 p-3 rounded-lg text-xs font-bold ${formStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{formStatus.msg}</div>}
            <form onSubmit={handleRegisterDriver} className="space-y-3">
              <input required value={newDriver.name} onChange={e => setNewDriver({ ...newDriver, name: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm outline-none" placeholder="Nome Completo" />
              <div className="grid grid-cols-2 gap-3"><input required type="tel" value={newDriver.phone} onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm outline-none" placeholder="Telefone" /><input required value={newDriver.plate} onChange={e => setNewDriver({ ...newDriver, plate: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm outline-none" placeholder="Matrícula" /></div>
              <input required type="email" value={newDriver.email} onChange={e => setNewDriver({ ...newDriver, email: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm outline-none" placeholder="Email" />
              <div className="bg-red-50 p-3 rounded-lg text-red-800 text-[10px] mt-2">Senha padrão: <span className="font-mono font-bold">vamu@2025</span></div>
              <button type="submit" className="w-full bg-[#E63121] text-white font-bold py-3 rounded-xl hover:bg-[#0066CC] shadow-lg mt-4">Confirmar Cadastro</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};