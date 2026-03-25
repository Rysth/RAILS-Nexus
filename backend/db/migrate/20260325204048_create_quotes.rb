class CreateQuotes < ActiveRecord::Migration[8.0]
  def change
    create_table :quotes do |t|
      t.references :project, null: false, foreign_key: true
      t.date :issue_date, null: false
      t.date :valid_until
      t.integer :status, default: 0, null: false
      t.decimal :total, precision: 10, scale: 2, default: 0, null: false

      t.timestamps
    end
  end
end
