class AudioService {
    private context: AudioContext | null = null;
    private gainNode: GainNode | null = null;

    private init() {
        if (!this.context) {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.gainNode = this.context.createGain();
            this.gainNode.connect(this.context.destination);
        }
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    playBeep(type: 'short' | 'long' = 'short') {
        this.init();
        if (!this.context || !this.gainNode) return;

        const osc = this.context.createOscillator();
        osc.connect(this.gainNode);

        osc.type = 'sine';

        const now = this.context.currentTime;

        if (type === 'short') {
            // High pitch for countdown (e.g., 3, 2, 1)
            osc.frequency.setValueAtTime(880, now); // A5
            osc.start(now);
            osc.stop(now + 0.1);
        } else {
            // Slightly lower text, longer for phase change
            osc.frequency.setValueAtTime(1760, now); // A6
            osc.start(now);
            osc.stop(now + 0.4);
        }
    }
}

export const audioService = new AudioService();
