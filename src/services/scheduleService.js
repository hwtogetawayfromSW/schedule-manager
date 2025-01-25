import { defaultShifts, defaultEmployees } from '../config/scheduleConfig.js';

class ScheduleService {
    constructor() {
        this.shifts = this.loadShifts();
        this.employees = this.loadEmployees();
        this.scheduleData = this.loadScheduleData();
    }
    
    // 加載班別設置
    loadShifts() {
        const savedShifts = localStorage.getItem('shifts');
        return savedShifts ? JSON.parse(savedShifts) : defaultShifts;
    }
    
    // 保存班別設置
    saveShifts(shifts) {
        localStorage.setItem('shifts', JSON.stringify(shifts));
        this.shifts = shifts;
    }
    
    // 加載員工資料
    loadEmployees() {
        const savedEmployees = localStorage.getItem('employees');
        return savedEmployees ? JSON.parse(savedEmployees) : defaultEmployees;
    }
    
    // 保存員工資料
    saveEmployees(employees) {
        localStorage.setItem('employees', JSON.stringify(employees));
        this.employees = employees;
    }
    
    // 加載排班數據
    loadScheduleData() {
        const savedData = localStorage.getItem('scheduleData');
        return savedData ? JSON.parse(savedData) : {};
    }
    
    // 保存排班數據
    saveScheduleData(data) {
        localStorage.setItem('scheduleData', JSON.stringify(data));
        this.scheduleData = data;
    }
    
    // 更新單日排班
    updateDaySchedule(date, employeeId, shiftName, notes = '') {
        if (!this.scheduleData[date]) {
            this.scheduleData[date] = [];
        }
        
        // 檢查是否已存在該員工的排班
        const existingIndex = this.scheduleData[date]
            .findIndex(s => s.employeeId === employeeId);
            
        const scheduleItem = {
            employeeId,
            shiftName,
            notes
        };
        
        if (existingIndex >= 0) {
            this.scheduleData[date][existingIndex] = scheduleItem;
        } else {
            this.scheduleData[date].push(scheduleItem);
        }
        
        this.saveScheduleData(this.scheduleData);
    }
    
    // 刪除單日排班
    removeDaySchedule(date, employeeId) {
        if (!this.scheduleData[date]) return;
        
        this.scheduleData[date] = this.scheduleData[date]
            .filter(s => s.employeeId !== employeeId);
            
        if (this.scheduleData[date].length === 0) {
            delete this.scheduleData[date];
        }
        
        this.saveScheduleData(this.scheduleData);
    }
    
    // 批量更新排班
    batchUpdateSchedule(dates, employeeId, shiftName, notes = '') {
        dates.forEach(date => {
            this.updateDaySchedule(date, employeeId, shiftName, notes);
        });
    }
    
    // 獲取某日排班
    getDaySchedule(date) {
        return this.scheduleData[date] || [];
    }
    
    // 獲取某月排班
    getMonthSchedule(year, month) {
        const result = {};
        const monthStr = String(month).padStart(2, '0');
        const pattern = `${year}-${monthStr}`;
        
        Object.entries(this.scheduleData).forEach(([date, schedule]) => {
            if (date.startsWith(pattern)) {
                result[date] = schedule;
            }
        });
        
        return result;
    }
    
    // 更新班別時間
    updateShiftTime(shiftName, startTime, endTime) {
        if (this.shifts[shiftName]) {
            this.shifts[shiftName].startTime = startTime;
            this.shifts[shiftName].endTime = endTime;
            this.saveShifts(this.shifts);
        }
    }
    
    // 添加新員工
    addEmployee(name, position, hourlyRate = null) {
        const newId = Math.max(...this.employees.map(e => e.id), 0) + 1;
        const newEmployee = { id: newId, name, position, hourlyRate };
        this.employees.push(newEmployee);
        this.saveEmployees(this.employees);
        return newEmployee;
    }
    
    // 刪除員工
    removeEmployee(employeeId) {
        this.employees = this.employees.filter(e => e.id !== employeeId);
        this.saveEmployees(this.employees);
        
        // 同時刪除該員工的所有排班
        Object.keys(this.scheduleData).forEach(date => {
            this.removeDaySchedule(date, employeeId);
        });
    }
}

export const scheduleService = new ScheduleService();
