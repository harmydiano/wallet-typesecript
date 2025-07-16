"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = process.env.PORT || 3010;
exports.default = {
    app: {
        appName: process.env.APP_NAME || 'TypeScript SMS API',
        environment: process.env.NODE_ENV || 'dev',
        superSecret: process.env.SERVER_SECRET || 'ipa-BUhBOJAm',
        baseUrl: `http://localhost:${PORT}`,
        port: PORT,
        domain: process.env.APP_DOMAIN || 'app.com',
    },
    api: {
        lang: 'en',
        prefix: '^/api/v[1-9]',
        versions: [1],
        patch_version: '1.0.0',
        pagination: {
            itemsPerPage: 10
        }
    },
    databases: {
        sql: {
            name: process.env.DATABASE_NAME || 'sms_db',
            user: process.env.DATABASE_USER || 'postgres',
            password: process.env.DATABASE_PASSWORD || 'password',
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT || '5432')
        }
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
    },
    options: {
        errors: {
            wrap: {
                label: ''
            }
        }
    }
};
//# sourceMappingURL=default.js.map