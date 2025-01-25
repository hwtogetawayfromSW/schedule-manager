// 排班服務
class ScheduleService {
    constructor() {
        this.shifts = {};
        this.weeklyDefaults = {};
        this.schedules = {};
        this.employees = [];
    }
    
    // 初始化
    initialize() {
        this.loadFromLocalStorage();
        this.initializeDefaultShifts();
    }
    
    // 初始化預設班別
    initializeDefaultShifts() {
        if (Object.keys(this.shifts).length === 0) {
            this.shifts = {
                'morning': {
                    startTime: '08:00',
                    endTime: '16:00',
                    color: '#e3f2fd'
                },
                'afternoon': {
                    startTime: '16:00',
                    endTime: '24:00',
                    color: '#f3e5f5'
                },
                'evening': {
                    startTime: '00:00',
                    endTime: '08:00',
                    color: '#fff3e0'
                },
                'rest': {
                    startTime: '00:00',
                    endTime: '24:00',
                    color: '#f5f5f5'
                }
            };
            
            // 設置預設每週排班
            this.weeklyDefaults = {
                'sunday': ['rest'],
                'monday': ['morning', 'afternoon', 'evening'],
                'tuesday': ['morning', 'afternoon', 'evening'],
                'wednesday': ['morning', 'afternoon', 'evening'],
                'thursday': ['morning', 'afternoon', 'evening'],
                'friday': ['morning', 'afternoon', 'evening'],
                'saturday': ['morning', 'afternoon']
            };
            
            this.saveToLocalStorage();
        }
    }
    
    // 從 localStorage 載入數據
    loadFromLocalStorage() {
        const data = localStorage.getItem('scheduleData');
        if (data) {
            const parsed = JSON.parse(data);
            this.shifts = parsed.shifts || {};
            this.weeklyDefaults = parsed.weeklyDefaults || {};
            this.schedules = parsed.schedules || {};
            this.employees = parsed.employees || [];
        }
    }
    
    // 保存數據到 localStorage
    saveToLocalStorage() {
        const data = {
            shifts: this.shifts,
            weeklyDefaults: this.weeklyDefaults,
            schedules: this.schedules,
            employees: this.employees
        };
        localStorage.setItem('scheduleData', JSON.stringify(data));
    }
    
    // 獲取所有班別
    getShifts() {
        return this.shifts;
    }
    
    // 添加班別
    addShift(shift) {
        this.shifts[shift.name] = {
            startTime: shift.startTime,
            endTime: shift.endTime,
            color: shift.color
        };
        this.saveToLocalStorage();
    }
    
    // 刪除班別
    removeShift(shiftName) {
        delete this.shifts[shiftName];
        // 從每週預設中移除該班別
        Object.keys(this.weeklyDefaults).forEach(day => {
            this.weeklyDefaults[day] = this.weeklyDefaults[day].filter(s => s !== shiftName);
        });
        this.saveToLocalStorage();
    }
    
    // 獲取每週預設設定
    getWeeklyDefaults() {
        return this.weeklyDefaults;
    }
    
    // 設置每週預設設定
    setWeeklyDefaults(settings) {
        this.weeklyDefaults = settings;
        this.saveToLocalStorage();
    }
    
    // 獲取指定日期的班別
    getDaySchedule(date) {
        return this.schedules[date] || [];
    }
    
    // 更新指定日期的班別
    updateDaySchedule(date, employeeId, shiftName, notes = '') {
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
        
        this.saveToLocalStorage();
    }
    
    // 移除指定日期的排班
    removeDaySchedule(date, employeeId) {
        if (this.schedules[date]) {
            this.schedules[date] = this.schedules[date].filter(s => s.employeeId !== employeeId);
            if (this.schedules[date].length === 0) {
                delete this.schedules[date];
            }
            this.saveToLocalStorage();
        }
    }
    
    // 添加員工
    addEmployee(name, position, hourlyRate) {
        const employee = {
            id: Date.now(),
            name,
            position,
            hourlyRate: hourlyRate ? Number(hourlyRate) : null
        };
        this.employees.push(employee);
        this.saveToLocalStorage();
        return employee;
    }
    
    // 移除員工
    removeEmployee(employeeId) {
        this.employees = this.employees.filter(e => e.id !== employeeId);
        // 移除該員工的所有排班
        Object.keys(this.schedules).forEach(date => {
            this.schedules[date] = this.schedules[date].filter(s => s.employeeId !== employeeId);
            if (this.schedules[date].length === 0) {
                delete this.schedules[date];
            }
        });
        this.saveToLocalStorage();
    }
    
    // 獲取所有員工
    getEmployees() {
        return this.employees;
    }
    
    // 獲取指定員工
    getEmployee(employeeId) {
        return this.employees.find(e => e.id === employeeId);
    }
    
    // 獲取月度統計
    getMonthlyStats(year, month) {
        const stats = {
            totalShifts: 0,
            employeeStats: {}
        };
        
        // 初始化員工統計
        this.employees.forEach(employee => {
            stats.employeeStats[employee.id] = {
                name: employee.name,
                shifts: 0,
                hours: 0
            };
        });
        
        // 遍歷該月的所有日期
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const daySchedules = this.schedules[date] || [];
            
            daySchedules.forEach(schedule => {
                const shift = this.shifts[schedule.shiftName];
                if (shift && stats.employeeStats[schedule.employeeId]) {
                    stats.totalShifts++;
                    stats.employeeStats[schedule.employeeId].shifts++;
                    
                    // 計算工作時數
                    const startTime = new Date(`${date}T${shift.startTime}`);
                    const endTime = new Date(`${date}T${shift.endTime}`);
                    let hours = (endTime - startTime) / (1000 * 60 * 60);
                    if (hours < 0) hours += 24; // 跨日班別
                    
                    stats.employeeStats[schedule.employeeId].hours += hours;
                }
            });
        }
        
        return stats;
    }
}

// 創建並導出排班服務實例
const scheduleService = new ScheduleService();
module.exports = scheduleService;
