
import { User, PrototypeFeedback, DriverFeedback, UserRole } from '../types';

// --- CONFIGURAÇÃO DE BANCO DE DADOS REMOTO (SUPABASE) ---
const SUPABASE_URL = 'https://sgepvykxaezscvnwyvdj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnZXB2eWt4YWV6c2N2bnd5dmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMDE1MzksImV4cCI6MjA3ODg3NzUzOX0.2tTtl0QZMgbf-TNlJ9PZBabgJT9BHnvD_gM-gpWfVZA';

// @ts-ignore
const supabase = (window.supabase && SUPABASE_URL && SUPABASE_KEY)
  // @ts-ignore
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

// Interface para viagens
export interface Ride {
  id: string;
  userId: string;
  destination: string;
  origin?: string;
  rideType: string;
  startedAt: string;
  completedAt?: string;
}

const DB_KEYS = {
  USERS: 'bk_users_v4',
  CURRENT_USER: 'bk_current_user_session_v4',
  STATS_SIMULATIONS: 'bk_stats_simulations_v4',
  FEEDBACK_APP: 'bk_feedback_app_v4',
  FEEDBACK_DRIVER: 'bk_feedback_driver_v4',
  RIDE_HISTORY: 'bk_ride_history_v4',
  INIT_FLAG: 'bk_db_initialized_v4'
};

// --- DADOS INICIAIS (APENAS ADMIN) ---
const SEED_USERS: User[] = [
  {
    id: 'admin-001',
    name: 'Administrador',
    email: 'admin@bazzakamba.ao',
    phone: '000000000',
    password: 'bazza@2025', // Senha fixa do Admin
    role: 'admin',
    registeredAt: new Date().toISOString()
  }
];

