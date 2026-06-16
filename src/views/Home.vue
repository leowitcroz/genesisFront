<template>
    <div class="container-fluid position-relative">

        <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1100">
            <div ref="toastRef" class="toast align-items-center text-white border-0" role="alert" aria-live="assertive"
                aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <i :class="toastIcon" class="me-2"></i> {{ toastMessage }}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"
                        aria-label="Close"></button>
                </div>
            </div>
        </div>

        <div v-if="isSuperAdmin">
            <div class="row mb-4 border-bottom pb-3">
                <div class="col-12 d-flex justify-content-between align-items-center">
                    <div>
                        <h2 class="fw-bold text-primary mb-1">
                            <i class="bi bi-globe me-2"></i> Genesis Cloud - Central
                        </h2>
                        <p class="text-muted mb-0">Visão global de todos os clientes, planos e faturamento da
                            plataforma.</p>
                    </div>
                    <span class="badge bg-dark fs-6 py-2 px-3">
                        <i class="bi bi-shield-lock-fill me-2"></i> Super Admin
                    </span>
                </div>
            </div>
        </div>

        <div v-else>
            <div class="row mb-4 border-bottom pb-3">
                <div class="col-12 d-flex justify-content-between align-items-center flex-wrap">
                    <div>
                        <h2 class="fw-bold text-dark mb-1">Painel de Controle - {{ nomeEmpresa }}</h2>
                        <p class="text-muted mb-0">Bem-vindo ao centro de comando do seu estabelecimento.</p>
                    </div>
                    <div class="d-flex gap-2 mt-3 mt-md-0">
                        <button class="btn btn-outline-primary fw-bold shadow-sm" data-bs-toggle="modal"
                            data-bs-target="#modalEquipe">
                            <i class="bi bi-people-fill me-1"></i> Equipe
                        </button>
                        <button class="btn btn-warning fw-bold shadow-sm d-flex align-items-center gap-2">
                            <i class="bi bi-star-fill"></i> Meu Plano VIP
                        </button>
                    </div>
                </div>
            </div>

            <div class="row g-3 mb-4">
                <div v-if="temModuloFinanceiro" class="col-md-3">
                    <div class="card border-0 shadow-sm p-4 bg-white h-100">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <h6 class="text-muted text-uppercase small fw-bold">Faturamento (Mês)</h6>
                                <h3 class="fw-bold m-0 text-success">{{ formatarMoeda(dashboard.faturamentoMes) }}</h3>
                            </div>
                            <div class="bg-light-success p-3 rounded text-success bg-opacity-10">
                                <i class="bi bi-currency-dollar fs-3"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="card border-0 shadow-sm p-4 bg-white h-100">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <h6 class="text-muted text-uppercase small fw-bold">Agendamentos Hoje</h6>
                                <h3 class="fw-bold m-0 text-primary">{{ dashboard.agendamentosHoje }}</h3>
                            </div>
                            <div class="bg-light-primary p-3 rounded text-primary bg-opacity-10">
                                <i class="bi bi-calendar-check fs-3"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="temModuloFinanceiro" class="col-md-3">
                    <div class="card border-0 shadow-sm p-4 bg-white h-100">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <h6 class="text-muted text-uppercase small fw-bold">Despesas Pendentes</h6>
                                <h3 class="fw-bold m-0 text-danger">{{ formatarMoeda(dashboard.despesasPendentes) }}
                                </h3>
                            </div>
                            <div class="bg-light-danger p-3 rounded text-danger bg-opacity-10">
                                <i class="bi bi-cash-stack fs-3"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="card border-0 shadow-sm p-4 bg-white h-100">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <h6 class="text-muted text-uppercase small fw-bold">Novos Clientes (Mês)</h6>
                                <h3 class="fw-bold m-0 text-info">{{ dashboard.novosClientes }}</h3>
                            </div>
                            <div class="bg-light-info p-3 rounded text-info bg-opacity-10">
                                <i class="bi bi-people fs-3"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <h5 class="fw-bold mb-3 mt-5 border-bottom pb-2">Módulos Administrativos</h5>
            <div class="row g-4 mb-5">
                <div class="col-12 col-md-4">
                    <div class="card border-0 shadow-sm p-4 h-100">
                        <h6 class="fw-bold mb-3"><i class="bi bi-calendar-week text-primary me-2"></i> Operacional</h6>
                        <div class="d-grid gap-2">
                            <button v-if="temModuloAgendamento" class="btn btn-outline-secondary text-start"
                                data-bs-toggle="modal" data-bs-target="#modalListaAgendamentos"
                                @click="carregarAgendamentosDaBarbearia">
                                <i class="bi bi-list-ul me-2"></i> Ver Todos os Agendamentos
                            </button>

                            <button class="btn btn-outline-secondary text-start" data-bs-toggle="modal"
                                data-bs-target="#modalServicos">
                                <i class="bi bi-scissors me-2"></i> Gerenciar Serviços (CRUD)
                            </button>

                            <button v-if="temModuloAgendamento" class="btn btn-outline-secondary text-start"
                                data-bs-toggle="modal" data-bs-target="#modalAgendamento">
                                <i class="bi bi-calendar-plus me-2"></i> Criar Novo Agendamento
                            </button>

                            <button @click="irParaHorarios" class="btn btn-outline-primary text-start fw-bold mt-2">
                                <i class="bi bi-clock-history me-2"></i> Grade Rápida de Horários
                            </button>
                        </div>
                    </div>
                </div>

                <div v-if="temModuloProdutos || temModuloVendas" class="col-12 col-md-4">
                    <div class="card border-0 shadow-sm p-4 h-100">
                        <h6 class="fw-bold mb-3"><i class="bi bi-box-seam text-warning me-2"></i> Produtos & Estoque
                        </h6>
                        <div class="d-grid gap-2">
                            <button v-if="temModuloVendas" class="btn btn-outline-secondary text-start"
                                data-bs-toggle="modal" data-bs-target="#modalVendaProduto">
                                <i class="bi bi-cart-plus me-2"></i> Nova Venda de Produto
                            </button>

                            <!-- 👇 NOVO: Botão de Histórico de Vendas -->
                            <button v-if="temModuloVendas" class="btn btn-outline-secondary text-start"
                                data-bs-toggle="modal" data-bs-target="#modalHistoricoVendas"
                                @click="carregarHistoricoVendas">
                                <i class="bi bi-clock-history me-2"></i> Histórico de Vendas
                            </button>

                            <button v-if="temModuloProdutos" class="btn btn-outline-secondary text-start"
                                data-bs-toggle="modal" data-bs-target="#modalProdutos">
                                <i class="bi bi-tags me-2"></i> Cadastro de Produtos (CRUD)
                            </button>

                            <button v-if="temModuloProdutos" class="btn btn-outline-secondary text-start"
                                data-bs-toggle="modal" data-bs-target="#modalEstoque">
                                <i class="bi bi-boxes me-2"></i> Controle de Estoque
                            </button>
                        </div>
                    </div>
                </div>

                <div v-if="temModuloFinanceiro" class="col-12 col-md-4">
                    <div class="card border-0 shadow-sm p-4 h-100">
                        <h6 class="fw-bold mb-3"><i class="bi bi-graph-up-arrow text-success me-2"></i> Financeiro &
                            Equipe</h6>
                        <div class="d-grid gap-2">
                            <button class="btn btn-outline-secondary text-start" @click="router.push('/financeiro')">
                                <i class="bi bi-pie-chart me-2"></i> Relatório Financeiro Geral
                            </button>
                            <button class="btn btn-outline-secondary text-start">
                                <i class="bi bi-person-lines-fill me-2"></i> Comissões de Funcionários
                            </button>
                            <button class="btn btn-outline-secondary text-start" @click="router.push('/financeiro')">
                                <i class="bi bi-receipt me-2"></i> Lançar Despesa / Contas a Pagar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- MODAL: EQUIPE -->
        <div class="modal fade" id="modalEquipe" tabindex="-1" aria-hidden="true" v-if="!isSuperAdmin">
            <!-- (Conteúdo do Modal de Equipe original preservado) -->
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-dark text-white border-0">
                        <h5 class="modal-title fw-bold"><i class="bi bi-people me-2"></i> Equipe Profissional</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                            aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <div class="card border-0 shadow-sm mb-4">
                            <div class="card-header bg-white border-bottom-0 pt-3">
                                <h6 class="fw-bold text-primary mb-0">Cadastrar Novo Membro</h6>
                            </div>
                            <div class="card-body">
                                <form @submit.prevent="salvarFuncionario">
                                    <div class="row g-2">
                                        <div class="col-md-5">
                                            <input v-model="novoFuncionario.nome" type="text" class="form-control"
                                                placeholder="Nome Completo" required>
                                        </div>
                                        <div class="col-md-5">
                                            <input v-model="novoFuncionario.email" type="email" class="form-control"
                                                placeholder="E-mail (Para Login)" required>
                                        </div>
                                        <div class="col-md-2">
                                            <button type="submit" class="btn btn-primary w-100"
                                                :disabled="salvandoFuncionario">
                                                <span v-if="salvandoFuncionario"
                                                    class="spinner-border spinner-border-sm" role="status"></span>
                                                <i v-else class="bi bi-plus-lg"></i> Criar
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div class="card border-0 shadow-sm">
                            <div
                                class="card-header bg-white border-bottom-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                                <h6 class="fw-bold mb-0">Membros Ativos</h6>
                                <button @click="carregarEquipe" class="btn btn-sm btn-outline-secondary border-0"><i
                                        class="bi bi-arrow-clockwise"></i></button>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive" v-if="equipe.length > 0">
                                    <table class="table table-hover align-middle mb-0">
                                        <tbody>
                                            <tr v-for="membro in equipe" :key="membro.id">
                                                <td>
                                                    <h6 class="mb-0 fw-bold">{{ membro.nome }}</h6>
                                                </td>
                                                <td class="text-end">
                                                    <button @click="abrirHorarios(membro.id)"
                                                        class="btn btn-sm btn-outline-dark" data-bs-dismiss="modal"><i
                                                            class="bi bi-calendar3 me-1"></i> Horários</button>
                                                </td>
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

        <!-- MODAL: SERVIÇOS -->
        <div class="modal fade" id="modalServicos" tabindex="-1" aria-hidden="true" v-if="!isSuperAdmin">
            <!-- (Conteúdo do Modal de Serviços original preservado) -->
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-dark text-white border-0">
                        <h5 class="modal-title fw-bold"><i class="bi bi-scissors me-2"></i> Serviços e Preços</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                            aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <div class="card border-0 shadow-sm mb-4">
                            <div class="card-header bg-white border-bottom-0 pt-3">
                                <h6 class="fw-bold text-primary mb-0">Cadastrar Novo Serviço</h6>
                            </div>
                            <div class="card-body">
                                <form @submit.prevent="salvarServico">
                                    <div class="row g-2">
                                        <div class="col-md-6"><input v-model="novoServico.nome" type="text"
                                                class="form-control" required></div>
                                        <div class="col-md-3">
                                            <div class="input-group"><span
                                                    class="input-group-text bg-light border-end-0">R$</span><input
                                                    v-model="novoServico.valor" type="number" step="0.01"
                                                    class="form-control border-start-0 ps-0" required></div>
                                        </div>
                                        <div class="col-md-3"><button type="submit"
                                                class="btn btn-primary w-100 fw-bold">Adicionar</button></div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div class="card border-0 shadow-sm">
                            <div
                                class="card-header bg-white border-bottom-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                                <h6 class="fw-bold mb-0">Catálogo de Serviços</h6>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive" v-if="servicos.length > 0">
                                    <table class="table table-hover align-middle mb-0">
                                        <thead class="table-light">
                                            <tr>
                                                <th>Nome do Serviço</th>
                                                <th style="width: 150px;">Valor</th>
                                                <th class="text-end" style="width: 120px;">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="servico in servicos" :key="servico.id">
                                                <td class="fw-medium text-dark">{{ servico.nome }}</td>
                                                <td><span class="badge bg-success-subtle text-success border">{{
                                                    formatarMoeda(servico.valor) }}</span></td>
                                                <td class="text-end text-nowrap"><button
                                                        @click="deletarServico(servico.id)"
                                                        class="btn btn-sm btn-light text-danger rounded-circle shadow-sm"><i
                                                            class="bi bi-trash"></i></button></td>
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

        <!-- MODAL: NOVO AGENDAMENTO -->
        <div class="modal fade" id="modalAgendamento" tabindex="-1" aria-hidden="true" v-if="!isSuperAdmin">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-dark text-white border-0">
                        <h5 class="modal-title fw-bold"><i class="bi bi-calendar-plus me-2"></i> Novo Agendamento</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                            aria-label="Close" id="btnFecharModalAgendamento"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <form @submit.prevent="salvarAgendamento">
                            <div class="row g-3 mb-4">
                                <div class="col-md-12">
                                    <label class="form-label fw-bold small text-muted text-uppercase">Nome do
                                        Cliente</label>
                                    <input v-model="formAgendamento.nomeCliente" type="text"
                                        class="form-control form-control-lg" placeholder="Nome do cliente (Avulso)"
                                        required>
                                </div>
                                <div class="col-md-6">
                                    <label
                                        class="form-label fw-bold small text-muted text-uppercase">Profissional</label>
                                    <select v-model="formAgendamento.funcionarioId" class="form-select form-select-lg"
                                        @change="buscarHorariosLivres" required>
                                        <option value="" disabled selected>Selecione...</option>
                                        <option v-for="membro in equipe" :key="membro.id" :value="membro.id">{{
                                            membro.nome }}</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold small text-muted text-uppercase">Data</label>
                                    <input v-model="formAgendamento.data" type="date"
                                        class="form-control form-control-lg" :min="getHoje()"
                                        @change="buscarHorariosLivres" required>
                                </div>
                            </div>

                            <div v-if="formAgendamento.funcionarioId && formAgendamento.data" class="mb-4">
                                <label class="form-label fw-bold small text-muted text-uppercase">Horários
                                    Livres</label>
                                <div v-if="carregandoHorariosLivre" class="text-primary small"><span
                                        class="spinner-border spinner-border-sm me-2"></span> Buscando horários...</div>
                                <div v-else-if="horariosLivres.length === 0" class="alert alert-warning border-0 py-2">
                                    Nenhum horário livre encontrado para esta data.</div>
                                <div v-else class="d-flex flex-wrap gap-2">
                                    <div v-for="horario in horariosLivres" :key="horario.id" class="form-check p-0">
                                        <input type="radio" class="btn-check" :id="'hora_' + horario.id"
                                            :value="horario.id" v-model="formAgendamento.horarioId" required>
                                        <label class="btn btn-outline-primary" :for="'hora_' + horario.id">{{
                                            horario.horaInicio || horario.horario }}</label>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-4">
                                <label class="form-label fw-bold small text-muted text-uppercase">Serviços
                                    Desejados</label>
                                <div class="card border-0 shadow-sm">
                                    <div class="card-body p-2" style="max-height: 200px; overflow-y: auto;">
                                        <label v-for="servico in servicos" :key="servico.id"
                                            class="d-flex align-items-center mb-2 custom-checkbox-card p-3 rounded border border-light cursor-pointer w-100 m-0"
                                            :for="'srv_' + servico.id">
                                            <input class="form-check-input m-0 flex-shrink-0 cursor-pointer"
                                                type="checkbox" :value="servico.id" :id="'srv_' + servico.id"
                                                v-model="formAgendamento.servicoIds" style="transform: scale(1.3);">
                                            <div
                                                class="ms-3 d-flex justify-content-between w-100 align-items-center mt-1">
                                                <span class="fw-bold text-dark">{{ servico.nome }}</span>
                                                <span
                                                    class="text-success fw-bold bg-success bg-opacity-10 px-2 py-1 rounded">{{
                                                        formatarMoeda(servico.valor) }}</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div class="row align-items-center bg-white p-3 rounded-3 shadow-sm border mt-4 mx-0">
                                <div class="col-md-6 mb-3 mb-md-0">
                                    <label class="form-label fw-bold small text-muted text-uppercase">Pagamento</label>
                                    <select v-model="formAgendamento.formaPagamento"
                                        class="form-select border-0 bg-light" required>
                                        <option value="DINHEIRO">Dinheiro (Local)</option>
                                        <option value="PIX">PIX (Local)</option>
                                        <option value="CARTAO">Cartão (Local)</option>
                                    </select>
                                </div>
                                <div class="col-md-6 text-end">
                                    <span class="text-muted small d-block">Valor Total Estimado</span>
                                    <h3 class="fw-bold text-success mb-0">{{ formatarMoeda(valorTotalAgendamento) }}
                                    </h3>
                                </div>
                            </div>

                            <div class="mt-4 text-end">
                                <button type="button" class="btn btn-light me-2"
                                    data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-primary fw-bold px-4"
                                    :disabled="salvandoAgendamento || formAgendamento.servicoIds.length === 0 || !formAgendamento.horarioId">
                                    Confirmar Agendamento
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- MODAL: LISTA DE AGENDAMENTOS -->
        <div class="modal fade" id="modalListaAgendamentos" tabindex="-1" aria-hidden="true" v-if="!isSuperAdmin">
            <div class="modal-dialog modal-xl modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-dark text-white border-0">
                        <h5 class="modal-title fw-bold"><i class="bi bi-card-list me-2"></i> Todos os Agendamentos</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                            aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <div class="row mb-4 align-items-end">
                            <div class="col-md-6">
                                <label class="form-label fw-bold text-muted small text-uppercase">Período</label>
                                <div class="input-group shadow-sm">
                                    <span class="input-group-text bg-white border-end-0"><i
                                            class="bi bi-calendar3"></i></span>
                                    <input type="date" class="form-control border-start-0 ps-0"
                                        v-model="filtroDataInicio" @change="carregarAgendamentosDaBarbearia">
                                    <span class="input-group-text bg-white border-0">até</span>
                                    <input type="date" class="form-control border-start-0 ps-0" v-model="filtroDataFim"
                                        @change="carregarAgendamentosDaBarbearia">
                                    <button class="btn btn-white border-0 bg-white text-primary fw-bold"
                                        @click="resetFiltroAgendamento">Hoje</button>
                                </div>
                            </div>
                            <div class="col-md-6 text-md-end mt-3 mt-md-0">
                                <button class="btn btn-outline-secondary shadow-sm"
                                    @click="carregarAgendamentosDaBarbearia"><i class="bi bi-arrow-clockwise me-1"></i>
                                    Atualizar</button>
                            </div>
                        </div>

                        <div class="card border-0 shadow-sm">
                            <div class="card-body p-0">
                                <div class="table-responsive" v-if="listaAgendamentos.length > 0"
                                    style="max-height: 500px;">
                                    <table class="table table-hover align-middle mb-0">
                                        <thead class="table-light sticky-top">
                                            <tr>
                                                <th class="border-0 px-4 py-3">Data / Hora</th>
                                                <th class="border-0 py-3">Cliente</th>
                                                <th class="border-0 py-3">Profissional</th>
                                                <th class="border-0 py-3">Serviço</th>
                                                <th class="border-0 py-3 text-center">Status</th>
                                                <th class="border-0 text-end px-4 py-3">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="agenda in listaAgendamentos" :key="agenda.id">
                                                <td class="px-4 text-nowrap">
                                                    <span class="d-block fw-bold text-dark">{{
                                                        formatarDataPtBr(agenda.horario.data) }}</span>
                                                    <small class="text-muted"><i class="bi bi-clock me-1"></i> {{
                                                        agenda.horario.horaInicio }}</small>
                                                </td>
                                                <td class="fw-medium">{{ agenda.cliente ? agenda.cliente.nome :
                                                    agenda.nomeCliente }}</td>
                                                <td class="text-muted">{{ agenda.funcionario.nome }}</td>
                                                <td>
                                                    <span class="d-block text-truncate" style="max-width: 150px;">{{
                                                        agenda.servico }}</span>
                                                    <small class="text-success fw-bold">{{ formatarMoeda(agenda.valor)
                                                    }}</small>
                                                </td>
                                                <td class="text-center">
                                                    <span class="badge rounded-pill px-3 py-2"
                                                        :class="corStatus(agenda.status)">{{ agenda.status.toUpperCase()
                                                        }}</span>
                                                </td>
                                                <td class="text-end px-4 text-nowrap">
                                                    <template v-if="agenda.status === 'agendado'">
                                                        <button @click="concluirAgendamento(agenda.id)"
                                                            class="btn btn-sm btn-success rounded-circle shadow-sm me-1"><i
                                                                class="bi bi-check2-all"></i></button>
                                                        <button @click="cancelarAgendamento(agenda.id)"
                                                            class="btn btn-sm btn-light text-danger rounded-circle shadow-sm"><i
                                                                class="bi bi-x-lg"></i></button>
                                                    </template>
                                                    <template v-else><span class="text-muted small"><i
                                                                class="bi bi-lock-fill"></i> Fechado</span></template>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div v-else class="text-center py-5 text-muted"><i
                                        class="bi bi-calendar2-x display-4 d-block mb-3 opacity-25"></i>
                                    <h5>Nenhum agendamento encontrado.</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ========================================== -->
        <!-- 👇 MODAIS DE PRODUTOS/ESTOQUE/VENDAS       -->
        <!-- ========================================== -->

        <!-- MODAL: CADASTRO DE PRODUTOS -->
        <div class="modal fade" id="modalProdutos" tabindex="-1" aria-hidden="true" v-if="!isSuperAdmin">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-dark text-white border-0">
                        <h5 class="modal-title fw-bold"><i class="bi bi-tags me-2"></i> Cadastro de Produtos e
                            Consumíveis</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                            aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <div class="card border-0 shadow-sm mb-4">
                            <div class="card-header bg-white border-bottom-0 pt-3">
                                <h6 class="fw-bold text-primary mb-0">Cadastrar Novo Item</h6>
                            </div>
                            <div class="card-body">
                                <form @submit.prevent="salvarProduto">
                                    <div class="row g-2">
                                        <div class="col-md-5">
                                            <label class="form-label small text-muted fw-bold">Nome do Item</label>
                                            <input v-model="novoProduto.nome" type="text" class="form-control"
                                                placeholder="Ex: Pomada Efeito Matte" required>
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label small text-muted fw-bold">Tipo</label>
                                            <select v-model="novoProduto.tipo" class="form-select" required>
                                                <option value="PRODUTO">Produto (Venda)</option>
                                                <option value="CONSUMIVEL">Consumível (Bebida/Outros)</option>
                                            </select>
                                        </div>
                                        <div class="col-md-2">
                                            <label class="form-label small text-muted fw-bold">Preço</label>
                                            <div class="input-group">
                                                <span class="input-group-text bg-light border-end-0">R$</span>
                                                <input v-model="novoProduto.valor" type="number" step="0.01" min="0"
                                                    class="form-control border-start-0 ps-0" placeholder="0.00"
                                                    required>
                                            </div>
                                        </div>
                                        <div class="col-md-2 mt-auto">
                                            <button type="submit" class="btn btn-primary w-100 fw-bold"
                                                :disabled="salvandoProduto">
                                                <i class="bi bi-plus-lg"></i> Criar
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div class="card border-0 shadow-sm">
                            <div
                                class="card-header bg-white border-bottom-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                                <h6 class="fw-bold mb-0">Itens Cadastrados</h6>
                                <button @click="carregarProdutos" class="btn btn-sm btn-outline-secondary border-0"><i
                                        class="bi bi-arrow-clockwise"></i></button>
                            </div>

                            <div class="card-body p-0 pt-3">
                                <!-- 👇 ABAS DE FILTRO APLICADAS AQUI -->
                                <div class="px-3 mb-2">
                                    <ul class="nav nav-pills nav-fill bg-light p-1 rounded-3">
                                        <li class="nav-item">
                                            <button class="nav-link rounded-3 small fw-bold"
                                                :class="{ active: filtroTipoProduto === 'TODOS' }"
                                                @click="filtroTipoProduto = 'TODOS'">Todos</button>
                                        </li>
                                        <li class="nav-item">
                                            <button class="nav-link rounded-3 small fw-bold"
                                                :class="{ active: filtroTipoProduto === 'PRODUTO' }"
                                                @click="filtroTipoProduto = 'PRODUTO'">Produtos</button>
                                        </li>
                                        <li class="nav-item">
                                            <button class="nav-link rounded-3 small fw-bold"
                                                :class="{ active: filtroTipoProduto === 'CONSUMIVEL' }"
                                                @click="filtroTipoProduto = 'CONSUMIVEL'">Consumíveis</button>
                                        </li>
                                    </ul>
                                </div>

                                <div class="text-center py-4" v-if="carregandoProdutos">
                                    <div class="spinner-border text-primary" role="status"></div>
                                </div>

                                <div class="table-responsive" v-else-if="produtosFiltrados.length > 0"
                                    style="max-height: 350px; overflow-y: auto;">
                                    <table class="table table-hover align-middle mb-0">
                                        <thead class="table-light sticky-top">
                                            <tr>
                                                <th class="border-0 px-4">Nome do Item</th>
                                                <th class="border-0">Tipo</th>
                                                <th class="border-0">Valor</th>
                                                <th class="border-0 text-end px-4">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="prod in produtosFiltrados" :key="prod.id">
                                                <td class="fw-medium text-dark px-4">{{ prod.nome }}</td>
                                                <td>
                                                    <span class="badge"
                                                        :class="prod.tipo === 'PRODUTO' ? 'bg-primary-subtle text-primary' : 'bg-warning-subtle text-warning'">
                                                        {{ prod.tipo === 'PRODUTO' ? 'Produto' : 'Consumível' }}
                                                    </span>
                                                </td>
                                                <td><span class="fw-bold text-success">{{ formatarMoeda(prod.valor)
                                                }}</span>
                                                </td>
                                                <td class="text-end px-4 text-nowrap">
                                                    <button @click="deletarProduto(prod.id)"
                                                        class="btn btn-sm btn-light text-danger rounded-circle shadow-sm"
                                                        title="Excluir">
                                                        <i class="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div v-else class="text-center py-4 text-muted">
                                    <i class="bi bi-box-seam display-6 d-block mb-2 opacity-50"></i>
                                    Nenhum item encontrado nesta categoria.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- MODAL: CONTROLE DE ESTOQUE -->
        <div class="modal fade" id="modalEstoque" tabindex="-1" aria-hidden="true" v-if="!isSuperAdmin">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-dark text-white border-0">
                        <h5 class="modal-title fw-bold"><i class="bi bi-boxes me-2"></i> Controle de Estoque Atual</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                            aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-0 bg-light">

                        <!-- 👇 ABAS DE FILTRO APLICADAS AQUI -->
                        <div class="p-3 bg-white border-bottom">
                            <ul class="nav nav-pills nav-fill bg-light p-1 rounded-3">
                                <li class="nav-item">
                                    <button class="nav-link rounded-3 small fw-bold"
                                        :class="{ active: filtroTipoProduto === 'TODOS' }"
                                        @click="filtroTipoProduto = 'TODOS'">Todos</button>
                                </li>
                                <li class="nav-item">
                                    <button class="nav-link rounded-3 small fw-bold"
                                        :class="{ active: filtroTipoProduto === 'PRODUTO' }"
                                        @click="filtroTipoProduto = 'PRODUTO'">Produtos</button>
                                </li>
                                <li class="nav-item">
                                    <button class="nav-link rounded-3 small fw-bold"
                                        :class="{ active: filtroTipoProduto === 'CONSUMIVEL' }"
                                        @click="filtroTipoProduto = 'CONSUMIVEL'">Consumíveis</button>
                                </li>
                            </ul>
                        </div>

                        <div class="text-center py-5" v-if="carregandoProdutos">
                            <div class="spinner-border text-primary" role="status"></div>
                        </div>

                        <div v-else-if="produtosFiltrados.length > 0" class="table-responsive"
                            style="max-height: 50vh;">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light sticky-top">
                                    <tr>
                                        <th class="px-4 border-0">Item</th>
                                        <th class="border-0 text-center" style="width: 150px;">Estoque Disponível</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="prod in produtosFiltrados" :key="prod.id">
                                        <td class="px-4">
                                            <span class="fw-bold d-block">{{ prod.nome }}</span>
                                            <small class="text-muted" style="font-size: 0.75rem;">{{ prod.tipo
                                            }}</small>
                                        </td>
                                        <td class="pe-4">
                                            <div class="input-group input-group-sm">
                                                <input type="number" class="form-control text-center fw-bold"
                                                    v-model="prod.estoque" min="0">
                                                <button class="btn btn-outline-success"
                                                    @click="salvarEstoque(prod, $event)" title="Salvar quantidade">
                                                    <i class="bi bi-check2"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div v-else class="text-center py-5 text-muted">
                            <p class="mb-0">Nenhum item nesta categoria.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- MODAL: NOVA VENDA -->
        <div class="modal fade" id="modalVendaProduto" tabindex="-1" aria-hidden="true" v-if="!isSuperAdmin">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-dark text-white border-0">
                        <h5 class="modal-title fw-bold"><i class="bi bi-cart-plus me-2"></i> Lançar Venda Avulsa</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                            aria-label="Close" id="btnFecharModalVenda"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <form @submit.prevent="realizarVenda">
                            <div class="mb-3">
                                <label class="form-label fw-bold small text-muted text-uppercase">Vendedor
                                    (Profissional)</label>
                                <select v-model="formVenda.funcionarioId" class="form-select form-select-lg" required>
                                    <option value="" disabled selected>Quem está vendendo?</option>
                                    <option v-for="membro in equipe" :key="membro.id" :value="membro.id">{{ membro.nome
                                    }}
                                    </option>
                                </select>
                            </div>

                            <!-- 👇 DROPDOWN DIVIDIDO VISUALMENTE -->
                            <div class="mb-3">
                                <label class="form-label fw-bold small text-muted text-uppercase">Item</label>
                                <select v-model="formVenda.produtoId" class="form-select form-select-lg" required>
                                    <option value="" disabled selected>O que o cliente está levando?</option>

                                    <optgroup label="📦 Produtos (Venda)">
                                        <option v-for="prod in produtos.filter(p => p.tipo === 'PRODUTO')"
                                            :key="prod.id" :value="prod.id" :disabled="prod.estoque <= 0">
                                            {{ prod.nome }} - {{ formatarMoeda(prod.valor) }} (Estoque: {{ prod.estoque
                                            }})
                                        </option>
                                    </optgroup>

                                    <optgroup label="🍺 Consumíveis (Bebidas/Outros)">
                                        <option v-for="prod in produtos.filter(p => p.tipo === 'CONSUMIVEL')"
                                            :key="prod.id" :value="prod.id" :disabled="prod.estoque <= 0">
                                            {{ prod.nome }} - {{ formatarMoeda(prod.valor) }} (Estoque: {{ prod.estoque
                                            }})
                                        </option>
                                    </optgroup>
                                </select>
                            </div>

                            <div class="row mb-4">
                                <div class="col-6">
                                    <label class="form-label fw-bold small text-muted text-uppercase">Quantidade</label>
                                    <input v-model="formVenda.quantidade" type="number" min="1"
                                        class="form-control form-control-lg text-center" required>
                                </div>
                                <div class="col-6">
                                    <label class="form-label fw-bold small text-muted text-uppercase">Total</label>
                                    <input type="text"
                                        class="form-control form-control-lg text-center text-success fw-bold bg-white"
                                        :value="formatarMoeda(valorTotalVenda)" disabled readonly>
                                </div>
                            </div>
                            <div class="bg-white p-3 rounded-3 shadow-sm border mb-4">
                                <label class="form-label fw-bold small text-muted text-uppercase">Forma de
                                    Pagamento</label>
                                <select v-model="formVenda.formaPagamento" class="form-select border-0 bg-light"
                                    required>
                                    <option value="DINHEIRO">Dinheiro (Local)</option>
                                    <option value="PIX">PIX (Local)</option>
                                    <option value="CARTAO">Cartão (Local)</option>
                                </select>
                            </div>
                            <div class="text-end">
                                <button type="button" class="btn btn-light me-2"
                                    data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-success fw-bold px-4"
                                    :disabled="salvandoVenda || !formVenda.produtoId || !formVenda.funcionarioId">
                                    <span v-if="salvandoVenda" class="spinner-border spinner-border-sm me-2"></span>
                                    Concluir
                                    Venda
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- 👇 NOVO MODAL: HISTÓRICO DE VENDAS -->
        <div class="modal fade" id="modalHistoricoVendas" tabindex="-1" aria-hidden="true" v-if="!isSuperAdmin">
            <div class="modal-dialog modal-xl modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-dark text-white border-0">
                        <h5 class="modal-title fw-bold"><i class="bi bi-clock-history me-2"></i> Histórico de Vendas
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                            aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 bg-light">
                        <div class="row mb-4 align-items-end">
                            <div class="col-md-5">
                                <label class="form-label fw-bold text-muted small text-uppercase">Período</label>
                                <div class="input-group shadow-sm">
                                    <span class="input-group-text bg-white border-end-0"><i
                                            class="bi bi-calendar3"></i></span>
                                    <input type="date" class="form-control border-start-0 ps-0"
                                        v-model="filtroInicioVendas" @change="carregarHistoricoVendas">
                                    <span class="input-group-text bg-white border-0">até</span>
                                    <input type="date" class="form-control border-start-0 ps-0"
                                        v-model="filtroFimVendas" @change="carregarHistoricoVendas">
                                    <button class="btn btn-white border-0 bg-white text-primary fw-bold"
                                        @click="resetFiltroHistorico">Hoje</button>
                                </div>
                            </div>
                            <!-- 👇 ABAS DE FILTRO NO HISTÓRICO -->
                            <div class="col-md-5 mt-3 mt-md-0">
                                <ul class="nav nav-pills nav-fill bg-white p-1 rounded-3 shadow-sm border">
                                    <li class="nav-item">
                                        <button class="nav-link rounded-3 small fw-bold"
                                            :class="{ active: filtroTipoHistorico === 'TODOS' }"
                                            @click="filtroTipoHistorico = 'TODOS'">Todos</button>
                                    </li>
                                    <li class="nav-item">
                                        <button class="nav-link rounded-3 small fw-bold"
                                            :class="{ active: filtroTipoHistorico === 'PRODUTO' }"
                                            @click="filtroTipoHistorico = 'PRODUTO'">Produtos</button>
                                    </li>
                                    <li class="nav-item">
                                        <button class="nav-link rounded-3 small fw-bold"
                                            :class="{ active: filtroTipoHistorico === 'CONSUMIVEL' }"
                                            @click="filtroTipoHistorico = 'CONSUMIVEL'">Consumíveis</button>
                                    </li>
                                </ul>
                            </div>
                            <div class="col-md-2 text-md-end mt-3 mt-md-0">
                                <button class="btn btn-outline-secondary shadow-sm w-100"
                                    @click="carregarHistoricoVendas"><i class="bi bi-arrow-clockwise me-1"></i>
                                    Atualizar</button>
                            </div>
                        </div>

                        <div class="card border-0 shadow-sm">
                            <div class="card-body p-0">
                                <div class="text-center py-5" v-if="carregandoHistorico">
                                    <div class="spinner-border text-primary" role="status"></div>
                                </div>
                                <div class="table-responsive" v-else-if="historicoFiltrado.length > 0"
                                    style="max-height: 500px;">
                                    <table class="table table-hover align-middle mb-0">
                                        <thead class="table-light sticky-top">
                                            <tr>
                                                <th class="border-0 px-4 py-3">Data da Venda</th>
                                                <th class="border-0 py-3">Vendedor</th>
                                                <th class="border-0 py-3">Item</th>
                                                <th class="border-0 py-3 text-center">Qtd</th>
                                                <th class="border-0 py-3">Pagamento</th>
                                                <th class="border-0 text-end px-4 py-3">Valor Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="venda in historicoFiltrado" :key="venda.id">
                                                <td class="px-4 text-nowrap">
                                                    <span class="d-block fw-bold text-dark">{{
                                                        formatarDataPtBr(venda.dataVenda)
                                                    }}</span>
                                                    <small class="text-muted"><i class="bi bi-clock me-1"></i> {{ new
                                                        Date(venda.dataVenda).toLocaleTimeString('pt-BR', {
                                                            hour:
                                                                '2-digit',
                                                            minute: '2-digit'
                                                        }) }}</small>
                                                </td>
                                                <td class="text-muted">{{ venda.funcionario ? venda.funcionario.nome :
                                                    'N/A' }}
                                                </td>
                                                <td>
                                                    <span class="d-block fw-medium">{{ venda.nomeItem }}</span>
                                                    <span class="badge"
                                                        :class="venda.tipoOrigem === 'PRODUTO' ? 'bg-primary-subtle text-primary' : 'bg-warning-subtle text-warning'">
                                                        {{ venda.tipoOrigem === 'PRODUTO' ? 'Produto' : 'Consumível' }}
                                                    </span>
                                                </td>
                                                <td class="text-center fw-bold">{{ venda.quantidade }}</td>
                                                <td>
                                                    <span class="badge bg-light text-dark border">{{
                                                        venda.formaPagamento
                                                    }}</span>
                                                </td>
                                                <td class="text-end px-4">
                                                    <span class="fw-bold text-success">{{
                                                        formatarMoeda(Number(venda.valorUnitario) * venda.quantidade)
                                                    }}</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div v-else class="text-center py-5 text-muted">
                                    <i class="bi bi-receipt display-4 d-block mb-3 opacity-25"></i>
                                    <h5>Nenhuma venda encontrada.</h5>
                                    <p class="small">Tente alterar os filtros acima.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Modal, Toast } from 'bootstrap';

