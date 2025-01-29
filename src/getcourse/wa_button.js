window.addEventListener('load', () => {
    const targetNode = document.body;
    const config = { childList: true, subtree: true };

    const selectElement = (selector) => document.querySelector(selector);

    function updateIframeHeight() {
        const userBlockBody = document.querySelector('.user-block-body');
        const iframe = document.querySelector('.content iframe');

        if (userBlockBody && iframe) {
            iframe.style.height = `${userBlockBody.clientHeight}px`; // Устанавливаем высоту iframe в зависимости от высоты родителя
        }
    }

    const createButton = () => {
        const button = document.createElement('button');
        button.className = 'custom-round-button';
        button.textContent = 'Checking...';

        Object.assign(button.style, {
            width: '100px',
            height: '30px',
            borderRadius: '8px',
            backgroundColor: '#ccc',
            color: 'white',
            border: 'none',
            cursor: 'not-allowed',
            marginRight: '10px',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
        });

        return button;
    };

    const updateButtonState = (button, state) => {
        const states = {
            success: { backgroundColor: '#4CAF50', text: 'Написать в WA', cursor: 'pointer' },
            error: { backgroundColor: '#f44336', text: 'Error', cursor: 'not-allowed' },
            noWhatsApp: { backgroundColor: '#ccc', text: 'Нет WA', cursor: 'not-allowed' },
        };

        const { backgroundColor, text, cursor } = states[state];
        button.style.backgroundColor = backgroundColor;
        button.textContent = text;
        button.style.cursor = cursor;
    };

    const showModal = ({ phoneNumber, email, userName, userLink, messenger_id }) => {
        const modalOverlay = document.createElement('div');
        Object.assign(modalOverlay.style, {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
        });
        const iframe = document.createElement('iframe');
        iframe.id = 'iframeid';
        iframe.name = 'iframename';
        iframe.src = `https://beechat.ru/waframe?phone=${encodeURIComponent(
            phoneNumber,
        )}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(
            userName,
        )}&link=${encodeURIComponent(userLink)}&messenger_id=${encodeURIComponent(messenger_id)}`;
        Object.assign(iframe.style, {
            width: '40%',
            height: '200px',
            left: '20px !important',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: 'white',
        });

        //защита iframe
        iframe.style.setProperty('left', '30%', 'important');

        if (iframe) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const leftStyle = iframe.style.left;

                        iframe.style.left = '30%';
                        console.log('Left property reset to 30%');
                    }
                });
            });
            console.log('add new');

            observer.observe(iframe, {
                attributes: true,
                attributeFilter: ['style'],
            });

            setInterval(() => {
                const iframe = document.querySelector('iframe');

                if (iframe && iframe.style.left === '-10000px !important') {
                    iframe.style.left = '30%';
                    console.log('Iframe left property reset.');
                }
            }, 100); // Проверяем каждую секунду
        }
        modalOverlay.appendChild(iframe);

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
            }
        });

        document.body.appendChild(modalOverlay);

        window.addEventListener('message', (event) => {
            // Проверяем источник сообщения и тип события
            if (event.data.action === 'closeIframe') {
                // Ищем открытый iframe с waframe
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                });
                modalOverlay.dispatchEvent(clickEvent);
            }
        });
    };

    const addNewItemMenuToMainSettingMenu = async () => {
        const USER_CALL_TO_PHONE_CLASS = 'user-call-to-phone';
        const USER_EMAIL_CLASS = 'user-email';
        const USER_NAME_CLASS = 'user-name';

        const interval = setInterval(async () => {
            const userPhoneElement = selectElement(`.${USER_CALL_TO_PHONE_CLASS}`);
            const userEmailElement = selectElement(`.${USER_EMAIL_CLASS}`);
            const userNameElement = selectElement(`.${USER_NAME_CLASS}`);

            if (userPhoneElement && userEmailElement && userNameElement) {
                clearInterval(interval);

                const phoneNumber = userPhoneElement.textContent.trim();
                const email = userEmailElement.textContent.trim();

                let userNameAnchor = userNameElement.querySelector('a');
                let userName = '';
                let userLink = '';
                let messenger_id = '';

                if (userNameAnchor) {
                    const userSpan = userNameAnchor.querySelector('span');
                    userName = userSpan
                        ? userSpan.textContent.trim()
                        : userNameAnchor.textContent.trim();
                    userLink = `https://linnik-fitness1.ru${userNameAnchor.getAttribute('href')}`;
                }

                if (!userPhoneElement.parentElement.querySelector('.custom-round-button')) {
                    const newButton = createButton();
                    userPhoneElement.insertAdjacentElement('beforebegin', newButton);

                    try {
                        const response = await fetch(
                            `https://beechat.ru/api/wa/checknumber?phone=${phoneNumber}`,
                        );
                        if (!response.ok) throw new Error('Ошибка проверки номера');

                        const data = await response.json();
                        const buttonState = data.status ? 'success' : 'noWhatsApp';
                        messenger_id = data.messenger_id ? data.messenger_id : '';
                        updateButtonState(newButton, buttonState);
                    } catch (error) {
                        updateButtonState(newButton, 'error');
                        console.error('Ошибка:', error);
                    }

                    newButton.addEventListener('click', () => {
                        if (newButton.style.backgroundColor === 'rgb(76, 175, 80)') {
                            showModal({ phoneNumber, email, userName, userLink, messenger_id });
                        }
                    });
                }

                const menuElement = selectElement('.block-items-menu');
                if (menuElement) {
                    if (!menuElement.querySelector('.custom-menu-item')) {
                        const newMenuItem = document.createElement('li');
                        newMenuItem.className = 'custom-menu-item'; // Используйте уникальный класс
                        newMenuItem.setAttribute('title', 'Новый элемент'); // Атрибут title, если нужен

                        const newIconImg = document.createElement('img');
                        newIconImg.src = 'https://beechat.ru/assets/icons/chat.png';
                        newIconImg.alt = 'Chat Icon'; // Альтернативный текст, если иконка не загрузится
                        newIconImg.style.width = '50%'; // Ширина изображения 100% от контейнера
                        newIconImg.style.height = '50%'; // Высота изображения 100% от контейнера
                        newIconImg.style.objectFit = 'contain'; // Сохраняет пропорции изображения

                        newMenuItem.appendChild(newIconImg);

                        // Вставка нового элемента перед блоком 'pull-right'
                        const pullRightDiv = menuElement.querySelector('.pull-right');
                        menuElement.insertBefore(newMenuItem, pullRightDiv);

                        newMenuItem.addEventListener('click', () => {
                            // Удалите класс 'active' у всех li элементов
                            const allItems = menuElement.querySelectorAll('li');
                            allItems.forEach((item) => {
                                item.classList.remove('active');
                            });

                            // Добавьте класс 'active' к новому элементу
                            newMenuItem.classList.add('active');

                            const contentElement = document.querySelector('.content');
                            if (contentElement) {
                                //contentElement.innerHTML = ''; // Очистка контента

                                contentElement.style.height = '100%';

                                const existingInnerDiv = contentElement.querySelector('div');
                                if (existingInnerDiv) {
                                    existingInnerDiv.innerHTML = ''; // Очистка контента
                                    // Создайте новый iframe

                                    const iframe = document.createElement('iframe');
                                    iframe.src = `https://beechat.ru/contactchatframe?phone=${encodeURIComponent(
                                        phoneNumber,
                                    )}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(
                                        userName,
                                    )}&link=${encodeURIComponent(
                                        userLink,
                                    )}&messenger_id=${encodeURIComponent(messenger_id)}`;
                                    iframe.style.width = '100%';
                                    iframe.style.height = '100%';
                                    iframe.style.border = 'none';
                                    iframe.style.display = 'block';

                                    // Вставьте iframe в элемент 'content'
                                    existingInnerDiv.appendChild(iframe);

                                    iframe.style.height = `${contentElement.clientHeight}px`;
                                } else {
                                    console.error('div в content не найден');
                                }
                            }
                        });
                    }
                }
            }
        }, 100);
    };

    const observerCallback = (mutationsList, observer) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                addNewItemMenuToMainSettingMenu();
            }
        }
    };

    const observer2 = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.target.style.left === '-10000px') {
                console.log('Left property reset by:', mutation.target, mutation.target.style);
            }
        });
    });

    const iframe = document.querySelector('iframe');
    if (iframe) {
        observer2.observe(iframe, { attributes: true });
    }

    const observer = new MutationObserver(observerCallback);
    observer.observe(targetNode, config);

    document.addEventListener('DOMContentLoaded', addNewItemMenuToMainSettingMenu);
});
window.addEventListener('message', (event) => {
    if (event.data.action === 'copy') {
        navigator.clipboard
            .writeText(event.data.text)
            .then(() => {
                alert('ID чата скопирован');
            })
            .catch((err) => {
                console.error('Ошибка при копировании:', err);
            });
    }
});
