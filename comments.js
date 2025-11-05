// ============================================
// Firebase 配置与初始化
// ============================================

// Firebase 配置 - 请替换为你自己的真实配置
// 获取方式：查看 FIREBASE_SETUP.md 文件创建 Firebase 项目
// 当前默认使用本地存储模式
const firebaseConfig = {
    apiKey: "AIzaSyDjekObR5bIb0H8pyWhYIyVaP4EpvWbCug",
    authDomain: "iplay-comments.firebaseapp.com",
    databaseURL: "https://iplay-comments-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "iplay-comments",
    storageBucket: "iplay-comments.firebasestorage.app",
    messagingSenderId: "916268939319",
    appId: "1:916268939319:web:ede9413fc33528cf35e7b2",
    measurementId: "G-83GHTNGYY4"
};
// 检测是否为示例配置
const isExampleConfig = firebaseConfig.apiKey === "YOUR_API_KEY" || firebaseConfig.apiKey.includes("Dummy");

// 初始化 Firebase
let database = null;
// 不再使用 Firebase Storage，头像使用 Base64 存储（完全免费）
let initialized = false;

function initFirebase() {
    // 如果是示例配置，直接使用本地存储
    if (isExampleConfig) {
        console.log('💾 使用本地存储模式（评论仅保存在浏览器中）');
        console.log('💡 提示：查看 FIREBASE_SETUP.md 配置 Firebase 实现云端同步');
        initLocalStorage();
        return;
    }

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
        // 不再使用 Firebase Storage，改用 Base64 存储（完全免费）
        initialized = true;
        console.log('✅ Firebase 初始化成功，评论已同步到云端');
    } catch (error) {
        console.error('❌ Firebase 初始化失败:', error);
        console.warn('📦 使用本地存储作为降级方案');
        initLocalStorage();
    }
}

