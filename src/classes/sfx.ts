export const Sounds = {
    shoot: 0,
};

class SoundfxPlayer {
    initialized: boolean;
    currentSfxIndex: number;
    audiopool: HTMLAudioElement[];
    //  pannerNodes: PannerNode[];
    audioContext?: AudioContext;
    sounds!: HTMLAudioElement[];

    constructor() {
        this.initialized = false;
        this.currentSfxIndex = 0;
        this.audiopool = [];
        //    this.pannerNodes = [];
    }

    initAudio() {
        if (this.audioContext) return;
        this.initialized = true;
        this.sounds = [
            new Audio(
                'data:audio/wav;base64,UklGRu4BAABXQVZFZm10IBAAAAABAAEAuAsAALgLAAABAAgAZGF0YXcBAACAgICAgICBgICAf3+AgICAgYGAgH9/foCBgICBgH9/gYKCgYB/f4GBgH9+foCDhIF/fX2AgoKAfoCCgX58foKFg316fYOGhX97f4WEfnt+goKAfn6AgoOEhIF6eHuDjol1b3iFjIN2eX95doKRkHtvgJOEZ2qIlIN1fol+bnuYlnhxj56CZ3eNe22Flox7dYiahGiArJxrdJh+Tmmhil+Cs5hldpiJcXF6g4N2b36IeHGCiISFfXqAeXN+h4eHf3V3hpKKd219ko52b4CFcGmCmpF1aHeOkIJ8hIV3bHeNmIlxbX+PjX90dYCJhHt9iIh/fX59goaCgoOAf359goiEfXt9goWEgX5+gYGAf4CBgYGAfX6BgoGCgH1/gYB/gIGBgoF/gYKAfn9/f4GCf35/f4CCgoB+foCBgoKAfX1/gYGBf35/gYKBgX9+f4GCgoGAfn+AgoKAgH9/f4CBgH9/gIGBgYB/fn+BgYGAf39/gIGBgYCAf4AATElTVEoAAABJTkZPSUNSRAsAAAAyMDIzLTA5LTA0AABJRU5HDAAAAFRpbW15IEtva2tlAElTRlQVAAAAU291bmQgRm9yZ2UgUHJvIDExLjAAAg=='
            ),
        ];

        this.audioContext = new AudioContext({sampleRate: 3000});

        this.audioContext.listener.upY.value = 1;
        let gain = this.audioContext.createGain();
        gain.gain.value = 1.5;
        gain.connect(this.audioContext.destination);

        for (let i = 0; i < 25; i++) {
            const audio = new Audio();
            this.audiopool.push(audio);
            const element = this.audioContext.createMediaElementSource(audio);

            // const pn = new PannerNode(this.audioContext, {
            //     panningModel: 'HRTF',
            //     distanceModel: 'exponential',
            // });

            element.connect(gain);
            //   pn.connect(gain);
            // this.pannerNodes.push(pn);
        }
    }

    playSound(audioIndex: number, pos?: number[]) {
        if (!this.audioContext) return;
        // if (!pos || !pos[0] || isNaN(pos[0])) {
        //     pos = [0, 0, 0];
        // }

        // this.pannerNodes[this.currentSfxIndex].positionX.value = pos[0];
        // this.pannerNodes[this.currentSfxIndex].positionY.value = pos[1];
        // this.pannerNodes[this.currentSfxIndex].positionZ.value = pos[2];

        this.audiopool[this.currentSfxIndex].src = this.sounds[audioIndex].src;
        this.audiopool[this.currentSfxIndex].play();
        this.currentSfxIndex = (this.currentSfxIndex + 1) % 25;
    }
}

export const SFX = new SoundfxPlayer();
