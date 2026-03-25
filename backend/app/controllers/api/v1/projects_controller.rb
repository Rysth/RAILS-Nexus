module Api
  module V1
    class ProjectsController < BaseController
      before_action :authenticate_rodauth_user!
      before_action -> { authorize_permission!(Permission::VIEW_PROJECTS) }, only: [:index, :show]
      before_action -> { authorize_permission!(Permission::CREATE_PROJECTS) }, only: [:create]
      before_action -> { authorize_permission!(Permission::EDIT_PROJECTS) }, only: [:update]
      before_action -> { authorize_permission!(Permission::DELETE_PROJECTS) }, only: [:destroy]
      before_action :set_project, only: [:show, :update, :destroy]

      # GET /api/v1/projects
      def index
        @q = Project.includes(:client).ransack(search_params)
        @q.sorts = 'id desc' if @q.sorts.empty?

        page = params[:page] || 1
        per_page = params[:per_page] || 12

        @pagy, @projects = pagy(@q.result(distinct: true), page: page, limit: per_page)

        projects = @projects.map { |project| project_json(project) }

        render json: {
          status: :success,
          projects: projects,
          pagination: {
            current_page: @pagy.page,
            total_pages: @pagy.pages,
            total_count: @pagy.count,
            per_page: @pagy.limit
          }
        }
      end

      # GET /api/v1/projects/:id
      def show
        render json: { status: :success, project: project_json(@project) }
      end

      # POST /api/v1/projects
      def create
        @project = Project.new(project_params)

        if @project.save
          render json: { status: :success, project: project_json(@project) }, status: :created
        else
          render json: { status: :error, errors: @project.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT /api/v1/projects/:id
      def update
        if @project.update(project_params)
          render json: { status: :success, project: project_json(@project) }
        else
          render json: { status: :error, errors: @project.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/projects/:id
      def destroy
        if @project.destroy
          render json: { status: :success, message: 'Proyecto eliminado correctamente' }
        else
          render json: { status: :error, message: 'No se pudo eliminar el proyecto' }, status: :unprocessable_entity
        end
      end

      private

      def set_project
        @project = Project.includes(:client).find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { status: :error, message: 'Proyecto no encontrado' }, status: :not_found
      end

      def project_params
        params.require(:project).permit(:client_id, :name, :production_url, :start_date, :status)
      end

      def search_params
        search = {}
        search[:name_or_client_name_cont] = params[:search] if params[:search].present?
        search[:status_eq] = params[:status] if params[:status].present?
        search[:client_id_eq] = params[:client_id] if params[:client_id].present?
        search
      end

      def project_json(project)
        {
          id: project.id,
          client_id: project.client_id,
          client_name: project.client&.name,
          name: project.name,
          production_url: project.production_url,
          start_date: project.start_date,
          status: project.status,
          created_at: project.created_at,
          updated_at: project.updated_at
        }
      end
    end
  end
end
