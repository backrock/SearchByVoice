// Main Application Logic

class SearchByVoiceApp {
    constructor() {
        this.recorder = null;
        this.isRecording = false;
        this.recordingStartTime = null;
        this.recordingTimerInterval = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        console.log('SearchByVoice App initialized');
    }

    setupEventListeners() {
        document.getElementById('recordBtn').addEventListener('click', () => this.toggleRecording());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopRecording());
        document.getElementById('uploadBtn').addEventListener('click', () => this.selectFile());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileSelect(e));
        document.getElementById('shareBtn').addEventListener('click', () => this.shareResult());
    }

    async toggleRecording() {
        if (!this.isRecording) {
            await this.startRecording();
        }
    }

    async startRecording() {
        try {
            this.recorder = new AudioRecorder();
            await this.recorder.start();
            this.isRecording = true;
            this.recordingStartTime = Date.now();

            this.showRecordingStatus();
            this.startRecordingTimer();
            this.startWaveformVisualization();
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.showError('无法启动麦克风', error.message);
        }
    }

    async stopRecording() {
        if (!this.isRecording) return;

        try {
            this.isRecording = false;
            clearInterval(this.recordingTimerInterval);

            const audioBlob = await this.recorder.stop();
            this.hideRecordingStatus();

            await this.processAudio(audioBlob);
        } catch (error) {
            console.error('Failed to stop recording:', error);
            this.showError('停止录音失败', error.message);
        }
    }

    selectFile() {
        document.getElementById('fileInput').click();
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showError('文件过大', '文件大小不能超过10MB');
            return;
        }

        const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/mp4', 'audio/aac'];
        if (!validTypes.includes(file.type)) {
            this.showError('文件格式不支持', '请上传 MP3、WAV、OGG、FLAC 等音频文件');
            return;
        }

        this.processAudio(file);
        event.target.value = '';
    }

    async processAudio(audioBlob) {
        try {
            this.showProcessingStatus();
            this.clearResults();

            const result = await APIClient.recognize(audioBlob);

            if (result.success) {
                this.displayResult(result.result);
            } else {
                this.displayRecommendations(result.recommendations, result.message);
            }
        } catch (error) {
            console.error('Failed to process audio:', error);
            this.showError('识曲失败', error.message);
        } finally {
            this.hideProcessingStatus();
        }
    }

    displayResult(song) {
        const resultCard = document.getElementById('resultCard');

        document.getElementById('songTitle').textContent = song.title || 'Unknown';
        document.getElementById('songArtist').textContent = song.artist || 'Unknown Artist';
        document.getElementById('songAlbum').textContent = `专辑: ${song.album || 'Unknown'}`;
        document.getElementById('releaseDate').textContent = `发行时间: ${song.releaseDate || 'Unknown'}`;

        const coverImg = document.getElementById('coverImage');
        if (song.coverUrl) {
            coverImg.src = song.coverUrl;
        } else {
            coverImg.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" font-size="24" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3E📀 No Image%3C/text%3E%3C/svg%3E';
        }

        const score = song.acoustidScore ? (song.acoustidScore * 100).toFixed(1) : 'N/A';
        document.getElementById('acoustidScore').textContent = `匹配度: ${score}%`;

        const lyricsSection = document.getElementById('lyricsSection');
        if (song.lyrics) {
            document.getElementById('lyricsContent').textContent = song.lyrics;
            lyricsSection.classList.remove('hidden');
        } else {
            lyricsSection.classList.add('hidden');
        }

        const spotifyLink = document.getElementById('spotifyLink');
        const youtubeLink = document.getElementById('youtubeLink');

        if (song.links?.spotify) {
            spotifyLink.href = song.links.spotify;
            spotifyLink.classList.remove('hidden');
        } else {
            spotifyLink.classList.add('hidden');
        }

        if (song.links?.youtube) {
            youtubeLink.href = song.links.youtube;
            youtubeLink.classList.remove('hidden');
        } else {
            youtubeLink.classList.add('hidden');
        }

        resultCard.classList.remove('hidden');
        resultCard.classList.add('slide-in');
        this.scrollToElement(resultCard);
    }

    displayRecommendations(recommendations, message) {
        const recommendationsCard = document.getElementById('recommendationsCard');
        const recommendationsList = document.getElementById('recommendationsList');

        if (!recommendations || recommendations.length === 0) {
            this.showError('无法识别', message || '无法识别这首歌曲');
            return;
        }

        recommendationsList.innerHTML = '';
        recommendations.forEach((song, index) => {
            const item = document.createElement('div');
            item.className = 'recommendation-item p-4 bg-gray-50 rounded-lg border border-gray-200';
            item.innerHTML = `
                <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        ${index + 1}
                    </div>
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-900">${song.title || 'Unknown'}</h4>
                        <p class="text-sm text-gray-600">${song.artist || 'Unknown Artist'}</p>
                        <p class="text-xs text-gray-500 mt-1">${song.album || 'Unknown Album'}</p>
                        ${song.similarity ? `<p class="text-xs text-blue-600 font-semibold mt-1">相似度: ${(song.similarity * 100).toFixed(1)}%</p>` : ''}
                    </div>
                </div>
            `;
            recommendationsList.appendChild(item);
        });

        recommendationsCard.classList.remove('hidden');
        recommendationsCard.classList.add('slide-in');
        this.scrollToElement(recommendationsCard);
    }

    shareResult() {
        const title = document.getElementById('songTitle').textContent;
        const artist = document.getElementById('songArtist').textContent;
        const text = `我用SearchByVoice识别到这首歌：${title} - ${artist}`;

        if (navigator.share) {
            navigator.share({
                title: '听歌识曲',
                text: text
            }).catch(err => console.log('Share failed:', err));
        } else {
            navigator.clipboard.writeText(text).then(() => {
                alert('已复制到剪贴板！');
            }).catch(err => {
                alert('分享：' + text);
            });
        }
    }

    showRecordingStatus() {
        document.getElementById('recordingStatus').classList.remove('hidden');
        document.getElementById('recordBtn').disabled = true;
        document.getElementById('uploadBtn').disabled = true;
    }

    hideRecordingStatus() {
        document.getElementById('recordingStatus').classList.add('hidden');
        document.getElementById('recordBtn').disabled = false;
        document.getElementById('uploadBtn').disabled = false;
    }

    startRecordingTimer() {
        let seconds = 0;
        this.recordingTimerInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            const time = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            document.getElementById('recordingTime').textContent = time;
        }, 1000);
    }

    startWaveformVisualization() {
        if (!this.recorder) return;

        const canvas = document.getElementById('waveform');
        const ctx = canvas.getContext('2d');
        const analyser = this.recorder.getAnalyser();

        if (!analyser) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!this.isRecording) return;

            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.fillStyle = 'rgb(245, 245, 245)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;
                ctx.fillStyle = `rgb(${barHeight + 100}, ${250 - barHeight}, 50)`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        };

        draw();
    }

    showProcessingStatus() {
        document.getElementById('processingStatus').classList.remove('hidden');
        document.getElementById('recordBtn').disabled = true;
        document.getElementById('uploadBtn').disabled = true;
    }

    hideProcessingStatus() {
        document.getElementById('processingStatus').classList.add('hidden');
        document.getElementById('recordBtn').disabled = false;
        document.getElementById('uploadBtn').disabled = false;
    }

    showError(title, message) {
        document.getElementById('errorText').textContent = title;
        document.getElementById('errorDetail').textContent = message;
        document.getElementById('errorMessage').classList.remove('hidden');
        this.scrollToElement(document.getElementById('errorMessage'));
    }

    clearResults() {
        document.getElementById('resultCard').classList.add('hidden');
        document.getElementById('recommendationsCard').classList.add('hidden');
        document.getElementById('errorMessage').classList.add('hidden');
    }

    scrollToElement(element) {
        setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new SearchByVoiceApp();
    });
} else {
    window.app = new SearchByVoiceApp();
}
