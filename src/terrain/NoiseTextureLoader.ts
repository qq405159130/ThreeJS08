import * as THREE from 'three';

export class NoiseTextureLoader {
    private texture: THREE.Texture | null = null;
    private imageBitmap: ImageBitmap | null = null; // 使用 ImageBitmap 替代 Image

    /**
     * 加载噪声图并创建 ImageBitmap
     * @param url 噪声图路径
     */
    public async loadNoiseTexture(url: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.load(
                url,
                async (texture) => {
                    this.texture = texture;
                    try {
                        // 使用 createImageBitmap 创建 ImageBitmap
                        this.imageBitmap = await createImageBitmap(texture.image);
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                },
                undefined,
                (error) => {
                    reject(error);
                }
            );
        });
    }

    /**
     * 从噪声图中生成噪声数据
     * @param width 地图的宽度
     * @param height 地图的高度
     * @returns 返回噪声数据（Float32Array）
     */
    public generateNoiseMap(width: number, height: number): Float32Array {
        if (!this.imageBitmap) {
            throw new Error('Noise texture not loaded');
        }

        const noiseMap = new Float32Array(width * height);
        const noiseWidth = this.imageBitmap.width;
        const noiseHeight = this.imageBitmap.height;

        // 创建 OffscreenCanvas 用于读取像素数据
        const offscreenCanvas = new OffscreenCanvas(noiseWidth, noiseHeight);
        const offscreenCtx = offscreenCanvas.getContext('2d');
        if (!offscreenCtx) {
            throw new Error('Failed to create OffscreenCanvas context');
        }

        // 将 ImageBitmap 绘制到 OffscreenCanvas 上
        offscreenCtx.drawImage(this.imageBitmap, 0, 0);

        // 一次性读取所有像素数据
        const imageData = offscreenCtx.getImageData(0, 0, noiseWidth, noiseHeight).data;
        console.warn(`预加载噪声数据   imageData.length: ${imageData.length} this.noiseMap:${noiseMap.length} `);

        // 按地图尺寸采样噪声图
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // 将地图坐标映射到噪声图的 UV 空间
                const uvX = (x / width) * (noiseWidth - 1);
                const uvY = (y / height) * (noiseHeight - 1);

                // 双线性插值采样
                const value = this.bilinearInterpolation(imageData, noiseWidth, noiseHeight, uvX, uvY);
                noiseMap[y * width + x] = value;
            }
        }

        return noiseMap;
    }

    /**
     * 双线性插值采样
     * @param imageData 噪声图的像素数据
     * @param width 噪声图的宽度
     * @param height 噪声图的高度
     * @param x X 坐标
     * @param y Y 坐标
     * @returns 返回插值后的噪声值（0 到 1）
     */
    private bilinearInterpolation(
        imageData: Uint8ClampedArray,
        width: number,
        height: number,
        x: number,
        y: number
    ): number {
        const x1 = Math.floor(x);
        const y1 = Math.floor(y);
        const x2 = x1 + 1;
        const y2 = y1 + 1;

        // 获取四个邻近像素的灰度值
        const q11 = this.getGrayValue(imageData, width, x1, y1);
        const q12 = this.getGrayValue(imageData, width, x1, y2);
        const q21 = this.getGrayValue(imageData, width, x2, y1);
        const q22 = this.getGrayValue(imageData, width, x2, y2);

        // 双线性插值
        const rx = x - x1;
        const ry = y - y1;
        const r1 = this.lerp(q11, q21, rx);
        const r2 = this.lerp(q12, q22, rx);
        return this.lerp(r1, r2, ry);
    }

    /**
     * 获取像素的灰度值
     * @param imageData 噪声图的像素数据
     * @param width 噪声图的宽度
     * @param x X 坐标
     * @param y Y 坐标
     * @returns 返回灰度值（0 到 1）
     */
    private getGrayValue(imageData: Uint8ClampedArray, width: number, x: number, y: number): number {
        const index = (y * width + x) * 4; // 每个像素占 4 个字节（RGBA）
        const r = imageData[index];
        const g = imageData[index + 1];
        const b = imageData[index + 2];
        return (r + g + b) / (3 * 255); // RGB 转灰度
    }

    /**
     * 线性插值
     * @param a 起始值
     * @param b 结束值
     * @param t 插值系数（0 到 1）
     * @returns 返回插值结果
     */
    private lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }
}