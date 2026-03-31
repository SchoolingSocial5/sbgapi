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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = require("./utils/errorHandler");
const blogRoutes_1 = __importDefault(require("./routes/blogRoutes"));
const applicationRoutes_1 = __importDefault(require("./routes/applicationRoutes"));
const companyRoutes_1 = __importDefault(require("./routes/companyRoutes"));
const consumptionRoutes_1 = __importDefault(require("./routes/consumptionRoutes"));
const faqRoutes_1 = __importDefault(require("./routes/faqRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/serviceRoutes"));
const marketingRoutes_1 = __importDefault(require("./routes/marketingRoutes"));
const strategyRoutes_1 = __importDefault(require("./routes/strategyRoutes"));
const emailRoutes_1 = __importDefault(require("./routes/emailRoutes"));
const equipmentRoutes_1 = __importDefault(require("./routes/equipmentRoutes"));
const visitorRoutes_1 = __importDefault(require("./routes/visitorRoutes"));
const expenseRoutes_1 = __importDefault(require("./routes/expenseRoutes"));
const summaryRoutes_1 = __importDefault(require("./routes/summaryRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const operationRoutes_1 = __importDefault(require("./routes/operationRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const socialRoutes_1 = __importDefault(require("./routes/socialRoutes"));
const salaryRoutes_1 = __importDefault(require("./routes/salaryRoutes"));
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
const userRoutes_1 = __importDefault(require("./routes/users/userRoutes"));
// import { geoipMiddleware } from './middlewares/geoipMiddleware'
const usersSocket_1 = require("./routes/socket/usersSocket");
const activityController_1 = require("./controllers/activityController");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
// app.use(geoipMiddleware)
const requestLogger = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.country}`);
    next();
};
app.use(requestLogger);
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'https://awiza.netlify.app',
        'https://awizafarm.com',
    ],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'socket-id'],
}));
const io = new socket_io_1.Server(server, {
    cors: {
        origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'https://awiza.netlify.app',
            'https://awizafarm.com',
        ],
        methods: ['GET', 'POST'],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
});
exports.io = io;
io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);
    socket.on('message', (data) => __awaiter(void 0, void 0, void 0, function* () {
        switch (data.to) {
            case 'users':
                yield (0, usersSocket_1.UsersSocket)(data);
                break;
            case 'activity':
                yield (0, activityController_1.createActivity)(data);
                break;
            default:
                break;
        }
    }));
    socket.on('disconnect', () => {
        console.log(`❌ User disconnected.: ${socket.id}`);
    });
});
app.use(body_parser_1.default.json());
app.use('/api/v1/blogs', blogRoutes_1.default);
app.use('/api/v1/applications', applicationRoutes_1.default);
app.use('/api/v1/company', companyRoutes_1.default);
app.use('/api/v1/consumptions', consumptionRoutes_1.default);
app.use('/api/v1/marketing', marketingRoutes_1.default);
app.use('/api/v1/strategies', strategyRoutes_1.default);
app.use('/api/v1/faqs', faqRoutes_1.default);
app.use('/api/v1/services', serviceRoutes_1.default);
app.use('/api/v1/equipments', equipmentRoutes_1.default);
app.use('/api/v1/emails', emailRoutes_1.default);
app.use('/api/v1/salaries', salaryRoutes_1.default);
app.use('/api/v1/expenses', expenseRoutes_1.default);
app.use('/api/v1/notifications', notificationRoutes_1.default);
app.use('/api/v1/operations', operationRoutes_1.default);
app.use('/api/v1/products', productRoutes_1.default);
app.use('/api/v1/reviews', reviewRoutes_1.default);
app.use('/api/v1/transactions', transactionRoutes_1.default);
app.use('/api/v1/socials', socialRoutes_1.default);
app.use('/api/v1/summary', summaryRoutes_1.default);
app.use('/api/v1/users', userRoutes_1.default);
app.use('/api/v1/visitors', visitorRoutes_1.default);
app.use((req, res, next) => {
    (0, errorHandler_1.handleError)(res, 404, `Request not found: ${req.method} ${req.originalUrl}`);
    next();
});
