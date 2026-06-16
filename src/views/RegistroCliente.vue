<template>
    <div class="card border-0 shadow-sm p-4 position-relative">
        <div class="text-center mb-4">
            <h4 class="fw-bold mb-1">Criar minha conta</h4>
            <p class="text-muted small">
                <span v-if="carregandoInfo" class="spinner-border spinner-border-sm text-primary"></span>
                <span v-else>Junte-se à <strong class="text-dark">{{ nomeNegocio }}</strong></span>
            </p>
        </div>

        <form @submit.prevent="handleRegister">
            <div class="mb-3">
                <label class="form-label">Nome Completo</label>
                <input v-model="form.nome" type="text" class="form-control" placeholder="João da Silva" required>
            </div>

            <div class="mb-3">
                <label class="form-label">E-mail</label>
                <input v-model="form.email" type="email" class="form-control" placeholder="seu@email.com" required>
            </div>

            <div class="mb-3">
                <label class="form-label">Telefone / WhatsApp</label>
                <input v-model="form.telefone" type="text" class="form-control" placeholder="(00) 00000-0000" required>
            </div>

            <div class="mb-4">
                <label class="form-label">Senha</label>
                <input v-model="form.password" type="password" class="form-control" placeholder="********" required>
            </div>

            <button :disabled="loading || !tenantId" class="btn btn-primary w-100 py-2 mb-3">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ loading ? 'Criando conta...' : 'Cadastrar' }}
            </button>

            <p class="text-center small m-0">
                Já tem uma conta? <router-link to="/login" class="fw-bold text-decoration-none">Faça Login</router-link>
            </p>
        </form>

        <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1055;">
            <div id="registerToast" class="toast align-items-center border-0 text-white" :class="toastClass"
                role="alert" ref="toastRef">
                <div class="d-flex">
                    <div class="toast-body"><i :class="toastIcon"></i> {{ toastMessage }}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto"
                        data-bs-dismiss="toast"></button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Toast } from 'bootstrap';

const router = useRouter();
const loading = ref(false);
const carregandoInfo = ref(true);

const form = reactive({ nome: '', email: '', telefone: '', password: '' });

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// --- ESTADOS DINÂMICOS ---
const nomeNegocio = ref('');
const tenantId = ref(null);

// --- TOAST ---
const toastRef = ref(null);
let bsToast = null;
const toastMessage = ref('');
const toastClass = ref('');
const toastIcon = ref('');

const showToast = (msg, type = 'success') => {
    toastMessage.value = msg;
    toastClass.value = type === 'success' ? 'bg-success' : 'bg-danger';
    toastIcon.value = type === 'success' ? 'bi-check-circle-fill me-2' : 'bi-exclamation-octagon-fill me-2';
    if (bsToast) bsToast.show();
};

onMounted(async () => {
    if (toastRef.value) bsToast = new Toast(toastRef.value);

    // Descobre em qual loja o cliente está tentando se cadastrar
    const hostname = window.location.hostname;
    const partes = hostname.split('.');
    const isLocalhost = hostname === 'localhost';

    if (partes.length > 1 && partes[0] !== 'www' && partes[0] !== 'adm' && !isLocalhost) {
        try {
            const res = await axios.get(`${API_URL}/tenants/info/${partes[0]}`);
            nomeNegocio.value = res.data.nomeNegocio;
            tenantId.value = res.data.id; // Precisa do id: true no backend!
        } catch (e) {
            showToast('Erro ao carregar dados da loja.', 'danger');
        }
    }
    carregandoInfo.value = false;
});

const handleRegister = async () => {
    try {
        loading.value = true;

        // Bate na nossa rota do portal do cliente
        const response = await axios.post(`${API_URL}/portal-cliente/registro`, {
            nome: form.nome,
            email: form.email,
            telefone: form.telefone,
            senha: form.password
        }, {
            headers: { 'x-tenant-id': tenantId.value } // Manda o ID da loja no cabeçalho
        });

        // Pega o token retornado (o cliente já sai logado!)
        const accessToken = response.data.access_token;

        const isLocalhost = window.location.hostname.endsWith('.localhost');
        if (isLocalhost) {
            Cookies.set('access_token', accessToken, { expires: 7 });
            Cookies.set('tenant_id', tenantId.value, { expires: 7 });
        } else {
            Cookies.set('access_token', accessToken, { expires: 7, domain: '.genesis.com' });
            Cookies.set('tenant_id', tenantId.value, { expires: 7, domain: '.genesis.com' });
        }

        showToast('Conta criada com sucesso!', 'success');

        setTimeout(() => {
            router.push('/meu-perfil'); // Redireciona para o painel do cliente
        }, 1200);

    } catch (e) {
        const mensagemErro = e.response?.data?.message || 'Verifique os dados preenchidos.';
        showToast(`Erro: ${mensagemErro}`, 'danger');
    } finally {
        loading.value = false;
    }
};
</script>