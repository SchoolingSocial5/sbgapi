"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
const handleError = (res, statusCode, customMessage, error) => {
    const safeError = error || {}; // Ensure it's at least an object
    console.error('🔥 Error occurred:', {
        message: safeError.message || 'Unknown error',
        stack: safeError.stack || 'No stack trace',
        name: safeError.name || 'UnknownError',
        code: safeError.code || 'N/A',
        errorObject: safeError,
    });
    if (statusCode && customMessage) {
        return res.status(statusCode).json({ message: customMessage });
    }
    if (safeError.code === 11000) {
        const field = Object.keys(safeError.keyValue || {})[0];
        const value = safeError.keyValue ? safeError.keyValue[field] : '';
        return res.status(400).json({
            message: `A user with the ${field} "${value}" already exists`,
        });
    }
    else if (safeError.errors) {
        const validationMessages = Object.values(safeError.errors).map((err) => err.message);
        return res.status(400).json({ message: validationMessages.join(', ') });
    }
    else {
        return res.status(500).json({
            message: safeError.message || 'Server error. Please try again later.',
        });
    }
};
exports.handleError = handleError;
