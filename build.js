#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

class DocsBuilder {
    constructor() {
        this.docsDir = path.join(__dirname, 'src', 'docs');
        this.outputDir = path.join(__dirname, 'dist');
        this.templatePath = path.join(__dirname, 'index.html');
    }

    async build() {
        console.log('🚀 开始构建文档站点...');
        
        try {
            // 创建输出目录
            this.ensureDir(this.outputDir);
            
            // 复制静态资源
            await this.copyStaticAssets();
            
            // 处理 HTML 文件
            await this.processHTML();
            
            // 复制文档文件
            await this.copyDocs();
            
            console.log('✅ 文档站点构建完成！');
            console.log(`📁 输出目录: ${this.outputDir}`);
            
        } catch (error) {
            console.error('❌ 构建失败:', error);
            process.exit(1);
        }
    }

    ensureDir(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    async copyStaticAssets() {
        console.log('📋 复制静态资源...');
        
        const assetsDir = path.join(__dirname, 'src');
        const outputAssetsDir = path.join(this.outputDir, 'src');
        
        // 复制整个 src 目录
        await this.copyDir(assetsDir, outputAssetsDir);
    }

    async copyDocs() {
        console.log('📚 复制文档文件...');
        
        const outputDocsDir = path.join(this.outputDir, 'src', 'docs');
        this.ensureDir(outputDocsDir);
        
        // 复制所有 markdown 文件
        const files = fs.readdirSync(this.docsDir);
        for (const file of files) {
            if (file.endsWith('.md')) {
                const srcPath = path.join(this.docsDir, file);
                const destPath = path.join(outputDocsDir, file);
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    async processHTML() {
        console.log('🔧 处理 HTML 文件...');
        
        const htmlContent = fs.readFileSync(this.templatePath, 'utf8');
        const outputPath = path.join(this.outputDir, 'index.html');
        
        // 这里可以添加 HTML 处理逻辑，比如内联 CSS/JS
        fs.writeFileSync(outputPath, htmlContent);
    }

    async copyDir(src, dest) {
        this.ensureDir(dest);
        
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
                await this.copyDir(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const builder = new DocsBuilder();
    builder.build();
}

module.exports = DocsBuilder;
