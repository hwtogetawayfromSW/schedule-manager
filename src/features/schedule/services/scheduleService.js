const fs = require('fs').promises;
const path = require('path');
const { DefaultShifts } = require('../types');

class ScheduleService {
    constructor() {
        this.dataPath = path.join(__dirname, '../../../../data/schedule.json');
        this.defaultShiftsPath = path.join(__dirname, '../../../../data/default_shifts.json');
    }

    async loadSchedule() {
        try {
            const data = await fs.readFile(this.dataPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('載入班表失敗:', error);
            return [];
        }
    }

    async saveSchedule(scheduleData) {
        try {
            await fs.writeFile(this.dataPath, JSON.stringify(scheduleData, null, 2));
            return true;
        } catch (error) {
            console.error('儲存班表失敗:', error);
            return false;
        }
    }

    async loadDefaultShifts() {
        try {
            const data = await fs.readFile(this.defaultShiftsPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('載入預設班別失敗，使用系統預設值:', error);
            return DefaultShifts;
        }
    }

    async saveDefaultShifts(shiftsData) {
        try {
            await fs.writeFile(this.defaultShiftsPath, JSON.stringify(shiftsData, null, 2));
            return true;
        } catch (error) {
            console.error('儲存預設班別失敗:', error);
            return false;
        }
    }

    calculateTotalHours(schedule) {
        const staffHours = {};
        
        schedule.forEach(day => {
            day.shifts.forEach(shift => {
                const shiftHours = shift.totalHours;
                shift.staff.forEach(staffId => {
                    staffHours[staffId] = (staffHours[staffId] || 0) + shiftHours;
                });
            });
        });

        return staffHours;
    }
}

module.exports = new ScheduleService();
