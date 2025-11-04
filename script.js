
const PROBLEMS = Object.freeze([
    { id: 1, title: '朝思暮想的 IPLAY logo', file: '1.PrintIPLAY' },
    { id: 2, title: "~~杨辉海~~ 杨辉三角", file: "2.Pascal's Triangle" },
    { id: 3, title: '黄瓜苦瓜之争', file: '3.BashGame' },
    { id: 4, title: '外卖大战必修课', file: '4.Coupon' },
    { id: 5, title: '异世界迷航', file: '5.GPLT' },
    { id: 6, title: '学姐我想吃鱼了', file: '6.Greedy' },
    { id: 7, title: '玩会吧,别真学会了', file: '7.Bitwise' },
    { id: 8, title: '到底谁在学美工', file: '8.String' },
    { id: 9, title: '来幻觉了', file: '9.HashMap' },
    { id: 10, title: '完完完完全互质', file: '10.gcd' },
    { id: 11, title: 'hina的粒子实验', file: '11.math' }
]);

const PATHS = Object.freeze({
    PROBLEM: 'Problem',
    SOLUTION: 'Solution'
});

const SELECTORS = Object.freeze({
    PROBLEM_LIST: '#problemList',
    PROBLEM_MARKDOWN: '#problemMarkdown',
    SOLUTION_CODE: '#solutionCode',
    WELCOME_PAGE: '#welcomePage',
    PROBLEM_CONTENT: '#problemContent',
    PAGE_TITLE: '#pageTitle',
    SIDEBAR: '#sidebar',
    SIDEBAR_OVERLAY: '#sidebarOverlay',
    MOBILE_MENU_BTN: '#mobileMenuBtn',
    SIDEBAR_TOGGLE: '#sidebarToggle',
    IMAGE_MODAL: '#imageModal'
});

const AppState = {
    currentProblem: null,
    loadingProblemId: null,
    closeSidebarFn: null,
    caches: {
        problems: new Map(),
        solutions: new Map()
    }
};

document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeApp();
    } catch (error) {
        console.error('应用初始化失败:', error);
        showError('应用初始化失败，请刷新页面重试');
    }
});

function initializeApp() {
    ensureRequestIdleCallback();
    configureMathJax();
    configureMarked();
    initProblemList();
    initThemeToggle();
    initTabs();
    initMobileMenu();
    initKeyboardNavigation();
}


function ensureRequestIdleCallback() {
    if (!window.requestIdleCallback) {
        window.requestIdleCallback = function(callback) {
            return setTimeout(callback, 1);
        };
    }
}


function configureMathJax() {
    if (window.MathJax) return; 
    
    window.MathJax = {
        tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            processEscapes: true,
            processEnvironments: true,
            packages: {'[+]': ['ams', 'newcommand', 'configmacros']}
        },
        options: {
            skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
        },
        startup: {
            pageReady: () => MathJax.startup.defaultPageReady()
                .then(() => console.log('MathJax 初始化完成'))
                .catch(err => console.error('MathJax 初始化失败:', err))
        }
    };
}

function configureMarked() {
    if (typeof marked === 'undefined') {
        console.error('marked 库未加载');
        return;
    }
    
    marked.setOptions({
        highlight: (code, lang) => {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { language: lang }).value;
                } catch (err) {
                    console.warn('代码高亮失败:', err);
                }
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true,
        gfm: true,
        sanitize: false, 
        xhtml: false
    });
}

function initProblemList() {
    const problemList = document.querySelector(SELECTORS.PROBLEM_LIST);
    if (!problemList) {
        console.error('找不到题目列表元素');
        return;
    }
    
    const fragment = document.createDocumentFragment();
    
    PROBLEMS.forEach(problem => {
        const li = createProblemListItem(problem);
        fragment.appendChild(li);
    });
    
    problemList.appendChild(fragment);
}

function createProblemListItem(problem) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    
    a.href = '#';
    a.dataset.problemId = problem.id;
    a.setAttribute('role', 'button');
    a.setAttribute('aria-label', `查看题目 ${problem.id}: ${problem.title}`);
    
    const renderedTitle = marked.parseInline(problem.title);
    
    a.innerHTML = `
        <span class="problem-number">${problem.id}</span>
        <span class="problem-title">${renderedTitle}</span>
    `;
    
    a.addEventListener('click', handleProblemClick(problem));
    
    a.addEventListener('mousedown', (e) => e.preventDefault());
    
    li.appendChild(a);
    return li;
}

