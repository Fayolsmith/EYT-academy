import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types";

export enum ClientType {
    SERVER = 'server',
    SPA = 'spa'
}

export class SassClient {
    private client: SupabaseClient<Database>;
    private clientType: ClientType;

    constructor(client: SupabaseClient<Database>, clientType: ClientType) {
        this.client = client;
        this.clientType = clientType;
    }

    async loginEmail(email: string, password: string) {
        return this.client.auth.signInWithPassword({
            email: email,
            password: password
        });
    }

    async registerEmail(email: string, password: string) {
        return this.client.auth.signUp({
            email: email,
            password: password
        });
    }

    async exchangeCodeForSession(code: string) {
        return this.client.auth.exchangeCodeForSession(code);
    }

    async resendVerificationEmail(email: string) {
        return this.client.auth.resend({
            email: email,
            type: 'signup'
        });
    }

    async logout() {
        const { error } = await this.client.auth.signOut({
            scope: 'local',
        });
        if (error) throw error;
        if (this.clientType === ClientType.SPA) {
            window.location.href = '/auth/login';
        }
    }

    async uploadFile(bucket: string, filename: string, file: File) {
        filename = filename.replace(/[^0-9a-zA-Z!\-_.*'()]/g, '_');
        return this.client.storage.from(bucket).upload(filename, file);
    }

    async getFiles(bucket: string, path: string) {
        return this.client.storage.from(bucket).list(path);
    }

    async deleteFile(bucket: string, path: string) {
        return this.client.storage.from(bucket).remove([path]);
    }

    // Children
    async getChildren() {
        return this.client.from('children').select('*');
    }

    // Bookings
    async getBookings() {
        return this.client.from('bookings').select('*');
    }

    // Enquiries
    async getEnquiries() {
        return this.client.from('enquiries').select('*');
    }

    getSupabaseClient() {
        return this.client;
    }
}
