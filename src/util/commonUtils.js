const retrieveKeyValue = (object = {}, key = '', level = 0) => {
    const keys = key.split('.');
    if (!object) {
        return '';
    } else if (keys.length === (level + 1)) {
        return object[keys[level]];
    } else {
        return retrieveKeyValue(object[keys[level]], key, level + 1);
    }
}

const setKeyValue = (object = {}, key = '', value = '', level = 0) => {
    const keys = key.split('.');
    if (keys.length === (level + 1)) {
        object[keys[level]] = value;
    } else {
        setKeyValue(object[keys[level]], key, value, level + 1);
    }
}

const getRandomHexaColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

export { retrieveKeyValue, setKeyValue, getRandomHexaColor };