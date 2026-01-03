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

        const t = this.context.currentTime;
        const osc = this.context.createOscillator();
        const envelope = this.context.createGain();

        // Connect: Osc -> Envelope -> Master Gain -> Destination
        osc.connect(envelope);
        envelope.connect(this.gainNode);

        osc.type = 'sine';

        if (type === 'short') {
            // 3-2-1 Count: Softer pitch (E5)
            osc.frequency.setValueAtTime(660, t);

            // "Ping" Envelope
            envelope.gain.setValueAtTime(0, t);
            envelope.gain.linearRampToValueAtTime(0.3, t + 0.05); // Attack
            envelope.gain.exponentialRampToValueAtTime(0.001, t + 0.3); // Release

            osc.start(t);
            osc.stop(t + 0.3);
        } else {
            // Phase Change: Harmonic high pitch (A5)
            osc.frequency.setValueAtTime(880, t);

            // "Chime" Envelope
            envelope.gain.setValueAtTime(0, t);
            envelope.gain.linearRampToValueAtTime(0.5, t + 0.05); // Attack
            envelope.gain.exponentialRampToValueAtTime(0.001, t + 0.8); // Long Release

            osc.start(t);
            osc.stop(t + 0.8);
        }
    }
}

export const audioService = new AudioService();