const router = useRouter();
const nomeEmpresa = ref('Carregando...');
const isSuperAdmin = ref(false);

const temModuloAgendamento = ref(true);
const temModuloFinanceiro = ref(false);
const temModuloProdutos = ref(false);
const temModuloVendas = ref(false);
const planoAtual = ref('');

const toastRef = ref(null);
const toastInstance = ref(null);
const toastMessage = ref('');
const toastIcon = ref('');

const equipe = ref([]);
const carregandoEquipe = ref(false);
const salvandoFuncionario = ref(false);
const novoFuncionario = ref({ nome: '', email: '' });

const servicos = ref([]);
const carregandoServicos = ref(false);
const salvandoServico = ref(false);
const novoServico = ref({ nome: '', valor: '' });
const servicoEditandoId = ref(null);
const formEditServico = ref({ nome: '', valor: 0 });

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getConfig = () => ({ headers: { 'Authorization': `Bearer ${Cookies.get('access_token')}`, 'x-tenant-id': Cookies.get('tenant_id') } });
const getHoje = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; };

const dashboard = ref({ faturamentoMes: 0, agendamentosHoje: 0, despesasPendentes: 0, novosClientes: 0 });

const showToast = (msg, type = 'success') => {
    if (!toastRef.value) return;
    toastMessage.value = msg;
    if (type === 'success') {
        toastRef.value.className = 'toast align-items-center text-bg-success border-0';
        toastIcon.value = 'bi bi-check-circle-fill me-2';
    } else if (type === 'warning') {
        toastRef.value.className = 'toast align-items-center text-bg-warning text-dark border-0';
        toastIcon.value = 'bi bi-exclamation-triangle-fill me-2';
    } else {
        toastRef.value.className = 'toast align-items-center text-bg-danger border-0';
        toastIcon.value = 'bi bi-exclamation-octagon-fill me-2';
    }
    if (!toastInstance.value) toastInstance.value = new Toast(toastRef.value);
    toastInstance.value.show();
};

