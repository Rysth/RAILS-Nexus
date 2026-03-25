module Api
  module V1
    class ClientsController < BaseController
      before_action :authenticate_rodauth_user!
      before_action -> { authorize_permission!(Permission::VIEW_CLIENTS) }, only: [:index, :show]
      before_action -> { authorize_permission!(Permission::CREATE_CLIENTS) }, only: [:create]
      before_action -> { authorize_permission!(Permission::EDIT_CLIENTS) }, only: [:update]
      before_action -> { authorize_permission!(Permission::DELETE_CLIENTS) }, only: [:destroy]
      before_action :set_client, only: [:show, :update, :destroy]

      # GET /api/v1/clients
      def index
        @q = Client.ransack(search_params)
        @q.sorts = 'id desc' if @q.sorts.empty?

        page = params[:page] || 1
        per_page = params[:per_page] || 12

        @pagy, @clients = pagy(@q.result(distinct: true).includes(:projects), page: page, limit: per_page)
        clients = @clients.map { |client| client_json(client) }

        render json: {
          status: :success,
          clients: clients,
          pagination: {
            current_page: @pagy.page,
            total_pages: @pagy.pages,
            total_count: @pagy.count,
            per_page: @pagy.limit
          }
        }
      end

      # GET /api/v1/clients/:id
      def show
        render json: { status: :success, client: client_json(@client, include_projects: true) }
      end

      # POST /api/v1/clients
      def create
        @client = Client.new(client_params)

        if @client.save
          render json: { status: :success, client: client_json(@client) }, status: :created
        else
          render json: { status: :error, errors: @client.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT /api/v1/clients/:id
      def update
        if @client.update(client_params)
          render json: { status: :success, client: client_json(@client) }
        else
          render json: { status: :error, errors: @client.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/clients/:id
      def destroy
        if @client.projects.any?
          return render json: {
            status: :error,
            message: "No se puede eliminar un cliente con proyectos asociados. Elimina los proyectos primero."
          }, status: :unprocessable_entity
        end

        if @client.destroy
          render json: { status: :success, message: 'Cliente eliminado correctamente' }
        else
          render json: { status: :error, message: 'No se pudo eliminar el cliente' }, status: :unprocessable_entity
        end
      end

      private

      def set_client
        @client = Client.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { status: :error, message: 'Cliente no encontrado' }, status: :not_found
      end

      def client_params
        params.require(:client).permit(:name, :identification_type, :identification, :email, :phone, :address)
      end

      def search_params
        search = {}
        search[:name_or_identification_or_email_cont] = params[:search] if params[:search].present?
        search[:identification_type_eq] = params[:identification_type] if params[:identification_type].present?
        search
      end

      def client_json(client, include_projects: false)
        data = {
          id: client.id,
          name: client.name,
          identification_type: client.identification_type,
          identification_type_label: client.identification_type_label,
          identification: client.identification,
          email: client.email,
          phone: client.phone,
          address: client.address,
          projects_count: client.projects.size,
          created_at: client.created_at,
          updated_at: client.updated_at
        }

        if include_projects
          data[:projects] = client.projects.order(id: :desc).map do |project|
            {
              id: project.id,
              name: project.name,
              production_url: project.production_url,
              start_date: project.start_date,
              status: project.status,
              created_at: project.created_at,
              updated_at: project.updated_at
            }
          end
        end

        data
      end
    end
  end
end
