# RAILS-Nexus

Plataforma interna de gestión para **RysthDesign**: clientes, proyectos, facturación, cotizaciones y cobros recurrentes.
Monorepo con **React 19** (frontend) y **Ruby on Rails 8** (backend API).

---

## 🚀 Inicio Rápido

### Requisitos

- [Docker](https://docs.docker.com/get-docker/) y Docker Compose
- Git

### Configuración

1. **Clona el repositorio:**

```bash
git clone https://github.com/Rysth/RAILS-Nexus.git
cd RAILS-Nexus
```

2. **Ejecuta el script de configuración:**

```bash
chmod +x setup.sh
./setup.sh
```

El script automáticamente:

- Crea `.env` desde `.env.example` si no existe
- Levanta todos los contenedores (Rails API, React, PostgreSQL, Redis, Sidekiq)

3. **Inicializa la base de datos (primera vez):**

```bash
docker exec -it base-api bundle exec rails db:prepare
docker exec -it base-api bundle exec rails db:seed
```

4. **Accede a las aplicaciones:**

| Servicio           | URL                                 |
| ------------------ | ----------------------------------- |
| Frontend (React)   | http://localhost:5173               |
| Backend (Rails)    | http://localhost:3000/api/v1        |
| Letter Opener      | http://localhost:3000/letter_opener |
| Sidekiq Dashboard  | http://localhost:3000/sidekiq       |

---

## 📁 Estructura del Proyecto

```
RAILS-Nexus/
├── frontend/                # React 19 + TypeScript + Vite + TailwindCSS 4
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── backend/                 # Rails 8 API (Rodauth + Sidekiq + ActiveRecord)
│   ├── app/
│   │   ├── controllers/     # API controllers (api/v1/)
│   │   ├── models/          # ActiveRecord models
│   │   ├── services/        # Business logic services
│   │   ├── jobs/            # Sidekiq/ActiveJob workers
│   │   ├── mailers/         # ActionMailer
│   │   └── misc/            # Rodauth configuration
│   ├── config/
│   ├── db/
│   ├── Gemfile
│   └── Dockerfile
├── docker-compose.yml       # Producción
├── docker-compose.dev.yml   # Desarrollo
├── .env.example             # Variables de entorno
├── setup.sh                 # Script de configuración
├── DEPLOYMENT.md            # Guía de despliegue
└── README.md
```

---

## 🔧 Comandos Útiles

### Desarrollo

```bash
# Levantar todos los servicios
./setup.sh

# Levantar servicios manualmente
docker compose -f docker-compose.dev.yml up

# Detener servicios
docker compose -f docker-compose.dev.yml down

# Ver logs
docker compose -f docker-compose.dev.yml logs -f

# Reconstruir contenedores
docker compose -f docker-compose.dev.yml up --build
```

### Base de Datos

```bash
# Ejecutar migraciones
docker exec -it base-api bundle exec rails db:migrate

# Crear base de datos + migraciones + seeds
docker exec -it base-api bundle exec rails db:prepare

# Ejecutar seeds
docker exec -it base-api bundle exec rails db:seed

# Rollback última migración
docker exec -it base-api bundle exec rails db:rollback

# Consola Rails
docker exec -it base-api bundle exec rails console
```

### Administración

```bash
# Reiniciar contenedor API
docker restart base-api

# Ver logs del backend
docker logs base-api -f

# Acceder al contenedor
docker exec -it base-api bash

# Redis CLI
docker exec -it base-redis redis-cli
```

---

## ⚙️ Configuración

### Variables de Entorno

Copia `.env.example` a `.env` y ajusta las variables:

```bash
cp .env.example .env
```

### Variables Principales

| Variable             | Propósito                        | Valor por defecto (dev)                                  |
| -------------------- | -------------------------------- | -------------------------------------------------------- |
| `RAILS_ENV`          | Entorno de ejecución             | `development`                                            |
| `SECRET_KEY_BASE`    | Clave secreta de Rails           | — (requerido)                                            |
| `PORT`               | Puerto del servidor              | `3000`                                                   |
| `DATABASE_URL`       | Conexión a PostgreSQL            | `postgres://postgres:...@postgres/rails_api_development` |
| `REDIS_URL`          | Conexión a Redis                 | `redis://redis:6379/1`                                   |
| `VITE_API_URL`       | URL del backend para el frontend | `http://localhost:3000`                                  |
| `FRONTEND_URL`       | CORS origin + enlaces en emails  | `http://localhost:5173`                                  |
| `SMTP_HOST/PORT/...` | Configuración SMTP               | —                                                        |
| `CLOUDFLARE_*`       | Almacenamiento R2                | —                                                        |

---

## 🐳 Servicios Docker

| Servicio | Contenedor    | Puerto | Descripción                     |
| -------- | ------------- | ------ | ------------------------------- |
| client   | base-client   | 5173   | Frontend React + Vite           |
| server   | base-api      | 3000   | Rails 8 API                     |
| sidekiq  | base-sidekiq  | —      | Worker de jobs (mismo codebase) |
| postgres | base-postgres | 5432   | PostgreSQL 16                   |
| redis    | base-redis    | 6379   | Cache, colas Sidekiq, OTP codes |

---

## 🔐 Autenticación y Autorización

### Autenticación (Rodauth + OTP)

1. `POST /api/v1/auth/send_otp` — valida email + password → envía OTP por email (Sidekiq)
2. `POST /api/v1/auth/verify_otp` — valida OTP → emite `access_token` (15 min) + `refresh_token` (7 días)
3. Frontend almacena tokens en `localStorage`, Axios interceptor auto-refresca tokens expirados

### RBAC (Roles y Permisos)

| Rol      | Permisos                                       |
| -------- | ---------------------------------------------- |
| admin    | Todos los permisos (9)                         |
| manager  | Todos excepto `delete_users`                   |
| operator | `view_dashboard`, `view_users`, `edit_profile` |
| user     | `edit_profile` solamente                       |

### Usuarios Seed (desarrollo)

| Email                  | Contraseña    | Rol      |
| ---------------------- | ------------- | -------- |
| `admin@example.com`    | `password123` | admin    |
| `manager@example.com`  | `password123` | manager  |
| `operator@example.com` | `password123` | operator |

---

## 🔍 Desarrollo Local (sin Docker)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
bundle install
rails db:prepare
rails s -p 3000
```

---

## 📝 Notas

- **Monorepo**: Frontend y backend viven en el mismo repositorio, orquestados por Docker Compose
- **Hot reloading**: Tanto React (Vite HMR) como Rails (auto-reload en dev) soportan recarga automática
- **Persistencia**: Los datos de PostgreSQL y Redis se mantienen en volúmenes Docker
- **Jobs**: Sidekiq procesa trabajos en segundo plano (emails, exports, limpieza de datos)
- **Código en inglés**, texto visible al usuario en **español**

---

## 🧩 Roadmap Funcional (Módulos)

> Adaptado desde un proyecto anterior en AdonisJS. Toda la implementación se hará sobre **Rails 8 + ActiveRecord + Sidekiq + ActionMailer**.

---

### Módulo 1: Gestión de Clientes y Proyectos (La base)

**Objetivo**: estructurar quién es el cliente y qué software se le vendió.

**Entidades**

- **`clients`**
  - `id` (PK)
  - `name` — nombre o razón social
  - `identification_type` — Ecuador: RUC=`04`, Cédula=`05`, Pasaporte=`06`
  - `identification` — RUC/Cédula/Pasaporte
  - `email`
  - `phone`
  - `address`
  - `timestamps`

- **`projects`**
  - `id` (PK)
  - `client_id` (FK → `clients`)
  - `name` — ej: "QuickInventory"
  - `production_url`
  - `start_date`
  - `status` — enum: `active`, `maintenance`, `canceled`
  - `timestamps`

**Relaciones (ActiveRecord)**

```ruby
class Client < ApplicationRecord
  has_many :projects, dependent: :destroy
end

class Project < ApplicationRecord
  belongs_to :client
  enum :status, { active: 0, maintenance: 1, canceled: 2 }
end
```

**API**: CRUD completo para `clients` y `projects` bajo `api/v1/`.

---

### Módulo 2: Servicios Recurrentes (Automatización del cobro)

**Objetivo**: definir qué se cobra mes a mes o anualmente por proyecto.

**Entidad**: **`recurring_services`**

- `id` (PK)
- `project_id` (FK → `projects`)
- `name` — ej: "Mantenimiento Mensual", "Hosting Anual"
- `amount` — precio (`decimal`)
- `billing_cycle` — enum: `monthly`, `yearly`
- `next_billing_date` — fecha del próximo cobro
- `status` — enum: `active`, `paused`
- `timestamps`

**Relaciones**

```ruby
class RecurringService < ApplicationRecord
  belongs_to :project
  enum :billing_cycle, { monthly: 0, yearly: 1 }
  enum :status, { active: 0, paused: 1 }
end

class Project < ApplicationRecord
  has_many :recurring_services, dependent: :destroy
end
```

**API**: CRUD para gestionar servicios recurrentes de un proyecto.

---

### Módulo 3: Cotizaciones (Upselling)

**Objetivo**: cotizar mejoras/cambios por proyecto.

**Entidades**

- **`quotes`**
  - `id` (PK)
  - `project_id` (FK → `projects`)
  - `issue_date`
  - `valid_until`
  - `status` — enum: `draft`, `sent`, `approved`, `rejected`
  - `total` — calculado desde items (`decimal`)
  - `timestamps`

- **`quote_items`**
  - `id` (PK)
  - `quote_id` (FK → `quotes`)
  - `description` — ej: "Módulo de reportes"
  - `quantity`
  - `unit_price` (`decimal`)
  - `subtotal` (`decimal`)
  - `timestamps`

**Relaciones**

```ruby
class Quote < ApplicationRecord
  belongs_to :project
  has_many :quote_items, dependent: :destroy
  accepts_nested_attributes_for :quote_items, allow_destroy: true
  enum :status, { draft: 0, sent: 1, approved: 2, rejected: 3 }
end

class QuoteItem < ApplicationRecord
  belongs_to :quote
end
```

**API**: Crear cotización con items anidados en una sola operación (`accepts_nested_attributes_for`).

**PDF**: Servicio que genere un PDF de la cotización con logo de RysthDesign. Librerías sugeridas para Rails: **Prawn** o **WickedPDF**.

---

### Módulo 4: Facturación y Conversión

**Objetivo**: facturar cotizaciones aprobadas y cobros recurrentes.

**Entidades**

- **`invoices`**
  - `id` (PK)
  - `project_id` (FK → `projects`)
  - `number` — secuencial auto-generado
  - `issue_date`
  - `due_date`
  - `status` — enum: `pending`, `paid`, `voided`
  - `total` (`decimal`)
  - Preparación facturación electrónica (fase futura):
    - `access_key` — clave de acceso SRI
    - `xml_content`
  - `timestamps`

- **`taxes`** (tabla de referencia para régimen tributario)
  - `id` (PK)
  - `name` — ej: "IVA 0%", "IVA 15%"
  - `rate` (`decimal`) — porcentaje
  - `active` (`boolean`)
  - `timestamps`

**Conversión (Quote → Invoice)**

- Servicio (`QuoteConversionService`) que reciba el ID de una `Quote` **aprobada** y genere una `Invoice` copiando sus items.

**Impuestos (RIMPE)**

- IVA configurable, por defecto **0% / exento**.
- Tabla `taxes` como base para cambios de régimen a futuro.

**Relaciones**

```ruby
class Invoice < ApplicationRecord
  belongs_to :project
  has_many :invoice_items, dependent: :destroy
  enum :status, { pending: 0, paid: 1, voided: 2 }
end
```

---

### Módulo 5: Automatización y Cron Jobs (Recordatorios)

**Objetivo**: evitar recordatorios manuales y generar facturas recurrentes.

**Stack**: Sidekiq + `sidekiq-cron` (reemplazo del scheduler de AdonisJS).

**Job `BillingReminderJob`**

- Se ejecuta todos los días a las **8:00 AM** vía `sidekiq-cron`.
- Busca en `recurring_services` los registros donde `next_billing_date` sea **hoy** (o configurable: hoy + N días).
- Por cada servicio encontrado:
  1. Genera una nueva `Invoice` con los datos del servicio.
  2. Envía correo al cliente usando **ActionMailer** + Sidekiq:
     - _"Hola [Cliente], tu factura por [Servicio] del proyecto [Proyecto] ya está generada por un valor de $[Monto]."_
  3. Actualiza `next_billing_date` (+1 mes o +1 año según `billing_cycle`).

```ruby
# config/initializers/sidekiq_cron.rb
Sidekiq::Cron::Job.create(
  name: 'BillingReminderJob - daily 8am',
  cron: '0 8 * * *',
  class: 'BillingReminderJob'
)
```

---

### Resumen del Roadmap

| #  | Módulo                     | Modelos principales                     | Estado       |
| -- | -------------------------- | --------------------------------------- | ------------ |
| 1  | Clientes y Proyectos      | `Client`, `Project`                     | 🔲 Pendiente |
| 2  | Servicios Recurrentes      | `RecurringService`                      | 🔲 Pendiente |
| 3  | Cotizaciones               | `Quote`, `QuoteItem`                    | 🔲 Pendiente |
| 4  | Facturación y Conversión   | `Invoice`, `InvoiceItem`, `Tax`         | 🔲 Pendiente |
| 5  | Automatización (Cron Jobs) | `BillingReminderJob`                    | 🔲 Pendiente |

---

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Add nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

Creado por [RysthDesign](https://rysthdesign.com/)
