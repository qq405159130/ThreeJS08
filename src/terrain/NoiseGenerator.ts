//#ignore_export
import { makeNoise2D } from 'fast-simplex-noise';

export class NoiseGenerator {
    private noise2D: (x: number, y: number) => number;

    constructor(seed: number = Date.now()) {
        // 使用种子初始化随机数生成器
        const random = this.createSeededRandom(seed);
        this.noise2D = makeNoise2D(random);
    }

    /**
     * 创建一个基于种子的随机数生成器
     * @param seed 随机种子
     * @returns 返回一个随机数生成函数
     */
    private createSeededRandom(seed: number): () => number {
        let seedValue = seed;
        return () => {
            const a = 1664525;
            const c = 1013904223;
            const m = 4294967296; // 2^32
            seedValue = (a * seedValue + c) % m; // 线性同余生成器
            return seedValue / m;// 归一化到 [0, 1)
        };
    }

    generateNoiseMap(
        width: number,
        height: number,
        scale: number = 0.1,
        octaves: number = 4,
        persistence: number = 0.5,
        lacunarity: number = 2.0
    ): Float32Array {
        const map = new Float32Array(width * height);
        const maxValue = this.calculateMaxValue(octaves, persistence);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let amplitude = 1;
                let frequency = 1;
                let noiseValue = 0;

                for (let i = 0; i < octaves; i++) {
                    const sampleX = (x / width) * scale * frequency;
                    const sampleY = (y / height) * scale * frequency;

                    noiseValue += this.noise2D(sampleX, sampleY) * amplitude;

                    amplitude *= persistence;
                    frequency *= lacunarity;
                }

                map[y * width + x] = (noiseValue / maxValue + 1) / 2; // 归一化到 [0, 1]
            }
        }

        return map;
    }

    private calculateMaxValue(octaves: number, persistence: number): number {
        let max = 0;
        let amplitude = 1;
        for (let i = 0; i < octaves; i++) {
            max += amplitude;
            amplitude *= persistence;
        }
        return max;
    }
}