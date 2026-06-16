<template>
    <div class="container fade-in">
        <div
            class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom">
            <div>
                <h2 class="fw-bold text-dark mb-1">Meu Perfil</h2>
                <p class="text-muted mb-0">Gerencie seus dados e acompanhe seus serviços.</p>
            </div>
            <div class="mt-3 mt-md-0">
                <button @click="logout" class="btn btn-outline-danger fw-bold shadow-sm">
                    <i class="bi bi-box-arrow-right me-2"></i> Sair da Conta
                </button>
            </div>
        </div>

        <div v-if="carregando" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="text-muted mt-2">Carregando informações...</p>
        </div>

        <div v-else-if="perfil" class="row g-4">
            <div class="col-lg-4">

                <div class="card border-0 shadow-sm rounded-4 mb-4 h-100">
                    <div class="card-body p-4">
                        <h6 class="fw-bold text-uppercase text-muted mb-4"><i class="bi bi-card-text me-2"></i> Dados
                            Pessoais</h6>

                        <div class="mb-3">
                            <small class="text-muted d-block mb-1">Nome Completo</small>
                            <span class="fw-bold fs-5 text-dark">{{ perfil.nome }}</span>
                        </div>

                        <div class="mb-3">
                            <small class="text-muted d-block mb-1">E-mail</small>
                            <span class="text-dark">{{ perfil.email }}</span>
                        </div>

                        <div>
                            <small class="text-muted d-block mb-1">Telefone / WhatsApp</small>
                            <span class="text-dark">{{ perfil.telefone }}</span>
                        </div>
                    </div>
                </div>

                <!-- <div class="card border-0 shadow-sm rounded-4 bg-dark text-white">
                    <div class="card-body p-4">
                        <h6 class="text-uppercase fw-bold text-white-50 mb-4"><i
                                class="bi bi-star-fill text-warning me-2"></i> Plano Atual</h6>

                        <div v-if="perfil.assinatura && perfil.assinatura.ativo">
                            <h3 class="fw-bold mb-2">{{ perfil.assinatura.plano.nome }}</h3>
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="opacity-75">Créditos Restantes:</span>
                                <span class="badge bg-light text-dark fs-6">{{ perfil.assinatura.limiteCreditos -
                                    perfil.assinatura.creditosUsados }}</span>
                            </div>
                            <div class="pt-3 border-top border-secondary">
                                <small class="text-white-50">Válido até {{ formatarData(perfil.assinatura.dataFim)
                                    }}</small>
                            </div>
                        </div>

                        <div v-else class="text-center py-3">
                            <i class="bi bi-shield-lock display-6 text-secondary mb-3 d-block"></i>
                            <p class="mb-0 text-white-50 small">Nenhuma assinatura ativa no momento.</p>
                        </div>
                    </div>
                </div> -->
            </div>

            <div class="col-lg-8">
                <div class="card border-0 shadow-sm rounded-4 h-100">
                    <div
                        class="card-header bg-white border-bottom-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                        <h6 class="fw-bold text-uppercase text-muted mb-0"><i class="bi bi-calendar-check me-2"></i>
                            Histórico de Agendamentos</h6>
                        <!-- <button class="btn btn-success btn-sm fw-bold shadow-sm">
                            <i class="bi bi-plus-lg me-1"></i> Novo
                        </button> -->
                    </div>

                    <div class="card-body p-4 pt-2">
                        <div class="table-responsive" v-if="perfil.agendamentos && perfil.agendamentos.length > 0">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th class="border-0 rounded-start">Data / Hora</th>
                                        <th class="border-0">Serviço</th>
                                        <th class="border-0">Profissional</th>
                                        <th class="border-0 rounded-end text-end">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="agenda in perfil.agendamentos" :key="agenda.id">
                                        <td class="py-3">
                                            <span class="d-block fw-bold text-dark">{{ formatarData(agenda.horario.data)
                                            }}</span>
                                            <span class="small text-muted"><i class="bi bi-clock me-1"></i> {{
                                                agenda.horario.horaInicio }}</span>
                                        </td>
                                        <td class="py-3 fw-medium">{{ formatServico(agenda.servico) }}</td>
                                        <td class="py-3 text-muted">{{ agenda.funcionario.nome }}</td>
                                        <td class="py-3 text-end">
                                            <span class="badge rounded-pill px-3 py-2"
                                                :class="obterCorStatus(agenda.status)">
                                                {{ agenda.status.toUpperCase() }}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div v-else class="text-center py-5 text-muted bg-light rounded-3 mt-3">
                            <i class="bi bi-calendar-x display-4 d-block mb-3 opacity-25"></i>
                            <h6 class="fw-bold">Nenhum agendamento encontrado</h6>
                            <p class="small mb-0">Quando você agendar um serviço, ele aparecerá aqui.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';

const perfil = ref(null);
const carregando = ref(true);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getConfig = () => ({
    headers: {
        'Authorization': `Bearer ${Cookies.get('access_token')}`,
        'x-tenant-id': Cookies.get('tenant_id')
    }
});

const formatarData = (d) => new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
const formatServico = (s) => s ? s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : '';

const obterCorStatus = (status) => {
    const mapa = {
        'agendado': 'bg-primary-subtle text-primary border border-primary-subtle',
        'concluido': 'bg-success-subtle text-success border border-success-subtle',
        'cancelado': 'bg-danger-subtle text-danger border border-danger-subtle'
    };
    return mapa[status.toLowerCase()] || 'bg-secondary';
};

const carregarPerfil = async () => {
    try {
        const response = await axios.get(`${API_URL}/portal-cliente/perfil`, getConfig());
        perfil.value = response.data;
    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        if (error.response?.status === 401) {
            logout();
        }
    } finally {
        carregando.value = false;
    }
};

const logout = () => {
    Cookies.remove('access_token');
    Cookies.remove('tenant_id');
    window.location.href = '/login';
};

onMounted(() => {
    carregarPerfil();
});
</script>

<style scoped>
.fade-in {
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>