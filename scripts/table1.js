import * as THREE from "three";

export class table1 extends THREE.Group{

constructor(){
    super();

}


createTable(){
  //1 . defining the materials
  const woodMaterial = new THREE.MeshPhongMaterial({
     color: 0x8B4513 ,
     specular: 0x111111,
      shininess: 50 
    });

    //2 group container for the table so I can move it around and add legs and top to it
    const tableGroup  = new THREE.Group();

    //Dimensions: Tabletop (2m x 0.1m x 1m), Legs (0.1m x 0.9m x 0.1m)
    const tableHeight = 3.0; 
    const tabletopThickness = 0.1;
    const NEW_LEG_HEIGHT = tableHeight - tabletopThickness;
    const legHeight = 0.9;
    const legWidth = 0.1

    // NEW TABLETOP DIMENSIONS
    const tabletopWidth = 8;
    const tabletopDepth = 4;

    //3. creating the tabletop
    const tabletopGeometry = new THREE.BoxGeometry(tabletopWidth,tabletopThickness, tabletopDepth);
    const tabletop = new THREE.Mesh(tabletopGeometry, woodMaterial);

    //4.Positioning the table top so its on top of the legs
    tabletop.position.y = tableHeight - (tabletopThickness / 2); 
    tableGroup.add(tabletop);

    // 5.Creating the four legs
    const legGeometry = new THREE.BoxGeometry(legWidth, NEW_LEG_HEIGHT, legWidth);
    const legOffsetY = NEW_LEG_HEIGHT  / 2;
    const legOffsetX = (tabletopWidth / 2) - (legWidth * 2); // (8 / 2) - 0.2 = 3.8
    const legOffsetZ = (tabletopDepth / 2) - (legWidth * 2); // (4 / 2) - 0.2 = 1.8

    const legPositions = [
      [ legOffsetX, legOffsetY,  legOffsetZ], // Front-Right
      [-legOffsetX, legOffsetY,  legOffsetZ], // Front-Left
      [ legOffsetX, legOffsetY, -legOffsetZ], // Back-Right
      [-legOffsetX, legOffsetY, -legOffsetZ]  // Back-Left
    ];

     legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, woodMaterial);
        leg.position.set(pos[0], pos[1], pos[2]);
        tableGroup.add(leg);
    });

    //this adds the shadow to the table so we can uncomment it later for better visual
    //tableGroup.children.forEach(mesh => {
        //mesh.castShadow = true;
        //mesh.receiveShadow = true;
    //});

    return tableGroup;

}




}





