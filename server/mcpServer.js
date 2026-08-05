const { dbQuery } = require('./db');
const { executeAutonomousLoop } = require('./services/loopService');

// MCP Server lắng nghe qua Standard Input/Output
process.stdin.setEncoding('utf8');

let buffer = '';

process.stdin.on('data', (chunk) => {
    buffer += chunk;
    let lineEnd = buffer.indexOf('\n');
    while (lineEnd !== -1) {
        const line = buffer.slice(0, lineEnd).trim();
        buffer = buffer.slice(lineEnd + 1);
        if (line) {
            handleRequest(line);
        }
        lineEnd = buffer.indexOf('\n');
    }
});

function sendResponse(responseObj) {
    process.stdout.write(JSON.stringify(responseObj) + '\n');
}

async function handleRequest(line) {
    try {
        const request = JSON.parse(line);
        const { jsonrpc, method, id, params } = request;

        if (jsonrpc !== '2.0') return;

        // 1. Initialize
        if (method === 'initialize') {
            sendResponse({
                jsonrpc: '2.0',
                id: id,
                result: {
                    protocolVersion: '2024-11-05',
                    capabilities: {
                        tools: {}
                    },
                    serverInfo: {
                        name: 'millennium-ai',
                        version: '1.0.0'
                    }
                }
            });
            return;
        }

        // 2. List tools
        if (method === 'tools/list') {
            sendResponse({
                jsonrpc: '2.0',
                id: id,
                result: {
                    tools: [
                        {
                            name: 'get_agents_status',
                            description: 'Lấy trạng thái và năng lượng hiện tại của tất cả AI Agents vận hành Millennium Vietnam.',
                            inputSchema: { type: 'object', properties: {} }
                        },
                        {
                            name: 'trigger_autonomous_loop',
                            description: 'Kích hoạt vòng lặp tự vận hành khép kín (marketing_loop hoặc system_audit).',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    loopType: {
                                        type: 'string',
                                        enum: ['marketing_loop', 'system_audit'],
                                        description: 'Loại vòng lặp cần chạy'
                                    }
                                },
                                required: ['loopType']
                            }
                        },
                        {
                            name: 'get_system_logs',
                            description: 'Đọc nhật ký vận hành mới nhất của hệ thống Millennium AI.',
                            inputSchema: { type: 'object', properties: {} }
                        },
                        {
                            name: 'update_system_configs',
                            description: 'Cập nhật cấu hình brand_voice (giọng nói thương hiệu) và system_instructions (chỉ thị điều hành) cho Claude Core.',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    brandVoice: { type: 'string', description: 'Định vị thương hiệu' },
                                    systemInstructions: { type: 'string', description: 'System instructions cho Claude' }
                                }
                            }
                        }
                    ]
                }
            });
            return;
        }

        // 3. Call tool
        if (method === 'tools/call') {
            const { name, arguments: args } = params;
            let resultText = '';

            try {
                if (name === 'get_agents_status') {
                    const agents = await dbQuery.getCollection('agents');
                    resultText = agents.map(a => `🤖 ${a.name} (${a.role}) - Trạng thái: ${a.status}, Năng lượng: ${a.energy}%, Tasks Completed: ${a.tasksCompleted}`).join('\n');
                } 
                else if (name === 'trigger_autonomous_loop') {
                    const { loopType } = args;
                    const agentId = loopType === 'marketing_loop' ? 'agent-2' : 'agent-4';
                    const loopName = loopType === 'marketing_loop' ? 'Content & Marketing Loop' : 'System Audit & Self-Correction';
                    
                    // Kích hoạt loop chạy nền
                    executeAutonomousLoop(loopType, agentId, loopName);
                    resultText = `🚀 Đã phát lệnh kích hoạt vòng lặp [${loopName}] chạy ngầm thành công. Bạn có thể theo dõi logs để kiểm tra kết quả.`;
                } 
                else if (name === 'get_system_logs') {
                    const logs = await dbQuery.getRecentLogs(15);
                    resultText = logs.map(l => `${l.timestamp} [${l.source}] ${l.message}`).join('\n');
                } 
                else if (name === 'update_system_configs') {
                    const { brandVoice, systemInstructions } = args;
                    if (brandVoice) await dbQuery.setDocument('config', 'brand_voice', { value: brandVoice });
                    if (systemInstructions) await dbQuery.setDocument('config', 'system_instructions', { value: systemInstructions });
                    resultText = `💾 Đã cập nhật thành công cấu hình hệ thống lên Firestore Database!`;
                } 
                else {
                    resultText = `❌ Không tìm thấy công cụ: ${name}`;
                }
            } catch (err) {
                resultText = `❌ Gặp lỗi khi thực thi tool [${name}]: ${err.message}`;
            }

            sendResponse({
                jsonrpc: '2.0',
                id: id,
                result: {
                    content: [
                        {
                            type: 'text',
                            text: resultText
                        }
                    ]
                }
            });
            return;
        }

        // Default fallback for unknown methods
        sendResponse({
            jsonrpc: '2.0',
            id: id,
            error: {
                code: -32601,
                message: `Method not found: ${method}`
            }
        });

    } catch (err) {
        console.error('MCP Server Error:', err.message);
    }
}
