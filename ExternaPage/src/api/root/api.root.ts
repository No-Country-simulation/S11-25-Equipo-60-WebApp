import { CONFIG } from '@/config';
import axios from 'axios';

export const api = axios.create({
    baseURL: CONFIG.API_URL
});