import { createRouter, createWebHistory } from 'vue-router';
import Cookies from 'js-cookie';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('../views/Login.vue'),
      meta: { layout: 'AuthLayout', guest: true }
    },
    // 🟢 Rota para CLIENTES da Barbearia criarem suas contas
    {
      path: '/registro',
      component: () => import('../views/RegistroCliente.vue'),
      meta: { layout: 'AuthLayout', guest: true }
    },
    // 🟢 Rota do Painel do Cliente Final
    {
      path: '/meu-perfil',
      component: () => import('../views/cliente/PerfilCliente.vue'),
      meta: { layout: 'ClientLayout', auth: true } // Usa AuthLayout para esconder o menu lateral do sistema
    },
    {
      path: '/horarios',
      component: () => import('../views/Horarios.vue'),
      meta: { layout: 'MainLayout', auth: true }
    },
    {
      path: '/home',
      component: () => import('../views/Home.vue'),
      meta: { layout: 'MainLayout', auth: true }
    },
    {
      path: '/adm/lojas',
      component: () => import('../views/adm/GestaoLojas.vue'),
      meta: { layout: 'MainLayout', auth: true }
    },
    {
      path: '/financeiro',
      component: () => import('../views/Financeiro.vue'),
      meta: { layout: 'MainLayout', auth: true }
    },
    { path: '/', redirect: '/home' }
  ]
});



// Middleware de Proteção (O Segurança da Porta)
router.beforeEach((to, from, next) => {
  // 1. O TRUQUE MÁGICO: Se vier token pela URL no redirecionamento, salva no cookie da casa nova!
  if (to.query.sync_token) {
    // Extrai os valores com segurança garantindo que sejam Strings (evitando o erro do TypeScript)
    const syncToken = Array.isArray(to.query.sync_token) ? to.query.sync_token[0] : to.query.sync_token;
    const syncTenant = Array.isArray(to.query.sync_tenant) ? to.query.sync_tenant[0] : to.query.sync_tenant;

    if (syncToken && syncTenant) {
      Cookies.set('access_token', syncToken as string, { expires: 7 });
      Cookies.set('tenant_id', syncTenant as string, { expires: 7 });
    }

    if (to.query.sync_features) {
      const features = Array.isArray(to.query.sync_features) ? to.query.sync_features[0] : to.query.sync_features;
      if (features) {
        const decodedFeatures = decodeURIComponent(features as string);
        localStorage.setItem('tenant_features', decodedFeatures);
      }
    }

    // Limpa a URL para esconder o token e recarrega a página limpa
    return next({ path: to.path, query: {} });
  }

  // 2. Lê direto do cookie
  const token = Cookies.get('access_token');
  const isAuthenticated = !!token;

  // 🧠 CÉREBRO DO GUARD: Descobre quem é o usuário logado lendo o Token
  let isCliente = false;
  if (isAuthenticated && token) {
    try {
      const parts = token.split('.');

      // Verificamos se o pedaço do meio realmente existe para acalmar o TypeScript
      if (parts.length >= 2 && parts[1]) {
        // O "as string" dá a garantia final que o atob() precisa
        const payload = JSON.parse(atob(parts[1] as string));
        isCliente = payload.userType === 'CLIENTE';
      }
    } catch (e) {
      console.error("Erro ao decodificar token JWT", e);
    }
  }
  // 3. Regras de Entrada e Blindagem
  if (to.meta.auth && !isAuthenticated) {
    // Tenta ir pra rota protegida sem token -> Chuta pro Login
    next('/login');
  }
  else if (to.meta.guest && isAuthenticated) {
    // Tenta ir pro Login já tendo token -> Redirecionamento Inteligente!
    next(isCliente ? '/meu-perfil' : '/home');
  }
  else if (isAuthenticated && isCliente && to.meta.layout === 'MainLayout') {
    // 🛡️ SEGURANÇA MÁXIMA: Se o CLIENTE tentar acessar /home ou /financeiro (que usam MainLayout),
    // ele é chutado imediatamente de volta para o perfil dele!
    next('/meu-perfil');
  }
  else {
    next();
  }
});

export default router;