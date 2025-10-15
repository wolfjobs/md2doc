# Md2doc 文档站点

一个基于 Markdown 的现代化文档网站，用于展示 md2doc 项目的完整文档。

## 特性

- 📱 **响应式设计** - 支持桌面端和移动端
- 🌙 **深色/浅色主题** - 自动适配系统主题偏好
- 🔍 **全文搜索** - 快速查找文档内容
- 📖 **自动目录生成** - 自动生成文档目录
- 📋 **代码复制** - 一键复制代码块
- ⚡ **快速加载** - 优化的性能和加载速度
- 🎨 **现代化 UI** - 美观的用户界面

## 技术栈

- **构建工具**: Vite
- **Markdown 解析**: Marked.js
- **样式**: 原生 CSS + CSS 变量
- **图标**: Font Awesome
- **字体**: Inter

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000 查看文档站点。

### 构建生产版本

```bash
npm run build
```

构建完成后，文件将输出到 `dist` 目录。

### 预览构建结果

```bash
npm run preview
```

### 本地服务器

```bash
npm run serve
```

使用 http-server 在本地提供静态文件服务。

## 项目结构

```
docs-site/
├── src/
│   ├── data/
│   │   └── docs.json          # 文档配置和导航结构
│   ├── docs/                  # Markdown 文档文件
│   │   ├── introduction.md
│   │   ├── getting-started.md
│   │   ├── formula-editor.md
│   │   ├── ucf-guide.md
│   │   └── ai-components.md
│   ├── js/
│   │   └── app.js             # 主应用逻辑
│   └── styles/
│       ├── main.css           # 主样式文件
│       └── prism.css          # 代码高亮样式
├── index.html                 # 主 HTML 文件
├── package.json               # 项目配置
├── vite.config.js            # Vite 配置
├── build.js                  # 构建脚本
└── README.md                 # 项目说明
```

## 文档管理

### 添加新文档

1. 在 `src/docs/` 目录下创建新的 `.md` 文件
2. 在 `src/data/docs.json` 中添加文档配置
3. 重新构建项目

### 文档配置

编辑 `src/data/docs.json` 文件来管理文档结构：

```json
{
  "title": "文档中心",
  "description": "文档中心",
  "version": "1.0.0",
  "sections": [
    {
      "id": "overview",
      "title": "概览",
      "icon": "fas fa-home",
      "items": [
        {
          "id": "introduction",
          "title": "项目介绍",
          "file": "introduction.md",
          "description": "文档中心"
        }
      ]
    }
  ]
}
```

### Markdown 语法支持

文档站点支持标准的 Markdown 语法，包括：

- 标题 (H1-H6)
- 段落和换行
- 列表 (有序和无序)
- 链接和图片
- 代码块和行内代码
- 表格
- 引用块
- 粗体和斜体

### 代码高亮

使用三个反引号创建代码块：

````markdown
```javascript
function hello() {
  console.log('Hello, World!');
}
```
````

## 自定义配置

### 主题配置

在 `src/styles/main.css` 中修改 CSS 变量来自定义主题：

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #212529;
  --accent-color: #007bff;
  /* 更多变量... */
}
```

### 搜索配置

在 `src/js/app.js` 中修改搜索逻辑：

```javascript
buildSearchIndex() {
  this.searchIndex = [];
  // 自定义搜索索引构建逻辑
}
```

## 部署

### 静态文件部署

构建完成后，将 `dist` 目录的内容上传到任何静态文件服务器：

- GitHub Pages
- Netlify
- Vercel
- 阿里云 OSS
- 腾讯云 COS

### Nginx 配置

```nginx
server {
    listen 80;
    server_name docs.example.com;
    root /var/www/docs-site/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker 部署

```dockerfile
FROM node:16-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 开发指南

### 添加新功能

1. 在 `src/js/app.js` 中添加新方法
2. 在 `src/styles/main.css` 中添加样式
3. 更新 `index.html` 中的 HTML 结构

### 调试

使用浏览器开发者工具进行调试：

- **Console**: 查看 JavaScript 错误和日志
- **Network**: 监控网络请求
- **Elements**: 检查 DOM 结构
- **Sources**: 调试 JavaScript 代码

### 性能优化

- 使用 Vite 的代码分割功能
- 优化图片资源
- 启用 gzip 压缩
- 使用 CDN 加速静态资源

## 浏览器支持

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 更新日志

### v1.0.0 (2025-10-15)
- 初始版本发布
- 支持基础文档展示功能
- 响应式设计和主题切换
- 全文搜索功能
- 代码高亮和复制功能

---

*最后更新: 2025年10月*
