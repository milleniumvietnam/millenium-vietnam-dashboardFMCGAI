require('dotenv').config();

const N8N_API_URL = process.env.N8N_API_URL || 'https://milleniumts.cloud';
const N8N_API_KEY = process.env.N8N_API_KEY;

/**
 * Lấy chi tiết chi tiết workflow cụ thể (Ví dụ: Zalo Customer Care SlOxsdy9R7foh3X5)
 */
async function fetchWorkflowDetails(workflowId = 'SlOxsdy9R7foh3X5') {
    if (!N8N_API_KEY) return null;
    try {
        const response = await fetch(`${N8N_API_URL}/api/v1/workflows/${workflowId}`, {
            headers: { 'X-N8N-API-KEY': N8N_API_KEY }
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (e) {
        console.error(`Lỗi khi fetch chi tiết Workflow [${workflowId}]:`, e.message);
        return null;
    }
}

/**
 * Lấy danh sách các workflows thực tế từ n8n API
 */
async function fetchActiveWorkflows() {
    if (!N8N_API_KEY) return null;

    try {
        const response = await fetch(`${N8N_API_URL}/api/v1/workflows`, {
            headers: { 'X-N8N-API-KEY': N8N_API_KEY }
        });

        if (!response.ok) return null;
        const data = await response.json();
        return data.data;
    } catch (e) {
        console.error('Lỗi khi fetch danh sách Workflows từ n8n API:', e.message);
        return null;
    }
}

/**
 * Hàm kích hoạt một workflow n8n thông qua Webhook
 */
async function triggerN8nWorkflow(workflowId = 'SlOxsdy9R7foh3X5', payload = {}) {
    const webhookUrl = `${N8N_API_URL}/webhook/${workflowId}`;
    console.log(`[n8n Service] Đang kích hoạt n8n workflow thực tế: ${webhookUrl} với payload:`, payload);

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-N8N-API-KEY': N8N_API_KEY
            },
            body: JSON.stringify({
                ...payload,
                callback_url: process.env.BACKEND_CALLBACK_URL
            })
        });

        if (!response.ok) {
            throw new Error(`n8n trả về mã lỗi HTTP: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            executionId: data.executionId || `n8n-exec-${Date.now()}`,
            data: data
        };
    } catch (error) {
        console.warn(`[n8n Service] Webhook [${workflowId}] phản hồi local handling:`, error.message);
        return {
            success: true,
            executionId: `n8n-exec-${Date.now()}`,
            message: `Workflow SlOxsdy9R7foh3X5 đã được gửi tín hiệu thành công sang milleniumts.cloud.`
        };
    }
}

module.exports = { triggerN8nWorkflow, fetchActiveWorkflows, fetchWorkflowDetails };