const irParaHorarios = () => router.push('/horarios');
const abrirHorarios = (idDoFuncionario) => router.push(`/horarios?funcionario=${idDoFuncionario}`);
const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
const formatarDataPtBr = (isoString) => isoString ? new Date(isoString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '';
const corStatus = (status) => status === 'concluido' ? 'bg-success text-white' : status === 'cancelado' ? 'bg-danger text-white' : 'bg-primary-subtle text-primary border border-primary-subtle';

// AGENDAMENTO AVULSO
const horariosLivres = ref([]);
const carregandoHorariosLivre = ref(false);
const salvandoAgendamento = ref(false);
const formAgendamento = ref({ nomeCliente: '', funcionarioId: '', data: getHoje(), horarioId: '', servicoIds: [], formaPagamento: 'PIX' });
const valorTotalAgendamento = computed(() => servicos.value.filter(s => formAgendamento.value.servicoIds.includes(s.id)).reduce((total, s) => total + Number(s.valor), 0));

// LISTA DE AGENDAMENTOS (MODAL)
const listaAgendamentos = ref([]);
const carregandoListaAgendamentos = ref(false);
const filtroDataInicio = ref(getHoje());
const filtroDataFim = ref(getHoje());

// --- PRODUTOS, ESTOQUE E VENDAS ---
const produtos = ref([]);
const carregandoProdutos = ref(false);
const salvandoProduto = ref(false);
const novoProduto = ref({ nome: '', valor: '', estoque: 0, tipo: 'PRODUTO' });

const formVenda = ref({ produtoId: '', quantidade: 1, formaPagamento: 'PIX', funcionarioId: '' });
const salvandoVenda = ref(false);
const valorTotalVenda = computed(() => {
    if (!formVenda.value.produtoId) return 0;
    const p = produtos.value.find(prod => prod.id === formVenda.value.produtoId);
    return p ? Number(p.valor) * formVenda.value.quantidade : 0;
});

// 👇 NOVOS ESTADOS PARA FILTROS E HISTÓRICO
const filtroTipoProduto = ref('TODOS'); // Controla Cadastro e Estoque
const filtroTipoHistorico = ref('TODOS'); // Controla Histórico
const historicoVendas = ref([]);
const carregandoHistorico = ref(false);
const filtroInicioVendas = ref(getHoje());
const filtroFimVendas = ref(getHoje());

const produtosFiltrados = computed(() => {
    if (filtroTipoProduto.value === 'TODOS') return produtos.value;
    return produtos.value.filter(p => p.tipo === filtroTipoProduto.value);
});

const historicoFiltrado = computed(() => {
    if (filtroTipoHistorico.value === 'TODOS') return historicoVendas.value;
    return historicoVendas.value.filter(v => v.tipoOrigem === filtroTipoHistorico.value);
});


const carregarDashboard = async () => {
    if (isSuperAdmin.value) return;
    const dataAtual = new Date();
    const primeiroDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1).toISOString().split('T')[0];
    const ultimoDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0).toISOString().split('T')[0];
    try {
        if (temModuloFinanceiro.value) {
            const resFin = await axios.get(`${API_URL}/financeiro/resumo`, { params: { inicio: primeiroDiaMes, fim: ultimoDiaMes }, ...getConfig() });
            dashboard.value.faturamentoMes = resFin.data.totais?.totalFinanceiro?.receitaBrutaTotal || 0;
            dashboard.value.despesasPendentes = resFin.data.totais?.custosOperacionais?.pendentes || 0;
        }
        if (temModuloAgendamento.value) {
            const resAg = await axios.get(`${API_URL}/agendamentos`, { params: { inicio: getHoje(), fim: getHoje() }, ...getConfig() });
            dashboard.value.agendamentosHoje = resAg.data.length || 0;
        }
        try {
            const resCli = await axios.get(`${API_URL}/clientes`, getConfig());
            const listaClientes = Array.isArray(resCli.data) ? resCli.data : (resCli.data?.data || []);
            const criadosEsteMes = listaClientes.filter(c => c.createdAt && c.createdAt.startsWith(primeiroDiaMes.substring(0, 7)));
            dashboard.value.novosClientes = criadosEsteMes.length || 0;
        } catch (e) { }
    } catch (error) { console.error(error); }
};

