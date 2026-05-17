// API Client Module

class APIClient {
    static async recognize(audioBlob) {
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, `audio_${Date.now()}.webm`);

            const response = await fetch('/api/recognize', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async search(query, limit = 10) {
        try {
            const params = new URLSearchParams({
                q: query,
                limit: limit
            });

            const response = await fetch(`/api/search?${params}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
}
