class Project < ApplicationRecord
  belongs_to :client

  enum :status, { active: 0, maintenance: 1, canceled: 2 }

  validates :name, presence: { message: "El nombre del proyecto es requerido" }
  validates :status, presence: true

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name status production_url start_date client_id created_at updated_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[client]
  end
end
