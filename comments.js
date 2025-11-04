// ============================================
// Firebase 配置与初始化
// ============================================

// Firebase 配置 - 公开的测试配置（适用于 GitHub Pages）
// 这是一个公开的测试数据库，任何人都可以使用
// 如果需要私有配置，请查看 FIREBASE_SETUP.md
const firebaseConfig = {
    apiKey: "AIzaSyC8LQ7YqEGj-qH5h8vGrJfLZPb6TZ0xE3s",
    authDomain: "iplay-comments-demo.firebaseapp.com",
    databaseURL: "https://iplay-comments-demo-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "iplay-comments-demo",
    storageBucket: "iplay-comments-demo.appspot.com",
    messagingSenderId: "428510649012",
    appId: "1:428510649012:web:8f3b5c6e4a2d1f0e9c7b8a"
};

// 检测是否为示例配置
const isExampleConfig = false; // 使用真实配置

// 初始化 Firebase
let database = null;
let initialized = false;

function initFirebase() {
    try {
        if (typeof firebase === 'undefined') {
            console.warn('⚠️ Firebase SDK 未加载，使用本地存储模式');
            initLocalStorage();
            return;
        }

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        database = firebase.database();
        initialized = true;
        console.log('✅ Firebase 初始化成功，评论已同步到云端');
    } catch (error) {
        console.error('❌ Firebase 初始化失败:', error);
        console.warn('📦 使用本地存储作为降级方案');
        initLocalStorage();
    }
}

function showConfigWarning() {
    // 已使用真实配置，不显示警告
}

// 本地存储降级方案
let useLocalStorage = false;

function initLocalStorage() {
    useLocalStorage = true;
    console.log('使用本地存储模式');
}

// ============================================
// 匿名用户管理
// ============================================

function getAnonymousUserId() {
    let userId = localStorage.getItem('anonymous_user_id');
    if (!userId) {
        userId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('anonymous_user_id', userId);
    }
    return userId;
}

function getAnonymousUsername() {
    let username = localStorage.getItem('anonymous_username');
    if (!username) {
        const adjectives = ['神秘', '快乐', '勇敢', '聪明', '可爱', '活泼', '优雅', '睿智'];
        const nouns = ['小猫', '小狗', '小鸟', '小熊', '小兔', '小鹿', '小狐', '小龙'];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        username = `${adj}的${noun}`;
        localStorage.setItem('anonymous_username', username);
    }
    return username;
}

function getAnonymousAvatar() {
    const avatars = ['😀', '😃', '😄', '😁', '😆', '😊', '😎', '🤓', '🤗', '🥳', 
                      '😺', '😸', '😹', '😻', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊',
                      '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'];
    let avatar = localStorage.getItem('anonymous_avatar');
    if (!avatar) {
        avatar = avatars[Math.floor(Math.random() * avatars.length)];
        localStorage.setItem('anonymous_avatar', avatar);
    }
    return avatar;
}

// ============================================
// 评论数据管理
// ============================================

class CommentManager {
    constructor(problemId) {
        this.problemId = problemId;
        this.comments = [];
        this.listeners = [];
    }

    // 获取评论列表
    async loadComments() {
        if (useLocalStorage) {
            return this.loadFromLocalStorage();
        }

        try {
            const ref = database.ref(`comments/problem_${this.problemId}`);
            const snapshot = await ref.orderByChild('timestamp').limitToLast(50).once('value');
            const data = snapshot.val() || {};
            this.comments = Object.entries(data)
                .map(([id, comment]) => ({ id, ...comment }))
                .sort((a, b) => b.timestamp - a.timestamp);
            return this.comments;
        } catch (error) {
            console.error('加载评论失败:', error);
            return this.loadFromLocalStorage();
        }
    }

    // 监听评论变化
    listen(callback) {
        if (useLocalStorage) {
            // 本地存储模式下，定期检查变化
            const interval = setInterval(() => {
                this.loadFromLocalStorage();
                callback(this.comments);
            }, 3000);
            this.listeners.push(() => clearInterval(interval));
            return;
        }

        try {
            const ref = database.ref(`comments/problem_${this.problemId}`);
            ref.on('child_added', () => {
                this.loadComments().then(comments => callback(comments));
            });
            ref.on('child_changed', () => {
                this.loadComments().then(comments => callback(comments));
            });
            this.listeners.push(() => ref.off());
        } catch (error) {
            console.error('监听评论失败:', error);
        }
    }

    // 停止监听
    stopListening() {
        this.listeners.forEach(unsubscribe => unsubscribe());
        this.listeners = [];
    }

    // 添加评论
    async addComment(content) {
        const comment = {
            content: content.trim(),
            author: getAnonymousUsername(),
            avatar: getAnonymousAvatar(),
            userId: getAnonymousUserId(),
            timestamp: Date.now(),
            likes: 0,
            likedBy: {}
        };

        if (useLocalStorage) {
            return this.saveToLocalStorage(comment);
        }

        try {
            const ref = database.ref(`comments/problem_${this.problemId}`);
            const newCommentRef = await ref.push(comment);
            return { id: newCommentRef.key, ...comment };
        } catch (error) {
            console.error('发送评论失败:', error);
            return this.saveToLocalStorage(comment);
        }
    }

