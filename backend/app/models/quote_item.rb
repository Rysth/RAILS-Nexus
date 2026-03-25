class QuoteItem < ApplicationRecord
  belongs_to :quote, counter_cache: true

  validates :description, presence: { message: "La descripción es requerida" }
  validates :quantity, presence: true, numericality: { greater_than: 0, message: "La cantidad debe ser mayor a 0" }
  validates :unit_price, presence: true, numericality: { greater_than_or_equal_to: 0, message: "El precio unitario debe ser mayor o igual a 0" }

  before_validation :calculate_subtotal

  def self.ransackable_attributes(_auth_object = nil)
    %w[id description quantity unit_price subtotal quote_id created_at updated_at]
  end

  private

  def calculate_subtotal
    self.subtotal = (quantity || 0) * (unit_price || 0)
  end
end
