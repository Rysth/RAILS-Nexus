class AddProjectsCountToClients < ActiveRecord::Migration[8.0]
  def change
    add_column :clients, :projects_count, :integer, default: 0, null: false
    
    reversible do |dir|
      dir.up do
        Client.reset_column_information
        Client.find_each do |client|
          Client.reset_counters(client.id, :projects)
        end
      end
    end
  end
end
