const fs = require('fs');
const path = require('path');
const os = require('os');

const configPath = path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
const mcpServerPath = path.join(__dirname, 'mcpServer.js');

console.log('Registering Millennium AI MCP Server in Claude Desktop...');
console.log('Claude Desktop Config Path:', configPath);
console.log('MCP Server Path:', mcpServerPath);

try {
    let config = {};
    
    // 1. Đọc file config hiện tại (nếu có)
    if (fs.existsSync(configPath)) {
        const fileContent = fs.readFileSync(configPath, 'utf8');
        try {
            config = JSON.parse(fileContent);
        } catch (e) {
            console.error('Không thể parse file json config hiện tại. Đang ghi đè mới.');
        }
    } else {
        // Đảm bảo thư mục cha tồn tại
        fs.mkdirSync(path.dirname(configPath), { recursive: true });
    }

    // 2. Đảm bảo cấu trúc mcpServers tồn tại
    if (!config.mcpServers) {
        config.mcpServers = {};
    }

    // 3. Đăng ký mcp server cho Millennium
    config.mcpServers['millennium-ai'] = {
        command: 'node',
        args: [mcpServerPath],
        env: {
            // Truyền biến môi trường NODE_PATH hoặc các biến cần thiết từ dự án
            NODE_PATH: path.join(__dirname, 'node_modules')
        }
    };

    // 4. Lưu lại cấu hình
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    
    console.log('====================================================');
    console.log('🔥 Đã đăng ký thành công Millennium AI MCP Server!');
    console.log('👉 Vui lòng Khởi động lại (Restart) ứng dụng Claude Desktop.');
    console.log('====================================================');

} catch (err) {
    console.error('❌ Lỗi khi đăng ký MCP Server:', err.message);
}
