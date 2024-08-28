export const autoresponder = (time) => {
    if (!time) {
        return false;
    }
    //нужно реализовать еще функцию,которая проверяет было ли уже сообщеине от автоответчика а то оно так будет на каждое сообщение отвечать

    const text =
        'Здравствуйте, ваше сообщение очень важно для нас. Менеджер ответит вам в период с 10 до 22 часов по московскому времени.';
    const date = new Date(time);

    // Преобразуем время UTC в Московское время (UTC+3)
    const moscowHours = date.getUTCHours() + 3;

    // Установим корректное значение часов с учетом перехода через полночь
    const adjustedHours = moscowHours >= 24 ? moscowHours - 24 : moscowHours;

    // Проверим, находится ли время в периоде с 22:00 до 10:00
    if (adjustedHours >= 22 || adjustedHours < 10) {
        return '';
    } else {
        return text;
    }
};
