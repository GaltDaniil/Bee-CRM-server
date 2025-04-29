window.addEventListener('message', (event) => {
    const name_list = {
        step_aerobics: 'Онлайн-курс СТЕП-АЭРОБИКА',
        strength_trainer_self: 'ИНСТРУКТОР ПО СИЛОВОМУ ТРЕНИНГУ. Тариф «Сам»',
        mfr_self: 'МИОФАСЦИАЛЬНЫЙ РЕЛИЗ. Тариф«Сам»',
        methodologist_tp_self: 'МЕТОДИСТ ТП. Тариф «Сам»',
        women_fitness_self: 'МАСТЕР ЖЕНСКОГО ФИТНЕСА. Тариф «Сам»',
        stretching_trainer_self: 'ИНСТРУКТОР ПО СТРЕТЧИНГУ. Тариф «Сам»',
        guides_collection: 'СБОРНИК ГАЙДОВ с топ-упражнениями на все тело',
        body_movement_self: 'ВСЕ О ТЕЛЕ И ДВИЖЕНИИ. Тариф «Сам»',
        nutritionist_self: 'НУТРИЦИОЛОГ. Тариф «Самостоятельный»',
        tz_trainer_self: 'ИНСТРУКТОР ТЗ. Тариф «Сам»',
        yoga_series_light: 'ЙОГА СЕРИАЛ от Анны Queen. Лайт',
        online_trainer_self: 'ОНЛАЙН-ТРЕНЕР. Тариф «Сам»',
        course_collection: 'СБОРНИК КУРСОВ по фитнесу',
        sport_body_light: 'СПОРТИВНОЕ ТЕЛО. Тариф «ЛАЙТ». Без обратной связи',
        pregnancy_moms_self: 'БЕРЕМЕННЫЕ И МОЛОДЫЕ МАМЫ. Тариф «Сам»',
        module_family_nutrition: 'Модуль Питание семьи [ВК]',
        module_eating_disorders: 'Модуль РПП [ВК]',
        module_medical_analysis: 'Модуль Интерпретация медицинских анализов. БАДы [ВК]',
        module_kids_nutrition: 'Модуль Детское питание [ВК]',
        module_pregnancy_feeding: 'Модуль Беременность и Грудное вскармливание [ВК]',
        module_gastro_nutrition: 'Модуль Питание при заболеваниях ЖКТ [ВК]',
        module_diabetes_nutrition: 'Модуль Питание для людей с диабетом [ВК]',
    };

    if (event.origin !== 'https://linnik-fitness.ru') return;

    console.log('message получено в виджет', event);

    if (!event.data.course_name) {
        console.warn('Параметр "course_name" не найден в сообщении');
        return;
    }
    const course_name = event.data.course_name;
    const labels = document.querySelectorAll('label');

    labels.forEach((label) => {
        const titleElement = label.querySelector('.offer-title');

        if (titleElement) {
            const titleText = titleElement.textContent.trim();

            // Если название курса совпадает
            if (titleText === name_list[course_name]) {
                console.log(`Курс найден: ${titleText}`);

                // Ищем чекбокс внутри текущего label
                const checkbox = label.querySelector('input[type="checkbox"]');

                if (checkbox) {
                    // Если чекбокс еще не отмечен, кликаем по нему
                    if (!checkbox.checked) {
                        checkbox.click();
                        console.log('Чекбокс был выбран программно');
                    } else {
                        console.log('Чекбокс уже был выбран');
                    }
                } else {
                    console.warn('Чекбокс не найден в метке:', label);
                }
            } else {
                // Удаляем метку, если название не совпадает
                label.remove();
            }
        } else {
            console.warn('Элемент .offer-title не найден внутри label:', label);
        }
    });
});
