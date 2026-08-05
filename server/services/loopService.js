const cron = require('node-cron');
const { dbQuery } = require('../db');
const { analyzeStrategicDecision } = require('./geminiService');
const { triggerN8nWorkflow } = require('./n8nService');

const activeCronJobs = {};

/**
 * Khởi động toàn bộ các vòng lặp tự vận hành 24/7 bằng Google Gemini API
 */
function initAutonomousLoops() {
    console.log('[Loop Service] Khởi tạo các vòng lặp tự vận hành 24/7 (Gemini AI Core)...');

    activeCronJobs['marketing_loop'] = cron.schedule('*/5 * * * *', async () => {
        await executeAutonomousLoop('marketing_loop', 'agent-2', 'Content & Marketing Loop');
    });

    activeCronJobs['system_audit'] = cron.schedule('*/10 * * * *', async () => {
        await executeAutonomousLoop('system_audit', 'agent-4', 'System Audit & Self-Correction');
    });

    console.log('[Loop Service] Đã kích hoạt schedulers thành công.');
}

/**
 * Thực thi một vòng lặp tự vận hành khép kín (Autonomous Loop)
 */
async function executeAutonomousLoop(loopType, agentId, loopName) {
    console.log(`\n🔄 [Loop Engine] Bắt đầu chạy vòng lặp: ${loopName} (${loopType})...`);

    try {
        // Bước 1: Thu thập bối cảnh hệ thống từ Firestore
        const recentLogs = await dbQuery.getRecentLogs(5);
        const agentInfo = await dbQuery.getDocument('agents', agentId);
        const systemMode = await dbQuery.getDocument('config', 'operating_mode');

        const loopContext = {
            loop_type: loopType,
            agent: agentInfo,
            recent_logs: recentLogs,
            operating_mode: systemMode?.value || 'autonomous',
            timestamp: new Date().toISOString()
        };

        await writeSystemLog('info', loopName, `[Vòng lặp] Đang thu thập bối cảnh & phân tích dữ liệu với Gemini AI...`);

        // Bước 2: Gọi Google Gemini AI để ra quyết định chiến lược
        const aiDecision = await analyzeStrategicDecision(loopContext);
        
        await writeSystemLog('highlight', loopName, `[Gemini Decision] ${aiDecision.reasoning}`);

        // Bước 3: Thực thi n8n workflow nếu Gemini AI yêu cầu
        if (aiDecision.should_trigger_workflow && aiDecision.workflow_id) {
            await writeSystemLog('info', loopName, `[n8n Trigger] Gemini ra lệnh kích hoạt workflow: ${aiDecision.workflow_id}`);
            
            const n8nResult = await triggerN8nWorkflow(aiDecision.workflow_id, aiDecision.payload);
            
            if (n8nResult.success) {
                await writeSystemLog('success', loopName, `${aiDecision.log_message} (Execution ID: ${n8nResult.executionId})`);
                
                // Cập nhật chỉ số của Agent trong Firestore
                const currentAgent = await dbQuery.getDocument('agents', agentId);
                if (currentAgent) {
                    await dbQuery.setDocument('agents', agentId, {
                        tasksCompleted: (currentAgent.tasksCompleted || 0) + 1,
                        energy: currentAgent.energy > 10 ? currentAgent.energy - 2 : 100
                    });
                }
            } else {
                await writeSystemLog('error', loopName, `[Lỗi n8n] Không thể chạy workflow: ${n8nResult.error}`);
            }
        } else {
            await writeSystemLog('info', loopName, `[System Check] Gemini AI quyết định không cần kích hoạt n8n workflow mới tại chu kỳ này.`);
        }

    } catch (error) {
        console.error(`Lỗi trong quá trình chạy vòng lặp ${loopName}:`, error.message);
        await writeSystemLog('error', loopName, `[Crash] Lỗi hệ thống: ${error.message}`);
    }
}

/**
 * Hàm ghi log vào Firestore Database
 */
async function writeSystemLog(level, source, message) {
    try {
        const fullLog = await dbQuery.addLog({ level, source, message });
        
        if (global.broadcastLog) {
            global.broadcastLog(fullLog);
        }
    } catch (err) {
        console.error('Lỗi khi ghi log Firestore:', err.message);
    }
}

function pauseLoopJob(loopType) {
    if (activeCronJobs[loopType]) {
        activeCronJobs[loopType].stop();
        console.log(`[Loop Service] Đã tạm dừng vòng lặp: ${loopType}`);
        return true;
    }
    return false;
}

function resumeLoopJob(loopType) {
    if (activeCronJobs[loopType]) {
        activeCronJobs[loopType].start();
        console.log(`[Loop Service] Đã kích hoạt lại vòng lặp: ${loopType}`);
        return true;
    }
    return false;
}

module.exports = {
    initAutonomousLoops,
    executeAutonomousLoop,
    writeSystemLog,
    pauseLoopJob,
    resumeLoopJob
};
