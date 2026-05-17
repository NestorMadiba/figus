# ⚽ Figuritas Salta 2026

Plataforma de intercambio de figuritas del Mundial 2026 para la provincia de Salta.

---

## 🚀 Deploy rápido (15 minutos)

### 1. Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) → **New Project**
2. Nombre: `figuritas-salta`, región: `South America (São Paulo)`
3. Guardar la contraseña de la base de datos

### 2. Configurar la base de datos

1. En Supabase → **SQL Editor** → pegar el contenido de `supabase_schema.sql` → **Run**
2. Ir a **Authentication → Providers → Email** → habilitar "Confirm email" si querés verificación

### 3. Conectar el frontend

Abrir `app.js` y reemplazar en las líneas 8-9:

```javascript
const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY';
```

Obtener estos valores en Supabase → **Settings → API**:
- `Project URL` → va en `SUPABASE_URL`
- `anon public` key → va en `SUPABASE_ANON_KEY`

### 4. Deploy en Vercel

```bash
# Opción A: desde la UI de Vercel
# 1. Subir los archivos a un repositorio GitHub (index.html, app.js)
# 2. Ir a vercel.com → Import Project → seleccionar repo
# 3. Framework Preset: Other → Deploy

# Opción B: Vercel CLI
npm i -g vercel
cd carpeta-del-proyecto
vercel
```

### 5. Habilitar Realtime (chat)

En Supabase → **Database → Replication** → activar la tabla `messages`

---

## 📁 Estructura del proyecto

```
figuritas-salta/
├── index.html          # App completa (SPA)
├── app.js              # Lógica, Supabase, algoritmo de match
├── supabase_schema.sql # Schema completo de la BD
└── README.md           # Esta guía
```

---

## 🎯 Funcionalidades MVP

| Feature | Estado |
|---------|--------|
| Landing page con mapa de Leaflet | ✅ |
| Registro/Login con Supabase Auth | ✅ |
| Carga de figuritas repetidas y faltantes | ✅ |
| Algoritmo de match automático | ✅ |
| Contacto por WhatsApp | ✅ |
| Chat interno con Supabase Realtime | ✅ |
| Mapa de puntos de encuentro (Leaflet.js) | ✅ |
| Sugerencia de nuevos puntos | ✅ |
| Modo demo (sin Supabase) | ✅ |
| Diseño responsive mobile-first | ✅ |

---

## 🗄️ Tablas en Supabase

| Tabla | Descripción |
|-------|-------------|
| `users` | Perfil: nombre, barrio, WhatsApp |
| `stickers` | Arrays de repetidas[] y faltantes[] |
| `matches` | Registro de intercambios coordinados |
| `messages` | Chat interno entre usuarios |
| `suggested_points` | Puntos de encuentro sugeridos |

---

## 🔒 Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Los usuarios solo pueden modificar sus propios datos
- El chat solo es visible para los participantes de cada sala
- Datos de WhatsApp opcionales

---

## 🧠 Algoritmo de Match

```
Para cada otro usuario:
  theyHaveINeed = (sus repetidas) ∩ (mis faltantes)
  iHaveTheyNeed = (mis repetidas) ∩ (sus faltantes)
  score = len(theyHaveINeed) + len(iHaveTheyNeed)
  
Ordenar por score descendente → mostrar los mejores matches primero
```

---

## 📍 Puntos de encuentro incluidos

- Plaza 9 de Julio (centro)
- Parque San Martín
- Paseo Balcarce
- Terminal de Ómnibus
- Plaza Güemes
- Shopping El Paseo
- Estadio Padre Martearena

---

## 🛠️ Próximas mejoras sugeridas

- [ ] Notificaciones push cuando hay un nuevo match
- [ ] Filtro por barrio/distancia en los matches
- [ ] Sistema de reputación (estrellas tras el intercambio)
- [ ] Importar figuritas desde foto del álbum (OCR)
- [ ] Ranking de usuarios más activos
- [ ] Grupos por barrio

---

## 💬 Soporte

Para reportar bugs o sugerir mejoras, abrí un issue en el repositorio.

Hecho con ❤️ para los coleccionistas de Salta 🇦🇷
