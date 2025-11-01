import * as THREE from 'three';

export class TallyMarks {
  createTallyMarks(position, rotationY, count = 5) {
    const group = new THREE.Group();
    const markMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const markGeometry = new THREE.BoxGeometry(0.15, 1.5, 0.05);
    const spacing = 0.4;

    const numVertical = Math.min(count, 4);
    for (let i = 0; i < numVertical; i++) {
      const mark = new THREE.Mesh(markGeometry, markMaterial);
      mark.position.set(i * spacing, 0, 0);
      group.add(mark);
    }

    if (count === 5) {
      const slash = new THREE.Mesh(markGeometry, markMaterial);
      slash.scale.set(1.6, 1.2, 1);
      slash.rotation.z = -Math.PI / 4;
      slash.position.set(spacing * 1.6, 0, 0.05);
      group.add(slash);
    }

    group.position.set(position.x, position.y, position.z);
    group.rotation.y = rotationY;

    return group;
  }
}