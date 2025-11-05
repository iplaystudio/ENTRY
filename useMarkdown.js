import { onMounted, onUnmounted } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'

export function useMarkdown() {
  // 配置 marked
  const configureMarked = () => {
    marked.setOptions({
      highlight: (code, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value
          } catch (err) {
            console.error('代码高亮失败:', err)
          }
        }
        return hljs.highlightAuto(code).value
      },
      breaks: true,
      gfm: true,
      headerIds: true,
      mangle: false
    })
  }

  // 渲染 Markdown
  const renderMarkdown = (content) => {
    if (!content) return ''
    
    try {
      let html = marked.parse(content)
      
      // 修复图片路径: 将 ./图片名 转换为 BASE_URL/Problem/图片名
      const baseUrl = import.meta.env.BASE_URL
      html = html.replace(
        /<img([^>]*?)src=["']\.\/([^"']+)["']/g,
        `<img$1src="${baseUrl}Problem/$2"`
      )
      
      return html
    } catch (err) {
      console.error('Markdown 渲染失败:', err)
      return `<p>渲染失败: ${err.message}</p>`
    }
  }

  // 渲染数学公式
  const renderMath = () => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch((err) => {
        console.error('MathJax 渲染失败:', err)
      })
    }
  }

  onMounted(() => {
    configureMarked()
    
    // 加载 MathJax
    if (!window.MathJax) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'
      script.async = true
      document.head.appendChild(script)
      
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          processEscapes: true,
          processEnvironments: true
        },
        options: {
          skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
        }
      }
    }
  })

  return {
    renderMarkdown,
    renderMath
  }
}
