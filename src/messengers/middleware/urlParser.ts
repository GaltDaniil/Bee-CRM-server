interface IParams {
    contact_id?: string;
    account_id?: string;
    from_url?: string;
}

export const urlParser = (str: string): IParams => {
    try {
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
            if (fromUrl) parsedParams.from_url = fromUrl[1];
        }
        return parsedParams;
    } catch (error) {
        console.log(error);
        return {};
    }
};
