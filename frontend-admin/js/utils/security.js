/**
 * 安全工具模块 - XSS 防护
 */

/**
 * HTML 实体转义，防止 XSS 攻击
 * @param {string} str - 需要转义的字符串
 * @returns {string} 转义后的安全字符串
 */
export function escapeHtml(str) {
    if (str === null || str === undefined) {
        return '';
    }
    
    const htmlEntities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };
    
    return String(str).replace(/[&<>"'`=\/]/g, char => htmlEntities[char]);
}

/**
 * 安全地设置元素的文本内容
 * @param {HTMLElement} element - DOM 元素
 * @param {string} text - 文本内容
 */
export function setTextContent(element, text) {
    if (element) {
        element.textContent = text;
    }
}

/**
 * 创建安全的 HTML 模板
 * 使用模板字符串时自动转义插入的值
 * @param {TemplateStringsArray} strings - 模板字符串
 * @param {...any} values - 插入的值
 * @returns {string} 安全的 HTML 字符串
 */
export function safeHtml(strings, ...values) {
    return strings.reduce((result, str, i) => {
        const value = values[i - 1];
        const escapedValue = escapeHtml(value);
        return result + escapedValue + str;
    });
}
