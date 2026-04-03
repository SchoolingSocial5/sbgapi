"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const columnController_1 = require("../controllers/columnController");
const router = (0, express_1.Router)();
router.route('/').get(columnController_1.getColumns).post(columnController_1.createColumn);
router.route('/search').get(columnController_1.searchColumns);
router.route('/:id').get(columnController_1.getColumn).patch(columnController_1.updateColumn).delete(columnController_1.deleteColumn);
exports.default = router;
