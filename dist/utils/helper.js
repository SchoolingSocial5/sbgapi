"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMoney = void 0;
const formatMoney = (value) => {
    if (value === null || value === undefined || value === '')
        return '0';
    const num = Number(value);
    if (isNaN(num))
        return '0';
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};
exports.formatMoney = formatMoney;
