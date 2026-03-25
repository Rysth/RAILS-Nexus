class Permission < ApplicationRecord
  has_many :role_permissions, dependent: :destroy
  has_many :roles, through: :role_permissions

  validates :key, presence: true, uniqueness: true
  validates :name, presence: true
  validates :group, presence: true

  # Permission keys as constants for easy reference
  # Dashboard
  VIEW_DASHBOARD = "view_dashboard".freeze

  # Users
  VIEW_USERS    = "view_users".freeze
  CREATE_USERS  = "create_users".freeze
  EDIT_USERS    = "edit_users".freeze
  DELETE_USERS  = "delete_users".freeze
  EXPORT_USERS  = "export_users".freeze

  # Clients
  VIEW_CLIENTS    = "view_clients".freeze
  CREATE_CLIENTS  = "create_clients".freeze
  EDIT_CLIENTS    = "edit_clients".freeze
  DELETE_CLIENTS  = "delete_clients".freeze

  # Projects
  VIEW_PROJECTS   = "view_projects".freeze
  CREATE_PROJECTS = "create_projects".freeze
  EDIT_PROJECTS   = "edit_projects".freeze
  DELETE_PROJECTS = "delete_projects".freeze

  # Recurring Services
  VIEW_RECURRING_SERVICES   = "view_recurring_services".freeze
  CREATE_RECURRING_SERVICES = "create_recurring_services".freeze
  EDIT_RECURRING_SERVICES   = "edit_recurring_services".freeze
  DELETE_RECURRING_SERVICES = "delete_recurring_services".freeze

  # Business
  VIEW_BUSINESS = "view_business".freeze
  EDIT_BUSINESS = "edit_business".freeze

  # Profile (own)
  EDIT_PROFILE = "edit_profile".freeze

  ALL_KEYS = [
    VIEW_DASHBOARD,
    VIEW_USERS, CREATE_USERS, EDIT_USERS, DELETE_USERS, EXPORT_USERS,
    VIEW_CLIENTS, CREATE_CLIENTS, EDIT_CLIENTS, DELETE_CLIENTS,
    VIEW_PROJECTS, CREATE_PROJECTS, EDIT_PROJECTS, DELETE_PROJECTS,
    VIEW_RECURRING_SERVICES, CREATE_RECURRING_SERVICES, EDIT_RECURRING_SERVICES, DELETE_RECURRING_SERVICES,
    VIEW_BUSINESS, EDIT_BUSINESS,
    EDIT_PROFILE
  ].freeze

  # Default permission mapping per role
  ROLE_DEFAULTS = {
    "admin" => ALL_KEYS,
    "manager" => [
      VIEW_DASHBOARD,
      VIEW_USERS, CREATE_USERS, EDIT_USERS, DELETE_USERS, EXPORT_USERS,
      VIEW_CLIENTS, CREATE_CLIENTS, EDIT_CLIENTS, DELETE_CLIENTS,
      VIEW_PROJECTS, CREATE_PROJECTS, EDIT_PROJECTS, DELETE_PROJECTS,
      VIEW_RECURRING_SERVICES, CREATE_RECURRING_SERVICES, EDIT_RECURRING_SERVICES, DELETE_RECURRING_SERVICES,
      VIEW_BUSINESS, EDIT_BUSINESS,
      EDIT_PROFILE
    ],
    "operator" => [
      VIEW_DASHBOARD,
      VIEW_CLIENTS, VIEW_PROJECTS, VIEW_RECURRING_SERVICES,
      EDIT_PROFILE
    ],
    "user" => [
      EDIT_PROFILE
    ]
  }.freeze

  # Seed all permissions and assign them to roles
  def self.seed!
    permission_definitions = [
      # Dashboard
      { key: VIEW_DASHBOARD, name: "Ver Dashboard", group: "dashboard", description: "Acceso al panel de control" },

      # Users
      { key: VIEW_USERS, name: "Ver Usuarios", group: "users", description: "Ver la lista de usuarios" },
      { key: CREATE_USERS, name: "Crear Usuarios", group: "users", description: "Crear nuevos usuarios" },
      { key: EDIT_USERS, name: "Editar Usuarios", group: "users", description: "Editar usuarios existentes" },
      { key: DELETE_USERS, name: "Eliminar Usuarios", group: "users", description: "Eliminar usuarios" },
      { key: EXPORT_USERS, name: "Exportar Usuarios", group: "users", description: "Exportar datos de usuarios" },

      # Clients
      { key: VIEW_CLIENTS, name: "Ver Clientes", group: "clients", description: "Ver la lista de clientes" },
      { key: CREATE_CLIENTS, name: "Crear Clientes", group: "clients", description: "Crear nuevos clientes" },
      { key: EDIT_CLIENTS, name: "Editar Clientes", group: "clients", description: "Editar clientes existentes" },
      { key: DELETE_CLIENTS, name: "Eliminar Clientes", group: "clients", description: "Eliminar clientes" },

      # Projects
      { key: VIEW_PROJECTS, name: "Ver Proyectos", group: "projects", description: "Ver la lista de proyectos" },
      { key: CREATE_PROJECTS, name: "Crear Proyectos", group: "projects", description: "Crear nuevos proyectos" },
      { key: EDIT_PROJECTS, name: "Editar Proyectos", group: "projects", description: "Editar proyectos existentes" },
      { key: DELETE_PROJECTS, name: "Eliminar Proyectos", group: "projects", description: "Eliminar proyectos" },

      # Recurring Services
      { key: VIEW_RECURRING_SERVICES, name: "Ver Servicios Recurrentes", group: "recurring_services", description: "Ver la lista de servicios recurrentes" },
      { key: CREATE_RECURRING_SERVICES, name: "Crear Servicios Recurrentes", group: "recurring_services", description: "Crear nuevos servicios recurrentes" },
      { key: EDIT_RECURRING_SERVICES, name: "Editar Servicios Recurrentes", group: "recurring_services", description: "Editar servicios recurrentes existentes" },
      { key: DELETE_RECURRING_SERVICES, name: "Eliminar Servicios Recurrentes", group: "recurring_services", description: "Eliminar servicios recurrentes" },

      # Business
      { key: VIEW_BUSINESS, name: "Ver Negocio", group: "business", description: "Ver configuración del negocio" },
      { key: EDIT_BUSINESS, name: "Editar Negocio", group: "business", description: "Editar configuración del negocio" },

      # Profile
      { key: EDIT_PROFILE, name: "Editar Perfil", group: "profile", description: "Editar perfil propio" }
    ]

    permissions_by_key = {}

    permission_definitions.each do |attrs|
      perm = Permission.find_or_create_by!(key: attrs[:key]) do |p|
        p.name = attrs[:name]
        p.group = attrs[:group]
        p.description = attrs[:description]
      end
      permissions_by_key[attrs[:key]] = perm
    end

    # Assign permissions to roles
    ROLE_DEFAULTS.each do |role_name, perm_keys|
      role = Role.find_by(name: role_name)
      next unless role

      perm_keys.each do |key|
        perm = permissions_by_key[key]
        next unless perm

        RolePermission.find_or_create_by!(role: role, permission: perm)
      end
    end
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id key name group description created_at updated_at]
  end
end
