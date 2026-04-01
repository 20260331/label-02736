/**
 * Modal 模态框组件
 */
export class Modal {
    static container = null;
    static currentModal = null;

    static init() {
        if (!this.container) {
            this.container = document.getElementById('modal-container');
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = 'modal-container';
                document.body.appendChild(this.container);
            }
            this.addStyles();
        }
    }

    static addStyles() {
        if (document.getElementById('modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                animation: modalFadeIn 0.2s ease;
            }
            
            .modal-overlay.hiding {
                animation: modalFadeOut 0.2s ease forwards;
            }
            
            .modal {
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                animation: modalSlideIn 0.2s ease;
            }
            
            .modal-overlay.hiding .modal {
                animation: modalSlideOut 0.2s ease forwards;
            }
            
            .modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 24px;
                border-bottom: 1px solid #EEEEEE;
            }
            
            .modal-title {
                font-size: 16px;
                font-weight: 600;
                color: #172B4D;
                margin: 0;
            }
            
            .modal-close {
                width: 24px;
                height: 24px;
                cursor: pointer;
                color: #6B778C;
                transition: color 0.2s;
                background: none;
                border: none;
                padding: 0;
            }
            
            .modal-close:hover {
                color: #172B4D;
            }
            
            .modal-body {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-footer {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 12px;
                padding: 16px 24px;
                border-top: 1px solid #EEEEEE;
            }
            
            .modal-message {
                font-size: 14px;
                color: #172B4D;
                line-height: 1.6;
            }
            
            @keyframes modalFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes modalFadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes modalSlideIn {
                from {
                    transform: translateY(-20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes modalSlideOut {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(-20px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    static show(options = {}) {
        this.init();
        
        const {
            title = '提示',
            content = '',
            showClose = true,
            footer = null,
            onClose = null,
            width = '500px'
        } = options;

        // 关闭已有的模态框
        if (this.currentModal) {
            this.close();
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal" style="max-width: ${width}">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    ${showClose ? `
                        <button class="modal-close">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    ` : ''}
                </div>
                <div class="modal-body">${content}</div>
                ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
            </div>
        `;

        // 点击遮罩关闭
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.close();
                if (onClose) onClose();
            }
        });

        // 关闭按钮
        const closeBtn = overlay.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.close();
                if (onClose) onClose();
            });
        }

        this.container.appendChild(overlay);
        this.currentModal = overlay;

        // ESC 键关闭
        this._escHandler = (e) => {
            if (e.key === 'Escape') {
                this.close();
                if (onClose) onClose();
            }
        };
        document.addEventListener('keydown', this._escHandler);

        return overlay;
    }

    static close() {
        if (!this.currentModal) return;

        const overlay = this.currentModal;
        overlay.classList.add('hiding');

        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 200);

        this.currentModal = null;

        if (this._escHandler) {
            document.removeEventListener('keydown', this._escHandler);
            this._escHandler = null;
        }
    }

    static confirm(options = {}) {
        return new Promise((resolve) => {
            const {
                title = '确认操作',
                message = '确定要执行此操作吗？',
                confirmText = '确定',
                cancelText = '取消',
                confirmType = 'primary',
                dangerous = false
            } = options;

            const confirmBtnClass = dangerous ? 'btn btn-danger' : `btn btn-${confirmType}`;

            this.show({
                title,
                content: `<p class="modal-message">${message}</p>`,
                footer: `
                    <button class="btn btn-secondary" data-action="cancel">${cancelText}</button>
                    <button class="${confirmBtnClass}" data-action="confirm">${confirmText}</button>
                `,
                onClose: () => resolve(false)
            });

            const modal = this.currentModal;
            const confirmBtn = modal.querySelector('[data-action="confirm"]');
            const cancelBtn = modal.querySelector('[data-action="cancel"]');

            confirmBtn.addEventListener('click', () => {
                this.close();
                resolve(true);
            });

            cancelBtn.addEventListener('click', () => {
                this.close();
                resolve(false);
            });
        });
    }

    static alert(options = {}) {
        return new Promise((resolve) => {
            const {
                title = '提示',
                message = '',
                confirmText = '确定'
            } = options;

            this.show({
                title,
                content: `<p class="modal-message">${message}</p>`,
                footer: `
                    <button class="btn btn-primary" data-action="confirm">${confirmText}</button>
                `,
                onClose: () => resolve()
            });

            const modal = this.currentModal;
            const confirmBtn = modal.querySelector('[data-action="confirm"]');

            confirmBtn.addEventListener('click', () => {
                this.close();
                resolve();
            });
        });
    }
}
