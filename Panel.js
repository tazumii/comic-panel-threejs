import earcut from "earcut";
import * as THREE from "three";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import Polygon from "./polygon";

export default class Panel extends THREE.Object3D {
  constructor(points, inset) {
    super();

    const poly = new Polygon(points);
    const insetPoly = Polygon.inset(poly, inset);
    const geometry = createGeometry(poly, insetPoly);

    const panelGeo = new THREE.BufferGeometry({});
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

    const outerLine = new LineGeometry();
    const innerLine = new LineGeometry();
    outerLine.setPositions(outline(poly.vertices));
    innerLine.setPositions(outline(insetPoly.vertices));

    const lineMat = new LineMaterial({
      color: "black",
      linewidth: 3,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      depthTest: false,
    });

    


  }
}

function createGeometry(polygon, paddingPolygon) {
  const vertices = verticesArray(polygon.vertices, paddingPolygon.vertices);
  const outlineIndices = indicesArray(polygon.vertices);
  const shapeIndices = Polygon.triangulate(paddingPolygon.vertices, null, 3)
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

function outline(vertices) {
  const positions = [];

  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    positions.push(vertex.x, vertex.y, 0);
  }

  if (vertices.length > 0) {
    const firstVertex = vertices[0];
    positions.push(firstVertex.x, firstVertex.y, 0);
  }

  return positions;
}

