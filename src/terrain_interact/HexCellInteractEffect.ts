import * as THREE from 'three';

export class HexCellInteractEffect {
    private mesh?: THREE.Mesh; // 六边形网格
    private border?: THREE.LineSegments; // 边框
    private overlay?: THREE.Mesh; // 颜色叠加
    private originalScale?: THREE.Vector3; // 原始缩放值
    private selectBorder?: THREE.LineSegments; // 选中边框
    private selectOverlay?: THREE.Mesh; // 选中叠加

    private particles?: THREE.Points; // 粒子效果
    private particleGeometry?: THREE.BufferGeometry; // 粒子几何体
    private particleMaterial?: THREE.PointsMaterial; // 粒子材质
    private isSelected: boolean = false; // 是否选中
    private hoverColor: THREE.Color = new THREE.Color(0xffa500); // 悬停颜色（橙色）
    private selectColor: THREE.Color = new THREE.Color(0xff0000); // 选中颜色（红色）
    private time: number = 0; // 用于动画的时间变量
    private particleLifetime: number = 0; // 每个粒子的生命周期
    private isParticleActive: boolean = false; // 粒子效果是否激活
    private readonly particleCount: number = 20;

    private static readonly HOVER_SCALE: number = 0.8;
    private static readonly SELECT_SCALE: number = 0.6;

    private static COUNT: number = 0;

    public useID: string = "";

    constructor() {
        console.warn(`HexCellInteractEffect constructor ${HexCellInteractEffect.COUNT++}`);
    }

    /**
     * 销毁 hover 效果
     */
    public dispose(): void {
        if (!this.mesh)
            return;
        if (this.border) {
            this.mesh.remove(this.border);
            this.border = undefined;
        }
        if (this.overlay) {
            this.mesh.remove(this.overlay);
            this.overlay = undefined;
        }
        if (this.selectBorder) {
            this.mesh.remove(this.selectBorder);
            this.selectBorder = undefined;
        }
        if (this.selectOverlay) {
            this.mesh.remove(this.selectOverlay);
            this.selectOverlay = undefined;
        }
        if (this.particles) {
            this.mesh.remove(this.particles);
            this.particles = undefined;
        }
        this.mesh = null!;
    }

    public init(mesh: THREE.Mesh) {
        this.mesh = mesh;
        this.originalScale = mesh.scale.clone(); // 保存原始缩放值
        this._createBorder();
        this._createOverlay();
        this._createSelectBorder();
        this._createSelectOverlay();
        this._createParticles();
    }

    public reset(): void {
        this.isSelected = false;
        this.isParticleActive = false;
        this.time = 0;
        this.particleLifetime = 0;
        this.hideHover();
        this.hideSelect();
    }

    public update(deltaTime: number): void {
        if (!this.mesh) return;

        this.time += deltaTime;

        // 边框颜色动态变化
        if (this.selectBorder && this.selectBorder.material instanceof THREE.LineBasicMaterial) {
            const colorValue = Math.sin(this.time * 2) * 0.5 + 0.5; // 正弦波变化
            this.selectBorder.material.color.setHSL(colorValue, 1, 0.5); // 颜色渐变
        }

        // 粒子扩散效果
        if (this.isParticleActive && this.particles && this.particleGeometry) {
            // 粒子扩散效果
            const positions = this.particleGeometry.attributes.position.array as Float32Array;
            for (let i = 0; i < positions.length; i += 3) {
                if (this.particleLifetime > 2) {
                    // 重置粒子位置和生命周期
                    positions[i] = 0;
                    positions[i + 1] = 0;
                    positions[i + 2] = 0;
                    this.particleLifetime = 0;
                } else {
                    // 粒子向外扩散
                    const speed = 2; // 扩散速度
                    positions[i] += (Math.random() - 0.5) * speed * deltaTime;
                    positions[i + 1] += (Math.random() - 0.5) * speed * deltaTime;
                    positions[i + 2] += (Math.random() - 0.5) * speed * deltaTime;
                    this.particleLifetime += deltaTime;
                }
            }
            this.particleGeometry.attributes.position.needsUpdate = true;
        }
    }



    public showHover(): void {
        if (!this.mesh) return;

        if (this.overlay) this.overlay.visible = true;
        if (this.border) this.border.visible = true;
        this.mesh.scale.set(HexCellInteractEffect.HOVER_SCALE, HexCellInteractEffect.HOVER_SCALE, HexCellInteractEffect.HOVER_SCALE);
    }

    public hideHover(): void {
        if (!this.mesh) return;

        if (this.overlay) this.overlay.visible = false;
        if (this.border) this.border.visible = false;
        this.mesh.scale.copy(this.originalScale || new THREE.Vector3(1, 1, 1)); // 恢复原始大小
    }

