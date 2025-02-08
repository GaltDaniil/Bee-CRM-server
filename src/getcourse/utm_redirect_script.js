document.addEventListener('DOMContentLoaded', function () {
    function getUTMParams() {
        const params = new URLSearchParams(window.location.search);
        const utmParams = {};
        params.forEach((value, key) => {
            if (key.startsWith('utm_')) {
                utmParams[key] = value;
            }
        });
        return utmParams;
    }

    function addUTMParamsToLink(link, utmParams) {
        const url = new URL(link, window.location.origin);
        const existingParams = new URLSearchParams(url.search);

        Object.keys(utmParams).forEach((key) => {
            if (!existingParams.has(key)) {
                existingParams.set(key, utmParams[key]);
            }
        });

        url.search = existingParams.toString();
        return url.toString();
    }

    const utmParams = getUTMParams();

    if (Object.keys(utmParams).length > 0) {
        document.querySelectorAll('a').forEach((link) => {
            const href = link.getAttribute('href');
            if (
                (href && !href.startsWith('#') && href.startsWith('/')) ||
                href.startsWith(window.location.origin)
            ) {
                link.href = addUTMParamsToLink(href, utmParams);
            }
        });
    }
});

//Старая версия
document.addEventListener('DOMContentLoaded', function () {
    function getUTMParams() {
        const urlParams = new URLSearchParams(window.location.search);
        let utmParams = '';
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((param) => {
            if (urlParams.has(param)) {
                utmParams += `${param}=${urlParams.get(param)}&`;
            }
        });
        return utmParams ? utmParams.slice(0, -1) : '';
    }

    const courseButtons = document.querySelectorAll('.course-button');

    courseButtons.forEach((button) => {
        const link = button.querySelector('a.tn-atom');

        if (link) {
            button.addEventListener('click', function (event) {
                const courseHref = link.getAttribute('href');

                if (!courseHref) {
                    console.warn('Link does not contain a valid URL');
                    return; // Exit if href is empty
                }

                const courseUrl = new URL(courseHref, window.location.origin);
                const utmParams = getUTMParams();

                if (utmParams) {
                    courseUrl.search += (courseUrl.search ? '&' : '?') + utmParams;
                }

                window.location.href = courseUrl.toString();
                event.preventDefault();
            });
        }
    });
});
//Вариант от GPT с уведомлением
document.addEventListener('DOMContentLoaded', function () {
    // Функция для получения UTM-меток из текущего URL
    function getUTMParams() {
        const params = new URLSearchParams(window.location.search);
        const utmParams = {};
        params.forEach((value, key) => {
            if (key.startsWith('utm_')) {
                utmParams[key] = value;
            }
        });
        return utmParams;
    }

    // Функция для сохранения UTM-меток в localStorage
    function saveUTMParams(utmParams) {
        const storedUTM = JSON.parse(localStorage.getItem('utm_params')) || {};

        // Если UTM-метки изменились, обновляем запись
        if (JSON.stringify(storedUTM) !== JSON.stringify(utmParams)) {
            utmParams.timestamp = new Date().toISOString(); // Добавляем метку времени
            localStorage.setItem('utm_params', JSON.stringify(utmParams));
            showNotification('✅ UTM-метки успешно сохранены');
        }
    }

    // Функция для добавления или обновления UTM-меток в URL
    function addUTMParamsToURL(utmParams) {
        const url = new URL(window.location.href);
        const existingParams = new URLSearchParams(url.search);

        // Добавляем или обновляем только UTM-метки, не трогая другие параметры
        Object.entries(utmParams).forEach(([key, value]) => {
            existingParams.set(key, value);
        });

        // Обновляем URL без перезагрузки страницы
        url.search = existingParams.toString();
        window.history.replaceState(null, '', url.toString());

        showNotification('🔄 UTM-метки восстановлены из localStorage');
    }

    // Функция для показа уведомлений
    function showNotification(message) {
        let notification = document.createElement('div');
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.background = 'rgba(0,0,0,0.8)';
        notification.style.color = 'white';
        notification.style.padding = '10px 15px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '9999';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000); // Уведомление исчезнет через 3 секунды
    }

    // Получаем UTM-метки из текущего URL
    const currentUTMParams = getUTMParams();

    if (Object.keys(currentUTMParams).length > 0) {
        // Если UTM-метки есть в URL, сохраняем их в localStorage
        saveUTMParams(currentUTMParams);
    } else {
        // Если UTM-меток в URL нет, пробуем восстановить их из localStorage
        const storedUTMParams = JSON.parse(localStorage.getItem('utm_params')) || null;

        if (storedUTMParams) {
            addUTMParamsToURL(storedUTMParams);
        }
    }
});

// Версия от DeepSick
document.addEventListener('DOMContentLoaded', function () {
    // Функция для получения UTM-меток из текущего URL
    function getUTMParams() {
        const params = new URLSearchParams(window.location.search);
        const utmParams = {};
        params.forEach((value, key) => {
            if (key.startsWith('utm_')) {
                utmParams[key] = value;
            }
        });
        return utmParams;
    }

    // Функция для сохранения UTM-меток в localStorage
    function saveUTMParams(utmParams) {
        const storedUTM = JSON.parse(localStorage.getItem('utm_params')) || {};

        // Если UTM-метки изменились, обновляем запись
        if (JSON.stringify(storedUTM) !== JSON.stringify(utmParams)) {
            utmParams.timestamp = new Date().toISOString(); // Добавляем метку времени
            localStorage.setItem('utm_params', JSON.stringify(utmParams));
        }
    }

    // Функция для добавления или обновления UTM-меток в URL
    function addUTMParamsToURL(utmParams) {
        const url = new URL(window.location.href);
        const existingParams = new URLSearchParams(url.search);

        // Добавляем или обновляем только UTM-метки, не трогая другие параметры
        Object.entries(utmParams).forEach(([key, value]) => {
            existingParams.set(key, value);
        });

        // Обновляем URL без перезагрузки страницы
        url.search = existingParams.toString();
        window.history.replaceState(null, '', url.toString());
    }

    // Получаем UTM-метки из текущего URL
    const currentUTMParams = getUTMParams();

    if (Object.keys(currentUTMParams).length > 0) {
        // Если UTM-метки есть в URL, сохраняем их в localStorage
        saveUTMParams(currentUTMParams);
    } else {
        // Если UTM-меток в URL нет, пробуем восстановить их из localStorage
        const storedUTMParams = JSON.parse(localStorage.getItem('utm_params')) || null;

        if (storedUTMParams) {
            addUTMParamsToURL(storedUTMParams);
        }
    }
});

// Скрикт на поиск поля по ID и подстановка значения из UTM_sourse

document.addEventListener('DOMContentLoaded', function () {
    // Функция для получения значения параметра из URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Получаем значение utm_source
    const utmSource = getQueryParam('utm_source');

    // Если utm_source есть, сохраняем его в localStorage и вставляем в поле
    if (utmSource && utmSource.trim() !== '') {
        localStorage.setItem('utm_source', utmSource);
        const inputField = document.getElementById('field-input-10723813');
        if (inputField) {
            inputField.value = utmSource;
        }
    } else {
        // Если utm_source нет в URL, проверяем localStorage
        const storedUTMSource = localStorage.getItem('utm_source');
        if (storedUTMSource) {
            const inputField = document.getElementById('field-input-10723813');
            if (inputField) {
                inputField.value = storedUTMSource;
            }
        }
    }
});

// V2 с поиском по имени ИСТОЧНИК
