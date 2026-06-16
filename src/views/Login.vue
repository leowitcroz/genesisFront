<template>
    <div class="card border-0 shadow-sm p-4 position-relative">

        <h4 class="mb-4 fw-bold text-center">
            <span v-if="carregandoInfo" class="spinner-border spinner-border-sm text-primary" role="status"></span>
            <span v-else>Bem-vindo(a) à <span class="text-primary">{{ nomeNegocio }}</span></span>
        </h4>

        <form @submit.prevent="handleLogin">
            <div class="mb-3">
                <label class="form-label">E-mail</label>
                <input v-model="form.email" type="email" class="form-control" placeholder="seu@email.com" required>
            </div>
            <div class="mb-4">
                <label class="form-label">Senha</label>
                <input v-model="form.password" type="password" class="form-control" placeholder="********" required>
            </div>
            <button :disabled="loading" class="btn btn-primary w-100 py-2 mb-3">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                    aria-hidden="true"></span>
                {{ loading ? 'Entrando...' : 'Entrar' }}
            </button>

            <p v-if="exibirRegistro" class="text-center small mb-0">
                Ainda não tem conta? <router-link to="/registro" class="fw-bold text-decoration-none">Crie uma
                    agora</router-link>
            </p>
        </form>

        <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1055;">
            <div id="loginToast" class="toast align-items-center border-0 text-white" :class="toastClass" role="alert"
                ref="toastRef">
                <div class="d-flex">
                    <div class="toast-body">
                        <i :class="toastIcon"></i> {{ toastMessage }}
                    </div>
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

const form = reactive({
    email: '',
    password: ''
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// --- ESTADOS DO TOAST ---
const toastRef = ref(null);
let bsToast = null;
const toastMessage = ref('');
const toastClass = ref('');
const toastIcon = ref('');

// --- ESTADOS DINÂMICOS DA TELA ---
const nomeNegocio = ref('Genesis'); // Nome padrão caso não tenha subdomínio
const exibirRegistro = ref(false);

const hostname = window.location.hostname;
const partes = hostname.split('.');

// Validação de domínio e busca de nome
const configurarTelaPorSubdominio = async () => {
    const isLocalhost = hostname === 'localhost';

    // Verifica se tem subdomínio válido (não é localhost puro, não é www, não é adm)
    const temSubdominio = partes.length > 1 && partes[0] !== 'www' && partes[0] !== 'adm' && !isLocalhost;

    if (temSubdominio) {
        exibirRegistro.value = true;
        const subdomain = partes[0]; // Pega a palavra 'alcateia' por exemplo

        try {
            // Busca o nome real do negócio na nossa nova rota
            const res = await axios.get(`${API_URL}/tenants/info/${subdomain}`);
            if (res.data && res.data.nomeNegocio) {
                nomeNegocio.value = res.data.nomeNegocio;
            }
        } catch (e) {
            console.error("Não foi possível carregar os dados da barbearia", e);
        }
    } else {
        // Portal global ou Super Admin
        exibirRegistro.value = false;
    }

    carregandoInfo.value = false;
};

onMounted(() => {
    if (toastRef.value) {
        bsToast = new Toast(toastRef.value);
    }
    configurarTelaPorSubdominio();
});

const showToast = (msg, type = 'success') => {
    toastMessage.value = msg;
    toastClass.value = type === 'success' ? 'bg-success' : 'bg-danger';
    toastIcon.value = type === 'success' ? 'bi-check-circle-fill me-2' : 'bi-exclamation-octagon-fill me-2';
    if (bsToast) bsToast.show();
};

const handleLogin = async () => {
    try {
        loading.value = true;

        const response = await axios.post(`${API_URL}/auth/login`, {
            email: form.email,
            senha: form.password
        });

        const { token, tenantId, subdomain, usuario, features } = response.data;
        const accessToken = token?.accessToken || response.data.access_token;

        const isLocalhost = hostname === 'localhost' || hostname.endsWith('.localhost');
        const jaEstaNoSubdominio = hostname.startsWith(`${subdomain}.`);
        const featuresCodificadas = encodeURIComponent(JSON.stringify(features || {}));

        showToast('Logado com sucesso!', 'success');

        setTimeout(() => {
            // Caso 1: ADM tentando logar fora do subdomínio dele
            if (usuario.role === 1 && subdomain && !jaEstaNoSubdominio) {
                if (isLocalhost) {
                    window.location.href = `http://${subdomain}.localhost:5173/home?sync_token=${accessToken}&sync_tenant=${tenantId}&sync_features=${featuresCodificadas}`;
                } else {
                    window.location.href = `http://${subdomain}.genesis.com/home?sync_token=${accessToken}&sync_tenant=${tenantId}&sync_features=${featuresCodificadas}`;
                }
            }
            // Caso 2: Login no lugar certo
            else {
                if (isLocalhost) {
                    Cookies.set('access_token', accessToken, { expires: 7 });
                    Cookies.set('tenant_id', tenantId, { expires: 7 });
                } else {
                    Cookies.set('access_token', accessToken, { expires: 7, domain: '.genesis.com' });
                    Cookies.set('tenant_id', tenantId, { expires: 7, domain: '.genesis.com' });
                }

                if (features) {
                    localStorage.setItem('tenant_features', JSON.stringify(features));
                }

                router.push('/home');
            }
        }, 1000);

    } catch (e) {
        const mensagemErro = e.response?.data?.message || 'Verifique as suas credenciais.';
        showToast(`Erro no login: ${mensagemErro}`, 'danger');
        console.error('Detalhes do erro:', e);
        loading.value = false;
    }
};
</script>