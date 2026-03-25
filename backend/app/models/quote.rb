class Quote < ApplicationRecord
  belongs_to :project
  has_many :quote_items, dependent: :destroy
  accepts_nested_attributes_for :quote_items, allow_destroy: true

  enum :status, { draft: 0, sent: 1, approved: 2, rejected: 3 }

  validates :issue_date, presence: { message: "La fecha de emisión es requerida" }
  validates :status, presence: true

  before_save :calculate_total

  def self.ransackable_attributes(_auth_object = nil)
    %w[id status issue_date valid_until total project_id created_at updated_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[project quote_items]
  end

  private

  def calculate_total
    self.total = quote_items.reject(&:marked_for_destruction?).sum { |item| item.subtotal || 0 }
  end
end
