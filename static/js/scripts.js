// 确保路径开头没有斜杠，这是在 GitHub Pages 上运行的关键
const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'projects', 'awards']

window.addEventListener('DOMContentLoaded', event => {

    // 1. 激活 Bootstrap ScrollSpy (滚动监听)
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    }

    // 2. 响应式导航栏点击后自动收起
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    // 3. 加载 YAML 配置文件 (用于填充标题、版权等)
    fetch(content_dir + config_file)
        .then(response => {
            if (!response.ok) throw new Error('找不到配置文件: ' + content_dir + config_file);
            return response.text();
        })
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.innerHTML = yml[key];
                } else {
                    console.warn("在 HTML 中未找到对应的 ID: " + key);
                }
            })
        })
        .catch(error => console.error("YAML 加载失败:", error));

    // 4. 加载并渲染 Markdown 内容
    // 设置 marked 选项，防止由于版本差异导致的报错
    marked.use({ mangle: false, headerIds: false });

    section_names.forEach((name) => {
        const filePath = content_dir + name + '.md';
        
        fetch(filePath)
            .then(response => {
                if (!response.ok) throw new Error(`无法加载文件: ${filePath} (状态码: ${response.status})`);
                return response.text();
            })
            .then(markdown => {
                const html = marked.parse(markdown);
                const targetId = name + '-md';
                const container = document.getElementById(targetId);
                
                if (container) {
                    container.innerHTML = html;
                    // 内容注入后，如果存在 MathJax 则重新渲染数学公式
                    if (window.MathJax && window.MathJax.typeset) {
                        window.MathJax.typeset();
                    }
                }
            })
            .catch(error => {
                console.error(`渲染栏目 [${name}] 失败:`, error);
                // 在页面上给予用户友好的提示（可选）
                const container = document.getElementById(name + '-md');
                if (container) container.innerHTML = `<p style="color:red;">内容加载失败，请检查文件 ${filePath} 是否存在。</p>`;
            });
    });
});