function showConfigWarning() {
    // 配置警告相关代码
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

// 同步用户资料到 Firebase
async function syncUserProfileToFirebase() {
    if (useLocalStorage || !database) {
        return; // 如果使用本地存储或 Firebase 未初始化，不同步
    }
    
    try {
        const userId = getAnonymousUserId();
        const username = getAnonymousUsername();
        const avatar = getAnonymousAvatar();
        
        const profileRef = database.ref(`userProfiles/${userId}`);
        await profileRef.set({
            username: username,
            avatar: avatar,
            lastUpdated: Date.now()
        });
        console.log('✅ 用户资料已同步到云端');
    } catch (error) {
        console.warn('⚠️ 同步用户资料失败:', error);
    }
}

// 从 Firebase 加载用户资料
async function loadUserProfileFromFirebase() {
    if (useLocalStorage || !database) {
        return; // 如果使用本地存储或 Firebase 未初始化，不加载
    }
    
    try {
        const userId = getAnonymousUserId();
        const profileRef = database.ref(`userProfiles/${userId}`);
        const snapshot = await profileRef.once('value');
        const profile = snapshot.val();
        
        if (profile) {
            // 从云端恢复用户资料
            localStorage.setItem('anonymous_username', profile.username);
            localStorage.setItem('anonymous_avatar', profile.avatar);
            updateUserProfileDisplay();
            console.log('✅ 已从云端加载用户资料');
        }
    } catch (error) {
        console.warn('⚠️ 加载用户资料失败:', error);
    }
}

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

function setAnonymousUsername(username) {
    localStorage.setItem('anonymous_username', username);
    // 同步到 Firebase
    syncUserProfileToFirebase();
    updateUserProfileDisplay();
}

function getAnonymousAvatar() {
    const avatars = ['😀', '😃', '😄', '😁', '😆', '😊', '😎', '🤓', '🤗', '🥳', 
                      '😺', '😸', '😹', '😻', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊',
                      '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
                      '🦄', '🦋', '🐙', '🦖', '🦕', '🐉', '🌸', '🌺', '🌻', '🌹',
                      '⭐', '🌟', '✨', '💫', '🔥', '💧', '🌈', '☀️', '🌙', '⚡'];
    let avatar = localStorage.getItem('anonymous_avatar');
    if (!avatar) {
        avatar = avatars[Math.floor(Math.random() * avatars.length)];
        localStorage.setItem('anonymous_avatar', avatar);
    }
    return avatar;
}

function setAnonymousAvatar(avatar) {
    // 保存头像（emoji 或 Base64 图片数据）
    localStorage.setItem('anonymous_avatar', avatar);
    // 同步到 Firebase
    syncUserProfileToFirebase();
    updateUserProfileDisplay();
}

function isAvatarImage() {
    const avatar = getAnonymousAvatar();
    // 检查是否为图片 URL（http/https）或 Base64 图片数据
    return avatar && (avatar.startsWith('http') || avatar.startsWith('data:image/'));
}

function setAvatarAsImage(url) {
    // 直接保存图片数据（Base64 或 URL），不需要额外标记
    localStorage.setItem('anonymous_avatar', url);
    // 同步到 Firebase
    syncUserProfileToFirebase();
    updateUserProfileDisplay();
}

function updateUserProfileDisplay() {
    const avatarDisplay = document.getElementById('userAvatarDisplay');
    const nameDisplay = document.getElementById('userNameDisplay');
    
    if (avatarDisplay) {
        const avatar = getAnonymousAvatar();
        if (isAvatarImage()) {
            avatarDisplay.innerHTML = `<img src="${avatar}" alt="头像" onerror="this.parentElement.textContent='😀'">`;
        } else {
            avatarDisplay.textContent = avatar;
        }
    }
    
    if (nameDisplay) {
        nameDisplay.textContent = getAnonymousUsername();
    }
}

function getAllAvatars() {
    return ['😀', '😃', '😄', '😁', '😆', '😊', '😎', '🤓', '🤗', '🥳', 
            '😺', '😸', '😹', '😻', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊',
            '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
            '🦄', '🦋', '🐙', '🦖', '🦕', '🐉', '🌸', '🌺', '🌻', '🌹',
            '⭐', '🌟', '✨', '💫', '🔥', '💧', '🌈', '☀️', '🌙', '⚡'];
}

// ============================================
// 用户资料编辑
// ============================================

let uploadedImageUrl = null;

async function uploadAvatarImage(file) {
    // 验证文件
    if (!file) {
        throw new Error('请选择文件');
    }
    
    if (!file.type.startsWith('image/')) {
        throw new Error('请选择图片文件');
    }
    
    // 限制文件大小为 200KB（Base64 存储在数据库中）
    if (file.size > 200 * 1024) {
        throw new Error('图片大小不能超过 200KB\n建议使用 tinypng.com 压缩图片');
    }
    
    const progressBar = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressContainer = document.getElementById('uploadProgress');
    
    try {
        progressContainer.style.display = 'block';
        progressText.textContent = '正在处理图片...';
        
        // 使用 FileReader 转换为 Base64
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onprogress = (e) => {
                if (e.lengthComputable) {
                    const progress = (e.loaded / e.total) * 100;
                    progressBar.style.width = progress + '%';
                    progressText.textContent = `处理中... ${Math.round(progress)}%`;
                }
            };
            
            reader.onload = (e) => {
                const base64String = e.target.result;
                progressBar.style.width = '100%';
                progressText.textContent = '处理完成！';
                
                uploadedImageUrl = base64String;
                updateAvatarPreview(base64String);
                
                setTimeout(() => {
                    progressContainer.style.display = 'none';
                    progressBar.style.width = '0%';
                }, 1000);
                
                resolve(base64String);
            };
            
            reader.onerror = (error) => {
                progressContainer.style.display = 'none';
                progressBar.style.width = '0%';
                reject(new Error('读取文件失败'));
            };
            
            // 开始读取文件为 Base64
            reader.readAsDataURL(file);
        });
        
    } catch (error) {
        progressContainer.style.display = 'none';
        progressBar.style.width = '0%';
        throw error;
    }
}

