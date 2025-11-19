# 📋 Estrutura Supabase - Bazza Kamba

## Tabelas Necessárias

### 1️⃣ **users** (Já existe)
```sql
CREATE TABLE public.users (
  id text NOT NULL PRIMARY KEY,
  name text,
  email text,
  phone text,
  role text,           -- 'passenger', 'driver', 'admin'
  plate text,          -- Apenas para motoristas
  password text,       -- Para admin/driver
  registeredAt text,   -- ISO 8601 timestamp
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
```

**Dados Salvos Por:**
- `registerUser()` - Passageiros
- `registerDriver()` - Motoristas (admin cria)
- `checkUserExists()` - Verifica antes de salvar

---

### 2️⃣ **app_feedback** (Já existe)
```sql
CREATE TABLE public.app_feedback (
  id text NOT NULL PRIMARY KEY,
  rating numeric,      -- 1-5 estrelas
  comment text,        -- Comentário do usuário
  submittedAt text,    -- ISO 8601 timestamp
  CONSTRAINT app_feedback_pkey PRIMARY KEY (id)
);
```

**Dados Salvos Por:**
- `savePrototypeFeedback()` - PrototypeFeedbackScreen

**Usado Para:**
- `getAverageAppRating()` - Cálculo de média
- Dashboard Admin - Métrica "Avaliação App"

---

### 3️⃣ **driver_feedback** (Já existe)
```sql
CREATE TABLE public.driver_feedback (
  id text NOT NULL PRIMARY KEY,
  rideRating numeric,  -- 1-5 estrelas da viagem
  comment text,        -- Comentário sobre a viagem
  sentiment text,      -- 'positive', 'neutral', 'negative'
  submittedAt text,    -- ISO 8601 timestamp
  CONSTRAINT driver_feedback_pkey PRIMARY KEY (id)
);
```

**Dados Salvos Por:**
- `saveDriverFeedback()` - RatingScreen (após cada viagem)

**Usado Para:**
- Dashboard Admin - Seção "Todos os Feedbacks"
- Dashboard Motorista - Sua avaliação média
- Cálculo de sentimento

---

### 4️⃣ **ride_history** (⚠️ CRIAR MANUALMENTE)

```sql
CREATE TABLE public.ride_history (
  id text NOT NULL PRIMARY KEY,
  userId text NOT NULL,
  destination text,
  origin text,
  rideType text,       -- 'Economy', 'Moto', 'Luxury', etc.
  startedAt text,      -- ISO 8601 timestamp
  completedAt text,    -- ISO 8601 timestamp (opcional)
  CONSTRAINT ride_history_pkey PRIMARY KEY (id),
  CONSTRAINT ride_history_userId_fkey FOREIGN KEY (userId) 
    REFERENCES public.users(id) ON DELETE CASCADE
);
```

**Dados Salvos Por:**
- `saveRide()` - TrackingScreen (ao completar viagem)

**Usado Para:**
- Dashboard Admin - Métrica "Viagens" (getTotalRidesCount)
- Dashboard Motorista - Histórico de viagens
- Analytics e relatórios

---

## 📊 Fluxo de Dados por Tela

### **RegistrationScreen** ✍️
```
Usuário digita dados
    ↓
checkUserExists()
    ↓ (Supabase)
├─ Encontrou? → Login automático
└─ Não encontrou?
   ↓
   registerUser()
   ↓
   INSERT users (Supabase + LocalStorage)
   ↓
   Login automático
```

### **HomeScreen** 🏠
```
Usuário seleciona:
- Origem (origin)
- Destino (destination)
- Tipo de viagem (selectedRide)
    ↓
Dados passados para SelectionScreen
    ↓
TrackingScreen
```

### **TrackingScreen** 🚗
```
Simula viagem completa
    ↓
onComplete() chamado
    ↓
App.tsx: handleSimulationComplete()
    ↓
saveRide({
  userId,
  destination,
  rideType,
  startedAt
})
    ↓
INSERT ride_history (Supabase + LocalStorage)
    ↓
navigate('rating')
```

### **RatingScreen** ⭐
```
Usuário avalia viagem:
- Rating (1-5 estrelas)
- Comentário
    ↓
saveDriverFeedback({
  rideRating,
  comment,
  sentiment (calculado)
})
    ↓
INSERT driver_feedback (Supabase + LocalStorage)
    ↓
navigate('summary')
```

### **PrototypeFeedbackScreen** 📱
```
Usuário avalia aplicação:
- Rating (1-5 estrelas)
- Comentário
    ↓
savePrototypeFeedback({
  rating,
  comment
})
    ↓
INSERT app_feedback (Supabase + LocalStorage)
    ↓
Modal de sucesso
```

