// 投资组合管理
class PortfolioManager {
    constructor() {
        this.authManager = authManager;
        this.stockManager = stockManager;
    }
    
    // 加载用户投资组合
    loadPortfolio() {
        const user = this.authManager.checkLoginStatus();
        if (!user) return null;
        
        const fullUser = this.authManager.getUser(user.username);
        if (!fullUser) return null;
        
        const portfolio = fullUser.portfolio || {};
        const stocks = this.stockManager.getAllStocks();
        
        let portfolioDetails = [];
        let totalPortfolioValue = 0;
        
        // 计算每只股票的详细信息
        Object.keys(portfolio).forEach(symbol => {
            const stock = this.stockManager.getStock(symbol);
            if (stock) {
                const quantity = portfolio[symbol];
                const value = quantity * stock.price;
                totalPortfolioValue += value;
                
                portfolioDetails.push({
                    symbol: symbol,
                    name: stock.name,
                    quantity: quantity,
                    price: stock.price,
                    value: value,
                    change: stock.change
                });
            }
        });
        
        return {
            details: portfolioDetails,
            totalValue: totalPortfolioValue,
            balance: fullUser.balance,
            totalAssets: fullUser.balance + totalPortfolioValue
        };
    }
    
    // 计算收益率
    calculateReturnRate(portfolio) {
        const initialBalance = 100000; // 初始资金
        const returnRate = ((portfolio.totalAssets - initialBalance) / initialBalance * 100).toFixed(2);
        return parseFloat(returnRate);
    }
    
