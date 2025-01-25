const fs = require('fs');
const path = require('path');
const store = require('../store');

async function loadSettings() {
    const settingsPath = path.join(__dirname, '../../data/settings.json');
    try {
        if (fs.existsSync(settingsPath)) {
            const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
            store.staffList = settings.staff || [];
            store.shifts = settings.shifts || [];
        } else {
            const defaultSettings = {
                staff: [],
                shifts: []
            };
            fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
        }
    } catch (error) {
        throw new Error('載入設定失敗: ' + error.message);
    }
}

function saveSettings() {
    const settingsPath = path.join(__dirname, '../../data/settings.json');
    try {
        fs.writeFileSync(settingsPath, JSON.stringify({
            staff: store.staffList,
            shifts: store.shifts
        }, null, 2));
        return true;
    } catch (error) {
        console.error('儲存設定失敗:', error);
        return false;
    }
}

module.exports = {
    loadSettings,
    saveSettings
};