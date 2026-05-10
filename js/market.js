// 股票市场管理器
class StockManager {
    constructor() {
        this.stocks = JSON.parse(localStorage.getItem('virtualStocks')) || this.getDefaultStocks();
        this.history = JSON.parse(localStorage.getItem('stockHistory')) || {};
        this.saveStocks();
    }
    
    // 获取默认股票列表
    getDefaultStocks() {
        return [
            { symbol: "TECH", name: "科技先锋", price: 150.25, change: 2.5, description: "领先的科技公司" },
            { symbol: "BANK", name: "金融巨头", price: 45.60, change: -1.2, description: "全球金融服务" },
            { symbol: "ENERGY", name: "能源动力", price: 78.90, change: 0.8, description: "可再生能源领导者" },
            { symbol: "HEALTH", name: "健康医疗", price: 120.75, change: 3.1, description: "医疗创新公司" },
            { symbol: "AUTO", name: "未来汽车", price: 210.30, change: -0.5, description: "电动汽车制造商" },
            { symbol: "FOOD", name: "美食天下", price: 65.40, change: 1.2, description: "食品与饮料" },
            { symbol: "TRAVEL", name: "旅行之家", price: 89.20, change: 2.3, description: "旅游和酒店" },
            { symbol: "MEDIA", name: "数字媒体", price: 55.80, change: -0.8, description: "娱乐和媒体" }
        ];
    }
    
    // 保存股票数据
    saveStocks() {
        localStorage.setItem('virtualStocks', JSON.stringify(this.stocks));
    }
    
    // 获取所有股票
    getAllStocks() {
        return this.stocks;
    }
    
    // 获取单个股票
    getStock(symbol) {
        return this.stocks.find(stock => stock.symbol === symbol);
    }
    
    // 更新股票价格
    updateStockPrice(symbol, newPrice) {
        const stock = this.getStock(symbol);
        if (stock) {
            const oldPrice = stock.price;
            const change = ((newPrice - oldPrice) / oldPrice * 100).toFixed(2);
            
            stock.price = parseFloat(newPrice.toFixed(2));
            stock.change = parseFloat(change);
            
            // 记录价格历史
            this.recordPriceHistory(symbol, newPrice);
            
            this.saveStocks();
            return { success: true, stock };
        }
        return { success: false, message: '股票不存在' };
    }
    
    // 随机更新股票价格（模拟市场波动）
    randomUpdateStocks() {
        this.stocks.forEach(stock => {
            // 随机波动范围 -5% 到 +5%
            const changePercent = (Math.random() * 10 - 5) / 100;
            const newPrice = stock.price * (1 + changePercent);
            this.updateStockPrice(stock.symbol, newPrice);
        });
    }
    
    // 记录价格历史
    recordPriceHistory(symbol, price) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.history[symbol]) {
            this.history[symbol] = [];
        }
        
        // 检查今天是否已有记录
        const todayIndex = this.history[symbol].findIndex(record => record.date === today);
        
        if (todayIndex !== -1) {
            this.history[symbol][todayIndex].price = price;
        } else {
            this.history[symbol].push({ date: today, price: price });
            
            // 只保留最近30天的记录
            if (this.history[symbol].length > 30) {
                this.history[symbol].shift();
            }
        }
        
        localStorage.setItem('stockHistory', JSON.stringify(this.history));
    }
    
    // 获取股票价格历史
    getPriceHistory(symbol) {
        return this.history[symbol] || [];
    }
}

// 创建全局股票管理器
const stockManager = new StockManager();

