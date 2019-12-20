import { safeLoad, safeDump } from 'js-yaml';
import shortid from 'shortid';

const checkContentEmpty = content => (
    (content.text.length > 0 && content.buttons && content.buttons.length && content.buttons[0].title)
    || (content.text && content.text.length > 0 && !content.buttons));

export const checkResponseEmpty = (response) => {
    let isEmpty = true;
    response.values.forEach((value) => {
        if (!isEmpty) return;
        value.sequence.forEach((variation) => {
            const content = safeLoad(variation.content);
            if (checkContentEmpty(content)) {
                isEmpty = false;
            }
        });
    });
    return isEmpty;
};

export const defaultTemplate = (template) => {
    if (template === 'text') {
        return { text: '', __typename: 'TextPayload' };
    }
    if (template === 'qr') {
        return {
            text: '',
            buttons: [
                {
                    title: '',
                    type: 'postback',
                    payload: '',
                },
            ],
        };
    }
    return false;
};

export const createResponseFromTemplate = (type, options = {}) => {
    const { generateKey } = options;
    const language = 'en';
    const key = generateKey ? `utter_${shortid}` : 'utter_';
    const newTemplate = {
        key,
        values: [
            {
                sequence: [{ content: safeDump(defaultTemplate(type)) }],
                lang: language,
            },
        ],
    };
    return newTemplate;
};

export const parseContentType = (content) => {
    if (content.elements || content.attachment || content.custom) return 'CustomPayload';
    if (content.image && !content.buttons) return 'ImagePayload';
    if (content.buttons && !content.image) return 'QuickReplyPayload';
    if (content.text && !content.image && !content.buttons) return 'TextPayload';
};

export const addContentType = content => ({ ...content, __typename: parseContentType(content) });