export const db = {
  // --- INICIALIZAÇÃO ---
  init: async () => {
    // Local Storage Fallback Initialization
    const isInitialized = localStorage.getItem(DB_KEYS.INIT_FLAG);

    // Garante que o admin sempre existe
    const existingUsers = localStorage.getItem(DB_KEYS.USERS);
    const users = existingUsers ? JSON.parse(existingUsers) : [];

    // Verifica se admin existe
    const adminExists = users.some((u: User) => u.role === 'admin');

    if (!isInitialized || !adminExists) {
      console.log("Inicializando Banco de Dados Local...");

      // Seeding Admin se não existir
      if (!adminExists) {
        users.push(SEED_USERS[0]);
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
        console.log("✅ Admin criado com sucesso");
      }

      if (!localStorage.getItem(DB_KEYS.STATS_SIMULATIONS)) {
        localStorage.setItem(DB_KEYS.STATS_SIMULATIONS, '0');
      }
      localStorage.setItem(DB_KEYS.INIT_FLAG, 'true');
    }

    // Sync com Supabase se configurado
    if (supabase) {
      console.log("Conectado ao Supabase. Tentando sincronizar...");
      // Aqui você implementaria o fetch inicial das tabelas do Supabase
    }
  },

  // --- AUTENTICAÇÃO ---
  loginUser: (user: User) => {
    localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  // Verificar se usuário já existe (por telefone ou email)
  checkUserExists: async (phone: string, email?: string): Promise<User | null> => {
    // Primeiro tenta Supabase
    if (supabase) {
      try {
        const query = supabase.from('users').select('*');

        if (phone) {
          const { data: byPhone } = await query.eq('phone', phone);
          if (byPhone && byPhone.length > 0) {
            return byPhone[0] as User;
          }
        }

        if (email) {
          const { data: byEmail } = await supabase.from('users').select('*').eq('email', email);
          if (byEmail && byEmail.length > 0) {
            return byEmail[0] as User;
          }
        }
      } catch (error) {
        console.error('Erro ao verificar usuário no Supabase:', error);
      }
    }

    // Fallback para localStorage
    const users = db.getUsers();
    return users.find(u => u.phone === phone || (email && u.email === email)) || null;
  },

  // Autenticação com Senha
  authenticate: (identifier: string, passwordInput: string): User | null => {
    const users = db.getUsers();
    console.log("🔍 Tentando autenticar:", identifier);
    console.log("👥 Usuários disponíveis:", users.map(u => ({ name: u.name, email: u.email, role: u.role })));

    const user = users.find(u =>
      (u.email.toLowerCase() === identifier.toLowerCase() || u.phone === identifier) &&
      (u.role === 'admin' || u.role === 'driver')
    );

    if (user) {
      console.log("✅ Usuário encontrado:", user.name);
      // Verifica senha
      if (user.password === passwordInput) {
        console.log("✅ Senha correta!");
        return user;
      } else {
        console.log("❌ Senha incorreta. Esperada:", user.password, "Recebida:", passwordInput);
      }
    } else {
      console.log("❌ Usuário não encontrado com email/telefone:", identifier);
    }
    return null;
  },

  getLoggedInUser: (): User | null => {
    const data = localStorage.getItem(DB_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  logout: () => {
    localStorage.removeItem(DB_KEYS.CURRENT_USER);
  },

  // --- GESTÃO DE USUÁRIOS ---

  // Cadastro de Passageiro com verificação de existência
  registerUser: async (userData: Omit<User, 'id' | 'registeredAt' | 'role' | 'password'>) => {
    // Verifica se já existe
    const existingUser = await db.checkUserExists(userData.phone, userData.email);
    if (existingUser) {
      return existingUser;
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      role: 'passenger',
      registeredAt: new Date().toISOString()
    };

    // 1. Salva Local
    const users = db.getUsers();
    users.push(newUser);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));

    // 2. Tenta Salvar Remoto
    if (supabase) {
      supabase.from('users').insert([newUser]).then(({ error }: any) => {
        if (error) console.error('Erro ao salvar no Supabase:', error);
        else console.log('Usuário cadastrado com sucesso no Supabase');
      });
    }

    return newUser;
  },

  // Cadastro de Motorista (Apenas Admin usa isso)
  registerDriver: (driverData: { name: string; email: string; phone: string; plate: string }) => {
    const users = db.getUsers();

    if (users.find(u => u.email === driverData.email || u.phone === driverData.phone)) {
      throw new Error("Motorista já cadastrado com este email ou telefone.");
    }

    const newDriver: User = {
      id: `driver-${Date.now()}`,
      name: driverData.name,
      email: driverData.email,
      phone: driverData.phone,
      plate: driverData.plate,
      role: 'driver',
      password: 'bazza@2025', // Senha padrão inicial
      registeredAt: new Date().toISOString()
    };

    users.push(newDriver);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));

    if (supabase) {
      supabase.from('users').insert([newDriver]).then(({ error }: any) => {
        if (error) console.error('Erro ao salvar motorista no Supabase:', error);
        else console.log('Motorista cadastrado com sucesso no Supabase');
      });
    }

    return newDriver;
  },

  getUsers: (): User[] => {
    const data = localStorage.getItem(DB_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  // --- ESTATÍSTICAS ---
  incrementSimulationCount: () => {
    const current = parseInt(localStorage.getItem(DB_KEYS.STATS_SIMULATIONS) || '0');
    const newVal = current + 1;
    localStorage.setItem(DB_KEYS.STATS_SIMULATIONS, newVal.toString());
  },

  getSimulationCount: (): number => {
    return parseInt(localStorage.getItem(DB_KEYS.STATS_SIMULATIONS) || '0');
  },

  // --- HISTÓRICO DE VIAGENS ---
  saveRide: (ride: Omit<Ride, 'id'>) => {
    const rides = db.getRides();
    const newRide: Ride = {
      ...ride,
      id: Date.now().toString()
    };
    rides.push(newRide);
    localStorage.setItem(DB_KEYS.RIDE_HISTORY, JSON.stringify(rides));

    if (supabase) {
      supabase.from('ride_history').insert([newRide]).catch((error: any) => {
        console.error('Erro ao salvar viagem no Supabase:', error);
      });
    }

    console.log("✅ Viagem salva com sucesso:", newRide);
    return newRide;
  },

  // Completar uma viagem existente
  completeRide: (rideId: string) => {
    const rides = db.getRides();
    const ride = rides.find(r => r.id === rideId);

    if (ride) {
      ride.completedAt = new Date().toISOString();
      localStorage.setItem(DB_KEYS.RIDE_HISTORY, JSON.stringify(rides));

      if (supabase) {
        supabase.from('ride_history').update({ completedAt: ride.completedAt }).eq('id', rideId).catch((error: any) => {
          console.error('Erro ao completar viagem no Supabase:', error);
        });
      }

      console.log("✅ Viagem completada:", ride);
    }
    return ride;
  },

  getRides: (): Ride[] => {
    const data = localStorage.getItem(DB_KEYS.RIDE_HISTORY);
    return data ? JSON.parse(data) : [];
  },

  getRidesByUser: (userId: string): Ride[] => {
    const rides = db.getRides();
    return rides.filter(r => r.userId === userId);
  },

  getTotalRidesCount: (): number => {
    return db.getRides().filter(r => r.completedAt).length;
  },

  // Contar viagens por usuário (motorista)
  getRidesCountByUser: (userId: string): number => {
    return db.getRidesByUser(userId).filter(r => r.completedAt).length;
  },

  // Obter avaliação média de um motorista
  getDriverAverageRating: (driverId?: string): number => {
    const feedbacks = driverId
      ? db.getDriverFeedback() // Se for passado driverId, pode filtrar depois
      : db.getDriverFeedback();

    if (feedbacks.length === 0) return 0;
    const total = feedbacks.reduce((acc, f) => acc + f.rideRating, 0);
    return Math.round((total / feedbacks.length) * 10) / 10;
  },

  // --- FEEDBACK DO PROTOTIPO (APP) ---
  savePrototypeFeedback: (feedback: Omit<PrototypeFeedback, 'id' | 'submittedAt'>) => {
    const list = db.getPrototypeFeedback();
    const newItem: PrototypeFeedback = {
      ...feedback,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString()
    };

    list.push(newItem);
    localStorage.setItem(DB_KEYS.FEEDBACK_APP, JSON.stringify(list));

    if (supabase) {
      supabase.from('app_feedback').insert([newItem]).then(({ error }: any) => {
        if (error) console.error('Erro ao salvar feedback app no Supabase:', error);
        else console.log('Feedback app salvo com sucesso no Supabase');
      });
    }
  },

  getPrototypeFeedback: (): PrototypeFeedback[] => {
    const data = localStorage.getItem(DB_KEYS.FEEDBACK_APP);
    return data ? JSON.parse(data) : [];
  },

  getAverageAppRating: (): number => {
    const feedbacks = db.getPrototypeFeedback();
    if (feedbacks.length === 0) return 0;
    const total = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    return Math.round((total / feedbacks.length) * 10) / 10;
  },

  // --- FEEDBACK DO MOTORISTA ---
  saveDriverFeedback: (feedback: Omit<DriverFeedback, 'id' | 'submittedAt'>) => {
    const list = db.getDriverFeedback();
    const newItem: DriverFeedback = {
      ...feedback,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString()
    };

    list.push(newItem);
    localStorage.setItem(DB_KEYS.FEEDBACK_DRIVER, JSON.stringify(list));

    if (supabase) {
      supabase.from('driver_feedback').insert([newItem]).then(({ error }: any) => {
        if (error) console.error('Erro ao salvar feedback motorista no Supabase:', error);
        else console.log('Feedback motorista salvo com sucesso no Supabase');
      });
    }
  },

  getDriverFeedback: (): DriverFeedback[] => {
    const data = localStorage.getItem(DB_KEYS.FEEDBACK_DRIVER);
    return data ? JSON.parse(data) : [];
  },

  exportDataToCSV: () => {
    const users = db.getUsers();
    const appFeedback = db.getPrototypeFeedback();
    const driverFeedback = db.getDriverFeedback();
    const simCount = db.getSimulationCount();

    const rows = [
      ['RELATORIO GERAL - BAZZA KAMBA'],
      ['Data de Geracao', new Date().toISOString()],
      ['Simulacoes Totais', simCount.toString()],
      [],
      ['--- USUARIOS ---'],
      ['ID', 'Nome', 'Email', 'Telefone', 'Perfil', 'Matricula', 'Data Registro'],
      ...users.map(u => [
        u.id,
        `"${u.name}"`,
        u.email,
        u.phone,
        u.role,
        u.plate || '-',
        u.registeredAt
      ]),
      [],
      ['--- FEEDBACK MOTORISTAS ---'],
      ['ID', 'Nota', 'Comentario', 'Sentimento', 'Data'],
      ...driverFeedback.map(df => [
        df.id,
        df.rideRating.toString(),
        `"${(df.comment || '').replace(/"/g, '""')}"`,
        df.sentiment || '-',
        df.submittedAt
      ]),
      [],
      ['--- FEEDBACK APP ---'],
      ['ID', 'Nota', 'Comentario', 'Data'],
      ...appFeedback.map(af => [
        af.id,
        af.rating.toString(),
        `"${(af.comment || '').replace(/"/g, '""')}"`,
        af.submittedAt
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8,"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bazza_kamba_report_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Inicia DB
db.init();