    // 获取用户交易记录
    getTransactionHistory(username) {
        const user = this.authManager.getUser(username);
        if (!user || !user.transactionHistory) {
            return [];
        }
        
        // 按日期倒序排序
        return user.transactionHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
}

// 创建全局投资组合管理器
const portfolioManager = new PortfolioManager();

// 加载用户投资组合到页面
function loadUserPortfolio() {
    const portfolio = portfolioManager.loadPortfolio();
    if (!portfolio) return;
    
    const tableBody = document.getElementById('portfolio-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (portfolio.details.length === 0) {
        document.getElementById('portfolio-table').style.display = 'none';
        document.getElementById('empty-portfolio').style.display = 'block';
    } else {
        document.getElementById('portfolio-table').style.display = 'table';
        document.getElementById('empty-portfolio').style.display = 'none';
        
        portfolio.details.forEach(stock => {
            const row = document.createElement('tr');
            const changeClass = stock.change >= 0 ? 'positive' : 'negative';
            
            row.innerHTML = `
                <td><strong>${stock.symbol}</strong></td>
                <td>${stock.name}</td>
                <td>${stock.quantity}</td>
                <td>$${stock.price.toFixed(2)}</td>
                <td>$${stock.value.toFixed(2)}</td>
                <td class="${changeClass}">${stock.change >= 0 ? '+' : ''}${stock.change}%</td>
                <td>
                    <button class="btn-sell" onclick="sellStock('${stock.symbol}')">卖出</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // 更新账户概览
    updateAccountOverview(portfolio);
    
    // 更新图表
    updatePortfolioChart(portfolio);
}

// 更新账户概览
function updateAccountOverview(portfolio) {
    if (!portfolio) {
        portfolio = portfolioManager.loadPortfolio();
    }
    
    if (!portfolio) return;
    
    const returnRate = portfolioManager.calculateReturnRate(portfolio);
    const returnClass = returnRate >= 0 ? 'positive' : 'negative';
    
    document.getElementById('account-balance').textContent = `$${portfolio.balance.toFixed(2)}`;
    document.getElementById('portfolio-value').textContent = `$${portfolio.totalValue.toFixed(2)}`;
    document.getElementById('total-assets').textContent = `$${portfolio.totalAssets.toFixed(2)}`;
    document.getElementById('total-return').innerHTML = `<span class="${returnClass}">${returnRate >= 0 ? '+' : ''}${returnRate}%</span>`;
    
    // 更新账户摘要
    document.getElementById('account-summary').textContent = 
        `总资产: $${portfolio.totalAssets.toFixed(2)} | 收益率: ${returnRate >= 0 ? '+' : ''}${returnRate}%`;
}

// 更新投资组合图表
function updatePortfolioChart(portfolio) {
    const ctx = document.getElementById('portfolio-chart');
    if (!ctx) return;
    
    if (!portfolio || portfolio.details.length === 0) {
        ctx.parentElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">暂无持仓</p>';
        return;
    }
    
    // 准备图表数据
    const labels = portfolio.details.map(stock => stock.symbol);
    const data = portfolio.details.map(stock => stock.value);
    const colors = generateChartColors(portfolio.details.length);
    
    // 如果图表已存在，销毁它
    if (window.portfolioChart) {
        window.portfolioChart.destroy();
    }
    
    // 创建新图表
    window.portfolioChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('0.8', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// 生成图表颜色
function generateChartColors(count) {
    const colors = [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(14, 165, 233, 0.8)',
        'rgba(244, 63, 94, 0.8)',
        'rgba(20, 184, 166, 0.8)'
    ];
    
    // 如果需要的颜色多于预定义的颜色，生成随机颜色
    const result = [];
    for (let i = 0; i < count; i++) {
        if (i < colors.length) {
            result.push(colors[i]);
        } else {
            const r = Math.floor(Math.random() * 128) + 128;
            const g = Math.floor(Math.random() * 128) + 128;
            const b = Math.floor(Math.random() * 128) + 128;
            result.push(`rgba(${r}, ${g}, ${b}, 0.8)`);
        }
    }
    
    return result;
}

// 加载交易记录
function loadTransactionHistory() {
    const user = authManager.checkLoginStatus();
    if (!user) return;
    
    const transactions = portfolioManager.getTransactionHistory(user.username);
    const tableBody = document.getElementById('transaction-table-body');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (transactions.length === 0) {
        document.getElementById('transaction-table').style.display = 'none';
        document.getElementById('empty-transactions').style.display = 'block';
    } else {
        document.getElementById('transaction-table').style.display = 'table';
        document.getElementById('empty-transactions').style.display = 'none';
        
        // 只显示最近20条记录
        transactions.slice(0, 20).forEach(transaction => {
            const date = new Date(transaction.date);
            const typeClass = transaction.type === '买入' ? 'positive' : 'negative';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${date.toLocaleString('zh-CN')}</td>
                <td><span class="${typeClass}">${transaction.type}</span></td>
                <td>${transaction.symbol} (${transaction.name})</td>
                <td>${transaction.quantity}</td>
                <td>$${transaction.price.toFixed(2)}</td>
                <td>$${transaction.total.toFixed(2)}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// 加载排行榜
function loadLeaderboard() {
    const leaderboard = authManager.getLeaderboard();
    const tableBody = document.getElementById('leaderboard-table-body');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    leaderboard.forEach((user, index) => {
        const rank = index + 1;
        const rankClass = rank <= 3 ? 'top-rank' : '';
        const returnClass = user.returnRate >= 0 ? 'positive' : 'negative';
        
        const row = document.createElement('tr');
        if (rank <= 3) {
            row.style.backgroundColor = rank === 1 ? '#fff7ed' : rank === 2 ? '#f8fafc' : rank === 3 ? '#fef2f2' : '';
        }
        
        row.innerHTML = `
            <td>
                ${rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
            </td>
            <td>
                ${user.username}
                ${authManager.currentUser && authManager.currentUser.username === user.username ? '<span style="color: #3b82f6;">(您)</span>' : ''}
            </td>
            <td>$${user.totalAssets.toFixed(2)}</td>
            <td class="${returnClass}">${user.returnRate >= 0 ? '+' : ''}${user.returnRate}%</td>
            <td>$${user.portfolioValue.toFixed(2)}</td>
            <td>$${user.balance.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    });
}