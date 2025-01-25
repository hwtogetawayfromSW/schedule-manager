class ScheduleService {
    constructor() {
        console.log('Initializing ScheduleService...');
        this.loadData();
        console.log('ScheduleService initialized successfully');
    }

    loadData() {
        try {
            // 從 localStorage 加載數據
            this.employees = JSON.parse(localStorage.getItem('employees')) || [];
            this.shifts = JSON.parse(localStorage.getItem('shifts')) || {};
            this.weeklyDefaults = JSON.parse(localStorage.getItem('weeklyDefaults')) || {
                sunday: [],
                monday: [],
                tuesday: [],
                wednesday: [],
                thursday: [],
                friday: [],
                saturday: []
            };
            this.schedules = JSON.parse(localStorage.getItem('schedules')) || {};
        } catch (error) {
            console.error('Error loading data:', error);
            // 如果加載失敗，使用默認值
            this.employees = [];
            this.shifts = {};
            this.weeklyDefaults = {
                sunday: [],
                monday: [],
                tuesday: [],
                wednesday: [],
                thursday: [],
                friday: [],
                saturday: []
            };
            this.schedules = {};
        }
    }

    saveData() {
        try {
            localStorage.setItem('employees', JSON.stringify(this.employees));
            localStorage.setItem('shifts', JSON.stringify(this.shifts));
            localStorage.setItem('weeklyDefaults', JSON.stringify(this.weeklyDefaults));
            localStorage.setItem('schedules', JSON.stringify(this.schedules));
            console.log('Data saved successfully');
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    // 員工相關方法
    addEmployee(employee) {
        if (!employee.id) {
            employee.id = Date.now().toString();
        }
        this.employees.push(employee);
        this.saveData();
        return employee;
    }

    getEmployees() {
        return this.employees;
    }

    getEmployeeById(id) {
        return this.employees.find(e => e.id === id);
    }

    removeEmployee(id) {
        this.employees = this.employees.filter(e => e.id !== id);
        // 同時移除該員工的所有排班
        Object.keys(this.schedules).forEach(date => {
            this.schedules[date] = this.schedules[date].filter(s => s.employeeId !== id);
            if (this.schedules[date].length === 0) {
                delete this.schedules[date];
            }
        });
        this.saveData();
    }

    // 班別相關方法
    addShift(name, shift) {
        this.shifts[name] = shift;
        this.saveData();
    }

    getShifts() {
        return this.shifts;
    }

    getShiftByName(name) {
        return this.shifts[name];
    }

    removeShift(name) {
        delete this.shifts[name];
        // 同時移除該班別的所有排班
        Object.keys(this.schedules).forEach(date => {
            this.schedules[date] = this.schedules[date].filter(s => s.shiftName !== name);
            if (this.schedules[date].length === 0) {
                delete this.schedules[date];
            }
        });
        // 從每週預設中移除該班別
        Object.keys(this.weeklyDefaults).forEach(day => {
            this.weeklyDefaults[day] = this.weeklyDefaults[day].filter(s => s !== name);
        });
        this.saveData();
    }

    // 每週預設班別相關方法
    updateWeeklyDefaults(weeklyDefaults) {
        this.weeklyDefaults = weeklyDefaults;
        this.saveData();
        console.log('Weekly defaults updated:', weeklyDefaults);
    }

    getWeeklyDefaults() {
        return this.weeklyDefaults;
    }

    // 排班相關方法
    addSchedule(date, schedule) {
        if (!this.schedules[date]) {
            this.schedules[date] = [];
        }
        // 檢查是否已存在相同員工在同一天的排班
        const existingSchedule = this.schedules[date].find(s => s.employeeId === schedule.employeeId);
        if (existingSchedule) {
            throw new Error('該員工在此日期已有排班');
        }
        this.schedules[date].push(schedule);
        this.saveData();
    }

    removeSchedule(date, scheduleId) {
        if (this.schedules[date]) {
            this.schedules[date] = this.schedules[date].filter(s => s.id !== scheduleId);
            if (this.schedules[date].length === 0) {
                delete this.schedules[date];
            }
            this.saveData();
        }
    }

    getDaySchedules(date) {
        const schedules = this.schedules[date] || [];
        const defaultSchedules = this.getDefaultSchedules(date);
        
        // 合併實際排班和預設班別
        return [
            ...schedules,
            ...defaultSchedules.map(shiftName => ({
                id: `default-${shiftName}`,
                shiftName,
                isDefault: true
            }))
        ];
    }

    // 獲取指定日期的預設班別
    getDefaultSchedules(date) {
        const dayOfWeek = new Date(date).getDay();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return this.weeklyDefaults[days[dayOfWeek]] || [];
    }
}

const scheduleService = new ScheduleService();
module.exports = scheduleService;
