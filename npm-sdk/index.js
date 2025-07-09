import axios from "axios";

const API_BASE_URL = process.env.API_BASE_URL;

export const getEnv = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/env`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}