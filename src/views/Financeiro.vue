<template>
    <div class="dashboard-container fade-in">

        <header class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-3">
            <div>
                <h2 class="fw-bold text-dark mb-1">
                    <i class="bi text-primary me-2" :class="isSuperAdmin ? 'bi-clouds-fill' : 'bi-wallet2'"></i>
                    {{ labels.titulo }}
                </h2>
                <p class="text-muted mb-0">{{ labels.subtitulo }}</p>

                <div v-if="isEspectador" class="badge bg-warning text-dark mt-2 border border-warning-subtle shadow-sm">
                    <i class="bi bi-eye-fill me-1"></i> Modo Espectador (Somente Leitura)
                </div>
            </div>

            <div class="d-flex gap-2 w-100 w-md-auto">
                <div class="input-group shadow-sm position-relative">
                    <span class="input-group-text bg-white border-end-0"><i class="bi bi-calendar3"></i></span>
                    <input type="date" class="form-control border-start-0 ps-0" v-model="dataInicio">
                    <span class="input-group-text bg-white border-0">até</span>
                    <input type="date" class="form-control border-start-0 ps-0" v-model="dataFim">

                    <div v-if="carregando" class="position-absolute end-0 top-50 translate-middle-y me-2 text-primary">
                        <div class="spinner-border spinner-border-sm" role="status"></div>
                    </div>
                </div>

                <button
                    class="btn btn-outline-success shadow-sm fw-bold px-3 d-none d-md-inline-flex align-items-center"
                    @click="gerarExcel" :disabled="!dadosRelatorio || carregando" title="Baixar Planilha">
                    <i class="bi bi-file-earmark-excel-fill me-1"></i> Excel
                </button>

                <button class="btn btn-success shadow-sm d-flex align-items-center gap-2 fw-bold px-4"
                    @click="abrirModalCriacao" :disabled="isEspectador">
                    <i class="bi bi-plus-lg"></i> <span class="d-none d-md-inline">{{ labels.btnNovaDespesa }}</span>
                </button>
            </div>
        </header>

        <div v-if="dadosRelatorio" class="animate-up">

            <div class="row g-4 mb-5">
                <div class="col-md-6 col-xl-3">
                    <div class="stat-card bg-white p-4 rounded-4 shadow-sm h-100 border-start border-4 border-primary">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <p class="text-uppercase text-muted fw-bold small mb-2">{{ labels.cardReceita }}</p>
                                <h3 class="fw-bold text-dark mb-0">{{ formatarValor(totais.receita) }}</h3>
                            </div>
                            <div class="icon-box bg-primary-subtle text-primary rounded-circle">
                                <i class="bi fs-4" :class="isSuperAdmin ? 'bi-cash-stack' : 'bi-graph-up-arrow'"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 col-xl-3">
                    <div class="stat-card bg-white p-4 rounded-4 shadow-sm h-100 border-start border-4"
                        :class="isSuperAdmin ? 'border-info' : 'border-warning'">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <p class="text-uppercase text-muted fw-bold small mb-2">{{ labels.cardSecundario }}</p>
                                <h3 class="fw-bold text-dark mb-0">{{ formatarValor(totais.secundario) }}</h3>
                            </div>
                            <div class="icon-box rounded-circle"
                                :class="isSuperAdmin ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning'">
                                <i class="bi fs-4" :class="isSuperAdmin ? 'bi-arrow-repeat' : 'bi-people-fill'"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 col-xl-3">
                    <div class="stat-card bg-white p-4 rounded-4 shadow-sm h-100 border-start border-4 border-danger">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <p class="text-uppercase text-muted fw-bold small mb-2">{{ labels.cardDespesa }}</p>
                                <h3 class="fw-bold text-dark mb-0">{{ formatarValor(totais.despesas) }}</h3>
                            </div>
                            <div class="icon-box bg-danger-subtle text-danger rounded-circle">
                                <i class="bi fs-4" :class="isSuperAdmin ? 'bi-server' : 'bi-lightning-charge-fill'"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 col-xl-3">
                    <div
                        class="stat-card bg-success text-white p-4 rounded-4 shadow h-100 position-relative overflow-hidden">
                        <div class="d-flex align-items-center justify-content-between position-relative z-1">
                            <div>
                                <p class="text-uppercase text-white-50 fw-bold small mb-2">{{ labels.cardLucro }}</p>
                                <h2 class="fw-bold mb-0">{{ formatarValor(totais.lucro) }}</h2>
                            </div>
                            <i class="bi display-4 opacity-25"
                                :class="isSuperAdmin ? 'bi-graph-up' : 'bi-cash-stack'"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-4 mb-5">
                <div class="col-lg-4">
                    <div class="card border-0 shadow-sm rounded-4 h-100">
                        <div class="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                            <ul class="nav nav-pills nav-fill bg-light p-1 rounded-3" role="tablist">
                                <li class="nav-item">
                                    <button class="nav-link active rounded-3 small fw-bold" data-bs-toggle="pill"
                                        data-bs-target="#tab-resumo">
                                        <i class="bi bi-file-text me-1"></i>Resumo
                                    </button>
                                </li>
                                <li class="nav-item" v-if="!isSuperAdmin">
                                    <button class="nav-link rounded-3 small fw-bold" data-bs-toggle="pill"
                                        data-bs-target="#tab-detalhes">
                                        <i class="bi bi-list-ul me-1"></i>Detalhes
                                    </button>
                                </li>
                                <li class="nav-item" v-if="isSuperAdmin">
                                    <button class="nav-link rounded-3 small fw-bold" data-bs-toggle="pill"
                                        data-bs-target="#tab-planos-saas">
                                        <i class="bi bi-layers me-1"></i>Planos
                                    </button>
                                </li>
                                <li class="nav-item">
                                    <button class="nav-link rounded-3 small fw-bold" data-bs-toggle="pill"
                                        data-bs-target="#tab-secundaria">
                                        <i class="bi me-1" :class="isSuperAdmin ? 'bi-buildings' : 'bi-people'"></i>{{
                                            labels.tabSecundaria }}
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div class="card-body p-4">
                            <div class="tab-content">

                                <div class="tab-pane fade show active" id="tab-resumo">
                                    <h5 class="fw-bold mb-4 text-dark">Demonstrativo Líquido</h5>
                                    <div class="finance-flow">
                                        <div class="d-flex justify-content-between mb-3 align-items-center">
                                            <span class="text-muted">
                                                <div class="dot bg-success"></div> Entrada Bruta
                                            </span>
                                            <span class="fw-bold text-dark">{{ formatarValor(totais.receita) }}</span>
                                        </div>
                                        <div class="d-flex justify-content-between mb-2 text-danger small">
                                            <span class="ps-3">{{ labels.cardDespesa }} (Pagas)</span>
                                            <span>- {{ formatarValor(totais.despesas) }}</span>
                                        </div>
                                        <!-- <div v-if="isSuperAdmin"
                                            class="d-flex justify-content-between mb-2 text-danger small">
                                            <span class="ps-3">Taxas de Gateway (Cartão)</span>
                                            <span>- {{ formatarValor(totais.taxasExtras) }}</span>
                                        </div> -->
                                        <hr class="my-4">
                                        <div
                                            class="bg-success bg-opacity-10 p-3 rounded-3 d-flex justify-content-between align-items-center">
                                            <span class="fw-bold text-success text-uppercase small">Resultado
                                                Líquido</span>
                                            <span class="fw-bolder fs-4 text-success">{{ formatarValor(totais.lucro)
                                                }}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="tab-pane fade" id="tab-detalhes" v-if="!isSuperAdmin">
                                    <h5 class="fw-bold mb-3 text-dark">Origem da Receita</h5>
                                    <div class="list-group list-group-flush rounded-3 mb-4">
                                        <div
                                            class="list-group-item d-flex justify-content-between px-0 py-3 border-bottom">
                                            <span class="fw-bold text-dark small text-uppercase">Total</span>
                                            <span class="fw-bold text-primary">{{ formatarValor(totais.receita)
                                                }}</span>
                                        </div>
                                        <div
                                            class="list-group-item d-flex justify-content-between px-0 py-3 border-bottom">
                                            <span>Serviços Avulsos</span>
                                            <span class="text-dark">{{ formatarValor(kpisDetalhados.avulsos) }}</span>
                                        </div>
                                        <div
                                            class="list-group-item d-flex justify-content-between px-0 py-3 border-bottom">
                                            <span>Planos (Assinaturas Clientes)</span>
                                            <span class="text-dark">{{ formatarValor(kpisDetalhados.planos) }}</span>
                                        </div>
                                        <div
                                            class="list-group-item d-flex justify-content-between px-0 py-3 border-bottom">
                                            <span>Produtos</span>
                                            <span class="text-dark">{{ formatarValor(kpisDetalhados.produtos) }}</span>
                                        </div>
                                        <div class="list-group-item d-flex justify-content-between px-0 py-3">
                                            <span>Bebidas</span>
                                            <span class="text-dark">{{ formatarValor(kpisDetalhados.bebidas) }}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="tab-pane fade" id="tab-planos-saas" v-if="isSuperAdmin">
                                    <h5 class="fw-bold mb-3 text-dark">Receita por Plano SaaS</h5>
                                    <div class="list-group list-group-flush rounded-3 mb-4"
                                        v-if="dadosRelatorio.receitaPorPlano">
                                        <div class="list-group-item d-flex justify-content-between px-0 py-3 border-bottom"
                                            v-for="(valor, plano) in dadosRelatorio.receitaPorPlano" :key="plano">
                                            <span>Plano {{ plano }}</span>
                                            <span class="text-dark">{{ formatarValor(valor) }}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="tab-pane fade" id="tab-secundaria">
                                    <h5 class="fw-bold mb-3 text-dark">{{ labels.tabSecundaria }}</h5>
                                    <div class="d-flex flex-column gap-2" style="max-height: 400px; overflow-y: auto;">
                                        <div v-if="!isSuperAdmin" v-for="barbeiro in listasSecundarias.barbeiros"
                                            :key="barbeiro.id"
                                            class="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 class="mb-1 fw-bold text-dark">{{ barbeiro.nome }}</h6>
                                                <span class="badge bg-primary-subtle text-primary border">{{
                                                    barbeiro.total }} serviços validos</span>
                                            </div>
                                            <span class="badge bg-white text-dark border">Média: {{ barbeiro.media
                                                }}</span>
                                        </div>
                                        <div v-if="isSuperAdmin" v-for="loja in listasSecundarias.lojas" :key="loja.id"
                                            class="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 class="mb-1 fw-bold text-dark">{{ loja.nomeNegocio }}</h6>
                                                <span class="badge bg-secondary text-white">Plano {{ loja.planoSaaS
                                                    }}</span>
                                            </div>
                                            <div class="text-end">
                                                <span class="fw-bold text-success d-block">{{
                                                    formatarValor(loja.valorAssinatura) }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-8">
                    <div class="card border-0 shadow-sm rounded-4 h-100">
                        <div class="card-header bg-white border-bottom-0 pt-4 px-4">
                            <ul class="nav nav-tabs card-header-tabs nav-justified" role="tablist">
                                <li class="nav-item">
                                    <button class="nav-link active" data-bs-toggle="tab"
                                        data-bs-target="#tab-historico-despesas">Despesas</button>
                                </li>
                                <li class="nav-item" v-if="!isSuperAdmin">
                                    <button class="nav-link" data-bs-toggle="tab"
                                        data-bs-target="#tab-tabela-servicos">Tabela Serviços</button>
                                </li>
                            </ul>
                        </div>

                        <div class="card-body p-4">
                            <div class="tab-content">

                                <div class="tab-pane fade show active" id="tab-historico-despesas">
                                    <div class="table-responsive" v-if="listaDespesas.length > 0"
                                        style="max-height: 400px; overflow-y: auto;">
                                        <table class="table table-hover align-middle mb-0">
                                            <thead class="bg-light sticky-top">
                                                <tr>
                                                    <th class="text-center" style="width: 50px">Pago</th>
                                                    <th>Data</th>
                                                    <th>Descrição</th>
                                                    <th>Tipo</th>
                                                    <th class="text-end">Valor</th>
                                                    <th class="text-center">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="despesa in listaDespesas" :key="despesa.id"
                                                    :class="{ 'table-success': despesa.isPaid, 'opacity-75': !despesa.isPaid }">
                                                    <td class="text-center">
                                                        <div class="form-check d-flex justify-content-center">
                                                            <input class="form-check-input" type="checkbox"
                                                                :checked="despesa.isPaid"
                                                                @change="alternarPagamento(despesa)"
                                                                :disabled="isEspectador"
                                                                style="cursor: pointer; transform: scale(1.2);">
                                                        </div>
                                                    </td>
                                                    <td class="small">{{ formatarData(despesa.date) }}</td>
                                                    <td
                                                        :class="{ 'text-decoration-line-through text-muted': despesa.isPaid }">
                                                        {{ despesa.description }}</td>
                                                    <td>
                                                        <span class="badge"
                                                            :class="despesa.type === 'FIXED' ? 'bg-info-subtle text-info-emphasis' : 'bg-warning-subtle text-warning-emphasis'">
                                                            {{ despesa.type === 'FIXED' ? 'Fixo' : 'Var' }}
                                                        </span>
                                                    </td>
                                                    <td class="text-end fw-bold"
                                                        :class="despesa.isPaid ? 'text-success' : 'text-danger'">
                                                        {{ formatarValor(despesa.amount) }}
                                                        <small v-if="!despesa.isPaid" class="d-block text-muted"
                                                            style="font-size: 0.6rem">Pendente</small>
                                                    </td>
                                                    <td class="text-center">
                                                        <button class="btn btn-sm me-2"
                                                            :class="despesa.type === 'FIXED' ? 'text-info' : 'text-warning'"
                                                            @click="trocarTipo(despesa)" :disabled="isEspectador"
                                                            title="Trocar Fixo/Var">
                                                            <i class="bi bi-arrow-repeat"></i>
                                                        </button>
                                                        <button class="btn btn-sm text-primary me-2"
                                                            @click="abrirModalEdicao(despesa)"
                                                            :disabled="isEspectador"><i
                                                                class="bi bi-pencil-square"></i></button>
                                                        <button class="btn btn-sm text-danger"
                                                            @click="prepararDelecao(despesa.id)"
                                                            :disabled="isEspectador"><i
                                                                class="bi bi-trash"></i></button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div v-else class="text-center py-4 text-muted">Nenhum custo lançado neste período.
                                    </div>
                                </div>

                                <div class="tab-pane fade" id="tab-tabela-servicos" v-if="!isSuperAdmin">
                                    <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                                        <table class="table table-sm align-middle">
                                            <thead class="bg-light sticky-top">
                                                <tr>
                                                    <th>Serviço</th>
                                                    <th class="text-center">Qtd</th>
                                                    <th class="text-end">Total Gerado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="item in servicosFiltrados" :key="item.servico">
                                                    <td>{{ item.nomeFormatado }}</td>
                                                    <td class="text-center">{{ item.quantidade }}</td>
                                                    <td class="text-end">{{
                                                        formatarValor((dadosRelatorio.valoresPorServico?.[item.servico]?.total
                                                            || 0)) }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <div class="modal fade" id="modalDespesa" tabindex="-1" ref="modalDespesaRef" data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4">
                    <div class="modal-header text-white" :class="modoEdicao ? 'bg-warning' : 'bg-danger'">
                        <h5 class="modal-title fw-bold">
                            <i class="bi" :class="modoEdicao ? 'bi-pencil-square' : 'bi-wallet-fill'"></i>
                            {{ modoEdicao ? 'Editar Lançamento' : labels.btnNovaDespesa }}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <form @submit.prevent="salvarDespesa">
                            <div class="mb-3">
                                <label>Descrição</label>
                                <input type="text" class="form-control" v-model="formDespesa.description" required>
                            </div>
                            <div class="row mb-3">
                                <div class="col-6">
                                    <label>Valor</label>
                                    <input type="number" step="0.01" class="form-control" v-model="formDespesa.amount"
                                        required>
                                </div>
                                <div class="col-6">
                                    <label>Data</label>
                                    <input type="date" class="form-control" v-model="formDespesa.date" required>
                                </div>
                            </div>

                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="modalPago"
                                    v-model="formDespesa.isPaid">
                                <label class="form-check-label" for="modalPago">Já está pago?</label>
                            </div>

                            <div class="form-check form-switch mb-4">
                                <input class="form-check-input" type="checkbox" id="tipoDespesa"
                                    v-model="formDespesa.isFixed">
                                <label class="form-check-label" for="tipoDespesa">Despesa Recorrente (Fixo
                                    Mensal)</label>
                            </div>

                            <button type="submit" class="btn w-100 fw-bold"
                                :class="modoEdicao ? 'btn-warning' : 'btn-danger'" :disabled="salvandoDespesa">
                                <span v-if="salvandoDespesa" class="spinner-border spinner-border-sm me-2"></span>
                                {{ modoEdicao ? 'Salvar Alterações' : 'Confirmar Lançamento' }}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="modalConfirmDelete" tabindex="-1" ref="modalConfirmDeleteRef">
            <div class="modal-dialog modal-dialog-centered modal-sm">
                <div class="modal-content border-0 shadow-lg">
                    <div class="modal-body text-center p-4">
                        <div class="text-danger mb-3"><i class="bi bi-exclamation-circle display-4"></i></div>
                        <h5 class="fw-bold mb-2">Tem certeza?</h5>
                        <div class="d-grid gap-2">
                            <button type="button" class="btn btn-danger fw-bold" @click="confirmarExclusao">Sim,
                                Excluir</button>
                            <button type="button" class="btn btn-light text-muted"
                                data-bs-dismiss="modal">Cancelar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="toast-container position-fixed bottom-0 end-0 p-3">
            <div id="liveToast" class="toast align-items-center border-0 text-white" :class="toastClass" role="alert"
                ref="toastRef">
                <div class="d-flex">
                    <div class="toast-body"><i :class="toastIcon"></i> {{ toastMessage }}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-toast="toast"></button>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { Modal, Toast } from 'bootstrap'
import * as XLSX from 'xlsx'
import Cookies from 'js-cookie'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// =========================================================================
//  1. O "CÉREBRO" (Identifica de onde está sendo acessado)
// =========================================================================
const isSuperAdmin = computed(() => {
    const subdomain = window.location.hostname.split('.')[0];
    return subdomain === 'adm' || subdomain === 'admin' || subdomain === 'localhost';
});

const userRole = ref(null)
const isEspectador = computed(() => userRole.value === 6);

// =========================================================================
//  2. TEXTOS DINÂMICOS (Muda conforme o usuário)
// =========================================================================
const labels = computed(() => {
    if (isSuperAdmin.value) {
        return {
            titulo: 'Financeiro Global SaaS',
            subtitulo: 'Visão consolidada de assinaturas e infraestrutura.',
            cardReceita: 'Faturamento SaaS',
            cardSecundario: 'MRR Atual',
            cardDespesa: 'Despesas',
            cardLucro: 'Lucro Líquido SaaS',
            btnNovaDespesa: 'Despesas',
            tabSecundaria: 'Tenants (Lojas)'
        };
    }
    return {
        titulo: 'Financeiro da Barbearia',
        subtitulo: 'Visão consolidada de receitas, despesas e performance.',
        cardReceita: 'Receita Bruta',
        cardSecundario: 'Comissões Pagas',
        cardDespesa: 'Custos Operacionais',
        cardLucro: 'Lucro Líquido Real',
        btnNovaDespesa: 'Nova Despesa',
        tabSecundaria: 'Performance Equipe'
    };
});

// =========================================================================
//  3. VARIÁVEIS DE ESTADO E FORMULÁRIOS
// =========================================================================
const dadosRelatorio = ref(null)
const relatorioSecundario = ref([])
const dataInicio = ref('')
const dataFim = ref('')
const carregando = ref(false)
const salvandoDespesa = ref(false)

const modalDespesaRef = ref(null)
const modalConfirmDeleteRef = ref(null)
const toastRef = ref(null)
const modoEdicao = ref(false)
const idParaEditar = ref(null)
const idParaDeletar = ref(null)
const tipoOriginal = ref(false)
const formDespesa = ref({ description: '', amount: '', date: '', isFixed: false, isPaid: false })

let bsModalDespesa = null
let bsModalDelete = null
let bsToast = null
const toastMessage = ref('')
const toastClass = ref('')
const toastIcon = ref('')

let timeoutDebounce = null;
watch([dataInicio, dataFim], () => {
    if (timeoutDebounce) clearTimeout(timeoutDebounce);
    carregando.value = true;
    timeoutDebounce = setTimeout(() => { carregarRelatorio(); }, 1500);
});

// Utilitários
const formatarValor = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
const formatarData = (d) => new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
const getLocalISODate = (date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().split('T')[0];
};
const getConfig = () => ({ headers: { 'Authorization': `Bearer ${Cookies.get('access_token')}`, 'x-tenant-id': Cookies.get('tenant_id') } });
const formatServico = (s) => s ? s.replace(/_PLANO[BPRS]+$/, '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : '';

const showToast = (msg, type = 'success') => {
    toastMessage.value = msg;
    toastClass.value = type === 'success' ? 'bg-success' : 'bg-danger';
    toastIcon.value = type === 'success' ? 'bi bi-check-circle-fill me-2' : 'bi bi-exclamation-octagon-fill me-2';
    if (!bsToast) bsToast = new Toast(toastRef.value);
    bsToast.show();
};

// =========================================================================
//  4. COMPUTEDS INTELIGENTES
// =========================================================================

const totais = computed(() => {
    if (!dadosRelatorio.value) return { receita: 0, secundario: 0, despesas: 0, lucro: 0, taxasExtras: 0 };

    if (isSuperAdmin.value) {
        const d = dadosRelatorio.value.totais;
        return {
            receita: d.receitaBrutaTotal || 0,
            secundario: d.mrrAtual || 0,
            despesas: d.custosInfraestrutura?.total || 0,
            taxasExtras: d.taxasGateway || 0,
            lucro: (d.receitaBrutaTotal || 0) - (d.custosInfraestrutura?.total || 0) - (d.taxasGateway || 0)
        };
    } else {
        const d = dadosRelatorio.value;
        const tc = d.totais.totalComissoes;
        const comissoes = (tc?.total || 0) + (tc?.consultorias || 0);
        return {
            receita: d.totais.totalFinanceiro?.receitaBrutaTotal || 0,
            secundario: comissoes,
            despesas: d.totais.custosOperacionais?.total || 0,
            taxasExtras: 0,
            lucro: d.lucroLiquidoReal || 0
        };
    }
});

const listaDespesas = computed(() => {
    if (!dadosRelatorio.value) return [];
    return isSuperAdmin.value
        ? dadosRelatorio.value.totais.custosInfraestrutura?.lista || []
        : dadosRelatorio.value.totais.custosOperacionais?.lista || [];
});

const listasSecundarias = computed(() => {
    if (!relatorioSecundario.value) return { lojas: [], barbeiros: [] };
    if (isSuperAdmin.value) {
        return { lojas: relatorioSecundario.value.sort((a, b) => b.valorAssinatura - a.valorAssinatura), barbeiros: [] };
    } else {
        return {
            lojas: [],
            barbeiros: relatorioSecundario.value.map(b => ({
                id: b.barbeiroId,
                nome: b.nomeBarbeiro,
                total: b.totalServicosRealizados || 0,
                media: ((b.totalServicosRealizados || 0) / 20).toFixed(1)
            })).sort((a, b) => b.total - a.total)
        };
    }
});

const kpisDetalhados = computed(() => {
    if (isSuperAdmin.value || !dadosRelatorio.value) return {};
    const tf = dadosRelatorio.value.totais.totalFinanceiro;
    return { avulsos: tf.avulsos, planos: tf.planos, produtos: tf.produtos, bebidas: tf.bebidas };
});

const servicosFiltrados = computed(() => {
    if (isSuperAdmin.value || !dadosRelatorio.value?.servicosRealizados) return [];
    return Object.entries(dadosRelatorio.value.servicosRealizados)
        .map(([s, q]) => ({ servico: s, quantidade: q, nomeFormatado: formatServico(s) }))
        .filter(i => i.quantidade > 0).sort((a, b) => b.quantidade - a.quantidade);
});

// =========================================================================
//  5. CHAMADAS DE API DINÂMICAS E CRUD DE DESPESAS (ROTAS ATUALIZADAS!)
// =========================================================================

const carregarRelatorio = async () => {
    carregando.value = true;
    try {
        let urlResumo = '';
        let urlSecundario = '';

        if (isSuperAdmin.value) {
            urlResumo = '/financeiro/saas/resumo';
            urlSecundario = '/financeiro/saas/lojas';
        } else {
            urlResumo = '/financeiro/resumo';
            urlSecundario = '/financeiro/equipe';
        }

        const [res1, res2] = await Promise.all([
            axios.get(`${API_URL}${urlResumo}`, { params: { inicio: dataInicio.value, fim: dataFim.value }, ...getConfig() }),
            axios.get(`${API_URL}${urlSecundario}`, { params: { inicio: `${dataInicio.value}T00:00:00`, fim: `${dataFim.value}T23:59:59` }, ...getConfig() })
        ]);

        dadosRelatorio.value = res1.data;
        relatorioSecundario.value = res2.data;
    } catch (error) {
        console.error(error);
    } finally {
        carregando.value = false;
    }
};
const salvarDespesa = async () => {
    if (isEspectador.value) return;
    salvandoDespesa.value = true;
    try {
        const ds = `${formDespesa.value.date}T12:00:00.000Z`;
        const payload = {
            description: formDespesa.value.description,
            amount: parseFloat(formDespesa.value.amount),
            date: ds,
            isPaid: formDespesa.value.isPaid
        };

        if (modoEdicao.value) {
            // 👇 Bate direto na rota unificada do Financeiro Controller
            await axios.patch(`${API_URL}/financeiro/despesas/${idParaEditar.value}`, payload, getConfig());

            if (formDespesa.value.isFixed !== tipoOriginal.value) {
                await axios.patch(`${API_URL}/financeiro/despesas/${idParaEditar.value}/tipo`, {}, getConfig());
            }
            showToast('Atualizado com sucesso!');
        } else {
            if (formDespesa.value.isFixed) {
                await axios.post(`${API_URL}/financeiro/despesas/recorrente`, { ...payload, dayOfMonth: parseInt(ds.split('-')[2]) }, getConfig());
            } else {
                await axios.post(`${API_URL}/financeiro/despesas/variavel`, payload, getConfig());
            }
            showToast('Lançamento criado!');
        }
        bsModalDespesa.hide();
        await carregarRelatorio();
    } catch (error) {
        showToast('Erro ao salvar.', 'error');
    } finally {
        salvandoDespesa.value = false;
    }
};

const alternarPagamento = async (despesa) => {
    if (isEspectador.value) return;
    try {
        await axios.patch(`${API_URL}/financeiro/despesas/${despesa.id}/status`, { isPaid: !despesa.isPaid }, getConfig());
        showToast(!despesa.isPaid ? 'Marcado como pago!' : 'Marcado como pendente.', 'success');
        await carregarRelatorio();
    } catch (error) {
        showToast('Erro ao atualizar.', 'error');
    }
};

const trocarTipo = async (despesa) => {
    if (isEspectador.value) return;
    try {
        await axios.patch(`${API_URL}/financeiro/despesas/${despesa.id}/tipo`, {}, getConfig());
        showToast('Tipo alterado (Fixo/Var).', 'success');
        await carregarRelatorio();
    } catch (error) {
        showToast('Erro ao alterar tipo.', 'error');
    }
};

const confirmarExclusao = async () => {
    if (isEspectador.value) return;
    try {
        await axios.delete(`${API_URL}/financeiro/despesas/${idParaDeletar.value}`, getConfig());
        bsModalDelete.hide();
        showToast('Excluído com sucesso!');
        await carregarRelatorio();
    } catch (error) {
        showToast('Erro ao excluir.', 'error');
    }
};

// =========================================================================
//  6. CONTROLE DE MODAIS E EXCEL
// =========================================================================

const abrirModalCriacao = () => {
    if (isEspectador.value) return;
    modoEdicao.value = false;
    idParaEditar.value = null;
    formDespesa.value = { description: '', amount: '', date: getLocalISODate(new Date()), isFixed: false, isPaid: false };
    if (!bsModalDespesa) bsModalDespesa = new Modal(modalDespesaRef.value);
    bsModalDespesa.show();
};

const abrirModalEdicao = (d) => {
    if (isEspectador.value) return;
    modoEdicao.value = true;
    idParaEditar.value = d.id;
    tipoOriginal.value = d.type === 'FIXED';
    formDespesa.value = {
        description: d.description,
        amount: d.amount,
        date: new Date(d.date).toISOString().split('T')[0],
        isFixed: d.type === 'FIXED',
        isPaid: d.isPaid
    };
    if (!bsModalDespesa) bsModalDespesa = new Modal(modalDespesaRef.value);
    bsModalDespesa.show();
};

const prepararDelecao = (id) => {
    if (isEspectador.value) return;
    idParaDeletar.value = id;
    if (!bsModalDelete) bsModalDelete = new Modal(modalConfirmDeleteRef.value);
    bsModalDelete.show();
};

const gerarExcel = () => {
    if (!dadosRelatorio.value) return;
    const wb = XLSX.utils.book_new();
    const r = [
        ["Métrica", "Valor"],
        ["Receita", totais.value.receita],
        ["Lucro", totais.value.lucro]
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(r), "Resumo");
    XLSX.writeFile(wb, isSuperAdmin.value ? 'Financeiro_SaaS.xlsx' : 'Financeiro_Barbearia.xlsx');
};

// --- Lifecycle ---
onMounted(() => {
    const cookieData = Cookies.get("saveData");
    if (cookieData) {
        try {
            const parsed = JSON.parse(cookieData);
            userRole.value = parsed.data?.role;
        } catch (e) { }
    }

    const dataRef = new Date();
    dataInicio.value = getLocalISODate(new Date(dataRef.getFullYear(), dataRef.getMonth(), 1));
    dataFim.value = getLocalISODate(new Date(dataRef.getFullYear(), dataRef.getMonth() + 1, 0));

    bsModalDespesa = new Modal(modalDespesaRef.value);
    bsModalDelete = new Modal(modalConfirmDeleteRef.value);
    bsToast = new Toast(toastRef.value);

    carregarRelatorio();
});
</script>

<style scoped>
.dashboard-container {
    padding: 2rem;
    background: #f8f9fa;
    min-height: 100vh;
}

.stat-card {
    transition: transform 0.2s;
}

.stat-card:hover {
    transform: translateY(-3px);
}

.nav-pills .nav-link.active {
    background-color: #0d6efd;
    color: white;
}

.nav-pills .nav-link {
    color: #6c757d;
    font-weight: 500;
}

.animate-up {
    animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.finance-flow .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
}
</style>