import * as THREE from "three";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import Polygon from "./polygon";
import { encloseVectors } from "./utils";

export default class Panel extends THREE.Object3D {
  constructor(points, inset) {
    super();

    const poly = new Polygon(points);
    const insetPoly = Polygon.inset(poly, inset);
    const geometry = createGeometry(poly, insetPoly);

    const panelGeo = new THREE.BufferGeometry();
    panelGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(geometry.vertices, 3)
    );
    panelGeo.setIndex(new THREE.BufferAttribute(geometry.indices, 1));
    panelGeo.addGroup(0, geometry.outlineIndices.length, 0);
    panelGeo.addGroup(
      geometry.outlineIndices.length,
      geometry.shapeIndices.length,
      1
    );

    const panelMats = [
      new THREE.MeshBasicMaterial({ color: "white" }),
      new THREE.MeshBasicMaterial({
        color: "#020202",
        depthWrite: false,
        stencilWrite: true,
        stencilRef: 1,
        stencilFunc: THREE.AlwaysStencilFunc,
        stencilZPass: THREE.ReplaceStencilOp,
      }),
    ];

    const panelMesh = new THREE.Mesh(panelGeo, panelMats);

    this.add(panelMesh);

    const outerLineGeo = new LineGeometry();
    const innerLineGeo = new LineGeometry();
    outerLineGeo.setPositions(encloseVectors(poly.vertices));
    innerLineGeo.setPositions(encloseVectors(insetPoly.vertices));

    const lineMat = new LineMaterial({
      color: "black",
      linewidth: 3,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      depthTest: false,
    });

    const outerLine = new Line2(outerLineGeo, lineMat);
    const innerLine = new Line2(innerLineGeo, lineMat);


    const outlines = new THREE.Group();
    outlines.add(outerLine);
    outlines.add(innerLine);
    outlines.renderOrder = 2;

    this.add(outlines)
  }
}

function createGeometry(polygon, paddingPolygon) {
  const vertices = verticesArray(polygon.vertices, paddingPolygon.vertices);
  const outlineIndices = indicesArray(polygon.vertices);
  const shapeIndices = Polygon.triangulate(paddingPolygon.vertices, null, 3);
  for (let i = 0; i < shapeIndices.length; i++) {
    shapeIndices[i] = shapeIndices[i] * 2 + 1;
  }

  const indices = new Uint16Array(outlineIndices.length + shapeIndices.length);
  indices.set(outlineIndices);
  indices.set(shapeIndices, outlineIndices.length);

  const geometry = {
    vertices,
    indices,
    outlineIndices,
    shapeIndices,
  };

  return geometry;
}

function verticesArray(points, offsetPoints) {
  const n = points.length * 2;
  const array = new Float32Array(n * 3);

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const inset = offsetPoints[i];

    array.set([point.x, point.y, 0], i * 6);
    array.set([inset.x, inset.y, 0], i * 6 + 3);
  }
  return array;
}

function indicesArray(vertices) {
  const n = vertices.length;
  const indices = new Uint16Array(n * 6);

  for (let i = 0; i < n; i++) {
    const point1 = i * 2;
    const point2 = (i * 2 + 2) % (n * 2);
    const insetPoint1 = i * 2 + 1;
    const insetPoint2 = (i * 2 + 3) % (n * 2);

    indices.set([point1, point2, insetPoint1], i * 6);
    indices.set([insetPoint1, point2, insetPoint2], i * 6 + 3);
  }

  return indices;
}
