export function validateTitle(title){
    const regex = /^\S(?:.*\S)?$/;
    const doubleSpaces = /\s{2,}/.test(title);
    return regex.test(title) && !doubleSpaces;
}

export function validateDuration(duration){
    const regex = /^(0|[1-9]\d*)(\.\d{1,2})?$/
    const num = parseFloat(duration)
    return regex.test(String(duration)) && num > 0;
}

export function validateDate(dateStr) {
    const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (!regex.test(dateStr)) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
}

export function validateTag(tag){
    const regex = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
    return regex.test(tag);
}

export function validateNoDuplicates(text){
    const regex = /\b(\w+)\s+\1\b/i
    return !regex.test(text);
}