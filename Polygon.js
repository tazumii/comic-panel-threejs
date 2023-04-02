import * as THREE from "three";
import earcut from "earcut";

export default class Polygon {
  constructor(vertices) {
    this.vertices = vertices;
    this.edges = [];

    for (let i = 0; i < vertices.length; i++) {
      const vertex1 = vertices[i];
      const vertex2 = vertices[(i + 1) % vertices.length];
      const edge = new Edge(vertex1, vertex2);
      this.edges.push(edge);
    }
  }

  static inset(polygon, inset) {
    const offsetEdges = [];
    for (let i = 0; i < polygon.edges.length; i++) {
      const edge = polygon.edges[i];
      const dx = edge.inwardNormal.x * inset;
      const dy = edge.inwardNormal.y * inset;
      offsetEdges.push(Polygon.createOffsetEdge(edge, dx, dy));
    }

    const vertices = [];
    for (let i = 0; i < offsetEdges.length; i++) {
      const thisEdge = offsetEdges[i];
      const prevEdge =
        offsetEdges[(i + offsetEdges.length - 1) % offsetEdges.length];

      const vertex = Polygon.edgesIntersection(prevEdge, thisEdge);
      if (vertex) vertices.push(vertex);
    }

    return new Polygon(vertices);
  }

  static createOffsetEdge(edge, dx, dy) {
    return new Edge(
      new THREE.Vector2(edge.vertex1.x + dx, edge.vertex1.y + dy),
      new THREE.Vector2(edge.vertex2.x + dx, edge.vertex2.y + dy)
    );
  }

  static edgesIntersection(edgeA, edgeB) {
    var den =
      (edgeB.vertex2.y - edgeB.vertex1.y) *
        (edgeA.vertex2.x - edgeA.vertex1.x) -
      (edgeB.vertex2.x - edgeB.vertex1.x) * (edgeA.vertex2.y - edgeA.vertex1.y);
    if (den == 0) return null;

    var ua =
      ((edgeB.vertex2.x - edgeB.vertex1.x) *
        (edgeA.vertex1.y - edgeB.vertex1.y) -
        (edgeB.vertex2.y - edgeB.vertex1.y) *
          (edgeA.vertex1.x - edgeB.vertex1.x)) /
      den;

    const vertex = new THREE.Vector2(
      edgeA.vertex1.x + ua * (edgeA.vertex2.x - edgeA.vertex1.x),
      edgeA.vertex1.y + ua * (edgeA.vertex2.y - edgeA.vertex1.y)
    );

    return vertex;
  }

  static triangulate(vertices, holes, dim) {
    const array = new Array(vertices.length * 3);

    for (let i = 0; i < vertices.length; i++) {
      const vertex = vertices[i];
      array[i * 3] = vertex.x;
      array[i * 3 + 1] = vertex.y;
      array[i * 3 + 2] = 0;
    }

    return new Uint16Array(earcut(array, holes, dim));
  }
}

class Edge {
  constructor(vertex1, vertex2) {
    this.vertex1 = vertex1;
    this.vertex2 = vertex2;
    this.outwardNormal = Edge.outwardEdgeNormal(vertex1, vertex2);
    this.inwardNormal = Edge.inwardEdgeNormal(vertex1, vertex2);
  }

  static inwardEdgeNormal(vertex1, vertex2) {
    const dx = vertex2.x - vertex1.x;
    const dy = vertex2.y - vertex1.y;
    const edgeLength = Math.sqrt(dx * dx + dy * dy);
    return new THREE.Vector2(-dy / edgeLength, dx / edgeLength);
  }

  static outwardEdgeNormal(vertex1, vertex2) {
    const n = Edge.inwardEdgeNormal(vertex1, vertex2);
    return new THREE.Vector2(-n.x, -n.y);
  }
}
