document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const courseName = urlParams.get('name') || 'yoga_series_light'; // Извлекаем из URL или ставим значение по умолчанию
    const iframe = document.querySelector('iframe');
    let messageSent = false; // Флаг для предотвращения повторной отправки

    if (!iframe) {
        console.warn('Iframe не найден');
        return;
    }

    // Отправка сообщения в iframe только после его загрузки
    iframe.addEventListener('load', () => {
        if (!messageSent) {
            iframe.contentWindow.postMessage({ course_name: courseName }, '*');
            messageSent = true;
            console.log('Сообщение отправлено в iframe');
        }
    });
});