function showProfileModal() {
    const modal = document.getElementById('profileModal');
    const avatarGrid = document.getElementById('avatarGrid');
    const nicknameInput = document.getElementById('nicknameInput');
    const emojiSection = document.getElementById('emojiAvatarSection');
    const imageSection = document.getElementById('imageAvatarSection');
    
    // 重置上传状态
    uploadedImageUrl = null;
    const preview = document.getElementById('avatarPreview');
    preview.style.display = 'none';
    preview.innerHTML = '<div class="avatar-preview-placeholder">预览区域</div>';
    
    // 显示当前资料
    nicknameInput.value = getAnonymousUsername();
    
    const currentAvatar = getAnonymousAvatar();
    const isImage = isAvatarImage();
    
    // 设置默认标签
    if (isImage) {
        document.querySelector('.avatar-type-tab[data-type="image"]').click();
        updateAvatarPreview(currentAvatar);
        preview.style.display = 'flex';
        uploadedImageUrl = currentAvatar;
    } else {
        document.querySelector('.avatar-type-tab[data-type="emoji"]').click();
        // 渲染表情头像选项
        avatarGrid.innerHTML = getAllAvatars().map(avatar => 
            `<div class="avatar-option ${avatar === currentAvatar ? 'selected' : ''}" data-avatar="${avatar}">${avatar}</div>`
        ).join('');
        
        // 添加头像选择事件
        avatarGrid.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                avatarGrid.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
    }
    
    modal.style.display = 'flex';
}

function updateAvatarPreview(url) {
    const preview = document.getElementById('avatarPreview');
    preview.style.display = 'flex';
    if (url && url.trim()) {
        preview.innerHTML = `<img src="${url}" alt="头像预览" onerror="this.parentElement.innerHTML='<div class=\\'avatar-preview-placeholder\\'>图片加载失败</div>'">`;
    } else {
        preview.innerHTML = '<div class="avatar-preview-placeholder">预览区域</div>';
    }
}

function hideProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.style.display = 'none';
}

function saveProfile() {
    const nicknameInput = document.getElementById('nicknameInput');
    const selectedAvatar = document.querySelector('.avatar-option.selected');
    const activeTab = document.querySelector('.avatar-type-tab.active');
    
    const newNickname = nicknameInput.value.trim();
    if (!newNickname) {
        alert('请输入昵称');
        return;
    }
    
    if (newNickname.length > 20) {
        alert('昵称最多20个字符');
        return;
    }
    
    // 根据选择的标签类型保存头像
    if (activeTab.dataset.type === 'emoji') {
        if (selectedAvatar) {
            setAnonymousAvatar(selectedAvatar.dataset.avatar);
        }
    } else {
        // 图片头像
        if (!uploadedImageUrl) {
            alert('请先上传图片');
            return;
        }
        setAvatarAsImage(uploadedImageUrl);
    }
    
    setAnonymousUsername(newNickname);
    
    hideProfileModal();
    showToast('资料已更新！');
}

