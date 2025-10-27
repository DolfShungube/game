import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Room extends THREE.Group {
    constructor(size = { width: 60, height: 20 }, options = {}) {
        super();
        this.size = size;
        this.options = options;

        this.walls = {};
        this.floor = null;
        this.ceiling = null;
        this.furniture = {};
        this.loader = new GLTFLoader();

        this.generateBaseRoom();
        this.setupFurniture();
    }

    generateBaseRoom() {
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, side: THREE.DoubleSide });
        const wallThickness = 1;
        const wallGeometry = new THREE.BoxGeometry(this.size.width, this.size.height, wallThickness);
        const halfHeight = this.size.height / 2;
        const halfWidth = this.size.width / 2;

        const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
        backWall.position.set(0, halfHeight, -halfWidth + wallThickness / 2);
        this.add(backWall);
        this.walls.back = backWall;

        const frontWall = new THREE.Mesh(wallGeometry, wallMaterial);
        frontWall.position.set(0, halfHeight, halfWidth - wallThickness / 2);
        this.add(frontWall);
        this.walls.front = frontWall;

        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, this.size.height, this.size.width), wallMaterial);
        leftWall.position.set(-halfWidth + wallThickness / 2, halfHeight, 0);
        this.add(leftWall);
        this.walls.left = leftWall;

        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, this.size.height, this.size.width), wallMaterial);
        rightWall.position.set(halfWidth - wallThickness / 2, halfHeight, 0);
        this.add(rightWall);
        this.walls.right = rightWall;

        const floorGeometry = new THREE.PlaneGeometry(this.size.width, this.size.width);
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        this.add(floor);
        this.floor = floor;

        const ceiling = new THREE.Mesh(
            floorGeometry,
            new THREE.MeshStandardMaterial({ color: 0x555555 })
        );
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = this.size.height;
        this.add(ceiling);
        this.ceiling = ceiling;
    }

    async setupFurniture() {
        const furnitureOptions = this.options.furniture || {
            bookshelf: { 
                enabled: true, 
                position: { x: 15, y: 0, z: -25 }, 
                scale: 0.5,
                modelUrl: './models/bookshelf.glb'
            },
            coffeeTable: { 
                enabled: true, 
                position: { x: 15, y: 0, z: 15 }, 
                scale: 0.8,
                modelUrl: './models/coffee_table.glb'
            },
        };

        // Add bookshelf
        if (furnitureOptions.bookshelf?.enabled) {
            try {
                await this.loadBookshelfModel(
                    furnitureOptions.bookshelf.modelUrl,
                    furnitureOptions.bookshelf.position,
                    furnitureOptions.bookshelf.scale
                );
            } catch (error) {
                console.warn('Failed to load bookshelf model, using simple version:', error);
            }
        }

        // Add coffee table
        if (furnitureOptions.coffeeTable?.enabled) {
            try {
                await this.loadCoffeeTableModel(
                    furnitureOptions.coffeeTable.modelUrl,
                    furnitureOptions.coffeeTable.position,
                    furnitureOptions.coffeeTable.scale
                );
            } catch (error) {
                console.warn('Failed to load coffee table model, using simple version:', error);
                
            }
        }
    }


    // Load bookshelf GLTF model
    async loadBookshelfModel(url, position = { x: 0, y: 0, z: 0 }, scale = 1) {
        return new Promise((resolve, reject) => {
            this.loader.load(url, (gltf) => {
                const model = gltf.scene;
                model.position.set(position.x, position.y-0.9, position.z-0.5);
                model.scale.set(scale*2, scale*2, scale*2);
                model.rotation.set( 0, -Math.PI/2, 0);
                
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                this.add(model);
                this.furniture.bookshelf = model;
                resolve(model);
            }, undefined, (error) => {
                console.error('Error loading bookshelf model:', error);
                reject(error);
            });
        });
    }

    // Load coffee table GLTF model
    async loadCoffeeTableModel(url, position = { x: 0, y: 1, z: 0 }, scale = 1) {
        return new Promise((resolve, reject) => {
            this.loader.load(url, (gltf) => {
                const model = gltf.scene;
                model.scale.set(scale*4, scale*4, scale*4);
                model.rotation.set( Math.PI / 2, 0, 0);

                const box = new THREE.Box3().setFromObject(model);
                const size = new THREE.Vector3();
                box.getSize(size);

                const tableHeight = size.y;
                const yPosition = position.y - (tableHeight );
            
                model.position.set(position.x, yPosition, position.z);
                
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                this.add(model);
                this.furniture.coffeeTable = model;
                resolve(model);
            }, undefined, (error) => {
                console.error('Error loading coffee table model:', error);
                reject(error);
            });
        });
    }

  
    setWallTexture(side, texture) {
        if (this.walls[side]) {
            this.walls[side].material.map = texture;
            this.walls[side].material.needsUpdate = true;
        }
    }

    setFloorTexture(texture) {
        if (this.floor) {
            this.floor.material.map = texture;
            this.floor.material.needsUpdate = true;
        }
    }

    setCeilingTexture(texture) {
        if (this.ceiling) {
            this.ceiling.material.map = texture;
            this.ceiling.material.needsUpdate = true;
        }
    }

    addItem(mesh) {
        this.add(mesh);
    }
}