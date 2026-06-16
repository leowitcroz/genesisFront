import { defineStore } from 'pinia';
import Cookies from 'js-cookie';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as any,
        token: Cookies.get('access_token') || null,
        tenantId: Cookies.get('tenant_id') || null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
    },

    actions: {
        async login(credentials: any) {
            const { data } = await api.post('/auth/login', credentials);
            this.token = data.access_token;
            this.tenantId = data.tenantId;
            this.user = data.user;

            Cookies.set('access_token', data.access_token, { expires: 7 });
            Cookies.set('tenant_id', data.tenantId, { expires: 7 });
        },

        async registerLoja(userData: any) {
            await api.post('/tenants/registrar-loja', userData); // Rota do seu NestJS
        },

        logout() {
            this.token = null;
            this.user = null;
            this.tenantId = null;
            Cookies.remove('access_token');
            Cookies.remove('tenant_id');
            window.location.href = '/login';
        }
    }
});