document.addEventListener('DOMContentLoaded', function () {
    // Функция для получения значения UTM-параметра из URL
    function getUTMParam(param) {
        const params = new URLSearchParams(window.location.search);
        return params.get(param) || '';
    }

    function detectTrafficSource() {
        const referrer = document.referrer.toLowerCase();
        const userAgent = navigator.userAgent.toLowerCase();

        // Проверяем реферер (если переход был с сайта)
        if (referrer.includes('vk.com')) return 'vk';
        if (referrer.includes('t.me')) return 'telegram';
        if (referrer.includes('instagram.com')) return 'instagram';
        if (referrer.includes('facebook.com')) return 'facebook';
        if (referrer.includes('youtube.com')) return 'youtube';

        // Проверяем userAgent (если переход был через встроенный браузер приложения)
        if (userAgent.includes('vkandroidapp') || userAgent.includes('vkbrowser')) return 'vk_app';
        if (userAgent.includes('telegram')) return 'telegram_app';
        if (userAgent.includes('instagram')) return 'instagram_app';
        if (userAgent.includes('fb_iab')) return 'facebook_app';
        if (userAgent.includes('youtube')) return 'youtube_app';

        return ''; // Если источник не определен
    }

    // Функция для вставки UTM-источника в нужный input
    function insertUTMSource() {
        // Ищем все label'ы
        const labels = document.querySelectorAll('label');

        labels.forEach((label) => {
            if (label.textContent.trim() === 'Источник') {
                // Поднимаемся к родительскому div
                console.log('Поле с именем Источник найдено');
                const parentDiv = label.closest('.custom-field-input');

                if (parentDiv) {
                    // Ищем input в том же родителе
                    const inputField = parentDiv.querySelector('input');

                    if (inputField) {
                        // Получаем utm_source и вставляем в input
                        const utmSource = getUTMParam('utm_source');

                        if (utmSource) {
                            inputField.value = utmSource;
                            console.log(`✅ Вставлен utm_source: ${utmSource}`);
                        } else {
                            console.log('⚠️ utm_source не найден в URL');
                        }
                    }
                }
            }
        });
    }

    // Вызываем функцию после загрузки страницы
    insertUTMSource();
});