    public showSelect(): void {
        if (!this.mesh) return;

        this.isSelected = true;
        if (this.selectBorder) this.selectBorder.visible = true;
        if (this.selectOverlay) this.selectOverlay.visible = true;
        if (this.particles) {
            this.particles.visible = true;
            this.isParticleActive = true; // 激活粒子效果
            // 重置粒子位置和生命周期
            if (this.particleGeometry) {
                const positions = this.particleGeometry.attributes.position.array as Float32Array;
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i] = 0; // 重置到中心
                    positions[i + 1] = 0;
                    positions[i + 2] = 0;
                }
                this.particleGeometry.attributes.position.needsUpdate = true;
                this.particleLifetime = 0; // 重置生命周期
            }
        }
        this.mesh.scale.set(HexCellInteractEffect.SELECT_SCALE, HexCellInteractEffect.SELECT_SCALE, HexCellInteractEffect.SELECT_SCALE);
    }

    public hideSelect(): void {
        if (!this.mesh) return;

        this.isSelected = false;
        if (this.selectBorder) this.selectBorder.visible = false;
        if (this.selectOverlay) this.selectOverlay.visible = false;
        if (this.particles) {
            this.particles.visible = false;
            this.isParticleActive = false; // 停止粒子效果
        }
        this.mesh.scale.copy(this.originalScale || new THREE.Vector3(1, 1, 1)); // 恢复原始大小
    }



    private _createBorder(): void {
        if (!this.mesh)
            return;
        if (!this.border) {
            const edges = new THREE.EdgesGeometry(this.mesh.geometry);
            const borderMaterial = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 2 }); // 黄色边框
            this.border = new THREE.LineSegments(edges, borderMaterial);
            //避免干扰
            this.border.castShadow = false;
            this.border.receiveShadow = false;
            this.border.raycast = () => null;
            //尽量让 border 节省性能
            this.border.name = 'border';
            this.border.matrixAutoUpdate = false;
            this.border.updateMatrix();
            this.border.visible = false;
            this.mesh.add(this.border);
        }
        else {
            this.mesh.add(this.border);
            this.border.position.copy(this.mesh.position);
        }
    }

    private _createOverlay(): void {
        if (!this.mesh)
            return;
        if (!this.overlay) {
            const overlayGeometry = this.mesh.geometry.clone();
            const overlayMaterial = new THREE.MeshBasicMaterial({ color: this.hoverColor, transparent: true, opacity: 0.5 }); // 白色半透明
            this.overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
            //避免干扰
            this.overlay.castShadow = false;
            this.overlay.receiveShadow = false;
            this.overlay.raycast = () => null;
            //尽量让 overlay 节省性能
            this.overlay.name = 'overlay';
            this.overlay.matrixAutoUpdate = false;
            this.overlay.updateMatrix();
            this.overlay.visible = false;
            this.mesh.add(this.overlay);

        }
        else {
            this.mesh.add(this.overlay);
            this.overlay.position.copy(this.mesh.position);
        }
    }

    private _createSelectBorder(): void {
        if (!this.mesh)
            return;
        if (!this.selectBorder) {
            const edges = new THREE.EdgesGeometry(this.mesh.geometry);
            const borderMaterial = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 2 }); // 黄色边框
            this.selectBorder = new THREE.LineSegments(edges, borderMaterial);
            //避免干扰
            this.selectBorder.castShadow = false;
            this.selectBorder.receiveShadow = false;
            this.selectBorder.raycast = () => null;
            //尽量让 selectBorder 节省性能
            this.selectBorder.name = 'selectBorder';
            this.selectBorder.matrixAutoUpdate = false;
            this.selectBorder.updateMatrix();
            this.selectBorder.visible = false;
            this.mesh.add(this.selectBorder);
        }
        else {
            this.mesh.add(this.selectBorder);
            this.selectBorder.position.copy(this.mesh.position);
        }
    }

    private _createSelectOverlay(): void {
        if (!this.mesh)
            return;
        if (!this.selectOverlay) {
            const selectOverlayGeometry = this.mesh.geometry.clone();
            const selectOverlayMaterial = new THREE.MeshBasicMaterial({ color: this.selectColor, transparent: true, opacity: 0.9 });
            this.selectOverlay = new THREE.Mesh(selectOverlayGeometry, selectOverlayMaterial);
            //避免干扰
            this.selectOverlay.castShadow = false;
            this.selectOverlay.receiveShadow = false;
            this.selectOverlay.raycast = () => null;
            //尽量让 selectOverlay 节省性能
            this.selectOverlay.name = 'selectOverlay';
            this.selectOverlay.matrixAutoUpdate = false;
            this.selectOverlay.updateMatrix();
            this.selectOverlay.visible = false;
            this.mesh.add(this.selectOverlay);
        }
        else {
            this.mesh.add(this.selectOverlay);
            this.selectOverlay.position.copy(this.mesh.position);
        }
    }

    private _createParticles(): void {
        if (!this.mesh)
            return;
        if (!this.particles) {
            const positions = new Float32Array(this.particleCount * 3);
            for (let i = 0; i < this.particleCount; i++) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                const radius = Math.random() * 1.5;
                positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
                positions[i * 3 + 1] = Math.cos(phi) * radius;
                positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius;
            }

            this.particleGeometry = new THREE.BufferGeometry();
            this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            this.particleMaterial = new THREE.PointsMaterial({
                color: 0xffffff,
                size: 0.1,
                transparent: true,
                opacity: 0.8,
            });
            this.particles = new THREE.Points(this.particleGeometry, this.particleMaterial);
            //避免干扰
            this.particles.castShadow = false;
            this.particles.receiveShadow = false;
            this.particles.raycast = () => null;
            this.particles.visible = false;
            this.mesh.add(this.particles);
        }
        else {
            this.mesh.add(this.particles);
        }
    }


}