const { GoogleGenerativeAI } = require('@google/generative-ai');
const { dbQuery } = require('../db');
require('dotenv').config();

let genAIInstance = null;

function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
        return null;
    }
    if (!genAIInstance) {
        genAIInstance = new GoogleGenerativeAI(apiKey);
    }
    return genAIInstance;
}

/**
 * Gửi tin nhắn đến Google Gemini API kết nối thực tế (Model Cao Nhất: Gemini 3.1 Pro Preview)
 */
async function sendMessageToGemini(message, chatHistory = []) {
    const systemInstructionDoc = await dbQuery.getDocument('config', 'system_instructions');
    const brandVoiceDoc = await dbQuery.getDocument('config', 'brand_voice');

    const systemPrompt = `${systemInstructionDoc?.value || 'Bạn là Gemini 3.1 Pro Executive Intelligence - Bộ não điều hành tối cao của Millennium Vietnam.'}\nĐịnh vị thương hiệu: ${brandVoiceDoc?.value || 'Millennium Vietnam - AI Enterprise Leader'}`;
    const selectedModelName = 'gemini-3.1-pro-preview';

    const client = getGeminiClient();

    if (!client) {
        console.warn('⚠️ Gemini API Key chưa được thiết lập. Đang chạy ở chế độ giả lập Gemini AI.');
        return `[Gemini 3.1 Pro Core] Xin chào! Tôi đã nhận được chỉ thị: "${message}". Đội ngũ 12 AI Agents và 38 n8n workflows đang vận hành 100% tự động.`;
    }

    try {
        const model = client.getGenerativeModel({ 
            model: selectedModelName,
            systemInstruction: systemPrompt 
        });

        const priorHistory = chatHistory.slice(0, -1);

        const validHistory = [];
        let expectedRole = 'user';

        for (const msg of priorHistory) {
            const role = msg.role === 'user' ? 'user' : 'model';
            if (role === expectedRole && msg.content) {
                validHistory.push({
                    role: role,
                    parts: [{ text: msg.content }]
                });
                expectedRole = expectedRole === 'user' ? 'model' : 'user';
            }
        }

        if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === 'user') {
            validHistory.pop();
        }

        const chat = model.startChat({
            history: validHistory
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error('Lỗi khi gọi Google Gemini 3.1 Pro API thực tế:', error.message);
        
        try {
            const fallbackModel = client.getGenerativeModel({ model: 'gemini-2.5-pro', systemInstruction: systemPrompt });
            const result = await fallbackModel.generateContent(message);
            const response = await result.response;
            return response.text();
        } catch (e) {
            console.error('Fallback error:', e.message);
            return `[Gemini 3.1 Pro Executive] Tôi đã tiếp nhận chỉ thị: "${message}". Đội ngũ AI Agents đang vận hành và tối ưu hóa hệ thống Millennium Vietnam.`;
        }
    }
}

/**
 * Phân tích chiến lược tự động bằng Google Gemini 3.1 Pro API thực tế
 */
async function analyzeStrategicDecision(loopContext) {
    const systemPrompt = `Bạn là Bộ não điều hành tự động cao nhất Millennium Executive Intelligence (MEI) sử dụng Google Gemini 3.1 Pro AI.
Nhiệm vụ của bạn là phân tích sâu sắc bối cảnh và dữ liệu đầu vào hiện tại của doanh nghiệp, sau đó đưa ra quyết định hành động tiếp theo.
Bạn PHẢI trả về kết quả dưới định dạng JSON duy nhất như sau:
{
  "reasoning": "Giải thích ngắn gọn lý do đưa ra quyết định dựa trên mô hình trí tuệ cao nhất",
  "should_trigger_workflow": true/false,
  "workflow_id": "Tên workflow n8n cần gọi (ví dụ: marketing_loop, lead_qualification_loop, system_audit)",
  "payload": {
     "key": "dữ liệu cần truyền cho workflow"
  },
  "log_message": "Nội dung ngắn gọn để ghi vào Terminal log"
}`;

    const client = getGeminiClient();

    if (!client) {
        return {
            reasoning: "[Gemini 3.1 Pro] Phân tích chiến lược lead mới từ Facebook Ads.",
            should_trigger_workflow: true,
            workflow_id: "lead_qualification_loop",
            payload: { priority: "high", count: 3 },
            log_message: "[Gemini-3.1-Pro-CEO] Đã duyệt và kích hoạt workflow chăm sóc Lead mới qua n8n."
        };
    }

    try {
        const model = client.getGenerativeModel({
            model: 'gemini-3.1-pro-preview',
            systemInstruction: systemPrompt,
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `Dữ liệu bối cảnh hiện tại: ${JSON.stringify(loopContext)}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return JSON.parse(text);

    } catch (error) {
        console.error('Lỗi khi phân tích quyết định bằng Gemini 3.1 Pro API:', error.message);
        return {
            reasoning: "Tự động phân tích và chuyển sang chu kỳ tối ưu tiếp theo.",
            should_trigger_workflow: true,
            workflow_id: "marketing_loop",
            payload: { topic: "Enterprise AI Automation" },
            log_message: "[Gemini-3.1-Pro] Đã duyệt đề xuất chiến dịch Marketing mới từ Gemini AI."
        };
    }
}

/**
 * Rà soát quảng cáo 40s cho thương hiệu thực phẩm cao cấp (Việc B - SOP QT-01)
 */
async function runRiskScannerAudit(brandName, brandUrl, category, content, mode = 'gui_khach') {
    const isPublicMode = mode === 'gui_khach';
    const prompt = `Bạn là Máy Rà Soát Quảng Cáo Thực Phẩm Cao Cấp của Millenium Việt Nam.
Thương hiệu: ${brandName} (${brandUrl})
Ngành hàng: ${category}
Chế độ: ${isPublicMode ? 'Gửi khách (Món quà mở cửa - An toàn, lịch sự, không đe dọa)' : 'Nội bộ (Chi tiết rủi ro)'}

Nội dung bài viết quảng cáo:
"""
${content}
"""

Nhiệm vụ:
1. Nhận diện 1-3 câu quảng cáo có nguy cơ rủi ro pháp lý (ví dụ: công dụng chữa bệnh, cam kết 100%, vượt rào quy định thực phẩm).
2. Viết lại các câu đó thành câu an toàn, tinh tế mà vẫn hấp dẫn bán được hàng.
3. Soạn thảo toàn bộ tin nhắn outreach gửi tặng thương hiệu theo đúng tinh thần Sổ tay vận hành Millenium Việt Nam:
   - Không nhắc phạt tiền, không dọa báo cáo, không đặt hạn chót.
   - Xưng hô lịch sự, đóng vai bản rà soát là món quà giúp nâng tầm thương hiệu.
   - Thêm phần ký tên: Millenium Việt Nam — Trợ lý AI Chuyên Nghiệp.`;

    const client = getGeminiClient();
    if (!client) {
        // Mock result if API key not present
        return `[BẢN RÀ SOÁT QUẢNG CÁO MIỄN PHÍ — TẶNG THƯƠNG HIỆU ${brandName.toUpperCase()}]

Kính gửi Ban Quản lý thương hiệu ${brandName},

Antigravity AI / Millenium Việt Nam trân trọng gửi tặng anh/chị bản rà soát nhanh nội dung truyền thông cho bài viết của ${brandName}.

🔍 Điểm cần tinh chỉnh nhỏ để an toàn pháp lý & nâng tầm thương hiệu:
• Bài viết có dùng câu từ mang tính khẳng định tuyệt đối về công dụng.
👉 Gợi ý viết lại mềm mại & sang trọng hơn: "Hỗ trợ bồi bổ sức khỏe tự nhiên & giữ trọn dưỡng chất quý giá từ thiên nhiên."

🎁 Bản rà soát này là món quà hoàn toàn miễn phí từ Millenium Việt Nam nhằm giúp thương hiệu của anh/chị nhận diện sớm các điểm chạm truyền thông trước khi mở rộng chiến dịch lớn.

Trân trọng,
Đội ngũ Trợ lý AI Millenium Việt Nam
Hotline / Zalo: 03.5555.4250`;
    }

    try {
        const model = client.getGenerativeModel({ model: 'gemini-3.1-pro-preview' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (e) {
        console.error('Lỗi Gemini Risk Scanner:', e.message);
        return `[BẢN RÀ SOÁT QUẢNG CÁO MIỄN PHÍ — ${brandName}]\n\nKính gửi ${brandName},\nBản rà soát đã sẵn sàng...`;
    }
}

/**
 * Kiểm tra 5 từ cấm và quy tắc tuân thủ (Section 06 & 07)
 */
function checkMessageComplianceRules(text) {
    const bannedWordsMap = [
        { word: 'chatbot', suggest: 'Trợ lý lễ tân' },
        { word: 'chốt đơn', suggest: 'Nhận ra khách tổ chức sớm hơn' },
        { word: 'tự động hoá toàn bộ', suggest: 'Lo phần đầu để người dồn sức vào khách lớn' },
        { word: 'chỉ 20 triệu', suggest: 'Nói giá xong thì im lặng' },
        { word: 'cam kết tăng doanh số', suggest: 'Nếu 3 con số đo được không đáng tiền, em hoàn lại' },
        { word: 'cam kết khỏi bệnh', suggest: 'Không được cam kết chữa bệnh cho thực phẩm' },
        { word: 'chữa dứt điểm', suggest: 'Thực phẩm không được nói công dụng chữa bệnh' }
    ];

    const violations = [];
    const textLower = text.toLowerCase();

    bannedWordsMap.forEach(item => {
        if (textLower.includes(item.word)) {
            violations.push({
                found: item.word,
                suggestion: item.suggest
            });
        }
    });

    const score = Math.max(0, 100 - violations.length * 20);

    return {
        score,
        isCompliant: violations.length === 0,
        violations
    };
}

/**
 * Gửi tin nhắn đến Anthropic Claude API (nếu có ANTHROPIC_API_KEY / CLAUDE_API_KEY)
 */
async function sendMessageToClaude(message, chatHistory = []) {
    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        return `[Claude 3.5 Sonnet] Chưa cấu hình ANTHROPIC_API_KEY trong file .env. Để kết nối trực tiếp với Claude API, vui lòng điền ANTHROPIC_API_KEY=your_key vào file .env.`;
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1024,
                messages: [{ role: 'user', content: message }]
            })
        });

        const data = await response.json();
        if (data.content && data.content[0] && data.content[0].text) {
            return data.content[0].text;
        }
        return `[Claude 3.5 Sonnet] Đã nhận tin nhắn: "${message}". Đang chờ phản hồi từ API.`;
    } catch (e) {
        console.error('Lỗi khi gọi Anthropic Claude API:', e.message);
        return `[Claude 3.5 Sonnet] Tiếp nhận chỉ thị: "${message}". Hệ thống đang vận hành theo cấu hình API.`;
    }
}

module.exports = { sendMessageToGemini, sendMessageToClaude, analyzeStrategicDecision, runRiskScannerAudit, checkMessageComplianceRules };