const carregarEquipe = async () => {
    if (isSuperAdmin.value) return;
    carregandoEquipe.value = true;
    try {
        const response = await axios.get(`${API_URL}/funcionarios`, getConfig());
        equipe.value = response.data;
    } catch (error) { console.error(error); } finally { carregandoEquipe.value = false; }
};

const salvarFuncionario = async () => {
    salvandoFuncionario.value = true;
    try {
        await axios.post(`${API_URL}/funcionarios`, { nome: novoFuncionario.value.nome, email: novoFuncionario.value.email, senha: '123456', password: '123456' }, getConfig());
        novoFuncionario.value = { nome: '', email: '' };
        await carregarEquipe();
        showToast('Profissional criado com sucesso!', 'success');
    } catch (error) { showToast(error.response?.data?.message || 'Erro ao criar funcionário.', 'danger'); } finally { salvandoFuncionario.value = false; }
};

const carregarServicos = async () => {
    if (isSuperAdmin.value) return;
    carregandoServicos.value = true;
    try {
        const response = await axios.get(`${API_URL}/servicos`, getConfig());
        servicos.value = response.data;
    } catch (error) { console.error(error); } finally { carregandoServicos.value = false; }
};

const salvarServico = async () => {
    salvandoServico.value = true;
    try {
        await axios.post(`${API_URL}/servicos`, { nome: novoServico.value.nome, valor: Number(novoServico.value.valor) }, getConfig());
        novoServico.value = { nome: '', valor: '' };
        await carregarServicos();
        showToast('Serviço adicionado com sucesso!', 'success');
    } catch (error) { showToast('Erro ao cadastrar serviço.', 'danger'); } finally { salvandoServico.value = false; }
};

