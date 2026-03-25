class CreateProjects < ActiveRecord::Migration[8.0]
  def change
    create_table :projects do |t|
      t.references :client, null: false, foreign_key: true
      t.string :name, null: false
      t.string :production_url
      t.date :start_date
      t.integer :status, default: 0, null: false

      t.timestamps
    end

    add_index :projects, :status
  end
end
