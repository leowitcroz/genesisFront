<template>
  <component :is="layouts[(route.meta.layout as string) || 'MainLayout']">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
// Importando os layouts usando caminhos relativos de acordo com a sua estrutura
import AuthLayout from './layouts/AuthLayout.vue';
import MainLayout from './layouts/MainLayout.vue';
import ClientLayout from '@/layouts/ClientLayout.vue';

const route = useRoute();

// Mapeamento dos componentes de layout para o TypeScript encontrar
const layouts: Record<string, any> = {
  AuthLayout,
  MainLayout,
  ClientLayout
};
</script>

<style>
/* Estilos globais do sistema se necessário (o Bootstrap já cuida da maioria) */
body {
  background-color: #f8f9fa;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
</style>