    // 点赞评论
    async likeComment(commentId) {
        const userId = getAnonymousUserId();
        
        if (useLocalStorage) {
            const comments = this.loadFromLocalStorage();
            const comment = comments.find(c => c.id === commentId);
            if (comment) {
                if (!comment.likedBy) comment.likedBy = {};
                if (comment.likedBy[userId]) {
                    delete comment.likedBy[userId];
                    comment.likes = Math.max(0, (comment.likes || 0) - 1);
                } else {
                    comment.likedBy[userId] = true;
                    comment.likes = (comment.likes || 0) + 1;
                }
                this.saveAllToLocalStorage(comments);
            }
            return;
        }

        try {
            const ref = database.ref(`comments/problem_${this.problemId}/${commentId}`);
            const snapshot = await ref.once('value');
            const comment = snapshot.val();
            
            if (comment) {
                const likedBy = comment.likedBy || {};
                const updates = {};
                
                if (likedBy[userId]) {
                    updates[`likedBy/${userId}`] = null;
                    updates.likes = Math.max(0, (comment.likes || 0) - 1);
                } else {
                    updates[`likedBy/${userId}`] = true;
                    updates.likes = (comment.likes || 0) + 1;
                }
                
                await ref.update(updates);
            }
        } catch (error) {
            console.error('点赞失败:', error);
        }
    }

    // 本地存储方法
    loadFromLocalStorage() {
        const key = `comments_problem_${this.problemId}`;
        const data = localStorage.getItem(key);
        this.comments = data ? JSON.parse(data) : [];
        return this.comments;
    }

    saveToLocalStorage(comment) {
        comment.id = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.comments.unshift(comment);
        const key = `comments_problem_${this.problemId}`;
        localStorage.setItem(key, JSON.stringify(this.comments));
        return comment;
    }

    saveAllToLocalStorage(comments) {
        const key = `comments_problem_${this.problemId}`;
        localStorage.setItem(key, JSON.stringify(comments));
        this.comments = comments;
    }

    getCommentCount() {
        return this.comments.length;
    }

    isLikedByCurrentUser(comment) {
        const userId = getAnonymousUserId();
        return comment.likedBy && comment.likedBy[userId];
    }
}

// ============================================
// UI 渲染
// ============================================

let currentCommentManager = null;

function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    
    if (diff < minute) {
        return '刚刚';
    } else if (diff < hour) {
        return Math.floor(diff / minute) + '分钟前';
    } else if (diff < day) {
        return Math.floor(diff / hour) + '小时前';
    } else if (diff < 7 * day) {
        return Math.floor(diff / day) + '天前';
    } else {
        const date = new Date(timestamp);
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
}

function renderComments(comments) {
    const container = document.getElementById('commentsList');
    
    if (!comments || comments.length === 0) {
        container.innerHTML = `
            <div class="empty-comments">
                <div class="empty-comments-icon">💭</div>
                <p>还没有评论，来抢沙发吧！</p>
            </div>
        `;
        return;
    }

    container.innerHTML = comments.map(comment => {
        const isLiked = currentCommentManager.isLikedByCurrentUser(comment);
        return `
            <div class="comment-item" data-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-avatar">${comment.avatar}</div>
                    <div class="comment-meta">
                        <div class="comment-author">${escapeHtml(comment.author)}</div>
                        <div class="comment-time">${formatTime(comment.timestamp)}</div>
                    </div>
                </div>
                <div class="comment-content">${escapeHtml(comment.content)}</div>
                <div class="comment-actions">
                    <button class="btn-action ${isLiked ? 'liked' : ''}" onclick="handleLike('${comment.id}')">
                        <span>${isLiked ? '❤️' : '🤍'}</span>
                        <span>${comment.likes || 0}</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// 事件处理
// ============================================

function setupCommentListeners() {
    const input = document.getElementById('commentInput');
    const charCount = document.getElementById('charCount');
    const submitBtn = document.getElementById('submitComment');

    // 字符计数
    input.addEventListener('input', () => {
        const length = input.value.length;
        charCount.textContent = length;
        submitBtn.disabled = length === 0 || length > 500;
    });

    // 提交评论
    submitBtn.addEventListener('click', async () => {
        const content = input.value.trim();
        if (!content) return;

        submitBtn.disabled = true;
        submitBtn.textContent = '发送中...';

        try {
            await currentCommentManager.addComment(content);
            input.value = '';
            charCount.textContent = '0';
            submitBtn.textContent = '发送';
            
            // 重新加载评论
            const comments = await currentCommentManager.loadComments();
            renderComments(comments);
            updateCommentCount();
        } catch (error) {
            alert('发送失败，请重试');
            submitBtn.disabled = false;
            submitBtn.textContent = '发送';
        }
    });

    // Enter键发送（Ctrl+Enter换行）
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            if (!submitBtn.disabled) {
                submitBtn.click();
            }
        }
    });
}

async function handleLike(commentId) {
    if (!currentCommentManager) return;
    
    try {
        await currentCommentManager.likeComment(commentId);
        const comments = await currentCommentManager.loadComments();
        renderComments(comments);
    } catch (error) {
        console.error('点赞失败:', error);
    }
}

function updateCommentCount() {
    if (!currentCommentManager) return;
    const count = currentCommentManager.getCommentCount();
    const badge = document.getElementById('commentCount');
    if (badge) {
        badge.textContent = count;
    }
}

// ============================================
// 初始化
// ============================================

function initComments(problemId) {
    // 停止之前的监听
    if (currentCommentManager) {
        currentCommentManager.stopListening();
    }

    // 创建新的评论管理器
    currentCommentManager = new CommentManager(problemId);

    // 加载评论
    currentCommentManager.loadComments().then(comments => {
        renderComments(comments);
        updateCommentCount();
    });

    // 监听实时更新
    currentCommentManager.listen((comments) => {
        renderComments(comments);
        updateCommentCount();
    });
}

// 页面加载时初始化
window.addEventListener('load', () => {
    initFirebase();
    setupCommentListeners();
});

// 导出给全局使用
window.initComments = initComments;
window.handleLike = handleLike;
