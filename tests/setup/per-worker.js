import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.test' }); // harmless if missing
process.env.NODE_ENV = 'test';
