-- ==========================================================
-- ESQUEMA DE BASE DE DATOS SUPABASE: CENTRO DE MANDO FITNESS
-- Ejecutar en el SQL Editor de tu proyecto en Supabase
-- ==========================================================

-- 1. Habilitar extensión para base de datos vectorial (pgvector)
create extension if not exists vector;

-- 2. Tabla de perfiles de usuario (enlazada a auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  preset_key text default 'definicion',
  active_split_key text default 'A',
  is_guardia boolean default false,
  body_comp jsonb default '{"musculo": 64.7, "grasaPct": 26.2, "visceral": 9}'::jsonb,
  meals jsonb,
  shopping_list jsonb default '{"categorias": []}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS (Row Level Security) en profiles
alter table public.profiles enable row level security;

-- Políticas de RLS para profiles
create policy "Usuarios pueden ver su propio perfil" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Usuarios pueden actualizar su propio perfil" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Usuarios pueden insertar su propio perfil" 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- 3. Tabla de bitácora nutricional diaria
create table public.nutrition_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  kcal integer default 0,
  proteina numeric default 0,
  carbo numeric default 0,
  grasa numeric default 0,
  water numeric default 0,
  food_items jsonb default '[]'::jsonb,
  supplements jsonb default '{"Creatina": false, "Whey Protein": false, "Vitamina D": false, "Multivitamínico": false}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, date)
);

alter table public.nutrition_logs enable row level security;

create policy "Usuarios pueden ver sus registros nutricionales" 
  on public.nutrition_logs for select 
  using (auth.uid() = user_id);

create policy "Usuarios pueden insertar sus propios registros nutricionales" 
  on public.nutrition_logs for insert 
  with check (auth.uid() = user_id);

create policy "Usuarios pueden actualizar sus propios registros nutricionales" 
  on public.nutrition_logs for update 
  using (auth.uid() = user_id);

create policy "Usuarios pueden eliminar sus propios registros nutricionales" 
  on public.nutrition_logs for delete 
  using (auth.uid() = user_id);

-- 4. Tabla de entrenamientos registrados
create table public.workout_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  exercise_name text not null,
  sets jsonb default '[]'::jsonb,
  duration integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.workout_logs enable row level security;

create policy "Usuarios pueden ver sus entrenamientos" 
  on public.workout_logs for select 
  using (auth.uid() = user_id);

create policy "Usuarios pueden insertar sus entrenamientos" 
  on public.workout_logs for insert 
  with check (auth.uid() = user_id);

create policy "Usuarios pueden actualizar sus entrenamientos" 
  on public.workout_logs for update 
  using (auth.uid() = user_id);

create policy "Usuarios pueden eliminar sus entrenamientos" 
  on public.workout_logs for delete 
  using (auth.uid() = user_id);

-- 5. Tabla de métricas y antropometría
create table public.metrics_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  weight numeric not null,
  musculo numeric not null,
  grasa_pct numeric not null,
  visceral integer not null,
  brazo_der numeric, brazo_izq numeric,
  muslo_der numeric, muslo_izq numeric,
  pantorrilla_der numeric, pantorrilla_izq numeric,
  cintura numeric, pecho numeric,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, date)
);

alter table public.metrics_logs enable row level security;

create policy "Usuarios pueden ver sus métricas" 
  on public.metrics_logs for select 
  using (auth.uid() = user_id);

create policy "Usuarios pueden insertar sus métricas" 
  on public.metrics_logs for insert 
  with check (auth.uid() = user_id);

create policy "Usuarios pueden actualizar sus métricas" 
  on public.metrics_logs for update 
  using (auth.uid() = user_id);

create policy "Usuarios pueden eliminar sus métricas" 
  on public.metrics_logs for delete 
  using (auth.uid() = user_id);

-- 6. Tabla de memoria semántica de chats (pgvector)
create table public.chat_memories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  message text not null,
  sender text not null,
  embedding vector(1536)
);

alter table public.chat_memories enable row level security;

create policy "Usuarios pueden ver sus memorias de chat" 
  on public.chat_memories for select 
  using (auth.uid() = user_id);

create policy "Usuarios pueden insertar sus memorias de chat" 
  on public.chat_memories for insert 
  with check (auth.uid() = user_id);

create policy "Usuarios pueden eliminar sus memorias de chat" 
  on public.chat_memories for delete 
  using (auth.uid() = user_id);

-- 7. Trigger para crear el perfil automáticamente tras registrarse en Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
