
import { GET_API_URL } from '@/config';
import axios from 'axios';

export const api = axios.create({
  baseURL: GET_API_URL,
});