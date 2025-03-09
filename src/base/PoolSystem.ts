
//#ignore_export
import * as THREE from 'three';



type Constructor<T> = new (...args: any[]) => T;
type ResetFn<T> = (obj: T) => void;
type CreateFn<T> = () => T;

export class PoolSystem {
    private pools: Map<string, { pool: any[]; create: CreateFn<any>; reset?: ResetFn<any> }>;

    constructor() {
        this.pools = new Map();
    }

    /**
     * 注册一个对象池
     * @param type 对象类型标识（如 "mesh"）
     * @param createFn 对象创建函数
     * @param resetFn 对象重置函数（可选）
     */
    public register<T>(type: string, createFn: CreateFn<T>, resetFn?: ResetFn<T>): void {
        this.pools.set(type, {
            pool: [],
            create: createFn,
            reset: resetFn,
        });
    }

    /**
     * 从对象池中获取一个对象
     * @param type 对象类型标识
     * @returns 对象实例
     */
    public acquire<T>(type: string): T {
        const poolData = this.pools.get(type);
        if (!poolData) {
            throw new Error(`Pool for type "${type}" not found.`);
        }

        const { pool, create } = poolData;
        if (pool.length > 0) {
            return pool.pop();
        }
        return create();
    }

    /**
     * 将对象归还到对象池
     * @param type 对象类型标识
     * @param obj 对象实例
     */
    public release<T>(type: string, obj: T): void {
        const poolData = this.pools.get(type);
        if (!poolData) {
            throw new Error(`Pool for type "${type}" not found.`);
        }

        const { pool, reset } = poolData;
        if (reset) {
            reset(obj);
        }
        pool.push(obj);
    }

    /**
     * 清空指定类型的对象池
     * @param type 对象类型标识
     */
    public clear(type: string): void {
        const poolData = this.pools.get(type);
        if (poolData) {
            poolData.pool = [];
        }
    }

    /**
     * 销毁整个对象池系统
     */
    public destroy(): void {
        this.pools.clear();
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