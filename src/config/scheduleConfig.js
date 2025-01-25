// 班別設置
export const defaultShifts = {
    '早班': {
        startTime: '08:00',
        endTime: '16:00',
        color: '#0369a1',
        backgroundColor: '#e0f2fe',
        hourlyRate: 150
    },
    '中班': {
        startTime: '16:00',
        endTime: '24:00',
        color: '#92400e',
        backgroundColor: '#fef3c7',
        hourlyRate: 170
    },
    '晚班': {
        startTime: '00:00',
        endTime: '08:00',
        color: '#5b21b6',
        backgroundColor: '#ede9fe',
        hourlyRate: 200
    },
    '休假': {
        startTime: '',
        endTime: '',
        color: '#166534',
        backgroundColor: '#dcfce7',
        hourlyRate: 0
    }
};

// 預設員工列表
export const defaultEmployees = [
    { id: 1, name: '員工A', position: '正職', hourlyRate: null },
    { id: 2, name: '員工B', position: '正職', hourlyRate: null },
    { id: 3, name: '員工C', position: '兼職', hourlyRate: null }
];

// 排班規則
export const scheduleRules = {
    maxShiftsPerDay: 2,  // 每人每天最多班數
    minRestHours: 12,    // 兩班之間最少休息時數
    maxHoursPerWeek: 40  // 每週最大工時
};

// 預設班表模板
export const defaultTemplates = {
    'template1': {
        name: '標準輪班',
        pattern: [
            { day: 1, shifts: ['早班'] },
            { day: 2, shifts: ['早班'] },
            { day: 3, shifts: ['中班'] },
            { day: 4, shifts: ['中班'] },
            { day: 5, shifts: ['晚班'] },
            { day: 6, shifts: ['晚班'] },
            { day: 7, shifts: ['休假'] }
        ]
    }
};
