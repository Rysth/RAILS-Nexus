# Development Seeds - Run ONLY in development environment
# This file creates test data for local development

unless Rails.env.development?
  puts "⚠️  This seed file is only for development environment!"
  puts "Current environment: #{Rails.env}"
  exit 1
end

puts "🌱 Seeding development database..."

# Clear existing data
puts "Clearing existing data..."
Project.destroy_all
Client.destroy_all
User.destroy_all
Account.destroy_all
Role.destroy_all

# Create default roles
puts "Creating roles..."
admin_role = Role.create!(name: 'admin')
manager_role = Role.create!(name: 'manager') 
operator_role = Role.create!(name: 'operator')
user_role = Role.create!(name: 'user')

# Create permissions and assign to roles
puts "Creating permissions..."
Permission.seed!

# Use BCrypt directly to hash passwords (same as Rodauth uses)
require 'bcrypt'
password_hash = BCrypt::Password.create("password123", cost: 12)

# Create 1 verified admin account with user
puts "Creating admin account..."
admin_account = Account.create!(
  email: "admin@example.com",
  password_hash: password_hash,
  status: 2 # verified status
)

admin_user = User.create!(
  account: admin_account,
  fullname: "System Administrator",
  username: "admin"
)
admin_user.add_role(:admin)

# Create 1 verified manager
puts "Creating manager account..."
manager_account = Account.create!(
  email: "manager@example.com", 
  password_hash: password_hash,
  status: 2
)

manager_user = User.create!(
  account: manager_account,
  fullname: "System Manager",
  username: "manager"
)
manager_user.add_role(:manager)

# Create 1 verified operator
puts "Creating operator account..."
operator_account = Account.create!(
  email: "operator@example.com",
  password_hash: password_hash, 
  status: 2
)

operator_user = User.create!(
  account: operator_account,
  fullname: "System Operator", 
  username: "operator"
)
operator_user.add_role(:operator)

# Create 20 unverified regular users
puts "Creating 20 regular users..."
20.times do |i|
  account = Account.create!(
    email: "user#{i + 1}@example.com",
    password_hash: password_hash,
    status: 1 # unverified status
  )
  
  user = User.create!(
    account: account,
    fullname: "User #{i + 1}",
    username: "user#{i + 1}"
  )
  user.add_role(:user)
end

# Create 10 Clients
puts "Creating clients..."
clients_data = [
  { name: "Acme Corp", identification_type: "04", identification: "0991234567001", email: "contact@acme.com", phone: "+593991234567" },
  { name: "Global Tech", identification_type: "04", identification: "1794567890001", email: "info@globaltech.ec", phone: "+593987654321" },
  { name: "Innovación y Desarrollo", identification_type: "04", identification: "0190001234001", email: "ventas@iyd.com", phone: "+59322334455" },
  { name: "Consultorías ABC", identification_type: "04", identification: "0998887776001", email: "contacto@consultoriasabc.com", phone: "+59345566778" },
  { name: "Juan Pérez", identification_type: "05", identification: "0912345678", email: "juan.perez@ejemplo.com", phone: "+593999888777" },
  { name: "María García", identification_type: "05", identification: "1712345678", email: "mgarcia@ejemplo.com", phone: "+593988777666" },
  { name: "Carlos Mendoza", identification_type: "05", identification: "0102345678", email: "cmendoza@ejemplo.com", phone: "+593977666555" },
  { name: "John Doe", identification_type: "06", identification: "P12345678", email: "jdoe@foreign.com", phone: "+12125550198" },
  { name: "Jane Smith", identification_type: "06", identification: "P87654321", email: "jsmith@foreign.com", phone: "+442071234567" },
  { name: "Tech Startup LLC", identification_type: "06", identification: "EIN123456", email: "hello@techstartup.io", phone: "+14155550132" }
]

clients = clients_data.map do |data|
  Client.create!(data)
end

# Create Projects for Clients
puts "Creating projects..."
project_statuses = ["active", "maintenance", "canceled"]

clients.each_with_index do |client, index|
  # Give each client between 1 and 3 projects
  rand(1..3).times do |i|
    status = project_statuses.sample
    project_number = i + 1
    
    Project.create!(
      client: client,
      name: "Proyecto #{client.name.split(' ').first} #{project_number}",
      status: status,
      production_url: status != "canceled" ? "https://proyecto#{project_number}-#{client.name.parameterize}.example.com" : nil,
      start_date: rand(1..24).months.ago
    )
  end
end

puts ""
puts "=" * 60
puts "✅ Development database seeded successfully!"
puts "=" * 60
puts ""
puts "📋 Created roles: #{Role.pluck(:name).join(', ')}"
puts "🔐 Created permissions: #{Permission.count} (#{Permission.pluck(:key).join(', ')})"
puts ""
puts "👥 Created 23 accounts with associated users:"
puts "   • 1 verified admin: admin@example.com (admin role)"
puts "   • 1 verified manager: manager@example.com (manager role)"  
puts "   • 1 verified operator: operator@example.com (operator role)"
puts "   • 20 unverified users: user1@example.com through user20@example.com (user role)"
puts ""
puts "🔑 All accounts have password: password123"
puts "=" * 60
