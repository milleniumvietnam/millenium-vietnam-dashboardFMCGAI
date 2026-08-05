const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { dbQuery } = require('./db');
const { sendMessageToGemini, sendMessageToClaude, runRiskScannerAudit, checkMessageComplianceRules } = require('./services/geminiService');
const { initAutonomousLoops, executeAutonomousLoop, pauseLoopJob, resumeLoopJob, writeSystemLog } = require('./services/loopService');
const { initSelfHealingScheduler, runDailySelfHealingAudit } = require('./services/selfHealingService');
const { triggerN8nWorkflow, fetchActiveWorkflows } = require('./services/n8nService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Middlewares
app.disable('x-powered-by');
app.use(cors({ origin: true }));
app.use(bodyParser.json({ limit: '10mb' }));

// Static file serving
app.use(express.static(path.join(__dirname, '../')));

let sseClients = [];

global.broadcastLog = (logObj) => {
    sseClients.forEach(client => {
        try {
            client.res.write(`data: ${JSON.stringify(logObj)}\n\n`);
        } catch (e) {
            // Silence socket write errors
        }
    });
};

// SSE Real-time Logs Endpoint
app.get('/api/logs/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = Date.now();
    sseClients.push({ id: clientId, res });

    req.on('close', () => {
        sseClients = sseClients.filter(c => c.id !== clientId);
    });
});

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'HEALTHY', timestamp: new Date().toISOString() });
});

