// 工具函数集合

// 格式化货币显示
function formatCurrency(amount) {
    return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
}

// 格式化百分比
function formatPercent(value) {
    const formatted = new Intl.NumberFormat('zh-CN', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value / 100);
    
    return value >= 0 ? `+${formatted}` : formatted;
}

// 格式化日期
function formatDate(date) {
    return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 简化日期显示
function formatShortDate(date) {
    const now = new Date();
    const targetDate = new Date(date);
    const diffMs = now - targetDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) {
        return '刚刚';
    } else if (diffMins < 60) {
        return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
        return `${diffHours}小时前`;
    } else if (diffDays < 7) {
        return `${diffDays}天前`;
    } else {
        return targetDate.toLocaleDateString('zh-CN');
    }
}

// 生成随机颜色
function getRandomColor() {
    const colors = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 验证电子邮件格式
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 验证密码强度
function isStrongPassword(password) {
    // 至少8个字符，包含字母和数字
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
}

// 从localStorage安全获取数据
function getLocalStorageItem(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error parsing localStorage item "${key}":`, error);
        return defaultValue;
    }
}

// 安全设置localStorage数据
function setLocalStorageItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error setting localStorage item "${key}":`, error);
        return false;
    }
}

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 深拷贝对象
function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// 模拟API延迟
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知容器
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        `;
        document.body.appendChild(container);
    }
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.style.cssText = `
        background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        margin-bottom: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.textContent = message;
    container.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode === container) {
                container.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // 添加CSS动画
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// 确认对话框
function confirmDialog(message) {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background-color: white;
            padding: 2rem;
            border-radius: 8px;
            max-width: 400px;
            width: 90%;
        `;
        
        content.innerHTML = `
            <h3 style="margin-top: 0;">确认</h3>
            <p>${message}</p>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button id="cancel-btn" style="padding: 0.5rem 1rem; background-color: #e5e7eb; border: none; border-radius: 4px; cursor: pointer;">取消</button>
                <button id="confirm-btn" style="padding: 0.5rem 1rem; background-color: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">确定</button>
            </div>
        `;
        
        dialog.appendChild(content);
        document.body.appendChild(dialog);
        
        document.getElementById('cancel-btn').onclick = () => {
            document.body.removeChild(dialog);
            resolve(false);
        };
        
        document.getElementById('confirm-btn').onclick = () => {
            document.body.removeChild(dialog);
            resolve(true);
        };
    });
}

// 加载动画
function showLoading(show = true) {
    let loader = document.getElementById('global-loader');
    
    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(255, 255, 255, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            `;
            
            loader.innerHTML = `
                <div style="text-align: center;">
                    <div style="border: 4px solid #f3f3f3;
                                border-top: 4px solid #3b82f6;
                                border-radius: 50%;
                                width: 40px;
                                height: 40px;
                                animation: spin 1s linear infinite;
                                margin: 0 auto 1rem;">
                    </div>
                    <p>加载中...</p>
                </div>
            `;
            
            // 添加CSS动画
            if (!document.getElementById('loader-styles')) {
                const style = document.createElement('style');
                style.id = 'loader-styles';
                style.textContent = `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(loader);
        }
    } else {
        if (loader && loader.parentNode) {
            loader.parentNode.removeChild(loader);
        }
    }
}

// 复制到剪贴板
function copyToClipboard(text) {
    return new Promise((resolve, reject) => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text)
                .then(() => resolve(true))
                .catch(() => reject(false));
        } else {
            // 回退方案
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                resolve(true);
            } catch (err) {
                document.body.removeChild(textArea);
                reject(false);
            }
        }
    });
}