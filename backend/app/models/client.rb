class Client < ApplicationRecord
  has_many :projects, dependent: :destroy

  validates :name, presence: { message: "El nombre es requerido" }
  validates :identification_type, presence: true, inclusion: {
    in: %w[04 05 06],
    message: "Tipo de identificación inválido (04=RUC, 05=Cédula, 06=Pasaporte)"
  }
  validates :identification, uniqueness: { message: "Esta identificación ya está registrada", allow_blank: true }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP, message: "Correo electrónico inválido" }, allow_blank: true

  IDENTIFICATION_TYPES = {
    "04" => "RUC",
    "05" => "Cédula",
    "06" => "Pasaporte"
  }.freeze

  def identification_type_label
    IDENTIFICATION_TYPES[identification_type] || identification_type
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name identification_type identification email phone created_at updated_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[projects]
  end
end
