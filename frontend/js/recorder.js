// Audio Recording Module

class AudioRecorder {
    constructor() {
        this.mediaStream = null;
        this.mediaRecorder = null;
        this.audioContext = null;
        this.analyser = null;
        this.audioChunks = [];
    }

    async start() {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: false
                }
            });

            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            source.connect(this.analyser);

            const mimeType = this.getSupportedMimeType();
            this.mediaRecorder = new MediaRecorder(this.mediaStream, {
                mimeType: mimeType
            });

            this.audioChunks = [];
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.start();
            console.log('Recording started');
        } catch (error) {
            if (error.name === 'NotAllowedError') {
                throw new Error('麦克风访问被拒绝。请在浏览器设置中允许麦克风访问。');
            } else if (error.name === 'NotFoundError') {
                throw new Error('未找到麦克风设备。请检查硬件连接。');
            }
            throw error;
        }
    }

    async stop() {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
                reject(new Error('Recording is not active'));
                return;
            }

            this.mediaRecorder.onstop = () => {
                this.mediaStream.getTracks().forEach(track => track.stop());
                if (this.audioContext) {
                    this.audioContext.close();
                }

                const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
                const audioBlob = new Blob(this.audioChunks, { type: mimeType });
                resolve(audioBlob);
            };

            this.mediaRecorder.stop();
        });
    }

    getAnalyser() {
        return this.analyser;
    }

    getSupportedMimeType() {
        const types = [
            'audio/webm',
            'audio/webm;codecs=opus',
            'audio/ogg;codecs=opus',
            'audio/mp4',
            'audio/mp3'
        ];

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }

        return 'audio/webm';
    }
}