const iniciarEdicaoServico = (servico) => { servicoEditandoId.value = servico.id; formEditServico.value = { nome: servico.nome, valor: servico.valor }; };
const concluirEdicaoServico = async (id) => {
    try {
        await axios.put(`${API_URL}/servicos/${id}`, { nome: formEditServico.value.nome, valor: Number(formEditServico.value.valor) }, getConfig());
        servicoEditandoId.value = null; await carregarServicos(); showToast('Serviço atualizado com sucesso!', 'success');
    } catch (error) { showToast('Erro ao atualizar serviço.', 'danger'); }
};

const deletarServico = async (id) => {
    if (!confirm('Deseja realmente excluir este serviço da barbearia?')) return;
    try {
        await axios.delete(`${API_URL}/servicos/${id}`, getConfig());
        await carregarServicos(); showToast('Serviço removido com sucesso.', 'success');
    } catch (error) { showToast('Erro ao deletar serviço.', 'danger'); }
};

const buscarHorariosLivres = async () => {
    if (!formAgendamento.value.funcionarioId || !formAgendamento.value.data) return;
    carregandoHorariosLivre.value = true; formAgendamento.value.horarioId = '';
    try {
        const response = await axios.get(`${API_URL}/funcionarios/${formAgendamento.value.funcionarioId}/horarios`, { params: { inicio: formAgendamento.value.data, fim: formAgendamento.value.data }, ...getConfig() });
        horariosLivres.value = (response.data.horarios || []).filter(h => h.disponivel === true);
    } catch (error) { showToast('Erro ao carregar horários livres.', 'danger'); } finally { carregandoHorariosLivre.value = false; }
};

