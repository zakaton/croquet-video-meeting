class SpatialAudioView extends Croquet.View {
    constructor(model) {
        super(model);

        // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
        this.audioContext = new AudioContext();

        window.addEventListener("click", event => {
            if(this.audioContext.state !== "closed")
                this.audioContext.resume();
        }, {once: true});

        // https://resonance-audio.github.io/resonance-audio/reference/web/ResonanceAudio.html
        this.scene = new ResonanceAudio(this.audioContext)
        // https://resonance-audio.github.io/resonance-audio/reference/web/ResonanceAudio.html#output
        this.scene.output.connect(this.audioContext.destination);
    }

    detach() {
        this.audioContext.close();
        super.detach();
    }
}

export default SpatialAudioView;