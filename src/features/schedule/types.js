// 定義班表相關的類型
const ShiftTypes = {
    MORNING_MAIN: '早班主位',
    MORNING_SUPPORT: '早班搭班',
    EVENING_MAIN: '晚班主位',
    EVENING_SUPPORT: '晚班搭班'
};

// 班別資料結構
class Shift {
    constructor(name, startTime, endTime, maxStaff = 1) {
        this.name = name;
        this.startTime = startTime;
        this.endTime = endTime;
        this.maxStaff = maxStaff;
        this.staff = [];
    }

    get totalHours() {
        // 計算班別總時數
        const start = new Date(`2000-01-01 ${this.startTime}`);
        const end = new Date(`2000-01-01 ${this.endTime}`);
        return (end - start) / (1000 * 60 * 60);
    }
}

// 預設班別設定
const DefaultShifts = {
    [ShiftTypes.MORNING_MAIN]: new Shift(ShiftTypes.MORNING_MAIN, '09:30', '17:00'),
    [ShiftTypes.MORNING_SUPPORT]: new Shift(ShiftTypes.MORNING_SUPPORT, '09:30', '13:00'),
    [ShiftTypes.EVENING_MAIN]: new Shift(ShiftTypes.EVENING_MAIN, '16:00', '21:30'),
    [ShiftTypes.EVENING_SUPPORT]: new Shift(ShiftTypes.EVENING_SUPPORT, '18:00', '21:30')
};

module.exports = {
    ShiftTypes,
    Shift,
    DefaultShifts
};
