// 管理员控制功能
class AdminManager {
    constructor() {
        this.stockManager = stockManager;
        this.loadStockControls();
    }
    
    // 加载股票控制界面
    loadStockControls() {
        const stocks = this.stockManager.getAllStocks();
        const container = document.getElementById('stock-controls-container');
        
        if (!container) return;
        
        container.innerHTML = '';
        
        stocks.forEach(stock => {
            const controlDiv = document.createElement('div');
            controlDiv.className = 'stock-control';
            controlDiv.innerHTML = `
                <div style="flex: 1;">
                    <strong>${stock.symbol}</strong> - ${stock.name}
                </div>
                <div style="flex: 1;">
                    当前价格: $<span id="price-${stock.symbol}">${stock.price.toFixed(2)}</span>
                </div>
                <div style="flex: 1;">
                    <input type="number" id="new-price-${stock.symbol}" placeholder="新价格" step="0.01" min="0.01" value="${stock.price.toFixed(2)}">
                </div>
                <div>
                    <button class="btn-update" onclick="updateStockPrice('${stock.symbol}')">更新</button>
                </div>
            `;
            container.appendChild(controlDiv);
        });
    }
    
    // 更新股票价格
    updateStockPrice(symbol) {
        const newPriceInput = document.getElementById(`new-price-${symbol}`);
        const newPrice = parseFloat(newPriceInput.value);
        
        if (isNaN(newPrice) || newPrice <= 0) {
            alert('请输入有效的价格');
            return;
        }
        
        const result = this.stockManager.updateStockPrice(symbol, newPrice);
        
        if (result.success) {
            document.getElementById(`price-${symbol}`).textContent = result.stock.price.toFixed(2);
            alert(`已更新 ${symbol} 价格为 $${result.stock.price.toFixed(2)}`);
            
            // 记录管理员操作
            this.logAdminAction(`更新股票 ${symbol} 价格为 $${result.stock.price.toFixed(2)}`);
        } else {
            alert(result.message);
        }
    }
    
    // 随机更新所有股票
    randomUpdateAll() {
        this.stockManager.randomUpdateStocks();
        this.loadStockControls();
        alert('已随机更新所有股票价格');
        
        // 记录管理员操作
        this.logAdminAction('随机更新所有股票价格');
    }
    
    // 重置所有股票价格
    resetAllStocks() {
        if (confirm('确定要重置所有股票价格为初始值吗？')) {
            const defaultStocks = this.stockManager.getDefaultStocks();
            defaultStocks.forEach(stock => {
                this.stockManager.updateStockPrice(stock.symbol, stock.price);
            });
            this.loadStockControls();
            alert('已重置所有股票价格');
            
            // 记录管理员操作
            this.logAdminAction('重置所有股票价格为初始值');
        }
    }
    
    // 添加新股票
    addNewStock() {
        const symbol = prompt('请输入股票代码:');
        if (!symbol) return;
        
        const name = prompt('请输入股票名称:');
        if (!name) return;
        
        const price = parseFloat(prompt('请输入初始价格:'));
        if (isNaN(price) || price <= 0) {
            alert('请输入有效的价格');
            return;
        }
        
        const description = prompt('请输入股票描述:') || '';
        
        const newStock = {
            symbol: symbol.toUpperCase(),
            name: name,
            price: price,
            change: 0,
            description: description
        };
        
        this.stockManager.stocks.push(newStock);
        this.stockManager.saveStocks();
        this.loadStockControls();
        alert(`已添加新股票: ${symbol} - ${name}`);
        
        // 记录管理员操作
        this.logAdminAction(`添加新股票: ${symbol} - ${name} 价格: $${price.toFixed(2)}`);
    }
    
    // 查看用户排行榜
    viewLeaderboard() {
        const leaderboard = authManager.getLeaderboard();
        
        let leaderboardHtml = '<h3>用户排行榜</h3><table style="width:100%;margin-top:1rem;"><tr><th>排名</th><th>用户名</th><th>总资产</th><th>收益率</th></tr>';
        
        leaderboard.forEach((user, index) => {
            const rank = index + 1;
            const returnClass = user.returnRate >= 0 ? 'positive' : 'negative';
            leaderboardHtml += `
                <tr>
                    <td>${rank}</td>
                    <td>${user.username}</td>
                    <td>$${user.totalAssets.toFixed(2)}</td>
                    <td class="${returnClass}">${user.returnRate >= 0 ? '+' : ''}${user.returnRate}%</td>
                </tr>
            `;
        });
        
        leaderboardHtml += '</table>';
        
        document.getElementById('leaderboard-container').innerHTML = leaderboardHtml;
    }
    
    // 记录管理员操作
    logAdminAction(action) {
        let adminLogs = JSON.parse(localStorage.getItem('adminLogs')) || [];
        adminLogs.push({
            action: action,
            timestamp: new Date().toISOString(),
            admin: authManager.currentUser ? authManager.currentUser.username : '未知'
        });
        
        // 只保留最近50条记录
        if (adminLogs.length > 50) {
            adminLogs = adminLogs.slice(-50);
        }
        
        localStorage.setItem('adminLogs', JSON.stringify(adminLogs));
    }
    
    // 查看管理员操作日志
    viewAdminLogs() {
        const adminLogs = JSON.parse(localStorage.getItem('adminLogs')) || [];
        
        let logsHtml = '<h3>管理员操作日志</h3>';
        
        if (adminLogs.length === 0) {
            logsHtml += '<p>暂无操作记录</p>';
        } else {
            logsHtml += '<table style="width:100%;margin-top:1rem;"><tr><th>时间</th><th>管理员</th><th>操作</th></tr>';
            
            adminLogs.reverse().forEach(log => {
                const date = new Date(log.timestamp);
                logsHtml += `
                    <tr>
                        <td>${date.toLocaleString()}</td>
                        <td>${log.admin}</td>
                        <td>${log.action}</td>
                    </tr>
                `;
            });
            
            logsHtml += '</table>';
        }
        
        document.getElementById('admin-logs-container').innerHTML = logsHtml;
    }
}

// 创建全局管理员管理器
let adminManager;

// 初始化管理员页面
function initAdminPage() {
    const user = authManager.checkLoginStatus();
    
    if (!user || !user.isAdmin) {
        alert('您没有管理员权限');
        window.location.href = 'index.html';
        return;
    }
    
    adminManager = new AdminManager();
    
    // 加载排行榜
    adminManager.viewLeaderboard();
    
    // 加载操作日志
    adminManager.viewAdminLogs();
}