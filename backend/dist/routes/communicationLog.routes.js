"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const communicationLog_controller_1 = __importDefault(require("../controllers/communicationLog.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require admin authentication
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_1.authorize)('ADMIN'));
router.get('/logs', communicationLog_controller_1.default.getLogs.bind(communicationLog_controller_1.default));
router.get('/statistics', communicationLog_controller_1.default.getStatistics.bind(communicationLog_controller_1.default));
router.get('/statistics/channels', communicationLog_controller_1.default.getChannelStatistics.bind(communicationLog_controller_1.default));
exports.default = router;
//# sourceMappingURL=communicationLog.routes.js.map