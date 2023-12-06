interface Parser {
    (match: RegExpExecArray): {};
}

export const paramParser: Parser = (match) => {
    try {
        const startParams = match[1].trim();
        let contactId, accountId, fromUrl;

        const parsedParams: { contact_id?: string; account_id?: string; from_url?: string } = {};

        console.log('startParams is ', startParams);
        if (startParams.match(/contactId/)) {
            contactId = startParams.match(/contactId=([^_]+)/);
            if (contactId) parsedParams.contact_id = contactId[1];
        }
        if (startParams.match(/accountId/)) {
            accountId = startParams.match(/accountId=([^_]+)/);
            if (accountId) parsedParams.account_id = accountId[1];
        }
        if (startParams.match(/fromUrl/)) {
            fromUrl = startParams.match(/fromUrl=([^_]+)/);
            if (fromUrl) parsedParams.from_url = fromUrl[1];
        }
        return parsedParams;
    } catch (error) {
        console.log(error);
        return {};
    }
};
