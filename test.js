//import { axios } from 'axios';

const data = {
    user: {
        email: 'vm.artcube@gmail.com',
    },
    system: {
        refresh_if_exists: 1,
    },
    deal: {
        deal_number: '29900',
        deal_cost: '990',
        deal_status: 'in_work',
        product_title: 'Функциональный тренинг',
        manager_email: null,
    },
};

const jsonData = JSON.stringify(data);
const base64Data = Buffer.from(jsonData).toString('base64');

const apiUrl = `https://linnik-fitness1.getcourse.ru/pl/api/deals`;

const secret_key =
    'yvV24VmeuCCoG9ClBhNHcSLSbPrPAO6naFw84AAB6p5xrgLuVe1JSIYU7uvC1GQx69edITzqH9bpQWcJjgDRZJ0NUWgMK5pk5375rpHt3RQ7JcLVWmRBwVeZ0iSgqX1d';

/* try {
    const response = await axios.post('https://linnik-fitness1.getcourse.ru/pl/api/deals', {
        data: base64Data,
    });
    console.log(response.data); // Результат запроса
} catch (error) {
    console.error(error);
} */
fetch(apiUrl, {
    method: 'POST',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `action=add&key=${secret_key}&params=${encodeURIComponent(base64Data)}`,
})
    .then((response) => response.json())
    .then((data) => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
//JSON.stringify({ data: base64Data }
