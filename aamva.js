/**
 * Parse AAMVA date string and return a JS Date.
 *
 * No error-handling included, sorry folks!
 */
function parseAAMVADate(str) {
    // MMDDCCYY for US, CCYYMMDD for Canada
    const possibleMonth = parseInt(str.slice(0, 2));
    if (possibleMonth <= 12) {
        // parse as JS Date from YYYY-MM-DD
        return new Date(`${str.slice(4, 8)}-${str.slice(0, 2)}-${str.slice(2, 4)}`);
    }

    // assume year comes first
    return new Date(`${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`);
}

/**
 * Extract first name, last name and date of birth from raw AAMVA data.
 *
 * Does not perform any kind of validation. Do not use in production, obviously.
 */
export function parseAAMVALicenseData(data) {
    if (!data || data.length === 0) {
        return null;
    }

    // extract fields using regular expressions
    const dateOfBirthMatch = data.match(/DBB([^\n|]*)[\n|]/);
    const lastNameMatch = data.match(/DCS([^\n|]*)[\n|]/);
    const firstNameMatch = data.match(/DAC([^\n|]*)[\n|]/);
    if (!lastNameMatch || !dateOfBirthMatch || !firstNameMatch) {
        return null;
    }

    if (dateOfBirthMatch[1].length !== 8) {
        // DBB should be 8 characters
        return null;
    }

    return {
        lastName: lastNameMatch[1],
        firstName: firstNameMatch[1],
        dateOfBirth: parseAAMVADate(dateOfBirthMatch[1])
    };
}

