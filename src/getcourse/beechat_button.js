(() => {
    const targetNode = document.body;
    const config = { childList: true, subtree: true };

    const NEW_MENU_ITEMS_ARRAY = [['Чаты +', '/beechat']];

    // Функция для создания уведомления
    const createNotificationBadge = (count) => {
        const badge = document.createElement('span');
        badge.className = 'notification-badge';
        badge.textContent = count > 0 ? count : '';
        return badge;
    };

    // Функция для добавления стилей
    const addCSSStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            .notification-badge {
                position: absolute;
                top: 0;
                right: 0;
                background-color: red;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                text-align: center;
                line-height: 20px;
                font-size: 12px;
                font-weight: bold;
            }
            .menu-item-custom {
                position: relative; /* Позволяет уведомлению позиционироваться относительно элемента меню */
            }
        `;
        document.head.appendChild(style);
    };

    const addNewItemMenuToMainSettingMenu = () => {
        // Указываем селектор блока главного меню на системной странице
        const MAIN_MENU_BLOCK_SELECTOR = 'gc-account-user-submenu-bar-notifications';

        // Проверяем наличие блока меню с нужным классом
        const mainMenuBlocks = document.getElementsByClassName(MAIN_MENU_BLOCK_SELECTOR);

        if (mainMenuBlocks.length > 0) {
            const mainMenuBlock = mainMenuBlocks[0];
            console.log(mainMenuBlock);
            const menuList = mainMenuBlock.querySelector('ul');

            if (menuList && !menuList.querySelector('.menu-item-custom')) {
                NEW_MENU_ITEMS_ARRAY.forEach((item) => {
                    const [title, link] = item;

                    // Новый элемент списка
                    const newMenuItem = document.createElement('li');
                    newMenuItem.className = 'menu-item menu-item-custom';

                    // Ссылка для нового пункта меню
                    const newMenuLink = document.createElement('a');
                    newMenuLink.href = link;
                    newMenuLink.className = 'subitem-link';
                    newMenuLink.target = '_self';
                    newMenuLink.textContent = title;

                    // Создаем уведомление
                    const notificationBadge = createNotificationBadge(0); // Начинаем с 0 сообщений
                    newMenuItem.appendChild(notificationBadge);

                    // Добавьте новый пункт меню в список
                    newMenuItem.appendChild(newMenuLink);
                    menuList.appendChild(newMenuItem);
                });
            }
        }
    };

    // Функция для обновления уведомления
    const updateNotificationBadge = (count) => {
        const menuItem = document.querySelector('.menu-item-custom');
        if (menuItem) {
            const badge = menuItem.querySelector('.notification-badge');
            if (badge) {
                badge.textContent = count > 0 ? count : '';
            }
        }
    };

    // Эта функция будет имитировать получение новых сообщений
    const simulateNewMessages = () => {
        let count = 0;
        setInterval(() => {
            count++;
            updateNotificationBadge(count);
        }, 5000); // обновление каждые 5 секунд
    };

    const observerCallback = function (mutationsList, observer) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                addNewItemMenuToMainSettingMenu();
            }
        }
    };

    const observer = new MutationObserver(observerCallback);
    observer.observe(targetNode, config);

    window.addEventListener('DOMContentLoaded', () => {
        addNewItemMenuToMainSettingMenu();
    });
})();
