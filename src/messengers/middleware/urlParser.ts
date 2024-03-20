interface IParams {
    contact_id?: string;
    account_id?: string;
    from_url?: string;
}

export const urlParser = (str: string): IParams => {
    try {
        console.log('начался парсинг параметров');
        let contactId, accountId, fromUrl;
        const parsedParams: IParams = {};

        if (str.match(/contactId/)) {
            contactId = str.match(/contactId=([^_]+)/);
            if (contactId) parsedParams.contact_id = contactId[1];
        }
        if (str.match(/accountId/)) {
            accountId = str.match(/accountId=([^_]+)/);
            if (accountId) parsedParams.account_id = accountId[1];
        }
        if (str.match(/fromUrl/)) {
            fromUrl = str.match(/fromUrl=([^_]+)/);
            if (fromUrl)
                parsedParams.from_url = fromUrl[1]
                    .replace(/102/g, '.')
                    .replace(/101/g, '-')
                    .replace(/100/g, '/')
                    .replace(/^https?:\/\//, '');
        }
        console.log('parsedParams', parsedParams);
        return parsedParams;
    } catch (error) {
        console.log(error);
        return {};
    }
};
