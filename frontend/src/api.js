import axios from 'axios';

// Create an Axios instance with the base URL from environment variables
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    // Do not set default Content-Type; axios sets it automatically (json or multipart)
});

export default api;
