"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItems = exports.deleteItem = exports.updateItem = exports.getItems = exports.getItemById = exports.createItem = exports.search = exports.generalSearchQuery = exports.queryData = exports.buildFilterQuery = void 0;
const fileUpload_1 = require("./fileUpload");
const errorHandler_1 = require("./errorHandler");
// const buildFilterQuery = (req: Request): Record<string, any> => {
//   const filters: Record<string, any> = {}
//   const operators: Record<string, string> = {
//     lt: '$lt',
//     lte: '$lte',
//     gt: '$gt',
//     gte: '$gte',
//     ne: '$ne',
//     in: '$in',
//     nin: '$nin',
//   }
//   const flattenQuery = (query: any): Record<string, any> => {
//     const flat: Record<string, any> = {}
//     for (const key in query) {
//       const value = query[key]
//       if (typeof value === 'object' && !Array.isArray(value)) {
//         for (const subKey in value) {
//           flat[`${key}[${subKey}]`] = value[subKey]
//         }
//       } else {
//         flat[key] = value
//       }
//     }
//     return flat
//   }
//   const flatQuery = flattenQuery(req.query)
//   for (const [key, rawValue] of Object.entries(flatQuery)) {
//     if (key === 'page' || key === 'page_size' || key === 'ordering') continue
//     const match = key.match(/^(.+)\[(.+)\]$/)
//     if (match) {
//       const field = match[1]
//       const op = match[2]
//       if (operators[op]) {
//         const mongoOp = operators[op]
//         const value = Array.isArray(rawValue) ? rawValue : [rawValue]
//         const finalValues = value.map((v) => {
//           if (typeof v === 'string' && v.includes(',')) {
//             return v.split(',').map((s) => s.trim())
//           }
//           if (v === 'true') return true
//           if (v === 'false') return false
//           if (!isNaN(Number(v))) return Number(v)
//           return v
//         })
//         if (!filters[field]) filters[field] = {}
//         filters[field][mongoOp] =
//           finalValues.length === 1 ? finalValues[0] : finalValues.flat()
//       }
//     }
//   }
//   return filters
// }
// const buildFilterQuery = (req: Request): Record<string, any> => {
//   const filters: Record<string, any> = {}
//   const operators: Record<string, string> = {
//     lt: '$lt',
//     lte: '$lte',
//     gt: '$gt',
//     gte: '$gte',
//     ne: '$ne',
//     in: '$in',
//     nin: '$nin',
//   }
//   // Flatten nested query params like ?price[gte]=100
//   const flattenQuery = (query: any): Record<string, any> => {
//     const flat: Record<string, any> = {}
//     for (const key in query) {
//       const value = query[key]
//       if (typeof value === 'object' && !Array.isArray(value)) {
//         for (const subKey in value) {
//           flat[`${key}[${subKey}]`] = value[subKey]
//         }
//       } else {
//         flat[key] = value
//       }
//     }
//     return flat
//   }
//   const flatQuery = flattenQuery(req.query)
//   // Handle standard filters (non-date)
//   for (const [key, rawValue] of Object.entries(flatQuery)) {
//     if (
//       [
//         'page',
//         'page_size',
//         'ordering',
//         'period',
//         'dateFrom',
//         'dateTo',
//       ].includes(key)
//     )
//       continue
//     const match = key.match(/^(.+)\[(.+)\]$/)
//     if (match) {
//       const field = match[1]
//       const op = match[2]
//       if (operators[op]) {
//         const mongoOp = operators[op]
//         const value = Array.isArray(rawValue) ? rawValue : [rawValue]
//         const finalValues = value.map((v) => {
//           if (typeof v === 'string' && v.includes(',')) {
//             return v.split(',').map((s) => s.trim())
//           }
//           if (v === 'true') return true
//           if (v === 'false') return false
//           if (!isNaN(Number(v))) return Number(v)
//           return v
//         })
//         if (!filters[field]) filters[field] = {}
//         filters[field][mongoOp] =
//           finalValues.length === 1 ? finalValues[0] : finalValues.flat()
//       }
//     }
//   }
//   // --- Handle date range logic ---
//   const { period, dateFrom, dateTo } = req.query
//   if (period !== 'all') {
//     const createdAtFilter: Record<string, any> = {}
//     const from =
//       dateFrom && dateFrom !== 'null' ? new Date(String(dateFrom)) : null
//     const to = dateTo && dateTo !== 'null' ? new Date(String(dateTo)) : null
//     // 1️⃣ Both dateFrom & dateTo exist → range filter
//     if (from && to) {
//       createdAtFilter.$gte = from
//       createdAtFilter.$lte = to
//     }
//     // 2️⃣ Only dateFrom → from date to present
//     else if (from && !to) {
//       createdAtFilter.$gte = from
//     }
//     // 3️⃣ Only dateTo → anything before or equal to dateTo
//     else if (!from && to) {
//       createdAtFilter.$lte = to
//     }
//     // Only apply if any of the above are true
//     if (Object.keys(createdAtFilter).length > 0) {
//       filters.createdAt = createdAtFilter
//     }
//   }
//   return filters
// }
const buildFilterQuery = (req) => {
    const filters = {};
    const operators = {
        lt: '$lt',
        lte: '$lte',
        gt: '$gt',
        gte: '$gte',
        ne: '$ne',
        in: '$in',
        nin: '$nin',
    };
    // Flatten nested query params like ?price[gte]=100
    const flattenQuery = (query) => {
        const flat = {};
        for (const key in query) {
            const value = query[key];
            if (typeof value === 'object' && !Array.isArray(value)) {
                for (const subKey in value) {
                    flat[`${key}[${subKey}]`] = value[subKey];
                }
            }
            else {
                flat[key] = value;
            }
        }
        return flat;
    };
    const flatQuery = flattenQuery(req.query);
    for (const [key, rawValue] of Object.entries(flatQuery)) {
        // Skip non-filter params
        if ([
            'page',
            'page_size',
            'ordering',
            'period',
            'dateFrom',
            'dateTo',
        ].includes(key))
            continue;
        const match = key.match(/^(.+)\[(.+)\]$/);
        // Handle operator filters like ?price[gte]=100
        if (match) {
            const field = match[1];
            const op = match[2];
            if (operators[op]) {
                const mongoOp = operators[op];
                const value = Array.isArray(rawValue) ? rawValue : [rawValue];
                const finalValues = value.map((v) => {
                    if (typeof v === 'string' && v.includes(',')) {
                        return v.split(',').map((s) => s.trim());
                    }
                    if (v === 'true')
                        return true;
                    if (v === 'false')
                        return false;
                    if (!isNaN(Number(v)))
                        return Number(v);
                    return v;
                });
                if (!filters[field])
                    filters[field] = {};
                filters[field][mongoOp] =
                    finalValues.length === 1 ? finalValues[0] : finalValues.flat();
            }
        }
        else {
            // Handle simple equality filters like ?isBuyable=false or ?category=poultry
            let value = rawValue;
            if (value === 'true')
                value = true;
            else if (value === 'false')
                value = false;
            else if (!isNaN(Number(value)))
                value = Number(value);
            filters[key] = value;
        }
    }
    // --- Handle date range logic ---
    const { period, dateFrom, dateTo } = req.query;
    if (period !== 'all') {
        const createdAtFilter = {};
        const from = dateFrom && dateFrom !== 'null' ? new Date(String(dateFrom)) : null;
        const to = dateTo && dateTo !== 'null' ? new Date(String(dateTo)) : null;
        if (from && to) {
            createdAtFilter.$gte = from;
            createdAtFilter.$lte = to;
        }
        else if (from && !to) {
            createdAtFilter.$gte = from;
        }
        else if (!from && to) {
            createdAtFilter.$lte = to;
        }
        if (Object.keys(createdAtFilter).length > 0) {
            filters.createdAt = createdAtFilter;
        }
    }
    return filters;
};
exports.buildFilterQuery = buildFilterQuery;
const buildSortingQuery = (req) => {
    const sort = {};
    if (req.query.ordering) {
        const ordering = req.query.ordering;
        const fields = ordering.split(',');
        fields.forEach((field) => {
            const sortOrder = field.startsWith('-') ? -1 : 1;
            const fieldName = field.replace('-', '');
            sort[fieldName] = sortOrder;
        });
    }
    return sort;
};
const MODELS_WITH_SUMMARY = ['Transaction', 'Stocking'];
const queryData = (model, req) => __awaiter(void 0, void 0, void 0, function* () {
    const page_size = parseInt(req.query.page_size, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const filters = (0, exports.buildFilterQuery)(req);
    const sort = buildSortingQuery(req);
    const count = yield model.countDocuments(filters);
    const results = yield model
        .find(filters)
        .skip((page - 1) * page_size)
        .limit(page_size)
        .sort(sort);
    let summary;
    if (MODELS_WITH_SUMMARY.includes(model.modelName)) {
        const pipeline = [
            { $match: filters },
            {
                $group: {
                    _id: null,
                    totalProfit: {
                        $sum: {
                            $cond: [
                                { $eq: ['$isProfit', true] },
                                model.modelName === 'Transaction' ? '$totalAmount' : '$amount',
                                0,
                            ],
                        },
                    },
                    totalLoss: {
                        $sum: {
                            $cond: [
                                { $eq: ['$isProfit', false] },
                                model.modelName === 'Transaction' ? '$totalAmount' : '$amount',
                                0,
                            ],
                        },
                    },
                    totalTransactions: { $sum: 1 },
                },
            },
        ];
        const aggResult = yield model.aggregate(pipeline);
        if (aggResult && aggResult.length > 0) {
            summary = aggResult[0];
        }
        else {
            summary = {
                totalProfit: 0,
                totalLoss: 0,
                totalTransactions: 0,
            };
        }
    }
    const payload = Object.assign({ count,
        results,
        page,
        page_size }, (summary ? { summary } : {}));
    return payload;
});
exports.queryData = queryData;
const generalSearchQuery = (req) => {
    const rawIds = req.query.myIds;
    const userId = req.query.myId;
    const userIds = typeof rawIds === 'string' ? rawIds.split(',').map((id) => id.trim()) : [];
    delete req.query.myIds;
    delete req.query.myId;
    const cleanedQuery = req.query;
    let searchQuery = {};
    const textFields = [
        'title',
        'name',
        'instruction',
        'username',
        'content',
        'displayName',
        'firstName',
        'middleName',
        'lastName',
        'subtitle',
    ];
    const regexConditions = textFields
        .filter((field) => cleanedQuery[field])
        .map((field) => ({
        [field]: { $regex: cleanedQuery[field], $options: 'i' },
    }));
    let filter = Object.assign(Object.assign({}, searchQuery), (regexConditions.length ? { $or: regexConditions } : {}));
    if (userIds) {
        filter = Object.assign(Object.assign({}, filter), { _id: { $nin: userIds }, userId: { $nin: userIds } });
    }
    const page = Math.max(1, parseInt(cleanedQuery.page) || 1);
    const page_size = Math.max(1, parseInt(cleanedQuery.page_size) || 3);
    return { filter, page, page_size, userId };
};
exports.generalSearchQuery = generalSearchQuery;
function buildSearchQuery(req) {
    const cleanedQuery = req.query;
    let searchQuery = {};
    const applyInFilter = (field) => {
        if (cleanedQuery[field]) {
            const values = cleanedQuery[field].split(',').map((val) => {
                if (val === 'true')
                    return true;
                if (val === 'false')
                    return false;
                return val;
            });
            Object.assign(searchQuery, {
                [field]: { $in: values },
            });
        }
    };
    applyInFilter('isVerified');
    applyInFilter('postType');
    applyInFilter('status');
    if (cleanedQuery.publishedAt) {
        let [startDate, endDate] = cleanedQuery.publishedAt.split(',');
        if (!startDate || startDate === 'undefined')
            startDate = undefined;
        if (!endDate || endDate === 'undefined')
            endDate = undefined;
        const dateFilter = {};
        if (startDate)
            dateFilter.$gte = new Date(startDate);
        if (endDate)
            dateFilter.$lte = new Date(endDate);
        if (Object.keys(dateFilter).length > 0) {
            Object.assign(searchQuery, { publishedAt: dateFilter });
        }
    }
    const textFields = [
        'title',
        'name',
        'email',
        'phone',
        'fullName',
        'username',
        'firstName',
        'middleName',
        'content',
        'description',
        'author',
        'lastName',
        'subtitle',
    ];
    const regexConditions = textFields
        .filter((field) => cleanedQuery[field])
        .map((field) => ({
        [field]: { $regex: cleanedQuery[field], $options: 'i' },
    }));
    if (cleanedQuery.userId) {
        Object.assign(searchQuery, {
            userId: { $ne: cleanedQuery.userId },
        });
    }
    if (cleanedQuery.bioUserId) {
        Object.assign(searchQuery, {
            bioUserId: { $ne: cleanedQuery.bioUserId },
        });
    }
    return Object.assign(Object.assign({}, searchQuery), (regexConditions.length ? { $or: regexConditions } : {}));
}
const search = (model, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newSearchQuery = buildSearchQuery(req);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        let results = yield model
            .find(newSearchQuery)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        res.json({ results });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.search = search;
const createItem = (req, res, model, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        yield model.create(req.body);
        const item = yield (0, exports.queryData)(model, req);
        const { page, page_size, count, results } = item;
        res.status(200).json({
            message: message,
            results,
            count,
            page,
            page_size,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createItem = createItem;
const getItemById = (req, res, model, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield model.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: message });
        }
        res.status(200).json({ data: item });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getItemById = getItemById;
const getItems = (req, res, model) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, exports.queryData)(model, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getItems = getItems;
const updateItem = (req, res, model, files, messages) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (((_a = req.files) === null || _a === void 0 ? void 0 : _a.length) || req.file) {
            const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
            uploadedFiles.forEach((file) => {
                req.body[file.fieldName] = file.s3Url;
            });
        }
        const result = yield model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!result) {
            return res.status(404).json({ message: messages[0] });
        }
        if (((_b = req.files) === null || _b === void 0 ? void 0 : _b.length) || req.file) {
            (0, fileUpload_1.deleteFilesFromS3)(result, files);
        }
        const item = yield (0, exports.queryData)(model, req);
        const { page, page_size, count, results } = item;
        res.status(200).json({
            message: messages[1],
            results,
            count,
            page,
            page_size,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateItem = updateItem;
const deleteItem = (req, res, model, fields, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield model.findById(req.params.id);
        yield model.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message });
        }
        if (fields.length > 0) {
            yield (0, fileUpload_1.deleteFilesFromS3)(result, fields);
        }
        const results = yield (0, exports.queryData)(model, req);
        res.status(200).json(results);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.deleteItem = deleteItem;
const deleteItems = (req, res, model, fields, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = req.body;
        for (let i = 0; i < items.length; i++) {
            const el = items[i];
            const result = yield model.findById(el.id);
            yield model.findByIdAndDelete(el.id);
            if (!result) {
                return res.status(404).json({ message });
            }
            if (fields.length > 0) {
                const s3Fields = [];
                fields.forEach((field) => {
                    const value = result[field];
                    if (value !== undefined) {
                        s3Fields.push(String(value));
                    }
                });
                yield (0, fileUpload_1.deleteFilesFromS3)(result, s3Fields);
            }
            if (i + 1 === items.length) {
                const results = yield (0, exports.queryData)(model, req);
                res.status(200).json(results);
            }
        }
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.deleteItems = deleteItems;
