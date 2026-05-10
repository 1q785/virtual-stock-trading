// 用户认证和管理
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('virtualStockUsers')) || [];
        this.initializeAdmin();
    }
    
    // 初始化管理员账户
    initializeAdmin() {
        const adminExists = this.users.some(user => user.username === 'admin');
        if (!adminExists) {
            this.users.push({
                username: 'admin',
                password: 'admin123',
                email: 'admin@virtualstock.com',
                isAdmin: true,
                balance: 0,
                portfolio: {},
                createdAt: new Date().toISOString()
            });
            this.saveUsers();
        }
    }
    
    saveUsers() {
        localStorage.setItem('virtualStockUsers', JSON.stringify(this.users));
    }
    
    // 用户注册
    register(username, password, email, initialBalance = 100000) {
        // 检查用户是否存在
        if (this.users.some(user => user.username === username)) {
            return { success: false, message: '用户名已存在' };
        }
        
        // 创建新用户
        const newUser = {
            username,
            password, // 注意：实际应用中应该加密存储密码
            email,
            isAdmin: false,
            balance: initialBalance,
            portfolio: {},
            createdAt: new Date().toISOString(),
            transactionHistory: []
        };
        
        this.users.push(newUser);
        this.saveUsers();
        
        return { success: true, message: '注册成功' };
    }
    
    // 用户登录
    login(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify({
                username: user.username,
                isAdmin: user.isAdmin
            }));
            return { success: true, user: user };
        } else {
            return { success: false, message: '用户名或密码错误' };
        }
    }
    
    // 用户登出
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }
    
    // 检查登录状态
    checkLoginStatus() {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
        }
        return this.currentUser;
    }
    
    // 获取用户信息
    getUser(username) {
        return this.users.find(u => u.username === username);
    }
    
    // 更新用户信息
    updateUser(updatedUser) {
        const index = this.users.findIndex(u => u.username === updatedUser.username);
        if (index !== -1) {
            this.users[index] = updatedUser;
            this.saveUsers();
            
            // 如果更新的是当前用户，更新currentUser
            if (this.currentUser && this.currentUser.username === updatedUser.username) {
                this.currentUser = updatedUser;
                localStorage.setItem('currentUser', JSON.stringify({
                    username: updatedUser.username,
                    isAdmin: updatedUser.isAdmin
                }));
            }
            
            return true;
        }
        return false;
    }
    
    // 获取用户排行榜
    getLeaderboard() {
        const regularUsers = this.users.filter(user => !user.isAdmin);
        
        return regularUsers.map(user => {
            // 计算用户总资产
            let portfolioValue = 0;
            Object.keys(user.portfolio || {}).forEach(symbol => {
                const stock = StockManager.getStock(symbol);
                if (stock) {
                    portfolioValue += stock.price * user.portfolio[symbol];
                }
            });
            
            const totalAssets = user.balance + portfolioValue;
            const initialBalance = 100000; // 初始资金
            const returnRate = ((totalAssets - initialBalance) / initialBalance * 100).toFixed(2);
            
            return {
                username: user.username,
                totalAssets: totalAssets,
                returnRate: parseFloat(returnRate),
                portfolioValue: portfolioValue,
                balance: user.balance
            };
        }).sort((a, b) => b.totalAssets - a.totalAssets);
    }
}

// 创建全局认证管理器
const authManager = new AuthManager();

// 检查登录状态并更新UI
function checkLoginStatus() {
    const user = authManager.checkLoginStatus();
    const loginLink = document.getElementById('login-link');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfo = document.getElementById('user-info');
    const adminLink = document.getElementById('admin-link');
    
    if (user) {
        if (loginLink) loginLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (userInfo) {
            userInfo.style.display = 'inline-block';
            userInfo.textContent = `欢迎, ${user.username}`;
        }
        if (adminLink && user.isAdmin) {
            adminLink.style.display = 'inline-block';
        }
        
        // 添加登出事件监听
        if (logoutBtn) {
            logoutBtn.onclick = function() {
                authManager.logout();
                window.location.href = 'index.html';
            };
        }
    } else {
        if (loginLink) loginLink.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userInfo) {
            userInfo.style.display = 'none';
        }
        if (adminLink) {
            adminLink.style.display = 'none';
        }
    }
    
    return user;
}