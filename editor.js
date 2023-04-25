import * as THREE from "three";
import { GUI } from "dat.gui";
import SkeletonLoader from "./skeletonLoader";

let camera, scene, container, renderer, clock;
camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.setZ(5);

scene = new THREE.Scene();

container = document.getElementById("container");
renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.LinearEncoding;
container.appendChild(renderer.domElement);

clock = new THREE.Clock();

const objects = [];
var object4 = {
  CreatePanel: function () {
    const v1 = new THREE.Vector2(-1, -1);
    const v2 = new THREE.Vector2(1, -1);
    const v3 = new THREE.Vector2(1, 1);
    const v4 = new THREE.Vector2(-1, 1);
    const points = [v1, v2, v3, v4];
    const skel = new SkeletonLoader(points);
    scene.add(skel);
    objects.push(skel);
  },
};

var object5 = {
  Test: function () {
    const v1 = new THREE.Vector2(-2, -1);
    const v2 = new THREE.Vector2(1, -1);
    const v3 = new THREE.Vector2(1, 1);
    const v4 = new THREE.Vector2(-1, 1);
    const points = [v1, v2, v3, v4];
    console.log( objects[0])
  },
};

const gui = new GUI();
const cubeFolder = gui.addFolder("Cube");
cubeFolder.add(object4, "CreatePanel");
cubeFolder.open();

let currentFolder = null;

function isChildOfDatGUI(element) {
  while (element.parentElement) {
    if (element.classList.contains("dg")) {
      return true;
    }
    element = element.parentElement;
  }
  return false;
}
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
window.addEventListener("mousedown", (event) => {
  if (isChildOfDatGUI(event.target)) {
    return;
  }
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;

    if (currentFolder) {
      gui.removeFolder(currentFolder);
    }

    currentFolder = gui.addFolder(`Panel`);
    console.log(clickedObject);
    currentFolder
      .add(clickedObject.parent.position, "x", -3, 3)
      .name("Position X");
    currentFolder
      .add(clickedObject.parent.position, "y", -3, 3)
      .name("Position Y");
      currentFolder.add(object5, 'Test').name("teees");
    currentFolder.open();
  } else {
    if (currentFolder) {
      gui.removeFolder(currentFolder);
      currentFolder = null;
    }
  }
});

function animate() {
  requestAnimationFrame(animate);

  objects.forEach((skel) => {
    skel.update(clock);
  });

  renderer.render(scene, camera);
}
animate();
