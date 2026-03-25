export interface SignInForm {
	email: string;
	password: string;
}

export interface SignUpForm {
	fullName: string;
	username: string;
	email: string;
	password: string;
	passwordConfirmation: string;
}

export interface ConfirmForm {
	email: string;
}

export interface ForgotPasswordForm {
	email: string;
}

export interface ResetPasswordForm {
	password: string;
	passwordConfirmation: string;
}

export interface User {
	id: number;
	email: string;
	username: string;
	fullname: string;
	roles: string[];
	permissions: string[];
	verified: boolean;
	created_at: string;
	updated_at: string;
}

// Permission constants (must match backend Permission model keys)
export const Permissions = {
	VIEW_DASHBOARD: "view_dashboard",
	VIEW_USERS: "view_users",
	CREATE_USERS: "create_users",
	EDIT_USERS: "edit_users",
	DELETE_USERS: "delete_users",
	EXPORT_USERS: "export_users",
  VIEW_CLIENTS: "view_clients",
  CREATE_CLIENTS: "create_clients",
  EDIT_CLIENTS: "edit_clients",
  DELETE_CLIENTS: "delete_clients",
  VIEW_PROJECTS: "view_projects",
  CREATE_PROJECTS: "create_projects",
  EDIT_PROJECTS: "edit_projects",
  DELETE_PROJECTS: "delete_projects",
