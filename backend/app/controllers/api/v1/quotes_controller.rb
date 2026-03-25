module Api
  module V1
    class QuotesController < BaseController
      before_action :authenticate_rodauth_user!
      before_action -> { authorize_permission!(Permission::VIEW_QUOTES) }, only: [:index, :show]
      before_action -> { authorize_permission!(Permission::CREATE_QUOTES) }, only: [:create]
      before_action -> { authorize_permission!(Permission::EDIT_QUOTES) }, only: [:update]
      before_action -> { authorize_permission!(Permission::DELETE_QUOTES) }, only: [:destroy]
      before_action :set_quote, only: [:show, :update, :destroy]

      # GET /api/v1/quotes
      def index
        @q = Quote.includes(project: :client).ransack(search_params)
        @q.sorts = "id desc" if @q.sorts.empty?

        page = params[:page] || 1
        per_page = params[:per_page] || 12

        @pagy, @quotes = pagy(@q.result(distinct: true), page: page, limit: per_page)

        quotes = @quotes.map { |quote| quote_json(quote) }

        render json: {
          status: :success,
          quotes: quotes,
          pagination: {
            current_page: @pagy.page,
            total_pages: @pagy.pages,
            total_count: @pagy.count,
            per_page: @pagy.limit
          }
        }
      end

      # GET /api/v1/quotes/:id
      def show
        render json: { status: :success, quote: quote_json(@quote, include_items: true) }
      end

      # POST /api/v1/quotes
      def create
        @quote = Quote.new(quote_params)

        if @quote.save
          render json: { status: :success, quote: quote_json(@quote, include_items: true) }, status: :created
        else
          render json: { status: :error, errors: @quote.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT /api/v1/quotes/:id
      def update
        if @quote.update(quote_params)
          render json: { status: :success, quote: quote_json(@quote, include_items: true) }
        else
          render json: { status: :error, errors: @quote.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/quotes/:id
      def destroy
        if @quote.destroy
          render json: { status: :success, message: "Cotización eliminada correctamente" }
        else
          render json: { status: :error, message: "No se pudo eliminar la cotización" }, status: :unprocessable_entity
        end
      end

      private

      def set_quote
        # Using includes for project/client. For show/update/destroy, quote_items are often needed.
        @quote = Quote.includes(project: :client).includes(:quote_items).find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { status: :error, message: "Cotización no encontrada" }, status: :not_found
      end

      def quote_params
        params.require(:quote).permit(
          :project_id, :issue_date, :valid_until, :status,
          quote_items_attributes: [:id, :description, :quantity, :unit_price, :_destroy]
        )
      end

      def search_params
        search = {}
        search[:project_name_cont] = params[:search] if params[:search].present?

        if params[:status].present?
          search[:status_eq] = Quote.statuses[params[:status]] || params[:status]
        end

        search[:project_id_eq] = params[:project_id] if params[:project_id].present?
        search
      end

      def quote_json(quote, include_items: false)
        data = {
          id: quote.id,
          project_id: quote.project_id,
          project_name: quote.project&.name,
          client_name: quote.project&.client&.name,
          issue_date: quote.issue_date,
          valid_until: quote.valid_until,
          status: quote.status,
          total: quote.total.to_f,
          items_count: quote.quote_items_count,
          created_at: quote.created_at,
          updated_at: quote.updated_at
        }

        if include_items
          data[:quote_items] = quote.quote_items.sort_by { |item| item.id || Float::INFINITY }.map do |item|
            {
              id: item.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price.to_f,
              subtotal: item.subtotal.to_f
            }
          end
        end

        data
      end
    end
  end
end
