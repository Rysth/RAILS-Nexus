class AddQuoteItemsCountToQuotes < ActiveRecord::Migration[8.0]
  def change
    add_column :quotes, :quote_items_count, :integer, default: 0, null: false
  end
end
