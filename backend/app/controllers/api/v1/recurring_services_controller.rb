module Api
  module V1
    class RecurringServicesController < BaseController
      before_action :authenticate_rodauth_user!
      before_action -> { authorize_permission!(Permission::VIEW_RECURRING_SERVICES) }, only: [:index, :show]
      before_action -> { authorize_permission!(Permission::CREATE_RECURRING_SERVICES) }, only: [:create]
      before_action -> { authorize_permission!(Permission::EDIT_RECURRING_SERVICES) }, only: [:update]
      before_action -> { authorize_permission!(Permission::DELETE_RECURRING_SERVICES) }, only: [:destroy]
      before_action :set_recurring_service, only: [:show, :update, :destroy]

      # GET /api/v1/recurring_services
      def index
        @q = RecurringService.includes(project: :client).ransack(search_params)
        @q.sorts = 'id desc' if @q.sorts.empty?

        page = params[:page] || 1
        per_page = params[:per_page] || 12

        @pagy, @services = pagy(@q.result(distinct: true), page: page, limit: per_page)

        services = @services.map { |service| service_json(service) }

        render json: {
          status: :success,
          recurring_services: services,
          pagination: {
            current_page: @pagy.page,
            total_pages: @pagy.pages,
            total_count: @pagy.count,
            per_page: @pagy.limit
          }
        }
      end

      # GET /api/v1/recurring_services/:id
      def show
        render json: { status: :success, recurring_service: service_json(@recurring_service) }
      end

      # POST /api/v1/recurring_services
      def create
        @recurring_service = RecurringService.new(service_params)

        if @recurring_service.save
          render json: { status: :success, recurring_service: service_json(@recurring_service) }, status: :created
        else
          render json: { status: :error, errors: @recurring_service.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT /api/v1/recurring_services/:id
      def update
        if @recurring_service.update(service_params)
          render json: { status: :success, recurring_service: service_json(@recurring_service) }
        else
          render json: { status: :error, errors: @recurring_service.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/recurring_services/:id
      def destroy
        if @recurring_service.destroy
          render json: { status: :success, message: 'Servicio recurrente eliminado correctamente' }
        else
          render json: { status: :error, message: 'No se pudo eliminar el servicio recurrente' }, status: :unprocessable_entity
        end
      end

      private

      def set_recurring_service
        @recurring_service = RecurringService.includes(project: :client).find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { status: :error, message: 'Servicio recurrente no encontrado' }, status: :not_found
      end

      def service_params
        params.require(:recurring_service).permit(:project_id, :name, :amount, :billing_cycle, :next_billing_date, :status)
      end

      def search_params
        search = {}
        search[:name_cont] = params[:search] if params[:search].present?
        search[:status_eq] = params[:status] if params[:status].present?
        search[:billing_cycle_eq] = params[:billing_cycle] if params[:billing_cycle].present?
        search[:project_id_eq] = params[:project_id] if params[:project_id].present?
        search
      end

      def service_json(service)
        {
          id: service.id,
          project_id: service.project_id,
          project_name: service.project&.name,
          client_name: service.project&.client&.name,
          name: service.name,
          amount: service.amount.to_f,
          billing_cycle: service.billing_cycle,
          next_billing_date: service.next_billing_date,
          status: service.status,
          created_at: service.created_at,
          updated_at: service.updated_at
        }
      end
    end
  end
end
