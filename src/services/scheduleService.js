class ScheduleService {
    constructor() {
        this.employees = [];
        this.shifts = {};
        this.schedules = {};
        this.weeklyDefaults = {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
        };
        console.log('Initializing ScheduleService...');
        this.loadData();
        console.log('ScheduleService initialized successfully');
    }

    loadData() {
        try {
            const fs = require('fs');
            const path = require('path');
            const dataPath = path.join(__dirname, '../data/schedule-data.json');

            if (fs.existsSync(dataPath)) {
                const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                this.employees = data.employees || [];
                this.shifts = data.shifts || {};
                this.schedules = data.schedules || {};
                this.weeklyDefaults = data.weeklyDefaults || {
                    monday: [],
                    tuesday: [],
                    wednesday: [],
                    thursday: [],
                    friday: [],
                    saturday: [],
                    sunday: []
                };
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    saveData() {
        try {
            const fs = require('fs');
            const path = require('path');
            const dataPath = path.join(__dirname, '../data/schedule-data.json');
            const dataDir = path.dirname(dataPath);

            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            const data = {
                employees: this.employees,
                shifts: this.shifts,
                schedules: this.schedules,
                weeklyDefaults: this.weeklyDefaults
            };

            fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
            console.log('Data saved successfully');
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    // 員工管理
    addEmployee(employee) {
        try {
            const newEmployee = {
                ...employee,
                id: Date.now()
            };
            this.employees.push(newEmployee);
            this.saveData();
            return newEmployee;
        } catch (error) {
            console.error('Error adding employee:', error);
            throw error;
        }
    }

    removeEmployee(employeeId) {
        try {
            this.employees = this.employees.filter(e => e.id !== employeeId);
            // 同時移除該員工的所有排班
            Object.keys(this.schedules).forEach(date => {
                this.schedules[date] = this.schedules[date].filter(s => s.employeeId !== employeeId);
            });
            this.saveData();
        } catch (error) {
            console.error('Error removing employee:', error);
            throw error;
        }
    }

    getEmployeeById(id) {
        return this.employees.find(emp => emp.id === id);
    }

    updateEmployee(employee) {
        const index = this.employees.findIndex(emp => emp.id === employee.id);
        if (index !== -1) {
            this.employees[index] = { ...this.employees[index], ...employee };
            this.saveData();
        }
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
        } catch (error) {
            console.error('Error adding shift:', error);
            throw error;
        }
    }

    removeShift(shiftName) {
        try {
            delete this.shifts[shiftName];
            // 同時移除該班別的所有排班和預設設定
            Object.keys(this.schedules).forEach(date => {
                this.schedules[date] = this.schedules[date].filter(s => s.shiftName !== shiftName);
            });
            Object.keys(this.weeklyDefaults).forEach(day => {
                this.weeklyDefaults[day] = this.weeklyDefaults[day].filter(s => s !== shiftName);
            });
            this.saveData();
        } catch (error) {
            console.error('Error removing shift:', error);
            throw error;
        }
    }

    getShifts() {
        return { ...this.shifts };
    }

    // 每週預設班別管理
    setWeeklyDefaults(defaults) {
        try {
            this.weeklyDefaults = { ...defaults };
            this.saveData();
            console.log('Weekly defaults updated:', this.weeklyDefaults);
        } catch (error) {
            console.error('Error setting weekly defaults:', error);
            throw error;
        }
    }

    getWeeklyDefaults() {
        return { ...this.weeklyDefaults };
    }

    // 排班管理
    addSchedule(date, employeeId, shiftName) {
        try {
            if (!this.schedules[date]) {
                this.schedules[date] = [];
            }
            this.schedules[date].push({ employeeId, shiftName });
            this.saveData();
        } catch (error) {
            console.error('Error adding schedule:', error);
            throw error;
        }
    }

    removeDaySchedule(date, employeeId) {
        try {
            if (this.schedules[date]) {
                this.schedules[date] = this.schedules[date].filter(s => s.employeeId !== employeeId);
                this.saveData();
            }
        } catch (error) {
            console.error('Error removing schedule:', error);
            throw error;
        }
    }

    getDaySchedules(date) {
        try {
            const actualSchedules = this.schedules[date] || [];
            if (actualSchedules.length > 0) {
                return actualSchedules.map(schedule => ({
                    ...schedule,
                    isDefault: false
                }));
            }

            // 如果沒有實際排班，返回預設班別
            const dayOfWeek = new Date(date).getDay();
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const defaultShifts = this.weeklyDefaults[days[dayOfWeek]] || [];
            
            return defaultShifts.map(shiftName => ({
                shiftName,
                isDefault: true
            }));
        } catch (error) {
            console.error('Error getting day schedules:', error);
            return [];
        }
    }

    getMonthSchedule(year, month) {
        const result = {};
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            result[dateStr] = this.getDaySchedules(dateStr);
        }

        return result;
    }

    // 統計功能
    calculateStats() {
        const stats = {
            totalShifts: 0,
            totalHours: 0,
            totalSalary: 0
        };

        Object.values(this.schedules).forEach(daySchedules => {
            daySchedules.forEach(schedule => {
                const employee = this.employees.find(e => e.id === schedule.employeeId);
                const shift = this.shifts[schedule.shiftName];
                
                if (employee && shift) {
                    stats.totalShifts++;
                    
                    const startTime = new Date(`2000-01-01T${shift.startTime}`);
                    const endTime = new Date(`2000-01-01T${shift.endTime}`);
                    let hours = (endTime - startTime) / (1000 * 60 * 60);
                    
                    if (hours < 0) {
                        hours += 24;
                    }
                    
                    stats.totalHours += hours;
                    stats.totalSalary += hours * employee.hourlyRate;
                }
            });
        });

        return stats;
    }
}

// 創建並導出排班服務實例
const scheduleService = new ScheduleService();
module.exports = scheduleService;
