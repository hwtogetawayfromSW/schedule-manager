const fs = require('fs');
const path = require('path');
const store = require('../store');

async function initializeSchedule() {
    const schedulePath = path.join(__dirname, '../../data/schedule.json');
    try {
        if (fs.existsSync(schedulePath)) {
            const data = JSON.parse(fs.readFileSync(schedulePath, 'utf-8'));
            store.scheduleData = data;
        } else {
            fs.writeFileSync(schedulePath, JSON.stringify([], null, 2));
            store.scheduleData = [];
        }
    } catch (error) {
        throw new Error('載入班表失敗: ' + error.message);
    }
}

function saveSchedule() {
    const schedulePath = path.join(__dirname, '../../data/schedule.json');
    try {
        fs.writeFileSync(schedulePath, JSON.stringify(store.scheduleData, null, 2));
        return true;
    } catch (error) {
        console.error('儲存班表失敗:', error);
        return false;
    }
}

function editSchedule(year, month, day) {
    // ... 保留原有的 editSchedule 邏輯，但使用 store.scheduleData ...
}

module.exports = {
    initializeSchedule,
    saveSchedule,
    editSchedule
};