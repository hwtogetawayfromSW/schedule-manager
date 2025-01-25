class DialogService {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 設置關閉按鈕事件
        document.querySelectorAll('.close-dialog').forEach(button => {
            button.addEventListener('click', () => {
                const dialog = button.closest('.dialog');
                if (dialog) {
                    this.closeDialog(dialog);
                }
            });
        });

        // 設置遮罩層點擊事件
        const dialogOverlay = document.querySelector('.dialog-overlay');
        if (dialogOverlay) {
            dialogOverlay.addEventListener('click', () => {
                document.querySelectorAll('.dialog').forEach(dialog => {
                    dialog.classList.add('hidden');
                });
                dialogOverlay.classList.add('hidden');
            });
        }
    }

    openDialog(dialog) {
        console.log('Opening dialog:', dialog);
        const dialogOverlay = document.querySelector('.dialog-overlay');
        if (dialog && dialogOverlay) {
            // 隱藏其他對話框
            document.querySelectorAll('.dialog').forEach(d => {
                if (d !== dialog) {
                    d.classList.add('hidden');
                }
            });
            
            // 顯示目標對話框和遮罩層
            dialog.classList.remove('hidden');
            dialogOverlay.classList.remove('hidden');
        }
    }

    closeDialog(dialog) {
        console.log('Closing dialog:', dialog);
        dialog.classList.add('hidden');
        const dialogOverlay = document.querySelector('.dialog-overlay');
        if (dialogOverlay) {
            dialogOverlay.classList.add('hidden');
        }
    }

    closeAllDialogs() {
        console.log('Closing all dialogs');
        document.querySelectorAll('.dialog').forEach(dialog => {
            dialog.classList.add('hidden');
        });
        const dialogOverlay = document.querySelector('.dialog-overlay');
        if (dialogOverlay) {
            dialogOverlay.classList.add('hidden');
        }
    }
}

// 創建並導出對話框服務實例
const dialogService = new DialogService();
module.exports = dialogService;
