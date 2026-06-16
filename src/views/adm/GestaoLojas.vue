<template>
    <div class="container-fluid position-relative">

        <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1100">
            <div ref="toastRef" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                    <strong class="me-auto">{{ toastMessage.title }}</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    {{ toastMessage.body }}
                </div>
            </div>
        </div>

        <div class="row mb-4">
            <div class="col-12 d-flex justify-content-between align-items-center">
                <div>
                    <h2 class="fw-bold text-dark mb-1">
                        <i class="bi bi-buildings-fill text-primary me-2"></i> Central de Estabelecimentos
                    </h2>
                    <p class="text-muted mb-0">Gerencie lojas (Tenants), usuários e planos em todo o ecossistema
                        Genesis.</p>
                </div>
                <button class="btn btn-primary fw-bold shadow-sm" @click="abrirModalNovaLoja">
                    <i class="bi bi-plus-lg me-2"></i> Provisionar Nova Loja
                </button>
            </div>
        </div>

        <div class="card border-0 shadow-sm bg-white overflow-hidden">
            <ul class="nav nav-tabs bg-light pt-2 px-3 border-bottom-0" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link fw-bold px-4" :class="{ active: abaAtual === 'lojas' }"
                        @click="abaAtual = 'lojas'">
                        <i class="bi bi-shop me-2"></i> Lojas (Tenants)
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link fw-bold px-4" :class="{ active: abaAtual === 'funcionarios' }"
                        @click="abaAtual = 'funcionarios'">
                        <i class="bi bi-person-badge me-2"></i> Funcionários / Barbeiros
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link fw-bold px-4" :class="{ active: abaAtual === 'clientes' }"
                        @click="abaAtual = 'clientes'">
                        <i class="bi bi-people me-2"></i> Clientes Finais
                    </button>
                </li>
            </ul>

            <div class="card-body p-4 border-top">
                <div class="row g-3 mb-4 bg-light p-3 rounded-3 border">
                    <div class="col-12 col-md-4">
                        <label class="form-label small text-muted fw-bold text-uppercase">Pesquisar</label>
                        <div class="input-group">
                            <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                            <input type="text" class="form-control" placeholder="Nome, email, subdomínio..."
                                v-model="filtros.busca">
                        </div>
                    </div>

                    <div v-if="abaAtual !== 'lojas'" class="col-12 col-md-3">
                        <label class="form-label small text-muted fw-bold text-uppercase">Filtrar por Loja</label>
                        <select class="form-select" v-model="filtros.lojaId">
                            <option value="">Todas as Lojas</option>
                            <option v-for="loja in lojasUnicas" :key="loja.id" :value="loja.id">{{ loja.nomeNegocio }}
                            </option>
                        </select>
                    </div>

                    <div v-if="abaAtual === 'lojas'" class="col-12 col-md-3">
                        <label class="form-label small text-muted fw-bold text-uppercase">Plano SaaS</label>
                        <select class="form-select" v-model="filtros.plano">
                            <option value="">Todos os Planos</option>
                            <option value="BASICO">Básico</option>
                            <option value="VIP">VIP</option>
                            <option value="PRO">Pro</option>
                        </select>
                    </div>

                    <div class="col-12 col-md-2">
                        <label class="form-label small text-muted fw-bold text-uppercase">Status</label>
                        <select class="form-select" v-model="filtros.status">
                            <option value="">Todos</option>
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo / Bloqueado</option>
                        </select>
                    </div>

                    <div class="col-12 col-md-2 d-flex align-items-end">
                        <button class="btn btn-outline-secondary w-100" @click="limparFiltros">Limpar Filtros</button>
                    </div>
                </div>

                <div v-if="loadingDados" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                    <p class="text-muted mt-3">Carregando dados da plataforma...</p>
                </div>

                <div v-else-if="abaAtual === 'lojas'" class="table-responsive">
                    <table class="table table-hover align-middle border">
                        <thead class="table-light">
                            <tr>
                                <th>Loja / Negócio</th>
                                <th>Subdomínio</th>
                                <th>Plano Atual</th>
                                <th>Módulos Ativos</th>
                                <th>Status</th>
                                <th class="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="loja in lojasFiltradas" :key="loja.id">
                                <td class="fw-bold">{{ loja.nomeNegocio }}</td>
                                <td><span class="badge bg-light text-primary border">{{ loja.subdomain
                                }}.genesis.com</span></td>
                                <td><span class="badge bg-dark">{{ loja.planoSaaS }}</span></td>
                                <td>
                                    <i class="bi bi-calendar-check text-primary me-2" title="Agendamento"
                                        v-if="loja.moduloAgendamento"></i>
                                    <i class="bi bi-graph-up-arrow text-success me-2" title="Financeiro"
                                        v-if="loja.moduloFinanceiro"></i>
                                    <i class="bi bi-box-seam text-warning" title="Produtos"
                                        v-if="loja.moduloProdutos"></i>
                                    <i class="bi bi-cart-check text-info" title="Vendas de Produtos"
                                        v-if="loja.moduloVendas"></i>
                                </td>
                                <td>
                                    <span v-if="loja.ativo"
                                        class="badge bg-success bg-opacity-10 text-success border border-success rounded-pill px-3">Ativo</span>
                                    <span v-else
                                        class="badge bg-danger bg-opacity-10 text-danger border border-danger rounded-pill px-3">Bloqueada</span>
                                </td>
                                <td class="text-end">
                                    <button class="btn btn-sm btn-outline-primary me-2" title="Editar Plano e Módulos"
                                        @click="abrirModalPlano(loja)">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-sm"
                                        :class="loja.ativo ? 'btn-outline-danger' : 'btn-outline-success'"
                                        title="Bloquear/Desbloquear" @click="toggleStatusLoja(loja)">
                                        <i class="bi" :class="loja.ativo ? 'bi-lock-fill' : 'bi-unlock-fill'"></i>
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="lojasFiltradas.length === 0">
                                <td colspan="6" class="text-center py-4 text-muted">Nenhuma loja encontrada com estes
                                    filtros.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-else-if="abaAtual === 'funcionarios'" class="table-responsive">
                    <table class="table table-hover align-middle border">
                        <thead class="table-light">
                            <tr>
                                <th>Nome</th>
                                <th>E-mail</th>
                                <th>Loja Vinculada (Tenant)</th>
                                <th>Nível / Role</th>
                                <th>Status</th>
                                <th class="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="func in funcionariosFiltrados" :key="func.id">
                                <td class="fw-bold">{{ func.nome }}</td>
                                <td class="text-muted">{{ func.email }}</td>
                                <td><span class="badge bg-primary bg-opacity-10 text-primary">{{
                                    getNomeLoja(func.tenantId) }}</span></td>
                                <td>
                                    <span v-if="func.role === 1" class="badge bg-warning text-dark"><i
                                            class="bi bi-star-fill me-1"></i> Dono/Admin</span>
                                    <span v-else class="badge bg-secondary">Barbeiro</span>
                                </td>
                                <td>
                                    <span v-if="func.ativo"
                                        class="badge bg-success bg-opacity-10 text-success border border-success rounded-pill px-3">Ativo</span>
                                    <span v-else
                                        class="badge bg-danger bg-opacity-10 text-danger border border-danger rounded-pill px-3">Inativo</span>
                                </td>
                                <td class="text-end">
                                    <button class="btn btn-sm btn-outline-secondary" title="Ver Detalhes"><i
                                            class="bi bi-eye"></i></button>
                                </td>
                            </tr>
                            <tr v-if="funcionariosFiltrados.length === 0">
                                <td colspan="6" class="text-center py-4 text-muted">Nenhum funcionário encontrado.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-else-if="abaAtual === 'clientes'" class="table-responsive">
                    <table class="table table-hover align-middle border">
                        <thead class="table-light">
                            <tr>
                                <th>Nome do Cliente</th>
                                <th>E-mail</th>
                                <th>Loja Vinculada (Tenant)</th>
                                <th>Telefone</th>
                                <th class="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="cliente in clientesFiltrados" :key="cliente.id">
                                <td class="fw-bold">{{ cliente.nome }}</td>
                                <td class="text-muted">{{ cliente.email }}</td>
                                <td><span class="badge bg-primary bg-opacity-10 text-primary">{{
                                    getNomeLoja(cliente.tenantId) }}</span></td>
                                <td>{{ cliente.telefone || '--' }}</td>
                                <td class="text-end">
                                    <button class="btn btn-sm btn-outline-secondary" title="Ver Agendamentos"><i
                                            class="bi bi-calendar-event"></i></button>
                                </td>
                            </tr>
                            <tr v-if="clientesFiltrados.length === 0">
                                <td colspan="5" class="text-center py-4 text-muted">Nenhum cliente encontrado.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </div>

        <div class="modal fade" ref="modalLojaRef" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-light">
                        <h5 class="modal-title fw-bold"><i class="bi bi-rocket-takeoff text-primary me-2"></i> Criar
                            Novo Tenant</h5>
                        <button type="button" class="btn-close" @click="fecharModalNovaLoja"></button>
                    </div>
                    <form @submit.prevent="handleRegister">
                        <div class="modal-body p-4">
                            <div class="mb-3">
                                <label class="form-label fw-bold small text-muted">Nome do Estabelecimento</label>
                                <input v-model="formNovaLoja.nomeNegocio" type="text" class="form-control"
                                    placeholder="Ex: Alcateia Barbearia" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-bold small text-muted">Subdomínio Desejado</label>
                                <div class="input-group">
                                    <input v-model="formNovaLoja.subdomain" type="text" class="form-control text-end"
                                        placeholder="alcateia" required pattern="[a-z0-9-]+"
                                        title="Apenas letras minúsculas, números e traços">
                                    <span class="input-group-text bg-light text-muted">.genesis.com</span>
                                </div>
                                <div class="form-text small">Como o cliente acessará o sistema.</div>
                            </div>
                            <hr class="my-4 text-muted">
                            <h6 class="fw-bold mb-3">Dados do Dono (Admin da Loja)</h6>
                            <div class="mb-3">
                                <label class="form-label fw-bold small text-muted">E-mail de Acesso</label>
                                <input v-model="formNovaLoja.email" type="email" class="form-control"
                                    placeholder="dono@email.com" required>
                            </div>
                            <div class="mb-4">
                                <label class="form-label fw-bold small text-muted">Senha Inicial</label>
                                <input v-model="formNovaLoja.password" type="password" class="form-control"
                                    placeholder="********" required minlength="6">
                            </div>
                        </div>
                        <div class="modal-footer bg-light">
                            <button type="button" class="btn btn-outline-secondary"
                                @click="fecharModalNovaLoja">Cancelar</button>
                            <button type="submit" class="btn btn-primary fw-bold px-4" :disabled="loadingRegistro">
                                <span v-if="loadingRegistro" class="spinner-border spinner-border-sm me-2"></span>
                                {{ loadingRegistro ? 'Criando...' : 'Provisionar Loja' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="modal fade" ref="modalPlanoRef" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-light">
                        <h5 class="modal-title fw-bold"><i class="bi bi-sliders text-primary me-2"></i> Configurar
                            Tenant</h5>
                        <button type="button" class="btn-close" @click="fecharModalPlano"></button>
                    </div>
                    <form @submit.prevent="handleAtualizarPlano">
                        <div class="modal-body p-4">
                            <h6 class="text-primary fw-bold mb-3">{{ formPlano.nomeNegocio }}</h6>

                            <div class="mb-4">
                                <label class="form-label fw-bold small text-muted text-uppercase">Nível do Plano
                                    SaaS</label>
                                <select class="form-select form-select-lg" v-model="formPlano.planoSaaS">
                                    <option value="BASICO">Básico (Apenas Agendamento)</option>
                                    <option value="PRO">Pro (Completo)</option>
                                    <option value="ENTERPRISE">Enterprise (Avançado)</option>
                                </select>
                            </div>

                            <label class="form-label fw-bold small text-muted text-uppercase mb-3">Módulos
                                Liberados</label>

                            <div class="list-group">
                                <label
                                    class="list-group-item d-flex justify-content-between align-items-center cursor-pointer">
                                    <span><i class="bi bi-calendar-check text-primary me-2"></i> Agendamentos</span>
                                    <div class="form-check form-switch fs-5 mb-0">
                                        <input class="form-check-input" type="checkbox"
                                            v-model="formPlano.moduloAgendamento">
                                    </div>
                                </label>
                                <label
                                    class="list-group-item d-flex justify-content-between align-items-center cursor-pointer">
                                    <span><i class="bi bi-graph-up-arrow text-success me-2"></i> Financeiro</span>
                                    <div class="form-check form-switch fs-5 mb-0">
                                        <input class="form-check-input" type="checkbox"
                                            v-model="formPlano.moduloFinanceiro">
                                    </div>
                                </label>
                                <label
                                    class="list-group-item d-flex justify-content-between align-items-center cursor-pointer">
                                    <span><i class="bi bi-box-seam text-warning me-2"></i> Produtos e Estoque</span>
                                    <div class="form-check form-switch fs-5 mb-0">
                                        <input class="form-check-input" type="checkbox"
                                            v-model="formPlano.moduloProdutos">
                                    </div>
                                </label>
                                <label
                                    class="list-group-item d-flex justify-content-between align-items-center cursor-pointer">
                                    <span><i class="bi bi-cart-check text-info me-2"></i> Vendas de Produtos</span>
                                    <div class="form-check form-switch fs-5 mb-0">
                                        <input class="form-check-input" type="checkbox"
                                            v-model="formPlano.moduloVendas">
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div class="modal-footer bg-light">
                            <button type="button" class="btn btn-outline-secondary"
                                @click="fecharModalPlano">Cancelar</button>
                            <button type="submit" class="btn btn-primary fw-bold px-4" :disabled="loadingPlano">
                                <span v-if="loadingPlano" class="spinner-border spinner-border-sm me-2"></span>
                                {{ loadingPlano ? 'Salvando...' : 'Salvar Alterações' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import axios from 'axios';
import { Toast, Modal } from 'bootstrap';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Função utilitária para buscar o config de segurança em todas as chamadas do Axios
const getConfig = () => ({
    headers: {
        'Authorization': `Bearer ${Cookies.get('access_token')}`,
        'x-tenant-id': Cookies.get('tenant_id')
    }
});

// --- ESTADOS DE UI ---
const abaAtual = ref('lojas');
const loadingDados = ref(false);
const loadingRegistro = ref(false);
const loadingPlano = ref(false);

// --- ESTADOS DO BANCO ---
const lojas = ref([]);
const funcionarios = ref([]);
const clientes = ref([]);

// --- FILTROS ---
const filtros = reactive({
    busca: '',
    lojaId: '',
    plano: '',
    status: ''
});

// --- ESTADOS DO TOAST ---
const toastRef = ref(null);
const toastInstance = ref(null);
const toastMessage = ref({ title: '', body: '', class: '' });

const showToast = (title, body, type = 'success') => {
    if (!toastRef.value) return;
    toastRef.value.className = `toast align-items-center text-white border-0 ${type === 'success' ? 'text-bg-success' : 'text-bg-danger'}`;
    toastMessage.value = { title, body };
    toastInstance.value.show();
};

// --- MODAL: NOVA LOJA ---
const modalLojaRef = ref(null);
let modalLojaInstance = null;
const formNovaLoja = reactive({ nomeNegocio: '', subdomain: '', email: '', password: '' });

const abrirModalNovaLoja = () => {
    formNovaLoja.nomeNegocio = '';
    formNovaLoja.subdomain = '';
    formNovaLoja.email = '';
    formNovaLoja.password = '';
    modalLojaInstance.show();
};

const fecharModalNovaLoja = () => {
    modalLojaInstance.hide();
};

const handleRegister = async () => {
    try {
        loadingRegistro.value = true;
        await axios.post(`${API_URL}/tenants/registrar-loja`, {
            nomeNegocio: formNovaLoja.nomeNegocio,
            subdomain: formNovaLoja.subdomain.toLowerCase(),
            email: formNovaLoja.email,
            password: formNovaLoja.password
        }, getConfig());

        showToast('Sucesso!', `A loja ${formNovaLoja.nomeNegocio} foi criada.`, 'success');
        fecharModalNovaLoja();
        await fetchDashboardDados();
    } catch (e) {
        const mensagemErro = e.response?.data?.message || 'Verifique se o subdomínio ou e-mail já existem.';
        showToast('Erro ao registrar', mensagemErro, 'danger');
    } finally {
        loadingRegistro.value = false;
    }
};

// --- MODAL: EDITAR PLANO E MÓDULOS ---
const modalPlanoRef = ref(null);
let modalPlanoInstance = null;
const formPlano = reactive({
    id: '',
    nomeNegocio: '',
    planoSaaS: 'BASICO',
    moduloAgendamento: false,
    moduloFinanceiro: false,
    moduloProdutos: false,
    moduloVendas: false
});

const abrirModalPlano = (loja) => {
    formPlano.id = loja.id;
    formPlano.nomeNegocio = loja.nomeNegocio;
    formPlano.planoSaaS = loja.planoSaaS;
    formPlano.moduloAgendamento = loja.moduloAgendamento;
    formPlano.moduloFinanceiro = loja.moduloFinanceiro;
    formPlano.moduloProdutos = loja.moduloProdutos;
    formPlano.moduloVendas = loja.moduloVendas || false;
    modalPlanoInstance.show();
};

const fecharModalPlano = () => {
    modalPlanoInstance.hide();
};

const handleAtualizarPlano = async () => {
    try {
        loadingPlano.value = true;
        await axios.patch(`${API_URL}/adm/tenants/${formPlano.id}/plano`, {
            planoSaaS: formPlano.planoSaaS,
            moduloAgendamento: formPlano.moduloAgendamento,
            moduloFinanceiro: formPlano.moduloFinanceiro,
            moduloProdutos: formPlano.moduloProdutos,
            moduloVendas: formPlano.moduloVendas
        }, getConfig());

        showToast('Atualizado!', 'As configurações da loja foram salvas.', 'success');
        fecharModalPlano();
        await fetchDashboardDados();
    } catch (e) {
        showToast('Erro', 'Não foi possível atualizar o plano do cliente.', 'danger');
    } finally {
        loadingPlano.value = false;
    }
};

// --- BLOQUEAR / DESBLOQUEAR LOJA ---
const toggleStatusLoja = async (loja) => {
    const acao = loja.ativo ? 'bloquear' : 'desbloquear';
    if (!confirm(`Você tem certeza que deseja ${acao} a loja "${loja.nomeNegocio}"?`)) return;

    try {
        await axios.patch(`${API_URL}/adm/tenants/${loja.id}/status`, {
            ativo: !loja.ativo
        }, getConfig());

        showToast('Sucesso', `A loja foi ${loja.ativo ? 'bloqueada' : 'desbloqueada'} com sucesso!`, 'success');
        await fetchDashboardDados();
    } catch (e) {
        showToast('Erro', `Falha ao tentar ${acao} a loja.`, 'danger');
    }
};

// --- BUSCAR DADOS DA API ---
const fetchDashboardDados = async () => {
    loadingDados.value = true;
    try {
        const config = getConfig();
        const [resLojas, resFunc, resClientes] = await Promise.all([
            axios.get(`${API_URL}/adm/tenants`, config),
            axios.get(`${API_URL}/adm/funcionarios`, config),
            axios.get(`${API_URL}/adm/clientes`, config)
        ]);

        lojas.value = resLojas.data;
        funcionarios.value = resFunc.data;
        clientes.value = resClientes.data;
    } catch (error) {
        showToast('Aviso', 'Não foi possível carregar os dados da plataforma.', 'danger');
    } finally {
        loadingDados.value = false;
    }
};

onMounted(() => {
    if (toastRef.value) toastInstance.value = new Toast(toastRef.value);
    if (modalLojaRef.value) modalLojaInstance = new Modal(modalLojaRef.value);
    if (modalPlanoRef.value) modalPlanoInstance = new Modal(modalPlanoRef.value);

    fetchDashboardDados();
});

// --- UTILITÁRIOS E COMPUTEDS ---
const getNomeLoja = (id) => {
    const loja = lojas.value.find(l => l.id === id);
    return loja ? loja.nomeNegocio : 'Desconhecida';
};

const limparFiltros = () => {
    filtros.busca = '';
    filtros.lojaId = '';
    filtros.plano = '';
    filtros.status = '';
};

const lojasUnicas = computed(() => lojas.value);

const lojasFiltradas = computed(() => {
    return lojas.value.filter(loja => {
        const matchBusca = loja.nomeNegocio.toLowerCase().includes(filtros.busca.toLowerCase()) ||
            loja.subdomain.toLowerCase().includes(filtros.busca.toLowerCase());
        const matchPlano = filtros.plano === '' || loja.planoSaaS === filtros.plano;
        const matchStatus = filtros.status === '' ||
            (filtros.status === 'ativo' ? loja.ativo : !loja.ativo);
        return matchBusca && matchPlano && matchStatus;
    });
});

const funcionariosFiltrados = computed(() => {
    return funcionarios.value.filter(func => {
        const matchBusca = func.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
            func.email.toLowerCase().includes(filtros.busca.toLowerCase());
        const matchLoja = filtros.lojaId === '' || func.tenantId === filtros.lojaId;
        const matchStatus = filtros.status === '' ||
            (filtros.status === 'ativo' ? func.ativo : !func.ativo);
        return matchBusca && matchLoja && matchStatus;
    });
});

const clientesFiltrados = computed(() => {
    return clientes.value.filter(cliente => {
        const matchBusca = cliente.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
            cliente.email.toLowerCase().includes(filtros.busca.toLowerCase());
        const matchLoja = filtros.lojaId === '' || cliente.tenantId === filtros.lojaId;
        return matchBusca && matchLoja;
    });
});
</script>

<style scoped>
.nav-tabs .nav-link {
    color: #6c757d;
    border: none;
    border-bottom: 2px solid transparent;
    padding-bottom: 0.75rem;
}

.nav-tabs .nav-link:hover {
    border-color: transparent;
    color: #0d6efd;
}

.nav-tabs .nav-link.active {
    color: #0d6efd;
    background-color: transparent;
    border-bottom: 2px solid #0d6efd;
}

.cursor-pointer {
    cursor: pointer;
}
</style>