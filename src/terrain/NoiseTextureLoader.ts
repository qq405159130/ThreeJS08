import * as THREE from 'three';

export class NoiseTextureLoader {
    private texture: THREE.Texture | null = null;

    /**
     * 加载噪声图
     * @param url 噪声图路径
     */
    public async loadNoiseTexture(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.load(
                url,
                (texture) => {
                    this.texture = texture;
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
     * 从噪声图中生成噪声数据
     * @param width 噪声图的宽度
     * @param height 噪声图的高度
     * @returns 返回噪声数据（Float32Array）
     */
    public generateNoiseMap(width: number, height: number): Float32Array {
        if (!this.texture) {
            throw new Error('Noise texture not loaded');
        }

        const noiseMap = new Float32Array(width * height);

        // 创建临时 canvas 用于读取像素数据
        const canvas = document.createElement('canvas');
        canvas.width = this.texture.image.width;
        canvas.height = this.texture.image.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to create canvas context');
        }

        // 将噪声图绘制到 canvas 上
        ctx.drawImage(this.texture.image, 0, 0);

        // 读取像素数据并生成噪声图
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // 将坐标映射到噪声图的 UV 空间
                const uvX = (x / width) * this.texture.image.width;
                const uvY = (y / height) * this.texture.image.height;

                // 获取像素的灰度值（0 到 1）
                const pixel = ctx.getImageData(uvX, uvY, 1, 1).data;
                const grayValue = (pixel[0] + pixel[1] + pixel[2]) / (3 * 255); // RGB 转灰度
                noiseMap[y * width + x] = grayValue;
            }
        }

        return noiseMap;
    }
}