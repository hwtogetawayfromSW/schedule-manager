class ScheduleService {
    constructor() {
        this.employees = [];
        this.shifts = {};
        this.schedules = {};
        this.weeklyDefaults = {};
        this.nextEmployeeId = 1;
    }

    initialize() {
        console.log('Initializing ScheduleService...');
        try {
            // 從本地存儲加載數據
            const savedData = localStorage.getItem('scheduleData');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.employees = data.employees || [];
                this.shifts = data.shifts || {};
                this.schedules = data.schedules || {};
                this.weeklyDefaults = data.weeklyDefaults || {};
                this.nextEmployeeId = data.nextEmployeeId || 1;
            }
            console.log('ScheduleService initialized successfully');
        } catch (error) {
            console.error('Failed to initialize ScheduleService:', error);
            // 重置為默認值
            this.employees = [];
            this.shifts = {};
            this.schedules = {};
            this.weeklyDefaults = {};
            this.nextEmployeeId = 1;
        }
    }

    saveData() {
        try {
            const data = {
                employees: this.employees,
                shifts: this.shifts,
                schedules: this.schedules,
                weeklyDefaults: this.weeklyDefaults,
                nextEmployeeId: this.nextEmployeeId
            };
            localStorage.setItem('scheduleData', JSON.stringify(data));
            console.log('Data saved successfully');
        } catch (error) {
            console.error('Failed to save data:', error);
        }
    }

    // 員工管理
    addEmployee(employee) {
        try {
            const newEmployee = {
                id: this.nextEmployeeId++,
                name: employee.name,
                position: employee.position,
                hourlyRate: parseFloat(employee.hourlyRate) || 0
            };
            this.employees.push(newEmployee);
            this.saveData();
            return newEmployee;
        } catch (error) {
            console.error('Failed to add employee:', error);
            return null;
        }
    }

    removeEmployee(employeeId) {
        try {
            this.employees = this.employees.filter(e => e.id !== employeeId);
            // 移除該員工的所有排班
            Object.keys(this.schedules).forEach(date => {
                this.schedules[date] = this.schedules[date].filter(s => s.employeeId !== employeeId);
            });
            this.saveData();
            return true;
        } catch (error) {
            console.error('Failed to remove employee:', error);
            return false;
        }
    }

    getEmployee(employeeId) {
        return this.employees.find(e => e.id === employeeId);
    }

    getEmployees() {
        return [...this.employees];
    }

    // 班別管理
    addShift(shift) {
        try {
            this.shifts[shift.name] = {
                startTime: shift.startTime,
                endTime: shift.endTime,
                color: shift.color
            };
            this.saveData();
            return true;
        } catch (error) {
            console.error('Failed to add shift:', error);
            return false;
        }
    }

    removeShift(shiftName) {
        try {
            delete this.shifts[shiftName];
            // 移除該班別的所有排班
            Object.keys(this.schedules).forEach(date => {
                this.schedules[date] = this.schedules[date].filter(s => s.shiftName !== shiftName);
            });
            this.saveData();
            return true;
        } catch (error) {
            console.error('Failed to remove shift:', error);
            return false;
        }
    }

    getShifts() {
        return { ...this.shifts };
    }

    // 排班管理
    updateDaySchedule(date, employeeId, shiftName, notes = '') {
        try {
            if (!this.schedules[date]) {
                this.schedules[date] = [];
            }
            
            // 移除該員工在該日期的現有排班
            this.schedules[date] = this.schedules[date].filter(s => s.employeeId !== employeeId);
            
            // 添加新排班
            this.schedules[date].push({
                employeeId,
                shiftName,
                notes
            });
            
            this.saveData();
            return true;
        } catch (error) {
            console.error('Failed to update day schedule:', error);
            return false;
        }
    }

    removeDaySchedule(date, employeeId) {
        try {
            if (this.schedules[date]) {
                this.schedules[date] = this.schedules[date].filter(s => s.employeeId !== employeeId);
                this.saveData();
            }
            return true;
        } catch (error) {
            console.error('Failed to remove day schedule:', error);
            return false;
        }
    }

    getDaySchedule(date) {
        return this.schedules[date] || [];
    }

    getMonthSchedule(year, month) {
        const result = {};
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            result[dateStr] = this.getDaySchedule(dateStr);
        }
        
        return result;
    }

    // 每週預設設定
    setWeeklyDefaults(settings) {
        try {
            this.weeklyDefaults = { ...settings };
            this.saveData();
            return true;
        } catch (error) {
            console.error('Failed to set weekly defaults:', error);
            return false;
        }
    }

    getWeeklyDefaults() {
        return { ...this.weeklyDefaults };
    }

    // 統計計算
    calculateStats() {
        try {
            let totalShifts = 0;
            let totalHours = 0;
            let totalSalary = 0;

            Object.values(this.schedules).forEach(daySchedules => {
                daySchedules.forEach(schedule => {
                    totalShifts++;
                    const shift = this.shifts[schedule.shiftName];
                    if (shift) {
                        const startTime = new Date(`2000-01-01T${shift.startTime}`);
                        const endTime = new Date(`2000-01-01T${shift.endTime}`);
                        let hours = (endTime - startTime) / (1000 * 60 * 60);
                        if (hours < 0) hours += 24; // 處理跨日的情況
                        
                        totalHours += hours;
                        
                        const employee = this.getEmployee(schedule.employeeId);
                        if (employee) {
                            totalSalary += hours * employee.hourlyRate;
                        }
                    }
                });
            });

            return {
                totalShifts,
                totalHours: Math.round(totalHours * 10) / 10,
                totalSalary: Math.round(totalSalary)
            };
        } catch (error) {
            console.error('Failed to calculate stats:', error);
            return {
                totalShifts: 0,
                totalHours: 0,
                totalSalary: 0
            };
        }
    }
}

// 創建並導出排班服務實例
const scheduleService = new ScheduleService();
module.exports = scheduleService;
