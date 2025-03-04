import * as THREE from 'three';

export class NoiseTextureLoader {
    private texture: THREE.Texture | null = null;
    private noiseData: Float32Array | null = null; // 预加载的噪声数据

    /**
     * 加载噪声图并预加载噪声数据
     * @param url 噪声图路径
     */
    public async loadNoiseTexture(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.load(
                url,
                (texture) => {
                    this.texture = texture;
                    this.preloadNoiseData(); // 预加载噪声数据
                    resolve();
                },
                undefined,
                (error) => {
                    reject("加载噪声图失败：" + error);
                }
            );
        });
    }

    /**
     * 预加载噪声数据
     */
    private preloadNoiseData(): void {
        if (!this.texture) {
            throw new Error('Noise texture not loaded');
        }

        const canvas = document.createElement('canvas');
        canvas.width = this.texture.image.width;
        canvas.height = this.texture.image.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to create canvas context');
        }

        // 将噪声图绘制到 canvas 上
        ctx.drawImage(this.texture.image, 0, 0);

        // 一次性读取所有像素数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        this.noiseData = new Float32Array(canvas.width * canvas.height);

        // 将 RGB 转换为灰度值（0 到 1）
        for (let i = 0; i < imageData.length; i += 4) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const grayValue = (r + g + b) / (3 * 255); // RGB 转灰度
            this.noiseData[i / 4] = grayValue;
        }

        console.warn(`预加载噪声数据   imageData.length: ${imageData.length} this.noiseData:${this.noiseData.length} `);
    }

    /**
     * 从预加载的噪声数据中生成噪声图
     * @param width 噪声图的宽度
     * @param height 噪声图的高度
     * @returns 返回噪声数据（Float32Array）
     */
    public generateNoiseMap(width: number, height: number): Float32Array {
        if (!this.noiseData) {
            throw new Error('Noise data not loaded');
        }

        const noiseMap = new Float32Array(width * height);

        // 从预加载的噪声数据中采样
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // 将坐标映射到噪声图的 UV 空间
                const uvX = (x / width) * (this.texture!.image.width - 1);
                const uvY = (y / height) * (this.texture!.image.height - 1);

                // 双线性插值采样
                const x1 = Math.floor(uvX);
                const y1 = Math.floor(uvY);
                const x2 = x1 + 1;
                const y2 = y1 + 1;

                const q11 = this.noiseData[y1 * this.texture!.image.width + x1];
                const q12 = this.noiseData[y2 * this.texture!.image.width + x1];
                const q21 = this.noiseData[y1 * this.texture!.image.width + x2];
                const q22 = this.noiseData[y2 * this.texture!.image.width + x2];

                const value = this.bilinearInterpolation(q11, q12, q21, q22, uvX - x1, uvY - y1);
                noiseMap[y * width + x] = value;
            }
        }

        return noiseMap;
    }

    /**
     * 双线性插值
     */
    private bilinearInterpolation(q11: number, q12: number, q21: number, q22: number, x: number, y: number): number {
        const r1 = this.lerp(q11, q21, x);
        const r2 = this.lerp(q12, q22, x);
        return this.lerp(r1, r2, y);
    }

    /**
     * 线性插值
     */
    private lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }
}