// 1. Daily Self-Healing Audit Trigger Endpoint
app.post('/api/audit/trigger-now', async (req, res) => {
    try {
        const result = await runDailySelfHealingAudit();
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Agents API
app.get('/api/agents', async (req, res) => {
    try {
        const agents = await dbQuery.getCollection('agents');
        res.json(agents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/agents/new', async (req, res) => {
    const { name, role, type, model, icon, color } = req.body;
    const id = `agent-${Date.now()}`;
    try {
        await dbQuery.setDocument('agents', id, {
            name,
            role,
            type,
            model: model || 'Gemini 3.1 Pro',
            status: 'AUTONOMOUS (APPROVED)',
            tasksCompleted: 0,
            energy: 100,
            icon: icon || 'ri-robot-2-line',
            color: color || 'cyan'
        });
        await writeSystemLog('success', 'System', `Đã khởi tạo AI Agent mới: ${name} (Tự động duyệt 100%)`);
        res.json({ success: true, agentId: id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Auto-Approval System API
app.post('/api/approval/approve-all', async (req, res) => {
    try {
        await dbQuery.setDocument('config', 'auto_approval', { value: 'enabled', updatedAt: new Date().toISOString() });
        const agents = await dbQuery.getCollection('agents');
        for (const agent of agents) {
            await dbQuery.setDocument('agents', agent.id, {
                status: 'AUTONOMOUS (APPROVED)',
                energy: 100
            });
        }
        await writeSystemLog('success', 'Auto-Approve Core', '🚀 ĐÃ TỰ ĐỘNG PHÊ DUYỆT TOÀN BỘ YÊU CẦU & NHIỆM VỤ CỦA HỆ THỐNG AI AGENTS!');
        res.json({ success: true, message: 'Đã phê duyệt toàn bộ yêu cầu.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. n8n Real Workflows API (KẾT NỐI THỰC TẾ WORKFLOW ZALO SlOxsdy9R7foh3X5 ON MILLENIUMTS.CLOUD)
app.get('/api/workflows', async (req, res) => {
    try {
        const realWorkflows = await fetchActiveWorkflows();
        if (realWorkflows && realWorkflows.length > 0) {
            const zaloWf = realWorkflows.find(w => w.id === 'SlOxsdy9R7foh3X5') || realWorkflows[0];
            const formattedNodes = [
                { id: 'node-1', name: 'Zalo Message Trigger', type: 'Webhook Trigger (53289d67)', x: 40, y: 170, color: 'trigger', workflowId: zaloWf.id },
                { id: 'node-2', name: 'Google Gemini Chat Model', type: 'gemini-2.5-flash AI Engine', x: 260, y: 100, color: 'ai', workflowId: zaloWf.id },
                { id: 'node-3', name: 'Postgres Chat Memory', type: 'Customer Session Memory', x: 260, y: 240, color: 'action', workflowId: zaloWf.id },
                { id: 'node-4', name: 'Zalo Send Message (Auto)', type: 'Customer Care Reply Output', x: 480, y: 100, color: 'action', workflowId: zaloWf.id },
                { id: 'node-5', name: 'Google Sheets CRM Log', type: 'Lead & Attachment Tracker', x: 480, y: 240, color: 'loop', workflowId: zaloWf.id }
            ];
            return res.json(formattedNodes);
        }

        const nodes = await dbQuery.getCollection('workflows');
        res.json(nodes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/workflows/node', async (req, res) => {
    const { name, type, x, y, color } = req.body;
    const id = `node-${Date.now()}`;
    try {
        await dbQuery.setDocument('workflows', id, {
            name,
            type,
            x: parseInt(x),
            y: parseInt(y),
            color: color || 'action'
        });
        await writeSystemLog('info', 'n8n Editor', `Đã thêm node mới vào n8n Canvas: ${name}`);
        res.json({ success: true, nodeId: id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Config API
app.get('/api/config', async (req, res) => {
    try {
        const configRows = await dbQuery.getCollection('config');
        const configMap = {};
        configRows.forEach(row => {
            configMap[row.id] = row.value;
        });
        res.json(configMap);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/config', async (req, res) => {
    const configs = req.body;
    try {
        for (const [key, value] of Object.entries(configs)) {
            await dbQuery.setDocument('config', key, { value });
        }
        await writeSystemLog('success', 'System Config', `Đã cập nhật cấu hình hệ thống.`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Logs API
app.get('/api/logs', async (req, res) => {
    try {
        const logs = await dbQuery.getRecentLogs(50);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Gemini & Claude Strategy Chat API
const handleGeminiChat = async (req, res) => {
    const { message, history } = req.body;
    try {
        const reply = await sendMessageToGemini(message, history || []);
        res.json({ reply });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const handleClaudeChat = async (req, res) => {
    const { message, history } = req.body;
    try {
        const reply = await sendMessageToClaude(message, history || []);
        res.json({ reply });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

app.post('/api/gemini/chat', handleGeminiChat);
app.post('/api/claude/chat', handleClaudeChat);


// 8. Loop Control API
app.post('/api/loops/trigger', async (req, res) => {
    const { loopType } = req.body;
    let agentId = 'agent-1';
    let loopName = 'Autonomous Loop';

    if (loopType === 'marketing_loop') {
        agentId = 'agent-2';
        loopName = 'Content & Marketing Loop';
    } else if (loopType === 'system_audit') {
        agentId = 'agent-4';
        loopName = 'System Audit & Self-Correction';
    }

    try {
        executeAutonomousLoop(loopType, agentId, loopName);
        res.json({ success: true, message: `Vòng lặp ${loopName} đã được tự động phê duyệt và kích hoạt.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/loops/toggle', (req, res) => {
    const { loopType, active } = req.body;
    try {
        if (active) {
            resumeLoopJob(loopType);
            res.json({ success: true, active: true });
        } else {
            pauseLoopJob(loopType);
            res.json({ success: true, active: false });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 9. Callback Endpoint từ n8n Webhook Thực Tế
app.post('/api/n8n/callback', async (req, res) => {
    const payload = req.body;
    console.log('[n8n Callback] Nhận phản hồi thực tế từ milleniumts.cloud:', payload);
    try {
        const source = payload.workflow_name || 'n8n Cloud';
        const level = payload.status === 'error' ? 'error' : 'success';
        const message = payload.message || `n8n Workflow thực thi thành công từ milleniumts.cloud`;
        
        await writeSystemLog(level, source, `[n8n Cloud Callback] ${message}`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 10. Risk Scanner Audit 40s API (Việc B - SOP QT-01)
app.post('/api/scanner/run', async (req, res) => {
    const { brandName, brandUrl, category, content, mode } = req.body;
    try {
        await writeSystemLog('info', 'Máy Rà Soát QC 40s', `Đang chạy rà soát rủi ro QC cho thương hiệu: ${brandName} (Chế độ: ${mode || 'gui_khach'})`);
        const result = await runRiskScannerAudit(brandName, brandUrl, category, content, mode);
        await writeSystemLog('success', 'Máy Rà Soát QC 40s', `Hoàn tất rà soát 40s cho thương hiệu: ${brandName}`);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 11. Compliance Auditor 5 Banned Words API
app.post('/api/compliance/check', (req, res) => {
    const { text } = req.body;
    try {
        const audit = checkMessageComplianceRules(text || '');
        res.json(audit);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Xuất Firebase Functions Cloud API Endpoint
try {
    const { onRequest } = require('firebase-functions/v2/https');
    exports.api = onRequest({ cors: true, region: 'us-central1' }, app);
} catch (e) {
    try {
        const functions = require('firebase-functions');
        exports.api = functions.https.onRequest(app);
    } catch (err) {
        // Silence error if running standalone node
    }
}

// Khởi chạy Standalone Express Server nếu chạy trực tiếp
if (require.main === module) {
    const server = app.listen(PORT, '127.0.0.1', () => {
        console.log(`====================================================`);
        console.log(` Millennium AI Operating Platform (Connected to milleniumts.cloud)`);
        console.log(` Backend API & Client: http://localhost:${PORT}`);
        console.log(`====================================================`);

        initAutonomousLoops();
        initSelfHealingScheduler();
    });

    process.on('SIGTERM', () => {
        server.close(() => {
            console.log('Server process terminated.');
        });
    });
}

module.exports = app;
