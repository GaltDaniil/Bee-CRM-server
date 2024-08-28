export const botCommand = (command) => {
    if (command === 'start' || command === 'старт') {
        return {
            text: 'Привет! Я Linnik-бот. Я знаю о школе все, выбери нужный тебе раздел в кнопках и я отвечу моментально. Или можешь позвать живого (вот тут обидно) менеджера и задать вопрос ему. Время ожидания менеджера от 2 до 5 минут.',
            buttons: [
                { text: 'Спросить у бота', command: 'ask_bot' },
                { text: 'Позвать менеджера', command: 'call_manager' },
            ],
        };
    } else if (command === 'ask_bot') {
        return {
            text: 'Какой у тебя вопрос?',
            buttons: [
                { text: 'Вопрос по большому курсу на профессию', command: 'big_course_question' },
                {
                    text: 'Вопрос по курсам повышения квалификации',
                    command: 'qualification_courses_question',
                },
                { text: 'Другой технический вопрос', command: 'other_technical_question' },
            ],
        };
    } else if (command === 'big_course_question') {
        return {
            text: 'На какую профессию?',
            buttons: [
                { text: 'Богатый Фитнес Тренер', command: 'bft' },
                {
                    text: 'Нутрициолог 3.0',
                    command: 'nutri_3.0',
                },
            ],
        };
    } else if (command === 'bft') {
        return {
            text: '',
            buttons: [
                { text: '', command: '' },
                {
                    text: '',
                    command: '',
                },
            ],
        };
    } else if (command === 'qualification_courses_question') {
        return {
            text: '',
            buttons: [
                { text: '', command: '' },
                {
                    text: '',
                    command: '',
                },
            ],
        };
    } else if (command === 'other_technical_question') {
        return {
            text: '',
            buttons: [
                { text: '', command: '' },
                {
                    text: '',
                    command: '',
                },
            ],
        };
    } else if (command === '') {
        return {
            text: '',
            buttons: [
                { text: '', command: '' },
                {
                    text: '',
                    command: '',
                },
            ],
        };
    } else if (command === '') {
        return {
            text: '',
            buttons: [
                { text: '', command: '' },
                {
                    text: '',
                    command: '',
                },
            ],
        };
    }
    // Добавьте другие команды по аналогии
    return 'not command';
};
