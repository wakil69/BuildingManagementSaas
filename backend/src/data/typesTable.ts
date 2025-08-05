export interface UsersTable {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: "admin" | "user" | "viewer";
    company_id: number;
    creation_date: Date;
    update_date: Date;
}