function setupProfileListeners() {
    const editBtn = document.getElementById('editProfileBtn');
    const closeBtn = document.getElementById('closeProfileModal');
    const saveBtn = document.getElementById('saveProfileBtn');
    const cancelBtn = document.getElementById('cancelProfileBtn');
    const modal = document.getElementById('profileModal');
    const avatarTypeTabs = document.querySelectorAll('.avatar-type-tab');
    const fileUploadArea = document.querySelector('.file-upload-area');
    const avatarFileInput = document.getElementById('avatarFileInput');
    const emojiSection = document.getElementById('emojiAvatarSection');
    const imageSection = document.getElementById('imageAvatarSection');
    
    if (editBtn) {
        editBtn.addEventListener('click', showProfileModal);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', hideProfileModal);
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', saveProfile);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideProfileModal);
    }
    
    // 标签切换
    avatarTypeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            avatarTypeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (tab.dataset.type === 'emoji') {
                emojiSection.style.display = 'block';
                imageSection.style.display = 'none';
            } else {
                emojiSection.style.display = 'none';
                imageSection.style.display = 'block';
            }
        });
    });
    
    // 点击上传区域触发文件选择
    if (fileUploadArea) {
        fileUploadArea.addEventListener('click', () => {
            avatarFileInput.click();
        });
        
        // 拖放功能
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.style.borderColor = '#4285f4';
            fileUploadArea.style.backgroundColor = '#f0f7ff';
        });
        
        fileUploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            fileUploadArea.style.borderColor = '#ddd';
            fileUploadArea.style.backgroundColor = 'transparent';
        });
        
        fileUploadArea.addEventListener('drop', async (e) => {
            e.preventDefault();
            fileUploadArea.style.borderColor = '#ddd';
            fileUploadArea.style.backgroundColor = 'transparent';
            
            const file = e.dataTransfer.files[0];
            if (file) {
                try {
                    const downloadURL = await uploadAvatarImage(file);
                    uploadedImageUrl = downloadURL;
                    updateAvatarPreview(downloadURL);
                    showToast('图片上传成功！');
                } catch (error) {
                    alert('上传失败：' + error.message);
                }
            }
        });
    }
    
    // 文件选择处理
    if (avatarFileInput) {
        avatarFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const downloadURL = await uploadAvatarImage(file);
                    uploadedImageUrl = downloadURL;
                    updateAvatarPreview(downloadURL);
                    showToast('图片上传成功！');
                } catch (error) {
                    alert('上传失败：' + error.message);
                }
            }
        });
    }
    
    // 点击遮罩关闭
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideProfileModal();
            }
        });
    }
    
    // 更新显示
    updateUserProfileDisplay();
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
        // 检查是否为图片头像（支持 URL 和 Base64）
        const isImageAvatar = comment.avatar && (comment.avatar.startsWith('http') || comment.avatar.startsWith('data:image/'));
        const avatarHtml = isImageAvatar 
            ? `<img src="${comment.avatar}" alt="头像" onerror="this.parentElement.textContent='😀'">` 
            : comment.avatar;
        
        return `
            <div class="comment-item" data-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-avatar">${avatarHtml}</div>
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

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'comment-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ============================================
// 事件处理
// ============================================

function setupCommentListeners() {
    const input = document.getElementById('commentInput');
    const charCount = document.getElementById('charCount');
    const submitBtn = document.getElementById('submitComment');

    if (!input || !charCount || !submitBtn) {
        console.warn('评论表单元素未找到，稍后重试');
        return;
    }

    console.log('设置评论监听器...');

    // 字符计数
    input.addEventListener('input', () => {
        const length = input.value.length;
        charCount.textContent = length;
        submitBtn.disabled = length === 0 || length > 500;
    });

    // 提交评论
    submitBtn.addEventListener('click', async () => {
        const content = input.value.trim();
        if (!content) {
            alert('请输入评论内容');
            return;
        }

        if (!currentCommentManager) {
            alert('评论系统未初始化，请先选择一道题目');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = '发送中...';
        console.log('开始发送评论...');

        try {
            console.log('评论内容:', content);
            const newComment = await currentCommentManager.addComment(content);
            console.log('评论发送成功:', newComment);
            
            input.value = '';
            charCount.textContent = '0';
            
            // 重新加载评论
            const comments = await currentCommentManager.loadComments();
            console.log('重新加载评论列表，共', comments.length, '条');
            renderComments(comments);
            updateCommentCount();
            
            // 恢复按钮状态
            submitBtn.textContent = '发送';
            submitBtn.disabled = true; // 因为输入框已清空
            
            // 显示成功提示
            showToast('评论发送成功！');
        } catch (error) {
            console.error('发送评论失败:', error);
            alert('发送失败: ' + (error.message || '未知错误'));
            submitBtn.textContent = '发送';
            submitBtn.disabled = false;
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
let listenersSetup = false;

// 等待 Firebase SDK 加载完成
function waitForFirebase(callback, maxAttempts = 50) {
    let attempts = 0;
    const checkFirebase = setInterval(() => {
        attempts++;
        if (typeof firebase !== 'undefined') {
            clearInterval(checkFirebase);
            console.log('✅ Firebase SDK 已加载');
            callback();
        } else if (attempts >= maxAttempts) {
            clearInterval(checkFirebase);
            console.warn('⚠️ Firebase SDK 加载超时，使用本地存储');
            callback();
        }
    }, 100);
}

// 初始化函数
function initializeCommentSystem() {
    console.log('评论系统开始初始化...');
    initFirebase();
    
    // 从云端加载用户资料
    loadUserProfileFromFirebase();
    
    // 只设置一次监听器
    if (!listenersSetup) {
        setupCommentListeners();
        setupProfileListeners();
        listenersSetup = true;
        console.log('评论监听器已设置');
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        waitForFirebase(initializeCommentSystem);
    });
} else {
    // DOM 已经加载完成
    waitForFirebase(initializeCommentSystem);
}

// 导出给全局使用
window.initComments = initComments;
window.handleLike = handleLike;
