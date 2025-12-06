<template>
  <div :class="['app-container', { 'dark-mode': isDark }]">
    <div class="sidebar-overlay" :class="{ active: isSidebarOpen }" @click="closeSidebar" />
    
    <Sidebar 
      :is-open="isSidebarOpen" 
      :problems="problems"
      :current-problem="currentProblem"
      @select-problem="handleSelectProblem"
      @close="closeSidebar"
    />
    
    <main class="main-content">
      <AppHeader 
        :current-title="currentTitle"
        @toggle-theme="toggleTheme"
        @toggle-sidebar="toggleSidebar"
      />
      
      <div class="content-wrapper">
        <WelcomePage v-if="!currentProblem" :total-problems="problems.length" />
        <ProblemContent v-else :problem="currentProblem" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, provide, watch } from 'vue'
import Sidebar from './components/Sidebar.vue'
import AppHeader from './components/AppHeader.vue'
import WelcomePage from './components/WelcomePage.vue'
import ProblemContent from './components/ProblemContent.vue'
import { useProblemStore } from './stores/problem'
import { useTheme } from './composables/useTheme'
import { useMobile } from './composables/useMobile'
import { initFirebase } from './firebase'

initFirebase()

const problemStore = useProblemStore()
const { isDark, toggleTheme } = useTheme()
const { isSidebarOpen, toggleSidebar, closeSidebar } = useMobile()

provide('isDark', isDark)

watch(isDark, async (dark) => {
  if (dark) {
    await import('highlight.js/styles/github-dark.css')
  }
}, { immediate: false })

const problems = computed(() => problemStore.problems)
const currentProblem = computed(() => problemStore.currentProblem)
const currentTitle = computed(() => 
  currentProblem.value ? currentProblem.value.title : 'IPLAY 纳新题'
)

const handleSelectProblem = (problemId) => {
  problemStore.selectProblem(problemId)
  closeSidebar()
}
</script>

<style lang="scss">
.app-container {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color var(--transition-normal);
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  transition: opacity var(--transition-normal);
  
  &.active {
    display: block;
    opacity: 1;
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-left: 0;
}

.content-wrapper {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

// 桌面端：为侧边栏留出空间
@media (min-width: 769px) {
  .main-content {
    margin-left: var(--sidebar-width);
  }
  
  .sidebar-overlay {
    display: none !important;
  }
}

// 移动端样式
@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }
  
  .main-content {
    margin-left: 0;
  }
}
</style>
