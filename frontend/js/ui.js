// UI Utilities Module

class UIUtils {
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    static formatDate(dateString) {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
    }

    static truncateText(text, maxLength = 50) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    static showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 left-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, duration);
    }
}