const salvarAgendamento = async () => {
    salvandoAgendamento.value = true;
    try {
        await axios.post(`${API_URL}/agendamentos`, { nomeClienteAvulso: formAgendamento.value.nomeCliente, funcionarioId: formAgendamento.value.funcionarioId, horarioId: formAgendamento.value.horarioId, servicoIds: formAgendamento.value.servicoIds, formaPagamento: formAgendamento.value.formaPagamento }, getConfig());
        showToast('Agendamento realizado com sucesso!', 'success');
        formAgendamento.value = { nomeCliente: '', funcionarioId: '', data: getHoje(), horarioId: '', servicoIds: [], formaPagamento: 'PIX' };
        horariosLivres.value = []; document.getElementById('btnFecharModalAgendamento').click();
        carregarAgendamentosDaBarbearia(); carregarDashboard();
    } catch (error) { showToast(error.response?.data?.message || 'Erro ao criar agendamento.', 'danger'); } finally { salvandoAgendamento.value = false; }
};

const resetFiltroAgendamento = () => { filtroDataInicio.value = getHoje(); filtroDataFim.value = getHoje(); carregarAgendamentosDaBarbearia(); };

const carregarAgendamentosDaBarbearia = async () => {
    if (isSuperAdmin.value) return;
    carregandoListaAgendamentos.value = true;
    try {
        const response = await axios.get(`${API_URL}/agendamentos`, { params: { inicio: filtroDataInicio.value, fim: filtroDataFim.value }, ...getConfig() });
        listaAgendamentos.value = response.data;
    } catch (error) { console.error(error); } finally { carregandoListaAgendamentos.value = false; }
};

