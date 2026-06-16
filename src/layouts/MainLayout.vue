<template>
    <div class="d-flex" style="min-height: 100vh;">
        <div class="bg-dark text-white d-none d-md-block" style="width: 250px;">
            <div class="p-3 text-center border-bottom border-secondary">
                <h4 class="fw-bold m-0">Genesis</h4>
                <small v-if="isSuperAdmin" class="text-info">Super Admin</small>
                <small v-else class="text-muted">Barbearia</small>
            </div>

            <nav class="nav flex-column p-2 mt-3">

                <router-link to="/home" class="nav-link text-white mb-2 py-2 rounded">
                    <i class="bi bi-house-door me-2"></i> Dashboard
                </router-link>

                <router-link to="/financeiro" class="nav-link text-white mb-2 py-2 rounded">
                    <i class="bi bi-currency-dollar me-2"></i> Financeiro
                </router-link>

                <router-link v-if="!isSuperAdmin" to="/agendamentos" class="nav-link text-white mb-2 py-2 rounded">
                    <i class="bi bi-calendar-event me-2"></i> Agenda
                </router-link>

                <router-link v-if="isSuperAdmin" to="/adm/lojas" class="nav-link text-white mb-2 py-2 rounded">
                    <i class="bi bi-buildings-fill me-2"></i> Central de Lojas
                </router-link>

            </nav>
        </div>

        <div class="flex-grow-1 bg-light d-flex flex-column">
            <nav class="navbar navbar-expand-lg navbar-white bg-white border-bottom px-4 py-3">
                <div class="container-fluid px-0">
                    <span class="navbar-brand d-md-none fw-bold">Genesis</span>
                    <div class="ms-auto d-flex align-items-center">
                        <span class="me-3 d-none d-sm-inline">
                            Olá, <strong>{{ isSuperAdmin ? 'Administrador' : 'Dono' }}</strong>
                        </span>
                        <button @click="handleLogout" class="btn btn-outline-danger btn-sm fw-bold">
                            <i class="bi bi-box-arrow-right"></i> Sair
                        </button>
                    </div>
                </div>
            </nav>

            <main class="p-4 flex-grow-1">
                <router-view />
            </main>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();

// O "Cérebro" que descobre quem está logado
const isSuperAdmin = computed(() => {
    const subdomain = window.location.hostname.split('.')[0];
    return subdomain === 'adm' || subdomain === 'admin' || subdomain === 'localhost';
});

// A Nova Lógica Inteligente de Logout
const handleLogout = () => {
    // 1. Executa a limpeza de cookies/tokens que já existe no seu store
    auth.logout();

    // 2. Decide a rota de redirecionamento
    if (isSuperAdmin.value) {
        // Se for o ADM, precisamos "arrancar" o subdomínio da URL
        const currentHost = window.location.host; // ex: adm.genesis.com ou adm.localhost:5173
        let baseHost = currentHost;

        if (currentHost.startsWith('adm.')) {
            baseHost = currentHost.replace('adm.', '');
        } else if (currentHost.startsWith('admin.')) {
            baseHost = currentHost.replace('admin.', '');
        }

        // Força a mudança real de domínio no navegador
        window.location.href = `${window.location.protocol}//${baseHost}/login`;
    } else {
        // Se for a barbearia, ele continua no próprio subdomínio atual (ex: alcateia.genesis.com/login)
        // Usamos window.location.href em vez de router.push para garantir que a memória do Vue (Pinia) zere completamente
        window.location.href = '/login';
    }
};
</script>

<style scoped>
.nav-link {
    transition: all 0.2s ease-in-out;
}

.nav-link:hover,
.router-link-active {
    background-color: rgba(255, 255, 255, 0.1);
    font-weight: bold;
    padding-left: 1rem !important;
}
</style>