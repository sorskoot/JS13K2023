const GL = WebGLRenderingContext; // For enums

let nextDataTextureIndex = 0;

export class TextureSampler {
    minFilter: number | null;
    magFilter: number | null;
    wrapS: number | null;
    wrapT: number | null;
    constructor() {
        this.minFilter = null;
        this.magFilter = null;
        this.wrapS = null;
        this.wrapT = null;
    }
}

export class Texture {
    sampler: TextureSampler;
    mipmap: boolean;
    constructor() {
        this.sampler = new TextureSampler();
        this.mipmap = true;
        // TODO: Anisotropy
    }

    get format() {
        return GL.RGBA;
    }

    get width() {
        return 0;
    }

    get height() {
        return 0;
    }

    get textureKey() {
        return null;
    }
}

export class ImageTexture extends Texture {
    _img: any;
    _imgBitmap: ImageBitmap | null;
    _manualKey: string | null;
    _promise: Promise<Awaited<this>>;
    constructor(img) {
        super();

        this._img = img;
        this._imgBitmap = null;
        this._manualKey = null;

        if (img.src && img.complete) {
            if (img.naturalWidth) {
                this._promise = this._finishImage();
            } else {
                this._promise = Promise.reject('Image provided had failed to load.');
            }
        } else {
            this._promise = new Promise((resolve, reject) => {
                img.addEventListener('load', () => resolve(this._finishImage()));
                img.addEventListener('error', reject);
            });
        }
    }

    _finishImage() {
        if (window.createImageBitmap) {
            return window.createImageBitmap(this._img).then((imgBitmap) => {
                this._imgBitmap = imgBitmap;
                return Promise.resolve(this);
            });
        }
        return Promise.resolve(this);
    }

    get format() {
        // TODO: Can be RGB in some cases.
        return GL.RGBA;
    }

    get width() {
        return this._img.width;
    }

    get height() {
        return this._img.height;
    }

    waitForComplete() {
        return this._promise;
    }

    get textureKey() {
        return this._manualKey || this._img.src;
    }

    get source() {
        return this._imgBitmap || this._img;
    }

    genDataKey() {
        this._manualKey = `DATA_${nextDataTextureIndex}`;
        nextDataTextureIndex++;
    }
}

export class BlobTexture extends ImageTexture {
    constructor(blob) {
        let img = new Image();
        super(img);
        img.src = window.URL.createObjectURL(blob);
    }
}