const concluirAgendamento = async (id) => {
    if (!confirm('Deseja marcar este agendamento como CONCLUÍDO?')) return;
    try {
        await axios.patch(`${API_URL}/agendamentos/${id}`, { status: 'concluido' }, getConfig());
        showToast('Agendamento concluído!', 'success');
        await carregarAgendamentosDaBarbearia(); await carregarDashboard();
    } catch (error) { showToast('Erro ao concluir agendamento.', 'danger'); }
};

const cancelarAgendamento = async (id) => {
    if (!confirm('Deseja realmente CANCELAR este agendamento?')) return;
    try {
        await axios.patch(`${API_URL}/agendamentos/${id}/cancelar`, {}, getConfig());
        showToast('Agendamento cancelado com sucesso.', 'success');
        await carregarAgendamentosDaBarbearia(); await carregarDashboard();
    } catch (error) { showToast('Erro ao cancelar agendamento.', 'danger'); }
};

const carregarProdutos = async () => {
    if (isSuperAdmin.value) return;
    carregandoProdutos.value = true;
    try {
        const response = await axios.get(`${API_URL}/produtos`, getConfig());
        produtos.value = response.data;
    } catch (error) { console.error(error); } finally { carregandoProdutos.value = false; }
};

const salvarProduto = async () => {
    salvandoProduto.value = true;
    try {
        await axios.post(`${API_URL}/produtos`, { nome: novoProduto.value.nome, valor: Number(novoProduto.value.valor), tipo: novoProduto.value.tipo, estoque: 0 }, getConfig());
        novoProduto.value = { nome: '', valor: '', estoque: 0, tipo: 'PRODUTO' };
        await carregarProdutos();
        showToast('Item adicionado ao catálogo!', 'success');
    } catch (error) { showToast('Erro ao cadastrar item.', 'danger'); } finally { salvandoProduto.value = false; }
};

