import * as THREE from "three";
import { encloseVectors, vectors2Vertices } from "./utils";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { Line2 } from "three/examples/jsm/lines/Line2";

export default class SkeletonLoader extends THREE.Object3D {
  constructor(vectors) {
    super();
    this.vectors = vectors;

    this.group = new THREE.Group();
    this.mesh();
    this.outline();
    this.add(this.group);
  }

  mesh() {
    const uvs = new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0]);

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const fragmentShader = `
      varying vec2 vUv;
      uniform float time;
  
      void main() {
        float scroll = mod(vUv.x - time, 1.0);
        float factor = abs(2.0 * scroll - 1.0);
        float sharpness = 2.0;
        vec3 color = mix(vec3(0.141,0.141,0.141), vec3(0.181,0.181,0.181), pow(factor, sharpness));
        gl_FragColor = vec4(color, 1.0);
      }
  `;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(vectors2Vertices(this.vectors), 3)
    );
    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex([0, 1, 2, 2, 3, 0]);

    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        time: { value: 0 },
      },
    });
    this.object = new THREE.Mesh(geometry, material);

    this.group.add(this.object);
  }

  outline() {
    const outlineGeo = new LineGeometry();
    outlineGeo.setPositions(encloseVectors(this.vectors));

    const outlineMat = new LineMaterial({
      color: "#444444",
      linewidth: 1,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
    });

    const outline = new Line2(outlineGeo, outlineMat);
    this.group.add(outline);
  }

  update(clock) {
    this.object.material.uniforms.time.value = clock.getElapsedTime() * 2.25;
  }
}
