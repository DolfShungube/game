import * as THREE from 'three';

export function createTable(){

  const loader = new THREE.TextureLoader();
  const woodTexture = loader.load('../src/textures/wood.jpg'); 
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(2, 2);
  woodTexture.anisotropy = 16;

  // 1. defining the material with texture
  const woodMaterial = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.8,
    metalness: 0.0,
  });

  // 2. group container
  const tableGroup = new THREE.Group();

  // Dimensions
  const tableHeight = 3.0; 
  const tabletopThickness = 0.1;
  const NEW_LEG_HEIGHT = tableHeight - tabletopThickness;
  const legWidth = 0.1;
  const tabletopWidth = 8;
  const tabletopDepth = 4;

  // 3. Tabletop
  const tabletopGeometry = new THREE.BoxGeometry(tabletopWidth, tabletopThickness, tabletopDepth);
  const tabletop = new THREE.Mesh(tabletopGeometry, woodMaterial);
  tabletop.position.y = tableHeight - (tabletopThickness / 2); 
  tableGroup.add(tabletop);

  // 4. Legs
  const legGeometry = new THREE.BoxGeometry(legWidth, NEW_LEG_HEIGHT, legWidth);
  const legOffsetY = NEW_LEG_HEIGHT / 2;
  const legOffsetX = (tabletopWidth / 2) - (legWidth * 2);
  const legOffsetZ = (tabletopDepth / 2) - (legWidth * 2);

  const legPositions = [
    [ legOffsetX, legOffsetY,  legOffsetZ],
    [-legOffsetX, legOffsetY,  legOffsetZ],
    [ legOffsetX, legOffsetY, -legOffsetZ],
    [-legOffsetX, legOffsetY, -legOffsetZ]
  ];

  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, woodMaterial);
    leg.position.set(pos[0], pos[1], pos[2]);
    tableGroup.add(leg);
  });

  tableGroup.position.set(-34.0, 0, -36.0);
  return tableGroup;
}
