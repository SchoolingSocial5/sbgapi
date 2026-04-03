"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const penController_1 = require("../controllers/penController");
const router = (0, express_1.Router)();
router.route('/').get(penController_1.getPens).post(penController_1.createPen);
router.route('/search').get(penController_1.searchPens);
router.route('/:id').get(penController_1.getPen).patch(penController_1.updatePen).delete(penController_1.deletePen);
exports.default = router;
