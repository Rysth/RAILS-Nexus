class CreateRecurringServices < ActiveRecord::Migration[8.0]
  def change
    create_table :recurring_services do |t|
      t.references :project, null: false, foreign_key: true
      t.string :name, null: false
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.integer :billing_cycle, default: 0, null: false
      t.date :next_billing_date
      t.integer :status, default: 0, null: false

      t.timestamps
    end
  end
end
