const { ipcRenderer } = require('electron');
const scheduleService = require('../services/scheduleService');

class ScheduleStore {
    constructor() {
        this.schedule = [];
        this.defaultShifts = {};
        this.listeners = new Set();
    }

    async initialize() {
        this.schedule = await scheduleService.loadSchedule();
        this.defaultShifts = await scheduleService.loadDefaultShifts();
        this.notifyListeners();
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this.getState()));
    }

    getState() {
        return {
            schedule: this.schedule,
            defaultShifts: this.defaultShifts,
            totalHours: scheduleService.calculateTotalHours(this.schedule)
        };
    }

    async updateSchedule(newSchedule) {
        this.schedule = newSchedule;
        await scheduleService.saveSchedule(newSchedule);
        this.notifyListeners();
    }

    async updateDefaultShifts(newShifts) {
        this.defaultShifts = newShifts;
        await scheduleService.saveDefaultShifts(newShifts);
        this.notifyListeners();
    }
}

const scheduleStore = new ScheduleStore();

// 監聽主進程的更新
ipcRenderer.on('schedule-updated', async () => {
    await scheduleStore.initialize();
});

module.exports = scheduleStore;