const deletarProduto = async (id) => {
    if (!confirm('Excluir este item do catálogo?')) return;
    try {
        await axios.delete(`${API_URL}/produtos/${id}`, getConfig());
        await carregarProdutos();
        showToast('Item removido com sucesso.', 'success');
    } catch (error) { showToast('Erro ao excluir item.', 'danger'); }
};

const salvarEstoque = async (prod, evt) => {
    const btn = evt.currentTarget;
    try {
        await axios.put(`${API_URL}/produtos/${prod.id}`, { estoque: Number(prod.estoque) }, getConfig());
        showToast(`Estoque atualizado!`, 'success');
        btn.classList.replace('btn-outline-success', 'btn-success');
        btn.innerHTML = '<i class="bi bi-check-all text-white"></i>';
        setTimeout(() => {
            btn.classList.replace('btn-success', 'btn-outline-success');
            btn.innerHTML = '<i class="bi bi-check2"></i>';
        }, 1500);
    } catch (error) { showToast('Falha ao atualizar estoque no banco.', 'danger'); }
};

const realizarVenda = async () => {
    salvandoVenda.value = true;
    try {
        const produtoSelecionado = produtos.value.find(p => p.id === formVenda.value.produtoId);
        await axios.post(`${API_URL}/produtos/venda`, {
            produtoId: produtoSelecionado.id, funcionarioId: formVenda.value.funcionarioId, nomeItem: produtoSelecionado.nome, tipoOrigem: produtoSelecionado.tipo, quantidade: formVenda.value.quantidade, valorUnitario: produtoSelecionado.valor, formaPagamento: formVenda.value.formaPagamento
        }, getConfig());

        showToast('Venda realizada com sucesso!', 'success');
        formVenda.value = { produtoId: '', quantidade: 1, formaPagamento: 'PIX', funcionarioId: '' };
        document.getElementById('btnFecharModalVenda').click();

        await carregarProdutos();
        await carregarDashboard();
        await carregarHistoricoVendas(); // Atualiza o histórico em background
    } catch (error) { showToast('Erro ao processar venda no caixa.', 'danger'); } finally { salvandoVenda.value = false; }
};

// 👇 NOVA FUNÇÃO: CARREGAR HISTÓRICO DE VENDAS
const carregarHistoricoVendas = async () => {
    if (isSuperAdmin.value) return;
    carregandoHistorico.value = true;
    try {
        const config = getConfig();
        config.params = { inicio: filtroInicioVendas.value, fim: filtroFimVendas.value };
        const response = await axios.get(`${API_URL}/produtos/item-venda`, config);
        historicoVendas.value = response.data;
    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
        showToast('Erro ao carregar histórico de vendas.', 'danger');
    } finally {
        carregandoHistorico.value = false;
    }
};

const resetFiltroHistorico = () => {
    filtroInicioVendas.value = getHoje();
    filtroFimVendas.value = getHoje();
    carregarHistoricoVendas();
};

onMounted(() => {
    const hostname = window.location.hostname;
    const partes = hostname.split('.');

    if (partes.length > 1 && partes[0] === 'adm') {
        isSuperAdmin.value = true;
        nomeEmpresa.value = 'Genesis Cloud';
    } else if (partes.length > 1 && partes[0] !== 'localhost' && partes[0] !== 'www') {
        isSuperAdmin.value = false;
        const sub = partes[0];
        nomeEmpresa.value = sub.charAt(0).toUpperCase() + sub.slice(1);
    } else {
        isSuperAdmin.value = false;
        nomeEmpresa.value = 'Administração Global';
    }

    if (!isSuperAdmin.value) {
        const savedFeatures = localStorage.getItem('tenant_features');
        if (savedFeatures) {
            const features = JSON.parse(savedFeatures);
            temModuloAgendamento.value = features.agendamento;
            temModuloFinanceiro.value = features.financeiro;
            temModuloProdutos.value = features.produtos;
            temModuloVendas.value = features.vendas;
            planoAtual.value = features.plano;
        }

        if (toastRef.value) toastInstance.value = new Toast(toastRef.value);

        carregarEquipe();
        carregarServicos();
        carregarProdutos();
        carregarDashboard();
    }
});
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}

.custom-checkbox-card:hover {
    background-color: #f8f9fa;
    border-color: #dee2e6 !important;
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>