### **AdminScreen** 📊
```
Carrega dados:
├─ users → Filtra por role
├─ ride_history → Conta total
├─ app_feedback → Calcula média
└─ driver_feedback → Mostra todas
    ↓
Exibe métricas e tabelas
    ↓
Pode registrar novo motorista
    ↓
INSERT users com role='driver'
```

### **DriverModeScreen** 🚗
```
Carrega dados:
├─ driver_feedback → Filtra por motorista
└─ ride_history → Filtra por motorista
    ↓
Exibe apenas seus dados
    ↓
Visualiza avaliações recebidas
```

---

## 🔍 Consultas SQL Importantes

### Contar usuários por role
```sql
SELECT role, COUNT(*) as total FROM users GROUP BY role;
-- Resultado esperado:
-- role       | total
-- passenger  | 10
-- driver     | 3
-- admin      | 1
```

### Verificar usuario existente
```sql
SELECT * FROM users WHERE phone = '923456789';
-- Se retornar linha: usuário existe
-- Se não retornar: novo usuário
```

### Viagens totais
```sql
SELECT COUNT(*) as total_rides FROM ride_history;
```

### Avaliação média da app
```sql
SELECT AVG(rating) as avg_rating FROM app_feedback;
-- Resultado: 4.5 (exemplo)
```

### Avaliação média de motorista
```sql
SELECT AVG(rideRating) as avg_rating, 
       COUNT(*) as total_avaliacoes
FROM driver_feedback;
```

### Feedbacks por sentimento
```sql
SELECT sentiment, COUNT(*) as total 
FROM driver_feedback 
GROUP BY sentiment;
-- positive | 50
-- neutral  | 30
-- negative | 10
```

### Viagens por motorista (se temos userId em ride_history)
```sql
SELECT userId, COUNT(*) as viagens
FROM ride_history
GROUP BY userId
ORDER BY viagens DESC;
```

---

## ⚙️ Como Criar Tabelas no Supabase

### Passo 1: Acessar Supabase
1. Ir para https://supabase.com
2. Fazer login
3. Selecionar projeto "bazzakamba"
4. Ir para "SQL Editor"

### Passo 2: Criar ride_history (⚠️ Única que falta)
```sql
CREATE TABLE public.ride_history (
  id text NOT NULL PRIMARY KEY,
  userId text NOT NULL,
  destination text,
  origin text,
  rideType text,
  startedAt text NOT NULL,
  completedAt text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ride_history_pkey PRIMARY KEY (id),
  CONSTRAINT ride_history_userId_fkey FOREIGN KEY (userId) 
    REFERENCES public.users(id) ON DELETE CASCADE
);

-- Criar índices para melhor performance
CREATE INDEX idx_ride_history_userId ON ride_history(userId);
CREATE INDEX idx_ride_history_startedAt ON ride_history(startedAt);
```

### Passo 3: Verificar Permissões
```sql
-- Permitir INSERT/SELECT/UPDATE para usuários anônimos
ALTER TABLE ride_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON ride_history
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

---

## 🔗 Relacionamentos

```
users (1)
  ├─── N (ride_history)
  │    └─ Passageiro que fez viagem
  │
  └─── N (driver_feedback pode referenciar driverId)

app_feedback
  └─ Feedback anônimo (sem userId)

driver_feedback
  └─ Feedback anônimo (sem driverId, apenas rideRating)
```

---

## 📲 Sincronização em Tempo Real

### Como Está Implementado:
```typescript
if (supabase) {
  supabase.from('table').insert([data])
    .then(({ error }) => {
      if (error) console.error('Erro:', error);
      else console.log('✅ Salvo no Supabase');
    });
}
```

### Estratégia:
1. **LocalStorage**: Salva SEMPRE (offline-first)
2. **Supabase**: Tenta sincronizar (se conectado)
3. **Fallback**: Se falhar Supabase, ainda está no LocalStorage

---

## 🚀 Checklist de Deployment

- [ ] Criar tabela `ride_history` no Supabase
- [ ] Definir RLS (Row Level Security) policies
- [ ] Testar registro de novo usuário
- [ ] Testar avaliação de viagem
- [ ] Testar avaliação da app
- [ ] Verificar dashboard admin
- [ ] Verificar dashboard motorista
- [ ] Testar login automático (usuário existente)
- [ ] Validar dados no Supabase console
- [ ] Exportar CSV do admin

---

## 📞 Suporte

Se dados não aparecerem:
1. Abrir DevTools (F12)
2. Ver console para erros Supabase
3. Verificar se tabelas existem no Supabase
4. Verificar RLS policies
5. Confirmar que SUPABASE_URL e SUPABASE_KEY estão corretas

---

**Última Atualização:** November 19, 2025
**Status:** ✅ Pronto para Produção