function handleProblemClick(problem) {
    return (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('加载题目:', problem.id, problem.title);
        loadProblem(problem);
    };
}

async function loadProblem(problem) {
    try {
        closeImageModal();

        if (AppState.currentProblem?.id === problem.id) {
            console.log('当前题目已加载，跳过');
            return;
        }
        
        AppState.loadingProblemId = problem.id;
        const thisLoadId = problem.id;
        const startTime = performance.now();
        
        AppState.currentProblem = problem;
        
        if (window.innerWidth <= 768 && AppState.closeSidebarFn) {
            AppState.closeSidebarFn();
        }
        
        updateProblemListState(problem.id);
        showProblemContent(problem);
        
        const problemMarkdown = document.querySelector(SELECTORS.PROBLEM_MARKDOWN);
        if (!AppState.caches.problems.has(problem.file)) {
            problemMarkdown.innerHTML = createLoadingHTML();
        }
        
        const [problemResult, solutionResult] = await Promise.allSettled([
            loadProblemContent(problem),
            loadSolutionContent(problem)
        ]);
        
        if (AppState.loadingProblemId !== thisLoadId) {
            console.log('加载已取消，有新的加载请求');
            return;
        }
        
        renderProblemResult(problemResult, problemMarkdown);
        renderSolutionResult(solutionResult);
        
        const loadTime = performance.now() - startTime;
        console.log(`题目 ${problem.id} 加载完成，耗时 ${loadTime.toFixed(2)}ms`);
        
        preloadAdjacentProblems(problem);
        
        // 初始化评论系统
        if (typeof window.initComments === 'function') {
            window.initComments(problem.id);
        }
        
    } catch (error) {
        console.error('加载题目时发生错误:', error);
        showError('加载题目失败，请重试');
    }
}

function updateProblemListState(problemId) {
    document.querySelectorAll('.problem-list a').forEach(a => {
        const isActive = parseInt(a.dataset.problemId) === problemId;
        a.classList.toggle('active', isActive);
        a.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
}

function showProblemContent(problem) {
    const welcomePage = document.querySelector(SELECTORS.WELCOME_PAGE);
    const problemContent = document.querySelector(SELECTORS.PROBLEM_CONTENT);
    const titleElement = document.querySelector(SELECTORS.PAGE_TITLE);
    
    welcomePage.style.display = 'none';
    problemContent.style.display = 'block';

    const plainTitle = problem.title.replace(/~~/g, '');
    titleElement.textContent = `${problem.id}. ${plainTitle}`;

    switchTab('problemTab');
}

function createLoadingHTML() {
    return `
        <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
            <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
            <div>加载中...</div>
        </div>
    `;
}

function createErrorHTML(title, message, details = '') {
    return `
        <div style="color: #ef4444; padding: 2rem; text-align: center;">
            <h3>❌ ${title}</h3>
            <p>${message}</p>
            ${details ? `<p style="font-size: 0.875rem; color: #94a3b8;">${details}</p>` : ''}
        </div>
    `;
}

function renderProblemResult(result, container) {
    if (result.status === 'fulfilled') {
        container.innerHTML = result.value;
        lazyLoadImages();
        requestIdleCallback(() => renderMathJax(container));
    } else {
        container.innerHTML = createErrorHTML(
            '加载失败',
            '无法加载题目描述文件',
            result.reason?.message
        );
    }
}

function renderSolutionResult(result) {
    const solutionCode = document.querySelector(SELECTORS.SOLUTION_CODE);
    
    if (result.status === 'fulfilled') {
        solutionCode.innerHTML = result.value;
    } else {
        solutionCode.innerHTML = createErrorHTML(
            '加载失败',
            '无法加载题解文件',
            result.reason?.message
        );
    }
}

function preloadAdjacentProblems(currentProblem) {
    requestIdleCallback(() => {
        const prevProblem = PROBLEMS.find(p => p.id === currentProblem.id - 1);
        const nextProblem = PROBLEMS.find(p => p.id === currentProblem.id + 1);
        
        if (prevProblem && !AppState.caches.problems.has(prevProblem.file)) {
            console.log(`预加载题目 ${prevProblem.id}`);
            loadProblemContent(prevProblem).catch(err => 
                console.warn('预加载失败:', err)
            );
        }
        
        if (nextProblem && !AppState.caches.problems.has(nextProblem.file)) {
            console.log(`预加载题目 ${nextProblem.id}`);
            loadProblemContent(nextProblem).catch(err => 
                console.warn('预加载失败:', err)
            );
        }
    });
}


async function loadProblemContent(problem) {
    if (AppState.caches.problems.has(problem.file)) {
        console.log('从缓存加载题目');
        return AppState.caches.problems.get(problem.file);
    }
    
    const response = await fetch(`${PATHS.PROBLEM}/${problem.file}.md`);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const text = await response.text();
    const html = marked.parse(text);
    
    AppState.caches.problems.set(problem.file, html);
    return html;
}


async function loadSolutionContent(problem) {
    if (AppState.caches.solutions.has(problem.file)) {
        console.log('从缓存加载题解');
        return AppState.caches.solutions.get(problem.file);
    }
    
    const response = await fetch(`${PATHS.SOLUTION}/${problem.file}.c`);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const text = await response.text();
    const highlightedCode = hljs.highlight(text, { language: 'c' }).value;
    const html = `<pre><code class="language-c">${highlightedCode}</code></pre>`;

    AppState.caches.solutions.set(problem.file, html);
    return html;
}

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const isActive = btn.dataset.tab === tab;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive);
    });
    
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    let targetPane;
    if (tab === 'problemTab') {
        targetPane = document.getElementById('problemTab');
    } else if (tab === 'solutionTab') {
        targetPane = document.getElementById('solutionTab');
    } else if (tab === 'commentTab') {
        targetPane = document.getElementById('commentTab');
    }
    
    if (targetPane) {
        targetPane.classList.add('active');
    }
}

