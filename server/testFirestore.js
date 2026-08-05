const { Firestore } = require('@google-cloud/firestore');
const fs = require('fs');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');

async function testCloudFirestoreConnection() {
    try {
        const firebaseConfigPath = path.join(process.env.HOME || '/Users/yakuzabinair', '.config/configstore/firebase-tools.json');
        const config = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
        const refreshToken = config.tokens?.refresh_token;

        // Firebase CLI standard OAuth Client ID & Secret
        const CLIENT_ID = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
        const CLIENT_SECRET = 'tWS-iBhYLigBsw_FwXEYBwBq';

        const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET);
        oAuth2Client.setCredentials({ refresh_token: refreshToken });

        const firestore = new Firestore({
            projectId: 'gen-lang-client-0685289006',
            authClient: oAuth2Client
        });

        console.log('Đang thử nghiệm ghi dữ liệu thực tế lên Google Cloud Firestore...');
        await firestore.collection('system_test').doc('ping').set({
            status: 'CONNECTED_REAL_FIRESTORE',
            account: 'ngonhut45@gmail.com',
            project: 'gen-lang-client-0685289006',
            timestamp: new Date().toISOString()
        });

        const doc = await firestore.collection('system_test').doc('ping').get();
        console.log('✅ ĐÃ KẾT NỐI FIRESTORE THỰC TẾ THÀNH CÔNG! Dữ liệu đọc ra:', doc.data());
    } catch (e) {
        console.error('Lỗi khi kết nối Firestore:', e.message);
    }
}

testCloudFirestoreConnection();
