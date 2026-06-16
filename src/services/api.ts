import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
    // URL onde o seu backend NestJS está rodando
    baseURL: 'http://localhost:3000',
});

// Interceptor de Requisição: Injeta os dados antes da requisição sair do navegador
api.interceptors.request.use(
    (config) => {
        // Pega o token e o tenantId salvos nos cookies
        const token = Cookies.get('access_token');
        const tenantId = Cookies.get('tenant_id');

        // Se o usuário estiver logado, anexa o Bearer Token no cabeçalho
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Se houver um tenantId ativo, envia para o nosso SaasFeatureGuard do backend
        if (tenantId) {
            config.headers['x-tenant-id'] = tenantId;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de Resposta: Trata erros globais que voltam do servidor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Se o servidor responder 401 (Não Autorizado), significa que o token expirou
        if (error.response && error.response.status === 401) {
            // Limpa os cookies para deslogar o usuário e evitar requisições infinitas
            Cookies.remove('access_token');
            Cookies.remove('tenant_id');

            // Força o redirecionamento para a tela de login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;