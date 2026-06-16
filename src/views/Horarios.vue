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
            <div class="col-12">
                <h2 class="fw-bold text-dark">Motor de Agendamentos</h2>
                <p class="text-muted">Gere horários disponíveis para os clientes reservarem ou gerencie a agenda
                    existente.</p>
            </div>
        </div>

        <div v-if="!temModuloAgendamento" class="alert alert-warning border-0 shadow-sm d-flex align-items-center p-4">
            <i class="bi bi-lock-fill fs-1 me-4 text-warning"></i>
            <div>
                <h5 class="fw-bold mb-1">Recurso Indisponível no seu Plano</h5>
                <p class="mb-2">O módulo de Agendamentos Online não está ativo no seu plano atual ({{ planoAtual }}).
                </p>
                <button class="btn btn-warning fw-bold btn-sm">Fazer Upgrade Agora</button>
            </div>
        </div>

        <div v-else class="row g-4 pb-5">

            <div v-if="etapa === 1" class="col-12 col-lg-8 mx-auto">
                <div class="card border-0 shadow-sm p-4 bg-white">
                    <div class="alert alert-primary bg-opacity-10 border-0 text-center mb-4">
                        Para <strong>adicionar novos horários</strong>, selecione os funcionarios abaixo.<br>
                        Para apenas consultar a agenda, clique no botão cinza ao final.
                    </div>

                    <div v-if="carregandoBarbeiros" class="text-center my-5">
                        <div class="spinner-border text-primary" role="status"></div>
                        <div class="mt-2 text-muted">Carregando profissionais...</div>
                    </div>

                    <div v-else class="row g-3">
                        <div class="col-12 col-md-6" v-for="barbeiro in barbeiros" :key="barbeiro.id">
                            <div class="d-flex justify-content-between align-items-center p-3 rounded-3 cursor-pointer user-select-none transition-all h-100"
                                :class="estaSelecionado(barbeiro) ? 'bg-primary text-white shadow' : 'bg-light border'"
                                @click="toggleBarbeiro(barbeiro)">
                                <div class="d-flex align-items-center">
                                    <div class="form-check me-3">
                                        <input class="form-check-input" type="checkbox"
                                            :checked="estaSelecionado(barbeiro)" readonly style="pointer-events: none;">
                                    </div>
                                    <img class="img_barbeiro" :src="barbeiro.img" :alt="barbeiro.nome"
                                        :class="{ 'border border-2 border-white': estaSelecionado(barbeiro) }">
                                    <div class="fw-bold ms-3">{{ barbeiro.nome }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="d-grid gap-3 mt-5">
                        <button class="btn btn-primary btn-lg fw-bold shadow-sm" @click="avancarEtapa"
                            :disabled="barbeirosSelecionados.length === 0">
                            <span v-if="barbeirosSelecionados.length === 0">Selecione para Adicionar</span>
                            <span v-else>Avançar para {{ barbeirosSelecionados.length }} Funcionário(s) <i
                                    class="bi bi-arrow-right"></i></span>
                        </button>

                        <button class="btn btn-light text-muted border-0" @click="pularParaConsulta"
                            :disabled="carregandoBarbeiros">
                            <i class="bi bi-search me-2"></i> Pular seleção e apenas consultar agendas
                        </button>
                    </div>
                </div>
            </div>

            <div v-else class="col-12">
                <div class="d-flex align-items-center mb-4">
                    <button class="btn btn-outline-secondary me-3" @click="voltarEtapa1">
                        <i class="bi bi-arrow-left"></i> Voltar
                    </button>
                    <h4 class="mb-0 fw-bold">{{ activeTab === 'adicionar' ? 'Gerar Novos Horários' : 'Consultar Agendas'
                    }}</h4>
                </div>

                <div class="card border-0 shadow-sm overflow-hidden bg-white">

                    <ul class="nav nav-tabs bg-light pt-2 px-3 border-bottom-0" id="horariosTab" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link fw-bold px-4"
                                :class="{ active: activeTab === 'adicionar', disabled: barbeirosSelecionados.length === 0 }"
                                @click="activeTab = 'adicionar'" type="button" role="tab">
                                <i class="bi bi-calendar-plus me-2"></i> Adicionar Horários
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link fw-bold px-4" :class="{ active: activeTab === 'gerenciar' }"
                                @click="selecionarTabGerenciar" type="button" role="tab">
                                <i class="bi bi-search me-2"></i> Consultar / Excluir
                            </button>
                        </li>
                    </ul>

                    <div class="tab-content position-relative" id="horariosTabContent">

                        <div v-if="showCustomModal"
                            class="custom-modal-overlay d-flex align-items-center justify-content-center">
                            <div class="card shadow-lg p-4 bg-white border-0" style="width: 320px; z-index: 1060;">
                                <h6 class="fw-bold mb-3 text-center text-dark">Adicionar Horário Específico</h6>
                                <div class="mb-3">
                                    <label class="form-label small text-muted">Digite o horário (ex: 12:30):</label>
                                    <input type="time" class="form-control form-control-lg text-center bg-light"
                                        v-model="inputHorarioCustom">
                                </div>
                                <div class="d-grid gap-2">
                                    <button class="btn btn-primary fw-bold"
                                        @click="confirmarHorarioCustom">Confirmar</button>
                                    <button class="btn btn-light" @click="showCustomModal = false">Cancelar</button>
                                </div>
                            </div>
                        </div>

                        <div class="tab-pane fade p-4" :class="{ 'show active': activeTab === 'adicionar' }"
                            role="tabpanel">

                            <div class="alert alert-info border-0 bg-opacity-10 py-2 mb-4 d-flex align-items-center"
                                v-if="barbeirosSelecionados.length > 0">
                                <i class="bi bi-info-circle-fill me-3 fs-4 text-info"></i>
                                <div>
                                    Criando agenda para: <strong class="text-dark">{{barbeirosSelecionados.map(b =>
                                        b.nome).join(', ')}}</strong>
                                </div>
                            </div>

                            <div class="row g-4">
                                <div class="col-lg-7 border-end-lg pe-lg-4">
                                    <div class="row g-3 mb-4">
                                        <div class="col-md-6">
                                            <label class="form-label fw-bold text-muted small text-uppercase">Data
                                                Inicial</label>
                                            <input type="date" class="form-control form-control-lg" v-model="dataInicio"
                                                :min="minDate">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label fw-bold text-muted small text-uppercase">Data
                                                Final</label>
                                            <input type="date" class="form-control form-control-lg" v-model="dataFim"
                                                :min="dataInicio">
                                        </div>
                                    </div>

                                    <div class="card border bg-light shadow-none">
                                        <div class="card-header bg-transparent border-bottom pt-3 pb-2">
                                            <h6 class="mb-0 fw-bold">Monte a Grade de Horários</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="d-flex flex-wrap gap-2 mb-4">
                                                <button v-for="(hora, index) in horasDisponiveis" :key="index"
                                                    class="btn"
                                                    :class="{ 'btn-outline-secondary bg-white': !horariosTemplate.includes(hora), 'btn-primary shadow-sm': horariosTemplate.includes(hora) }"
                                                    @click="toggleHorarioTemplate(hora)">
                                                    {{ hora }}
                                                </button>

                                                <button class="btn btn-outline-secondary bg-white dashed-border"
                                                    @click="abrirModalCustom" title="Adicionar horário específico">
                                                    <i class="bi bi-plus-lg text-primary"></i> Novo
                                                </button>
                                            </div>

                                            <div class="d-grid">
                                                <button class="btn btn-dark btn-lg fw-bold"
                                                    @click="adicionarIntervaloAFila"
                                                    :disabled="horariosTemplate.length === 0">
                                                    Adicionar à Fila de Envio <span
                                                        class="badge bg-light text-dark ms-2">{{ calcularDias }}
                                                        dia(s)</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-lg-5">
                                    <div class="d-flex flex-column h-100 bg-light rounded-3 p-3 border">
                                        <h6
                                            class="fw-bold text-dark mb-3 d-flex justify-content-between align-items-center">
                                            🛒 Fila de Processamento
                                            <span class="badge bg-primary rounded-pill px-3"
                                                v-if="totalHorariosNaFila > 0">{{ totalHorariosNaFila }} slots</span>
                                        </h6>

                                        <div v-if="Object.keys(filaHorarios).length === 0"
                                            class="text-center text-muted py-5 my-auto">
                                            <i class="bi bi-inbox display-4 opacity-50"></i>
                                            <p class="mt-3 mb-0">A fila está vazia.</p>
                                            <small>Gere os horários ao lado para vê-los aqui.</small>
                                        </div>

                                        <div v-else class="resumo-container mb-3 flex-grow-1 pe-2"
                                            style="max-height: 380px; overflow-y: auto;">
                                            <div v-for="(horas, data) in filaHorariosOrdenada" :key="data"
                                                class="card mb-2 shadow-sm border-0">
                                                <div
                                                    class="card-header d-flex justify-content-between align-items-center bg-white py-2 border-bottom-0">
                                                    <span class="fw-bold text-primary">{{ formatarData(data) }} <small
                                                            class="text-muted fw-normal ms-1">({{ getDiaSemana(data)
                                                            }})</small></span>
                                                    <button class="btn btn-sm btn-light text-danger rounded-circle"
                                                        @click="removerDiaDaFila(data)"><i
                                                            class="bi bi-trash"></i></button>
                                                </div>
                                                <div class="card-body p-2 bg-light border-top">
                                                    <div class="d-flex flex-wrap gap-1">
                                                        <span v-for="h in horas" :key="h"
                                                            class="badge bg-white text-dark border shadow-sm">{{ h
                                                            }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div v-if="Object.keys(filaHorarios).length > 0"
                                            class="mt-auto pt-3 border-top">
                                            <div class="d-grid gap-2">
                                                <button class="btn btn-success btn-lg fw-bold shadow-sm"
                                                    @click="salvarHorariosEmMassa" :disabled="loading">
                                                    <span v-if="loading"
                                                        class="spinner-border spinner-border-sm me-2"></span>
                                                    <i v-else class="bi bi-cloud-arrow-up me-2"></i> Gravar no Banco de
                                                    Dados
                                                </button>
                                                <button class="btn btn-link text-danger text-decoration-none btn-sm"
                                                    @click="limparFila">Limpar toda a fila</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="tab-pane fade p-4" :class="{ 'show active': activeTab === 'gerenciar' }"
                            role="tabpanel">

                            <div class="row bg-light p-3 rounded-3 mb-4 mx-0 border">
                                <div class="col-md-6 mb-3 mb-md-0">
                                    <label class="form-label fw-bold text-muted small text-uppercase">Agenda do
                                        Profissional:</label>
                                    <select class="form-select border-0 shadow-sm" v-model="barbeiroVisualizacaoId"
                                        @change="fetchHorariosCadastrados">
                                        <option v-for="b in barbeiros" :key="b.id" :value="b.id">✂️ {{ b.nome }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold text-muted small text-uppercase">Data
                                        Específica:</label>
                                    <div class="input-group shadow-sm">
                                        <input type="date" class="form-control border-0" v-model="dataGerenciar"
                                            @change="fetchHorariosCadastrados">
                                        <button class="btn btn-white border-0 bg-white text-primary fw-bold"
                                            @click="resetDateGerenciar">Hoje</button>
                                    </div>
                                </div>
                            </div>

                            <div v-if="carregandoHorarios" class="text-center my-5 py-5">
                                <div class="spinner-border text-primary" role="status"></div>
                                <div class="mt-2 text-muted">Buscando horários no banco...</div>
                            </div>

                            <div v-else-if="horariosCadastrados.length > 0" class="row">
                                <div class="col-md-8 mx-auto">
                                    <ul class="list-group shadow-sm border-0">
                                        <li v-for="horario in horariosCadastradosOrdenados" :key="horario.id"
                                            class="list-group-item d-flex justify-content-between align-items-center py-3 border-start-0 border-end-0">
                                            <div class="d-flex align-items-center gap-3">
                                                <i class="bi bi-clock text-muted"></i>
                                                <span class="fs-5 fw-bold font-monospace">{{ horario.horario ||
                                                    horario.horaInicio }}</span>
                                                <span v-if="horario.disponivel === false"
                                                    class="badge bg-danger bg-opacity-10 text-danger border border-danger rounded-pill px-3">Reservado</span>
                                                <span v-else
                                                    class="badge bg-success bg-opacity-10 text-success border border-success rounded-pill px-3">Livre</span>
                                            </div>
                                            <button class="btn btn-light text-danger btn-sm rounded-circle"
                                                @click="deletarHorario(horario, $event)"
                                                :disabled="horario.disponivel === false" title="Excluir Horário">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div v-else class="text-center py-5 bg-light rounded-3 mt-3 border dashed-border">
                                <i class="bi bi-calendar-x display-4 text-muted opacity-50"></i>
                                <p class="text-muted mt-3 mb-0 fs-5">Nenhum horário gerado para <strong>{{
                                    formatarData(dataGerenciar) }}</strong>.</p>
                                <p class="small text-muted">Acesse a aba "Adicionar Horários" para criar a agenda.</p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { Toast } from 'bootstrap'
import Cookies from 'js-cookie' // 👇 IMPORTAÇÃO ADICIONADA

// CONFIGURAÇÃO DA API USANDO O PADRÃO VITE
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 👇 FUNÇÃO MÁGICA ADICIONADA PARA ENVIAR O CABEÇALHO DO TENANT
const getConfig = () => ({
    headers: {
        'Authorization': `Bearer ${Cookies.get('access_token')}`,
        'x-tenant-id': Cookies.get('tenant_id')
    }
});

// --- ESTADOS GERAIS DO COMPONENTE ---
const temModuloAgendamento = ref(true);
const planoAtual = ref('BÁSICO');
const etapa = ref(1);
const activeTab = ref('adicionar')
const barbeirosSelecionados = ref([]);
const barbeiroVisualizacaoId = ref(null);

const barbeiros = ref([]);
const carregandoBarbeiros = ref(true);

// --- BUSCA DE BARBEIROS NO BACKEND ---
const buscarBarbeirosDinamicos = async () => {
    try {
        carregandoBarbeiros.value = true;
        // 👇 getConfig() APLICADO AQUI
        const response = await axios.get(`${API_URL}/funcionarios`, getConfig());
        barbeiros.value = response.data.map(b => ({
            id: b.idBarbeiro || b.id, // Adicionado fallback para b.id caso a API tenha mudado
            nome: b.nome,
            img: b.fotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.nome)}&background=2c3e50&color=fff&size=128`
        }));
    } catch (error) {
        showToast("Aviso", "Não foi possível carregar os profissionais do banco de dados.", "warning");
    } finally {
        carregandoBarbeiros.value = false;
    }
};

// --- TOAST NOTIFICATION ---
const toastRef = ref(null);
const toastInstance = ref(null);
const toastMessage = ref({ title: '', body: '', class: '' });

onMounted(async () => {
    // 1. Inicializa os Toasts do Bootstrap
    if (toastRef.value) toastInstance.value = new Toast(toastRef.value);

    // 2. Lê as permissões de plano
    const savedFeatures = localStorage.getItem('tenant_features');
    if (savedFeatures) {
        const features = JSON.parse(savedFeatures);
        temModuloAgendamento.value = features.agendamento === true || features.agendamento == 1 || features.agendamento === "true";
        planoAtual.value = features.plano || 'BÁSICO';
    } else {
        temModuloAgendamento.value = false;
    }

    // 3. Busca a equipe
    if (temModuloAgendamento.value) {
        await buscarBarbeirosDinamicos();
    }
})

const showToast = (title, body, type = 'success') => {
    if (!toastRef.value) return;
    toastRef.value.className = `toast align-items-center text-white border-0 ${type === 'success' ? 'text-bg-success' : type === 'warning' ? 'text-bg-warning' : 'text-bg-danger'}`;
    toastMessage.value = { title, body };
    toastInstance.value.show();
}

// --- ESTADOS: ABA ADICIONAR ---
const loading = ref(false);
const dataInicio = ref(getHoje());
const dataFim = ref(getHoje());
const horariosTemplate = ref([]);
const filaHorarios = ref({});

const horasDisponiveis = ref([
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00',
    '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
]);

const showCustomModal = ref(false);
const inputHorarioCustom = ref('');

// --- ESTADOS: ABA GERENCIAR ---
const carregandoHorarios = ref(false);
const horariosCadastrados = ref([]);
const dataGerenciar = ref(getHoje());

// --- FUNÇÕES UTILITÁRIAS ---
function getHoje() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
}

const formatarData = (s) => s ? s.split('-').reverse().join('/') : '';
const getDiaSemana = (s) => {
    const [y, m, d] = s.split('-').map(Number);
    return ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][new Date(y, m - 1, d).getDay()];
}

// --- COMPUTEDS ---
const minDate = computed(() => getHoje());

const calcularDias = computed(() => {
    if (!dataInicio.value || !dataFim.value) return 0;
    const diff = new Date(dataFim.value) - new Date(dataInicio.value);
    return Math.ceil(diff / (86400000)) + 1;
})

const totalHorariosNaFila = computed(() => Object.values(filaHorarios.value).flat().length);

const filaHorariosOrdenada = computed(() => {
    return Object.keys(filaHorarios.value).sort().reduce((obj, key) => {
        obj[key] = filaHorarios.value[key]; return obj;
    }, {});
});

const horariosCadastradosOrdenados = computed(() => {
    return [...horariosCadastrados.value].sort((a, b) => (a.horaInicio || a.horario || '').localeCompare(b.horaInicio || b.horario || ''));
});

// --- LÓGICA DE NAVEGAÇÃO E SELEÇÃO ---
const estaSelecionado = (b) => barbeirosSelecionados.value.some(sel => sel.id === b.id);

const toggleBarbeiro = (b) => {
    const idx = barbeirosSelecionados.value.findIndex(sel => sel.id === b.id);
    if (idx === -1) barbeirosSelecionados.value.push(b);
    else barbeirosSelecionados.value.splice(idx, 1);
}

const avancarEtapa = () => {
    if (barbeirosSelecionados.value.length > 0) {
        etapa.value = 2;
        activeTab.value = 'adicionar';
        barbeiroVisualizacaoId.value = barbeirosSelecionados.value[0].id;
    }
}

const pularParaConsulta = () => {
    etapa.value = 2;
    activeTab.value = 'gerenciar';
    barbeirosSelecionados.value = [];
    if (barbeiros.value.length > 0) {
        barbeiroVisualizacaoId.value = barbeiros.value[0].id;
    }
    fetchHorariosCadastrados();
}

const voltarEtapa1 = () => {
    etapa.value = 1;
    filaHorarios.value = {};
    horariosCadastrados.value = [];
    showCustomModal.value = false;
}

// --- LÓGICA DE ADIÇÃO DE HORÁRIOS ---
const toggleHorarioTemplate = (h) => {
    const i = horariosTemplate.value.indexOf(h);
    if (i === -1) horariosTemplate.value.push(h);
    else horariosTemplate.value.splice(i, 1);
}

const abrirModalCustom = () => {
    inputHorarioCustom.value = '';
    showCustomModal.value = true;
}

const confirmarHorarioCustom = () => {
    if (!inputHorarioCustom.value) return;
    const novaHora = inputHorarioCustom.value;

    if (!horasDisponiveis.value.includes(novaHora)) {
        horasDisponiveis.value.push(novaHora);
        horasDisponiveis.value.sort();
    }

    if (!horariosTemplate.value.includes(novaHora)) {
        horariosTemplate.value.push(novaHora);
        horariosTemplate.value.sort();
    }

    showCustomModal.value = false;
}

const adicionarIntervaloAFila = () => {
    if (horariosTemplate.value.length === 0) return showToast('Atenção', 'Selecione pelo menos um horário.', 'warning');

    let curr = new Date(dataInicio.value + 'T12:00:00');
    const end = new Date(dataFim.value + 'T12:00:00');
    let count = 0;

    while (curr <= end) {
        const key = curr.toISOString().split('T')[0];
        if (!filaHorarios.value[key]) filaHorarios.value[key] = [];

        horariosTemplate.value.forEach(h => {
            if (!filaHorarios.value[key].includes(h)) filaHorarios.value[key].push(h);
        });

        filaHorarios.value[key].sort();
        curr.setDate(curr.getDate() + 1);
        count++;
    }
    showToast('Pronto', `${count} dia(s) processado(s). Não se esqueça de Gravar no Banco.`, 'success');
}

const salvarHorariosEmMassa = async () => {
    if (totalHorariosNaFila.value === 0 || barbeirosSelecionados.value.length === 0) return;
    loading.value = true;
    try {
        const listaDiasHoras = Object.entries(filaHorarios.value).map(([d, h]) => ({ data: d, horas: h }));

        // 👇 getConfig() APLICADO AQUI
        await axios.post(`${API_URL}/funcionarios/abrir-agenda`, {
            agendas: barbeirosSelecionados.value.map(b => ({ funcionarioId: b.id, horarios: listaDiasHoras }))
        }, getConfig());

        showToast('Sucesso', 'Agenda salva no banco de dados com sucesso!', 'success');
        filaHorarios.value = {};
    } catch (e) {
        let msg = e.response?.data?.message || 'Falha de conexão com o servidor.';
        showToast('Erro ao Salvar', msg, 'danger');
    } finally {
        loading.value = false;
    }
}

const removerDiaDaFila = (d) => delete filaHorarios.value[d];
const limparFila = () => { if (confirm('Esvaziar toda a fila de envio?')) filaHorarios.value = {}; }

// --- LÓGICA DE GERENCIAMENTO (CONSULTA) ---
const selecionarTabGerenciar = () => { activeTab.value = 'gerenciar'; fetchHorariosCadastrados(); }
const resetDateGerenciar = () => { dataGerenciar.value = getHoje(); fetchHorariosCadastrados(); }

const fetchHorariosCadastrados = async () => {
    if (!dataGerenciar.value || !barbeiroVisualizacaoId.value) return;
    carregandoHorarios.value = true;
    try {
        // 👇 mesclando os headers do getConfig() junto com os parâmetros (params) da requisição
        const config = getConfig();
        config.params = { inicio: dataGerenciar.value, fim: dataGerenciar.value };

        const res = await axios.get(`${API_URL}/funcionarios/${barbeiroVisualizacaoId.value}/horarios`, config);
        horariosCadastrados.value = res.data.horarios || [];
    } catch (e) {
        console.error(e);
    } finally {
        carregandoHorarios.value = false;
    }
}

const deletarHorario = async (h, evt) => {
    if (!confirm(`Tem certeza que deseja excluir o horário das ${h.horario || h.horaInicio}?`)) return;
    evt.currentTarget.disabled = true;
    try {
        // 👇 getConfig() APLICADO AQUI
        await axios.delete(`${API_URL}/funcionarios/horarios/${h.id}`, getConfig());
        showToast('Removido', 'Horário excluído com sucesso.', 'success');
        await fetchHorariosCadastrados();
    } catch (e) {
        evt.currentTarget.disabled = false;
        showToast('Erro', 'Falha ao excluir o horário.', 'danger');
    }
}

</script>

<style scoped>
.img_barbeiro {
    height: 60px;
    width: 60px;
    border-radius: 50%;
    object-fit: cover;
}

.cursor-pointer {
    cursor: pointer;
}

.transition-all {
    transition: all 0.2s ease;
}

.resumo-container::-webkit-scrollbar {
    width: 6px;
}

.resumo-container::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
}

.dashed-border {
    border-style: dashed;
    border-width: 2px;
}

.border-end-lg {
    border-right: 1px solid #dee2e6;
}

@media (max-width: 991.98px) {
    .border-end-lg {
        border-right: none;
        border-bottom: 1px solid #dee2e6;
        padding-bottom: 1.5rem;
        margin-bottom: 1.5rem;
    }
}

/* Overlay centralizado e escuro para o modal customizado de hora */
.custom-modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
    z-index: 1055;
    border-radius: 0.375rem;
}
</style>