class CreateClients < ActiveRecord::Migration[8.0]
  def change
    create_table :clients do |t|
      t.string :name, null: false
      t.string :identification_type, null: false, default: "05"
      t.string :identification
      t.string :email
      t.string :phone
      t.text :address

      t.timestamps
    end

    add_index :clients, :identification, unique: true, where: "identification IS NOT NULL AND identification != ''"
    add_index :clients, :email
  end
end
