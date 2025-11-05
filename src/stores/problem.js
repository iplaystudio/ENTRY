import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { PROBLEMS, PATHS } from '../config/constants'
import { storage } from '../utils/helpers'

export const useProblemStore = defineStore('problem', () => {
  // State
  const problems = ref(PROBLEMS)
  const currentProblemId = ref(null)
  const problemContents = ref(new Map())
  const solutionContents = ref(new Map())
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const currentProblem = computed(() => {
    if (!currentProblemId.value) return null
    return problems.value.find(p => p.id === currentProblemId.value)
  })

  const currentProblemContent = computed(() => {
    if (!currentProblemId.value) return ''
    return problemContents.value.get(currentProblemId.value) || ''
  })

  const currentSolutionContent = computed(() => {
    if (!currentProblemId.value) return ''
    return solutionContents.value.get(currentProblemId.value) || ''
  })

  // Actions
  async function selectProblem(problemId) {
    currentProblemId.value = problemId
    
    // 如果已经加载过，直接返回
    if (problemContents.value.has(problemId) && solutionContents.value.has(problemId)) {
      return
    }

    await Promise.all([
      loadProblemContent(problemId),
      loadSolutionContent(problemId)
    ])
  }

  async function loadProblemContent(problemId) {
    const problem = problems.value.find(p => p.id === problemId)
    if (!problem) return

    loading.value = true
    error.value = null

    try {
      // 暂时禁用缓存，直接从服务器加载
      // const cached = storage.get(`problem_${problemId}`)
      // if (cached) {
      //   problemContents.value.set(problemId, cached)
      //   return
      // }

      // 从服务器加载
      const response = await fetch(`${import.meta.env.BASE_URL}${PATHS.PROBLEM}/${problem.file}.md`)
      if (!response.ok) {
        console.error('加载失败:', response.status, response.statusText)
        throw new Error(`加载题目失败: ${response.status}`)
      }
      
      const content = await response.text()
      console.log(`📄 加载题目 ${problemId}:`, content.substring(0, 100))
      problemContents.value.set(problemId, content)
      
      // 暂时不缓存
      // storage.set(`problem_${problemId}`, content)
    } catch (err) {
      console.error('加载题目失败:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function loadSolutionContent(problemId) {
    const problem = problems.value.find(p => p.id === problemId)
    if (!problem) return

    try {
      // 暂时禁用缓存
      // const cached = storage.get(`solution_${problemId}`)
      // if (cached) {
      //   solutionContents.value.set(problemId, cached)
      //   return
      // }

      // 从服务器加载
      const response = await fetch(`${import.meta.env.BASE_URL}${PATHS.SOLUTION}/${problem.file}.c`)
      if (!response.ok) {
        console.error('加载题解失败:', response.status, response.statusText)
        throw new Error(`加载题解失败: ${response.status}`)
      }
      
      const content = await response.text()
      solutionContents.value.set(problemId, content)
      
      // 暂时不缓存
      // storage.set(`solution_${problemId}`, content)
    } catch (err) {
      console.error('加载题解失败:', err)
      // 题解加载失败不影响题目显示
    }
  }

  function clearCache() {
    problemContents.value.clear()
    solutionContents.value.clear()
    // 清除本地存储的缓存
    problems.value.forEach(p => {
      storage.remove(`problem_${p.id}`)
      storage.remove(`solution_${p.id}`)
    })
  }

  return {
    // State
    problems,
    currentProblemId,
    loading,
    error,
    
    // Getters
    currentProblem,
    currentProblemContent,
    currentSolutionContent,
    
    // Actions
    selectProblem,
    clearCache
  }
})