function initThemeToggle() {
    const toggleBtn = document.getElementById('toggleTheme');
    if (!toggleBtn) return;
    
    const themeIcon = toggleBtn.querySelector('.theme-icon');
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme, themeIcon);
    
    toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        applyTheme(newTheme, themeIcon);
        localStorage.setItem('theme', newTheme);
    });
}

function applyTheme(theme, iconElement) {
    document.documentElement.setAttribute('data-theme', theme);
    if (iconElement) {
        iconElement.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    updateHighlightTheme(theme);
}

function updateHighlightTheme(theme) {
    const lightTheme = document.getElementById('highlight-light');
    const darkTheme = document.getElementById('highlight-dark');
    
    if (!lightTheme || !darkTheme) return;
    
    lightTheme.disabled = (theme === 'dark');
    darkTheme.disabled = (theme === 'light');
}

async function renderMathJax(element) {
    const targetElement = element || document.querySelector(SELECTORS.PROBLEM_MARKDOWN);
    
    if (!window.MathJax) {
        console.warn('MathJax 未加载');
        setTimeout(() => renderMathJax(targetElement), 500);
        return;
    }
    
    try {
        if (window.MathJax.startup?.promise) {
            await window.MathJax.startup.promise;
        }
        
        if (window.MathJax.typesetPromise) {
            console.log('渲染数学公式...');
            await window.MathJax.typesetPromise([targetElement]);
            console.log('数学公式渲染完成');
        } else if (window.MathJax.typeset) {
            window.MathJax.typeset([targetElement]);
        }
    } catch (err) {
        console.error('MathJax 渲染失败:', err);
        try {
            if (window.MathJax.typesetPromise) {
                await window.MathJax.typesetPromise();
            }
        } catch (retryErr) {
            console.error('MathJax 重试失败:', retryErr);
        }
    }
}

function lazyLoadImages() {
    const problemMarkdown = document.querySelector(SELECTORS.PROBLEM_MARKDOWN);
    if (!problemMarkdown) return;
    
    const images = problemMarkdown.querySelectorAll('img');
    
    images.forEach(img => {
        const newImg = initializeImage(img);
        if (newImg && img.parentNode) {
            img.parentNode.replaceChild(newImg, img);
        }
    });
}

function initializeImage(img) {
    const src = img.getAttribute('src');
    if (!src) return null;
    
    const newImg = img.cloneNode(true);
    
    if (src.startsWith('./')) {
        newImg.setAttribute('src', `${PATHS.PROBLEM}/${src.substring(2)}`);
    }
    
    newImg.style.cssText = 'opacity: 0; transition: opacity 0.3s ease-in-out; cursor: zoom-in;';
    newImg.title = '点击查看大图';
    newImg.alt = newImg.alt || '题目图片';

    newImg.onload = function() {
        this.style.opacity = '1';
    };
    
    newImg.onerror = function() {
        this.style.display = 'none';
        const errorMsg = createImageErrorElement(this.src);
        if (this.parentNode) {
            this.parentNode.insertBefore(errorMsg, this.nextSibling);
        }
    };
    
    newImg.addEventListener('click', (e) => {
        e.stopPropagation();
        openImageModal(newImg.src, newImg.alt);
    });
    
    if (newImg.complete && newImg.naturalHeight !== 0) {
        newImg.style.opacity = '1';
    }
    
    return newImg;
}

function createImageErrorElement(src) {
    const errorMsg = document.createElement('div');
    errorMsg.style.cssText = `
        padding: 1rem;
        background: var(--bg-tertiary);
        border-radius: 0.5rem;
        text-align: center;
        color: var(--text-secondary);
        margin: 1rem 0;
    `;
    errorMsg.innerHTML = `<span style="font-size: 2rem;">🖼️</span><br>图片加载失败: ${src}`;
    return errorMsg;
}

function openImageModal(src, alt) {
    closeImageModal(); 
    
    const modal = createImageModal(src, alt);
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function createImageModal(src, alt) {
    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        cursor: zoom-out;
        animation: fadeIn 0.3s ease-in-out;
    `;
    
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90vh;
        border-radius: 0.5rem;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: zoomIn 0.3s ease-in-out;
        cursor: zoom-out;
    `;
    
    const closeModal = () => {
        modal.style.animation = 'fadeOut 0.2s ease-in-out';
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
                document.body.style.overflow = '';
            }
        }, 200);
        document.removeEventListener('keydown', escHandler);
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
    
    img.onclick = (e) => {
        e.stopPropagation();
        closeModal();
    };
    
    const escHandler = (e) => {
        if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', escHandler);
    
    modal.appendChild(img);
    return modal;
}

function closeImageModal() {
    const imageModal = document.querySelector(SELECTORS.IMAGE_MODAL);
    if (!imageModal) return;
    
    imageModal.style.animation = 'fadeOut 0.2s ease-in-out';
    setTimeout(() => {
        if (document.body.contains(imageModal)) {
            document.body.removeChild(imageModal);
            document.body.style.overflow = '';
        }
    }, 200);
}

function initMobileMenu() {
    const mobileMenuBtn = document.querySelector(SELECTORS.MOBILE_MENU_BTN);
    const sidebarToggle = document.querySelector(SELECTORS.SIDEBAR_TOGGLE);
    const sidebar = document.querySelector(SELECTORS.SIDEBAR);
    const overlay = document.querySelector(SELECTORS.SIDEBAR_OVERLAY);
    
    if (!mobileMenuBtn || !sidebar || !overlay) return;
    
    const closeSidebar = () => {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    };
    
    AppState.closeSidebarFn = closeSidebar;
    
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.add('show');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    });
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', closeSidebar);
    }
    
    overlay.addEventListener('click', closeSidebar);
}

function initKeyboardNavigation() {
    document.addEventListener('keydown', handleKeyboardNavigation);
}

function handleKeyboardNavigation(e) {
    if (!AppState.currentProblem) return;
    
    const currentId = AppState.currentProblem.id;
    
    switch(e.key) {
        case 'ArrowLeft':
            if (currentId > 1) {
                navigateToProblem(currentId - 1);
            }
            break;
        case 'ArrowRight':
            if (currentId < PROBLEMS.length) {
                navigateToProblem(currentId + 1);
            }
            break;
    }
}

function navigateToProblem(problemId) {
    const problem = PROBLEMS.find(p => p.id === problemId);
    if (problem) {
        loadProblem(problem);
    }
}

function showError(message) {
    console.error(message);
}
