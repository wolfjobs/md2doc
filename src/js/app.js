import { marked } from 'marked';
import docsData from '../data/docs-food.json';

class DocsApp {
    constructor() {
        this.currentDoc = null;
        this.searchIndex = [];
        this.theme = localStorage.getItem('theme') || 'light';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTheme();
        this.buildNavigation();
        this.buildSearchIndex();
        this.loadDefaultDoc();
    }

    setupEventListeners() {
        // 侧边栏切换
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const sidebar = document.getElementById('sidebar');

        sidebarToggle?.addEventListener('click', () => this.toggleSidebar());
        mobileMenuToggle?.addEventListener('click', () => this.toggleSidebar());

        // 主题切换
        const themeToggle = document.getElementById('themeToggle');
        themeToggle?.addEventListener('click', () => this.toggleTheme());

        // 搜索功能
        const searchInput = document.getElementById('searchInput');
        const searchModalInput = document.getElementById('searchModalInput');
        const searchModal = document.getElementById('searchModal');
        const searchModalClose = document.getElementById('searchModalClose');

        searchInput?.addEventListener('focus', () => this.openSearchModal());
        searchModalInput?.addEventListener('input', (e) => this.handleSearch(e.target.value));
        searchModalClose?.addEventListener('click', () => this.closeSearchModal());
        searchModal?.addEventListener('click', (e) => {
            if (e.target === searchModal) this.closeSearchModal();
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        this.openSearchModal();
                        break;
                    case '/':
                        e.preventDefault();
                        this.openSearchModal();
                        break;
                }
            }
            if (e.key === 'Escape') {
                this.closeSearchModal();
            }
        });

        // 响应式处理
        window.addEventListener('resize', () => this.handleResize());
    }

    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            icon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.setupTheme();
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar?.classList.toggle('open');
    }

    buildNavigation() {
        const sidebarNav = document.getElementById('sidebarNav');
        if (!sidebarNav) return;

        let navHTML = '';

        docsData.sections.forEach(section => {
            navHTML += `
                <div class="nav-section">
                    <div class="nav-section-title">
                        <i class="${section.icon}"></i>
                        ${section.title}
                    </div>
            `;

            section.items.forEach(item => {
                navHTML += this.buildNavItem(item, 0);
            });

            navHTML += '</div>';
        });

        sidebarNav.innerHTML = navHTML;

        // 初始化所有子菜单为折叠状态
        this.initializeNavState();

        // 添加导航点击事件
        sidebarNav.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            const navToggle = e.target.closest('.nav-toggle');
            
            if (navToggle) {
                e.preventDefault();
                e.stopPropagation();
                this.toggleNavItem(navToggle);
            } else if (navItem) {
                e.preventDefault();
                const docId = navItem.dataset.doc;
                this.loadDoc(docId);
                this.updateActiveNav(navItem);
            }
        });
    }

    buildNavItem(item, level = 0) {
        const hasChildren = item.items && item.items.length > 0;
        const indentClass = level > 0 ? `nav-item-level-${level}` : '';
        const toggleIcon = hasChildren ? 'fas fa-chevron-right' : '';
        
        let html = `
            <div class="nav-item-wrapper ${indentClass}">
                <a href="#" class="nav-item" data-doc="${item.id}">
                    ${hasChildren ? `<i class="nav-toggle ${toggleIcon}"></i>` : '<i class="nav-spacer"></i>'}
                    <i class="fas fa-file-alt"></i>
                    <span class="nav-text">${item.title}</span>
                </a>
        `;

        if (hasChildren) {
            html += '<div class="nav-children">';
            item.items.forEach(child => {
                html += this.buildNavItem(child, level + 1);
            });
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    initializeNavState() {
        // 初始化所有有子菜单的导航项为折叠状态
        const navToggles = document.querySelectorAll('.nav-toggle');
        navToggles.forEach(toggle => {
            const navItemWrapper = toggle.closest('.nav-item-wrapper');
            const navChildren = navItemWrapper.querySelector('.nav-children');
            
            if (navChildren) {
                // 设置为折叠状态
                navChildren.style.display = 'none';
                toggle.className = 'nav-toggle fas fa-chevron-right';
                navItemWrapper.classList.remove('expanded');
            }
        });
    }

    toggleNavItem(toggle) {
        const navItemWrapper = toggle.closest('.nav-item-wrapper');
        const navChildren = navItemWrapper.querySelector('.nav-children');
        
        if (navChildren) {
            const isExpanded = navChildren.style.display !== 'none';
            navChildren.style.display = isExpanded ? 'none' : 'block';
            
            // 更新箭头图标
            toggle.className = isExpanded ? 'nav-toggle fas fa-chevron-right' : 'nav-toggle fas fa-chevron-down';
            
            // 更新展开状态
            navItemWrapper.classList.toggle('expanded', !isExpanded);
        }
    }

    buildSearchIndex() {
        this.searchIndex = [];
        
        docsData.sections.forEach(section => {
            section.items.forEach(item => {
                this.addItemToSearchIndex(item, section.title);
            });
        });
    }

    addItemToSearchIndex(item, sectionTitle) {
        this.searchIndex.push({
            id: item.id,
            title: item.title,
            description: item.description,
            section: sectionTitle,
            content: '', // 文档内容将在加载时填充
            file: item.file // 保存文件路径用于加载内容
        });

        // 递归添加子项目
        if (item.items && item.items.length > 0) {
            item.items.forEach(child => {
                this.addItemToSearchIndex(child, sectionTitle);
            });
        }
    }

    loadDefaultDoc() {
        const firstSection = docsData.sections[0];
        if (firstSection && firstSection.items.length > 0) {
            this.loadDoc(firstSection.items[0].id);
        }
    }

    async loadDoc(docId) {
        const doc = this.findDocById(docId);
        if (!doc) return;

        this.currentDoc = doc;
        this.showLoading();

        try {
            const response = await fetch(`./src/docs/${doc.file}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const markdown = await response.text();
            const html = this.renderMarkdown(markdown);
            this.displayContent(html);
            
            // 更新搜索索引中的文档内容
            this.updateSearchIndexContent(docId, markdown);
            
            // 更新左侧导航的激活状态
            this.updateActiveNavById(docId);
        } catch (error) {
            console.error('加载文档失败:', error);
            this.displayError(`加载文档失败: ${error.message}`);
        }
    }

    findDocById(docId) {
        for (const section of docsData.sections) {
            const doc = this.findItemInSection(section.items, docId);
            if (doc) {
                return { ...doc, section: section.title };
            }
        }
        return null;
    }

    findItemInSection(items, docId) {
        for (const item of items) {
            if (item.id === docId) {
                return item;
            }
            if (item.items && item.items.length > 0) {
                const found = this.findItemInSection(item.items, docId);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    updateSearchIndexContent(docId, markdownContent) {
        // 找到对应的搜索索引项并更新内容
        const searchItem = this.searchIndex.find(item => item.id === docId);
        if (searchItem) {
            // 清理Markdown内容，移除标记符号，只保留纯文本
            const cleanContent = this.cleanMarkdownForSearch(markdownContent);
            searchItem.content = cleanContent;
        }
    }

    cleanMarkdownForSearch(markdown) {
        return markdown
            // 移除Markdown标题标记
            .replace(/^#{1,6}\s+/gm, '')
            // 移除代码块标记
            .replace(/```[\s\S]*?```/g, '')
            .replace(/`[^`]+`/g, '')
            // 移除链接标记，保留链接文本
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            // 移除图片标记
            .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
            // 移除粗体和斜体标记
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/__([^_]+)__/g, '$1')
            .replace(/_([^_]+)_/g, '$1')
            // 移除列表标记
            .replace(/^[\s]*[-*+]\s+/gm, '')
            .replace(/^[\s]*\d+\.\s+/gm, '')
            // 移除引用标记
            .replace(/^>\s*/gm, '')
            // 移除水平线
            .replace(/^[-*_]{3,}$/gm, '')
            // 移除表格标记
            .replace(/\|/g, ' ')
            // 移除多余的空白字符
            .replace(/\s+/g, ' ')
            .trim();
    }

    renderMarkdown(markdown) {
        // 配置 marked
        marked.setOptions({
            highlight: function(code, lang) {
                // 这里可以集成代码高亮库
                return code;
            },
            breaks: true,
            gfm: true
        });

        return marked.parse(markdown);
    }

    displayContent(html) {
        const content = document.getElementById('content');
        if (!content) return;

        content.innerHTML = `
            <div class="markdown-content">
                ${html}
            </div>
        `;

        // 添加代码复制功能
        this.addCodeCopyButtons();
        
        // 添加目录生成
        this.generateTableOfContents();
        
        // 调整内容包装器布局
        this.adjustContentWrapperLayout();
        
        // 处理文档内链接
        this.handleDocumentLinks();
        
        // 处理图片路径
        this.fixImagePaths();
    }

    displayError(message) {
        const content = document.getElementById('content');
        if (!content) return;

        content.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>加载失败</h2>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-btn">
                    <i class="fas fa-refresh"></i>
                    重新加载
                </button>
            </div>
        `;
    }

    showLoading() {
        const content = document.getElementById('content');
        if (!content) return;

        content.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>加载中...</p>
            </div>
        `;
    }

    updateActiveNav(activeItem) {
        // 移除所有活动状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // 添加活动状态
        activeItem.classList.add('active');

        // 在移动端关闭侧边栏
        if (window.innerWidth <= 768) {
            this.toggleSidebar();
        }
    }

    updateActiveNavById(docId) {
        // 移除所有活动状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // 查找对应的导航项
        const targetNavItem = document.querySelector(`.nav-item[data-doc="${docId}"]`);
        if (targetNavItem) {
            // 添加活动状态
            targetNavItem.classList.add('active');
            
            // 展开父级菜单（如果有的话）
            this.expandParentMenus(targetNavItem);
            
            // 在移动端关闭侧边栏
            if (window.innerWidth <= 768) {
                this.toggleSidebar();
            }
        }
    }

    expandParentMenus(navItem) {
        // 向上查找所有父级菜单并展开
        let currentElement = navItem.closest('.nav-item-wrapper');
        while (currentElement) {
            const parentWrapper = currentElement.parentElement.closest('.nav-item-wrapper');
            if (parentWrapper) {
                const navChildren = parentWrapper.querySelector('.nav-children');
                const navToggle = parentWrapper.querySelector('.nav-toggle');
                
                if (navChildren && navToggle) {
                    // 展开父级菜单
                    navChildren.style.display = 'block';
                    navToggle.className = 'nav-toggle fas fa-chevron-down';
                    parentWrapper.classList.add('expanded');
                }
            }
            currentElement = parentWrapper;
        }
    }

    addCodeCopyButtons() {
        const codeBlocks = document.querySelectorAll('pre code');
        
        codeBlocks.forEach(block => {
            const pre = block.parentElement;
            const button = document.createElement('button');
            button.className = 'code-copy-btn';
            button.innerHTML = '<i class="fas fa-copy"></i>';
            button.title = '复制代码';
            
            button.addEventListener('click', () => {
                navigator.clipboard.writeText(block.textContent).then(() => {
                    button.innerHTML = '<i class="fas fa-check"></i>';
                    button.classList.add('copied');
                    setTimeout(() => {
                        button.innerHTML = '<i class="fas fa-copy"></i>';
                        button.classList.remove('copied');
                    }, 2000);
                });
            });
            
            pre.style.position = 'relative';
            pre.appendChild(button);
        });
    }

    generateTableOfContents() {
        const headings = document.querySelectorAll('.markdown-content h1, .markdown-content h2, .markdown-content h3');
        
        // 移除旧的目录
        const contentWrapper = document.querySelector('.content-wrapper');
        if (contentWrapper) {
            const oldToc = contentWrapper.querySelector('.table-of-contents');
            if (oldToc) {
                oldToc.remove();
            }
        }
        
        // 如果没有标题，不生成目录
        if (headings.length === 0) return;

        const toc = document.createElement('div');
        toc.className = 'table-of-contents';
        toc.innerHTML = '<h3>目录</h3><ul></ul>';

        const tocList = toc.querySelector('ul');
        let currentLevel = 0;

        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            const id = `heading-${index}`;
            heading.id = id;

            const li = document.createElement('li');
            li.className = `toc-level-${level}`;
            li.innerHTML = `<a href="#${id}">${heading.textContent}</a>`;

            if (level > currentLevel) {
                // 创建嵌套列表
                const nestedUl = document.createElement('ul');
                nestedUl.appendChild(li);
                tocList.appendChild(nestedUl);
            } else {
                tocList.appendChild(li);
            }

            currentLevel = level;
        });

        // 只有当有目录项时才添加到页面
        if (contentWrapper && tocList.children.length > 0) {
            contentWrapper.appendChild(toc);
        }
    }

    adjustContentWrapperLayout() {
        const contentWrapper = document.querySelector('.content-wrapper');
        const toc = contentWrapper?.querySelector('.table-of-contents');
        
        if (contentWrapper) {
            if (toc) {
                // 有目录时使用 flex 布局
                contentWrapper.style.display = 'flex';
                contentWrapper.style.gap = '2rem';
                contentWrapper.style.alignItems = 'flex-start';
            } else {
                // 没有目录时使用块级布局
                contentWrapper.style.display = 'block';
                contentWrapper.style.gap = '0';
            }
        }
    }

    handleDocumentLinks() {
        const content = document.getElementById('content');
        if (!content) return;

        // 处理文档内的锚点链接
        const links = content.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                const targetId = href.substring(1); // 移除 # 号
                
                // 查找目标文档
                const targetDoc = this.findDocById(targetId);
                if (targetDoc) {
                    // 如果目标文档存在，加载该文档
                    this.loadDoc(targetId);
                    // 更新左侧导航的激活状态
                    this.updateActiveNavById(targetId);
                } else {
                    // 如果目标文档不存在，可能是当前文档内的锚点
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }

    fixImagePaths() {
        const content = document.getElementById('content');
        if (!content) return;

        // 处理所有图片的路径
        const images = content.querySelectorAll('img');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src && src.startsWith('../../')) {
                // 将相对路径转换为绝对路径
                const newSrc = src.replace('../../', './src/');
                img.setAttribute('src', newSrc);
                
                // 添加错误处理
                img.onerror = function() {
                    console.warn('图片加载失败:', newSrc);
                    // 可以设置一个默认图片或者隐藏图片
                    this.style.display = 'none';
                };
            }
        });
    }

    openSearchModal() {
        const searchModal = document.getElementById('searchModal');
        const searchModalInput = document.getElementById('searchModalInput');
        
        if (searchModal && searchModalInput) {
            searchModal.classList.add('active');
            searchModalInput.focus();
        }
    }

    closeSearchModal() {
        const searchModal = document.getElementById('searchModal');
        const searchModalInput = document.getElementById('searchModalInput');
        
        if (searchModal && searchModalInput) {
            searchModal.classList.remove('active');
            searchModalInput.value = '';
            this.clearSearchResults();
        }
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.clearSearchResults();
            return;
        }

        const lowerQuery = query.toLowerCase();
        const results = this.searchIndex.filter(item => {
            // 搜索标题
            const titleMatch = item.title.toLowerCase().includes(lowerQuery);
            // 搜索描述（处理空描述的情况）
            const descriptionMatch = item.description && item.description.toLowerCase().includes(lowerQuery);
            // 搜索文档内容
            const contentMatch = item.content && item.content.toLowerCase().includes(lowerQuery);
            
            return titleMatch || descriptionMatch || contentMatch;
        });

        // 按匹配类型排序：标题匹配 > 描述匹配 > 内容匹配
        results.sort((a, b) => {
            const aTitleMatch = a.title.toLowerCase().includes(lowerQuery);
            const bTitleMatch = b.title.toLowerCase().includes(lowerQuery);
            const aDescMatch = a.description && a.description.toLowerCase().includes(lowerQuery);
            const bDescMatch = b.description && b.description.toLowerCase().includes(lowerQuery);
            
            if (aTitleMatch && !bTitleMatch) return -1;
            if (!aTitleMatch && bTitleMatch) return 1;
            if (aDescMatch && !bDescMatch) return -1;
            if (!aDescMatch && bDescMatch) return 1;
            return 0;
        });

        this.displaySearchResults(results, query);
    }

    displaySearchResults(results, query) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="no-results">没有找到相关文档</div>';
            return;
        }

        const resultsHTML = results.map(result => {
            // 生成内容摘要
            const excerpt = this.generateSearchExcerpt(result, query);
            return `
                <div class="search-result-item" data-doc="${result.id}">
                    <div class="search-result-title">${this.highlightText(result.title, query)}</div>
                    <div class="search-result-excerpt">${excerpt}</div>
                    <div class="search-result-section">${result.section}</div>
                </div>
            `;
        }).join('');

        searchResults.innerHTML = resultsHTML;

        // 添加点击事件
        searchResults.addEventListener('click', (e) => {
            const resultItem = e.target.closest('.search-result-item');
            if (resultItem) {
                const docId = resultItem.dataset.doc;
                this.loadDoc(docId);
                this.closeSearchModal();
            }
        });
    }

    highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    generateSearchExcerpt(result, query) {
        const lowerQuery = query.toLowerCase();
        let excerpt = '';
        
        // 优先显示描述（如果描述存在且包含搜索词）
        if (result.description && result.description.trim() && result.description.toLowerCase().includes(lowerQuery)) {
            excerpt = this.highlightText(result.description, query);
        } 
        // 如果描述中没有匹配，则从内容中提取摘要
        else if (result.content && result.content.trim()) {
            const content = result.content.toLowerCase();
            const queryIndex = content.indexOf(lowerQuery);
            
            if (queryIndex !== -1) {
                // 在匹配位置前后各取50个字符
                const start = Math.max(0, queryIndex - 50);
                const end = Math.min(result.content.length, queryIndex + query.length + 50);
                let snippet = result.content.substring(start, end);
                
                // 确保摘要以完整单词开始和结束
                if (start > 0) {
                    const firstSpace = snippet.indexOf(' ');
                    if (firstSpace !== -1) {
                        snippet = '...' + snippet.substring(firstSpace + 1);
                    }
                }
                if (end < result.content.length) {
                    const lastSpace = snippet.lastIndexOf(' ');
                    if (lastSpace !== -1) {
                        snippet = snippet.substring(0, lastSpace) + '...';
                    }
                }
                
                excerpt = this.highlightText(snippet, query);
            } else {
                // 如果没有找到匹配，显示内容的前100个字符
                excerpt = result.content.substring(0, 100) + (result.content.length > 100 ? '...' : '');
            }
        } 
        // 如果描述存在但不包含搜索词，显示描述
        else if (result.description && result.description.trim()) {
            excerpt = result.description;
        }
        // 如果既没有有效描述也没有内容，显示默认文本
        else {
            excerpt = '暂无描述';
        }
        
        return excerpt;
    }

    clearSearchResults() {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.innerHTML = '';
        }
    }

    handleResize() {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth > 768) {
            sidebar?.classList.remove('open');
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new DocsApp();
});

// 添加一些额外的样式
const additionalStyles = `
    .error-message {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--text-secondary);
    }
    
    .error-message i {
        font-size: 3rem;
        color: var(--danger-color);
        margin-bottom: 1rem;
    }
    
    .error-message h2 {
        margin-bottom: 1rem;
        color: var(--text-primary);
    }
    
    .retry-btn {
        background-color: var(--accent-color);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: var(--border-radius);
        cursor: pointer;
        font-size: 1rem;
        margin-top: 1rem;
    }
    
    .retry-btn:hover {
        background-color: var(--accent-hover);
    }
    
    .no-results {
        text-align: center;
        padding: 2rem;
        color: var(--text-secondary);
    }
    
    .search-result-section {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-top: 0.25rem;
    }
`;

// 动态添加样式
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
