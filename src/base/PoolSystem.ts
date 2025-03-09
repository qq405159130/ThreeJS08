
//#ignore_export
import * as THREE from 'three';

type Constructor<T> = new (...args: any[]) => T;
type ResetFn<T> = (obj: T) => void;
type CreateFn<T> = () => T;

class Pool<T> {
    private pool: T[];
    private createFn: CreateFn<T>;
    private resetFn?: ResetFn<T>;

    constructor(createFn: CreateFn<T>, resetFn?: ResetFn<T>) {
        this.pool = [];
        this.createFn = createFn;
        this.resetFn = resetFn;
    }

    /**
     * 从对象池中获取一个对象
     * @returns 对象实例
     */
    acquire(): T {
        if (this.pool.length > 0) {
            return this.pool.pop()!;
        }
        return this.createFn();
    }

    /**
     * 将对象归还到对象池
     * @param obj 对象实例
     */
    release(obj: T): void {
        if (this.resetFn) {
            this.resetFn(obj);
        }
        this.pool.push(obj);
    }

    /**
     * 清空对象池
     */
    clear(): void {
        this.pool = [];
    }

    /**
     * 获取当前对象池的大小
     * @returns 对象池的大小
     */
    size(): number {
        return this.pool.length;
    }
}



class PoolSystem {
    private pools: Map<string, Pool<any>>;

    constructor() {
        this.pools = new Map();
    }

    /**
     * 注册一个对象池
     * @param type 对象类型标识（如 "mesh"）
     * @param createFn 对象创建函数
     * @param resetFn 对象重置函数（可选）
     */
    register<T>(type: string, createFn: CreateFn<T>, resetFn?: ResetFn<T>): void {
        this.pools.set(type, new Pool(createFn, resetFn));
    }

    /**
     * 从对象池中获取一个对象
     * @param type 对象类型标识
     * @returns 对象实例
     */
    acquire<T>(type: string): T {
        const pool = this.pools.get(type);
        if (!pool) {
            throw new Error(`Pool for type "${type}" not found.`);
        }
        return pool.acquire();
    }

    /**
     * 将对象归还到对象池
     * @param type 对象类型标识
     * @param obj 对象实例
     */
    release<T>(type: string, obj: T): void {
        const pool = this.pools.get(type);
        if (!pool) {
            throw new Error(`Pool for type "${type}" not found.`);
        }
        pool.release(obj);
    }

    /**
     * 清空指定类型的对象池
     * @param type 对象类型标识
     */
    clear(type: string): void {
        const pool = this.pools.get(type);
        if (pool) {
            pool.clear();
        }
    }

    /**
     * 销毁整个对象池系统
     */
    destroy(): void {
        this.pools.clear();
    }

    /**
     * 获取指定类型对象池的大小
     * @param type 对象类型标识
     * @returns 对象池的大小
     */
    size(type: string): number {
        const pool = this.pools.get(type);
        if (!pool) {
            throw new Error(`Pool for type "${type}" not found.`);
        }
        return pool.size();
    }
}

/** 针对 Three.js 的优化扩展 */
export class ThreeJSPoolSystem extends PoolSystem {
    constructor() {
        super();

        // 默认注册 Three.js 对象的对象池
        this.registerMeshPool();
        this.registerMaterialPool();
    }

    /**
     * 注册 Three.js Mesh 对象池
     */
    public registerMeshPool(): void {
        this.register<THREE.Mesh>(
            'mesh',
            () => new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial()),
            (mesh) => {
                // 重置 Mesh 的状态
                mesh.position.set(0, 0, 0);
                mesh.rotation.set(0, 0, 0);
                mesh.scale.set(1, 1, 1);
                mesh.matrix.identity();
            }
        );
    }

    /**
     * 注册 Three.js Material 对象池
     */
    public registerMaterialPool(): void {
        this.register<THREE.Material>(
            'material',
            () => new THREE.MeshBasicMaterial(),
            (material) => {
                // 清理 Material 的资源
                material.dispose();
            }
        );
    }
}