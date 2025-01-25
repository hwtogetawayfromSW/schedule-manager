class DialogService {
    constructor() {
        // 初始化遮罩層
        this.overlay = document.createElement('div');
        this.overlay.className = 'dialog-overlay';
        document.body.appendChild(this.overlay);
        
        // 監聽 ESC 鍵關閉對話框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDialogs();
            }
        });
        
        // 點擊遮罩層關閉對話框
        this.overlay.addEventListener('click', () => {
            this.closeAllDialogs();
        });
    }

    openDialog(dialog) {
        if (!dialog) return;
        
        // 確保對話框是 <dialog> 元素
        if (!(dialog instanceof HTMLDialogElement)) {
            console.error('Dialog must be a <dialog> element');
            return;
        }

        // 顯示遮罩層
        this.overlay.style.display = 'block';
        
        // 顯示對話框
        dialog.showModal();
        
        console.log('Dialog opened:', dialog.id);
    }

    closeDialog(dialog) {
        if (!dialog) return;
        
        // 確保對話框是 <dialog> 元素
        if (!(dialog instanceof HTMLDialogElement)) {
            console.error('Dialog must be a <dialog> element');
            return;
        }

        // 隱藏對話框
        dialog.close();
        
        // 檢查是否還有其他開啟的對話框
        const openDialogs = document.querySelectorAll('dialog[open]');
        if (openDialogs.length === 0) {
            // 如果沒有開啟的對話框，隱藏遮罩層
            this.overlay.style.display = 'none';
        }
        
        console.log('Dialog closed:', dialog.id);
    }

    closeAllDialogs() {
        // 關閉所有開啟的對話框
        const openDialogs = document.querySelectorAll('dialog[open]');
        openDialogs.forEach(dialog => {
            dialog.close();
        });
        
        // 隱藏遮罩層
        this.overlay.style.display = 'none';
        
        console.log('All dialogs closed');
    }
}

const dialogService = new DialogService();
module.exports = dialogService;
