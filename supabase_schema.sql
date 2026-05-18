-- ============================================================
-- FIGURITAS SALTA 2026 - Supabase Schema
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- EXTENSION para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: users (perfil extendido de auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  email       TEXT NOT NULL,
  barrio      TEXT,
  whatsapp    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: stickers (figuritas de cada usuario)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stickers (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  repetidas   INTEGER[] DEFAULT '{}',
  faltantes   INTEGER[] DEFAULT '{}',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: matches (registro de intercambios coordinados)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.matches (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user1_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stickers    INTEGER[] DEFAULT '{}',   -- figuritas intercambiadas
  estado      TEXT DEFAULT 'pendiente', -- pendiente | aceptado | completado | cancelado
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: messages (chat interno)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id     TEXT NOT NULL,            -- sorted user1_user2 ids
  sender_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_room ON public.messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);

-- ============================================================
-- TABLA: suggested_points (puntos de encuentro sugeridos)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.suggested_points (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  address     TEXT NOT NULL,
  description TEXT,
  status      TEXT DEFAULT 'pending',   -- pending | approved | rejected
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggested_points ENABLE ROW LEVEL SECURITY;

-- users: cualquiera puede leer, solo el dueño puede modificar
CREATE POLICY "users_read_all"   ON public.users FOR SELECT USING (true);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- stickers: lectura pública, escritura propia
CREATE POLICY "stickers_read_all"   ON public.stickers FOR SELECT USING (true);
CREATE POLICY "stickers_write_own"  ON public.stickers FOR ALL USING (auth.uid() = user_id);

-- matches: solo participantes pueden ver
CREATE POLICY "matches_read_own" ON public.matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "matches_insert"   ON public.matches FOR INSERT WITH CHECK (auth.uid() = user1_id);
CREATE POLICY "matches_update_own" ON public.matches FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- messages: solo participantes de la sala
CREATE POLICY "messages_read_room"  ON public.messages FOR SELECT
  USING (room_id LIKE '%' || auth.uid()::text || '%');
CREATE POLICY "messages_insert_own" ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- suggested_points: lectura pública, insert autenticado
CREATE POLICY "points_read_all"    ON public.suggested_points FOR SELECT USING (true);
CREATE POLICY "points_insert_auth" ON public.suggested_points FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- REALTIME (para chat)
-- ============================================================
-- Habilitar en: Supabase → Database → Replication → messages table
-- O ejecutar:
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ============================================================
-- FUNCIÓN: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at    BEFORE UPDATE ON public.users    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_stickers_updated_at BEFORE UPDATE ON public.stickers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_matches_updated_at  BEFORE UPDATE ON public.matches  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
