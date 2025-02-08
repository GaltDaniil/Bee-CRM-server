document.addEventListener('DOMContentLoaded', async () => {
    console.log('Скрипт запущен');

    async function getCurrency() {
        try {
            const response = await fetch('https://beechat.ru/api/integration/novofon?valuta=KGS');
            const data = await response.json();
            console.log('Ответ API:', data);
            return data;
        } catch (error) {
            console.error('Ошибка получения курса валют:', error);
            return null;
        }
    }

    const kztRate = await getCurrency();
    if (!kztRate) {
        console.error('Не удалось получить курс валют');
        return;
    }

    console.log('Курс RUB → KZT:', kztRate.rate);

    function addKazakhstanPrices(rate, currency) {
        const priceElements = document.querySelectorAll('.price');

        priceElements.forEach((priceElement, index) => {
            console.log(`Обрабатываем элемент #${index + 1}:`, priceElement);

            const priceText =
                priceElement.querySelector('h3 strong')?.textContent || priceElement.textContent;
            const russianPrice = parseFloat(priceText.replace(/[^\d.]/g, ''));

            if (isNaN(russianPrice)) {
                console.warn(`Не удалось извлечь цену из элемента #${index + 1}:`, priceText);
                return;
            }

            const localPrice = (russianPrice * rate).toFixed(2);

            // Устанавливаем стиль текущего элемента
            priceElement.style.display = 'block'; // Блоки располагаются друг под другом
            priceElement.style.marginBottom = '0px'; // Уменьшаем отступ между блоками

            // Создаем новый элемент для локальной цены
            const localPriceElement = document.createElement('div');
            localPriceElement.className = 'localPrice';
            localPriceElement.textContent = `≈ ${localPrice} ${currency}`;
            localPriceElement.style.fontSize = '14px';
            localPriceElement.style.color = '#fff'; // Белый цвет шрифта
            localPriceElement.style.marginTop = '0px'; // Отступ сверху для локальной цены

            // Добавляем локальную цену под основным элементом
            priceElement.appendChild(localPriceElement);
        });
    }

    addKazakhstanPrices(kztRate.rate, kztRate.currency);
});
