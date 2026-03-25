class RecurringService < ApplicationRecord
  belongs_to :project

  enum :billing_cycle, { monthly: 0, yearly: 1, unique: 2 }
  enum :status, { active: 0, paused: 1 }

  validates :name, presence: { message: "El nombre del servicio es requerido" }
  validates :amount, presence: { message: "El monto es requerido" },
                     numericality: { greater_than: 0, message: "El monto debe ser mayor a 0" }
  validates :billing_cycle, presence: true
  validates :status, presence: true

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name amount billing_cycle next_billing_date status project_id created_at updated_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[project]
  end
end
