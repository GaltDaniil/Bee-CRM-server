window.addEventListener('load', () => {
    document.addEventListener('DOMContentLoaded', function () {
        // Целевые значения для поиска
        const targetValues = ['vk', 'tg', 'ig', 'google', 'yandex'];

        // Проходим по всем строкам таблицы
        document.querySelectorAll('tr.gc-user-link').forEach((row) => {
            // Находим все <td> в текущей строке
            const cells = row.querySelectorAll('td');

            // Ищем ячейку, содержащую одно из целевых значений
            let foundValue = null;
            cells.forEach((cell) => {
                const text = cell.textContent.trim().toLowerCase();
                if (targetValues.includes(text)) {
                    foundValue = text;
                }
            });

            if (foundValue) {
                // Находим ссылку с классом user-profile-link
                const profileLink = row.querySelector('.user-profile-link');

                if (profileLink) {
                    // Создаем новый div с классом ads_tag
                    const newDiv = document.createElement('div');
                    newDiv.className = 'ads_tag';
                    newDiv.textContent = foundValue;

                    // Вставляем div после user-profile-link
                    profileLink.insertAdjacentElement('afterend', newDiv);

                    console.log(
                        `✅ Добавлен ads_tag: ${foundValue} для пользователя ${profileLink.textContent.trim()}`,
                    );
                }
            }
        });
    });
});