// 加载并显示股票市场
function loadStockMarket() {
    const stocks = stockManager.getAllStocks();
    const tableBody = document.getElementById('stocks-table-body');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    stocks.forEach(stock => {
        const changeClass = stock.change >= 0 ? 'positive' : 'negative';
        const changeIcon = stock.change >= 0 ? '▲' : '▼';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${stock.symbol}</strong><br><small>${stock.name}</small></td>
            <td>$${stock.price.toFixed(2)}</td>
            <td class="${changeClass}">${changeIcon} ${Math.abs(stock.change)}%</td>
            <td>${stock.description}</td>
            <td>
                <button class="btn-buy" onclick="buyStock('${stock.symbol}')">买入</button>
                <button class="btn-sell" onclick="sellStock('${stock.symbol}')">卖出</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 买入股票
function buyStock(symbol) {
    const user = authManager.checkLoginStatus();
    if (!user) {
        alert('请先登录');
        window.location.href = 'login.html';
        return;
    }
    
    const fullUser = authManager.getUser(user.username);
    const stock = stockManager.getStock(symbol);
    
    if (!stock) {
        alert('股票不存在');
        return;
    }
    
    const quantity = prompt(`请输入要买入的 ${stock.name} (${symbol}) 数量:\n当前价格: $${stock.price.toFixed(2)}\n您的余额: $${fullUser.balance.toFixed(2)}`, "10");
    
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
        alert('请输入有效的数量');
        return;
    }
    
    const qty = parseInt(quantity);
    const totalCost = qty * stock.price;
    
    if (totalCost > fullUser.balance) {
        alert('余额不足');
        return;
    }
    
    // 更新用户信息
    fullUser.balance -= totalCost;
    
    if (!fullUser.portfolio[symbol]) {
        fullUser.portfolio[symbol] = 0;
    }
    
    fullUser.portfolio[symbol] += qty;
    
    // 记录交易
    if (!fullUser.transactionHistory) {
        fullUser.transactionHistory = [];
    }
    
    fullUser.transactionHistory.push({
        type: '买入',
        symbol: symbol,
        name: stock.name,
        quantity: qty,
        price: stock.price,
        total: totalCost,
        date: new Date().toISOString()
    });
    
    authManager.updateUser(fullUser);
    
    alert(`成功买入 ${qty} 股 ${stock.name}，花费 $${totalCost.toFixed(2)}`);
    
    // 刷新页面
    if (window.location.pathname.includes('dashboard.html')) {
        loadUserPortfolio();
    }
}

// 卖出股票
function sellStock(symbol) {
    const user = authManager.checkLoginStatus();
    if (!user) {
        alert('请先登录');
        window.location.href = 'login.html';
        return;
    }
    
    const fullUser = authManager.getUser(user.username);
    const stock = stockManager.getStock(symbol);
    
    if (!stock) {
        alert('股票不存在');
        return;
    }
    
    const ownedShares = fullUser.portfolio[symbol] || 0;
    
    if (ownedShares <= 0) {
        alert(`您没有持有 ${stock.name} 股票`);
        return;
    }
    
    const quantity = prompt(`请输入要卖出的 ${stock.name} (${symbol}) 数量:\n当前价格: $${stock.price.toFixed(2)}\n持有数量: ${ownedShares}`, ownedShares.toString());
    
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
        alert('请输入有效的数量');
        return;
    }
    
    const qty = parseInt(quantity);
    
    if (qty > ownedShares) {
        alert(`卖出数量不能超过持有数量 (${ownedShares})`);
        return;
    }
    
    const totalValue = qty * stock.price;
    
    // 更新用户信息
    fullUser.balance += totalValue;
    fullUser.portfolio[symbol] -= qty;
    
    if (fullUser.portfolio[symbol] === 0) {
        delete fullUser.portfolio[symbol];
    }
    
    // 记录交易
    if (!fullUser.transactionHistory) {
        fullUser.transactionHistory = [];
    }
    
    fullUser.transactionHistory.push({
        type: '卖出',
        symbol: symbol,
        name: stock.name,
        quantity: qty,
        price: stock.price,
        total: totalValue,
        date: new Date().toISOString()
    });
    
    authManager.updateUser(fullUser);
    
    alert(`成功卖出 ${qty} 股 ${stock.name}，获得 $${totalValue.toFixed(2)}`);
    
    // 刷新页面
    if (window.location.pathname.includes('dashboard.html')) {
        loadUserPortfolio();
    }
}