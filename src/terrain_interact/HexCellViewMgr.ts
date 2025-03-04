import * as THREE from 'three';
import { HexCellView } from './HexCellView';
import { EventManager } from '../utils/EventManager';
import { HexCellData } from '@/terrain/types';
import { MapViewUtils } from '../terrain_view/MapViewUtils';
import { eTerrain } from '@/terrain/enums';
// import { HexCellRenderer } from '../terrain_view/HexCellRenderer';
import { ServiceManager } from '@/utils/ServiceManager';
import { Config } from '@/config';


export class HexCellViewMgr {
    private scene: THREE.Scene;
    private cellViews: Map<string, HexCellView> = new Map();

    // private renderer: HexCellRenderer;

    constructor(scene: THREE.Scene) {
        this.scene = scene;

        // this.renderer = new HexCellRenderer(scene);
    }

    /**
     * 创建六边形网格
     * @returns 六边形网格
     */
    private createHexMesh(q: number, r: number, terrainType: eTerrain): THREE.Mesh {
        const geometry = MapViewUtils.getHexGeometry();
        const material = MapViewUtils.getMaterial(terrainType);
        // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        // const instancedMesh = new THREE.InstancedMesh(geometry, material, 1000); // 1000 个实例
        const mesh = new THREE.Mesh(geometry, material);
        // mesh.renderOrder = 1; // 设置一个较高的渲染顺序
        mesh.name = 'hexcellview';
        mesh.castShadow = false;
        mesh.receiveShadow = false;

        const x = 1.5 * q;
        const z = Math.sqrt(3) * (r + q / 2);
        mesh.position.set(x, 0, z);
        mesh.rotation.y = Math.PI / 2;
        // console.warn('Created Hex Mesh:', mesh); // 打印网格信息
        return mesh;
    }

    // 添加或更新单元格视图
    public addOrUpdateCellView(q: number, r: number, cellData: HexCellData): void {
        const eventManager = ServiceManager.getInstance().getEventManager();
        const key = `${q},${r}`;
        let cellView = this.cellViews.get(key);
        if (!cellView) {
            const mesh = this.createHexMesh(q, r, cellData.terrainType);
            cellView = new HexCellView(q, r, mesh);
            cellView.init(eventManager);
            this.cellViews.set(key, cellView);
            this.scene.add(cellView.mesh);
            console.warn(" scene添加物体！");
        }

        // const color = MapViewUtils.getColor(cellData.terrainType);
        // this.renderer.addCell(q, r, color);
    }


    // 获取单元格视图
    public getCellView(q: number, r: number): HexCellView | undefined {
        return this.cellViews.get(`${q},${r}`);
    }

    // 获取所有单元格视图
    public getAllCellViews(): HexCellView[] {
        return Array.from(this.cellViews.values());
    }

    public getCellViews(): Map<string, HexCellView> {
        return this.cellViews;
    }

    public getAllMeshs(): THREE.Mesh[] {
        return Array.from(this.cellViews.values()).map((cellView: HexCellView) => {
            return cellView.mesh;
        });
        // return this.renderer.getMeshs();
    }

    // 清除所有单元格视图
    public clear(): void {
        this.cellViews.clear();

        // this.renderer.clear();
    }
}