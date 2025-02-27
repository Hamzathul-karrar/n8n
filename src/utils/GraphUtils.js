// Graph traversal and data passing utilities

/**
 * Represents a graph structure for node tracking and data passing
 */
class Graph {
  constructor() {
    this.adjacencyList = new Map();
    this.nodeData = new Map();
  }

  /**
   * Add a node to the graph
   * @param {string} nodeId - The unique identifier of the node
   * @param {Object} data - The data associated with the node
   */
  addNode(nodeId, data = {}) {
    if (!this.adjacencyList.has(nodeId)) {
      this.adjacencyList.set(nodeId, []);
      this.nodeData.set(nodeId, data);
    }
  }

  /**
   * Add a directed edge between nodes
   * @param {string} source - The source node ID
   * @param {string} destination - The destination node ID
   */
  addEdge(source, destination) {
    if (!this.adjacencyList.has(source)) {
      this.addNode(source);
    }
    if (!this.adjacencyList.has(destination)) {
      this.addNode(destination);
    }
    this.adjacencyList.get(source).push(destination);
  }

  /**
   * Find a path between source and destination using BFS
   * @param {string} source - The source node ID
   * @param {string} destination - The destination node ID
   * @returns {string[]|null} - Array of node IDs representing the path, or null if no path exists
   */
  findPath(source, destination) {
    if (!this.adjacencyList.has(source) || !this.adjacencyList.has(destination)) {
      return null;
    }

    const queue = [[source]];
    const visited = new Set();

    while (queue.length > 0) {
      const path = queue.shift();
      const currentNode = path[path.length - 1];

      if (currentNode === destination) {
        return path;
      }

      if (!visited.has(currentNode)) {
        visited.add(currentNode);

        const neighbors = this.adjacencyList.get(currentNode);
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            queue.push([...path, neighbor]);
          }
        }
      }
    }

    return null;
  }

  /**
   * Pass data along a path of nodes
   * @param {string[]} path - Array of node IDs representing the path
   * @param {*} initialData - The data to be passed along the path
   * @param {Function} onDataPass - Callback function called when data passes through each node
   * @returns {Promise<{success: boolean, data: *, path: string[]}>} - Result of data passing
   */
  async passData(path, initialData, onDataPass) {
    if (!path || path.length === 0) {
      return { success: false, data: null, path: [] };
    }

    let currentData = initialData;
    const traversedPath = [];

    for (let i = 0; i < path.length; i++) {
      const currentNode = path[i];
      traversedPath.push(currentNode);

      // Process data at current node
      if (onDataPass) {
        try {
          currentData = await onDataPass(currentNode, currentData, i, path.length);
        } catch (error) {
          console.error(`Error passing data through node ${currentNode}:`, error);
          return {
            success: false,
            data: currentData,
            path: traversedPath,
            error: error.message
          };
        }
      }
    }

    return {
      success: true,
      data: currentData,
      path: traversedPath
    };
  }

  /**
   * Build a graph from an array of edges
   * @param {Array<{source: string, target: string}>} edges - Array of edge objects
   * @returns {Graph} - The constructed graph
   */
  static fromEdges(edges) {
    const graph = new Graph();
    
    edges.forEach(edge => {
      graph.addEdge(edge.source, edge.target);
    });

    return graph;
  }

  /**
   * Validate if a path exists and is valid in the graph
   * @param {string[]} path - Array of node IDs representing the path
   * @returns {boolean} - Whether the path is valid
   */
  isValidPath(path) {
    if (!path || path.length < 2) return false;

    for (let i = 0; i < path.length - 1; i++) {
      const currentNode = path[i];
      const nextNode = path[i + 1];

      if (!this.adjacencyList.has(currentNode)) return false;
      
      const neighbors = this.adjacencyList.get(currentNode);
      if (!neighbors.includes(nextNode)) return false;
    }

    return true;
  }

  /**
   * Get all nodes in the graph
   * @returns {string[]} - Array of node IDs
   */
  getNodes() {
    return Array.from(this.adjacencyList.keys());
  }

  /**
   * Get all edges in the graph
   * @returns {Array<{source: string, target: string}>} - Array of edge objects
   */
  getEdges() {
    const edges = [];
    this.adjacencyList.forEach((destinations, source) => {
      destinations.forEach(target => {
        edges.push({ source, target });
      });
    });
    return edges;
  }
}

export default Graph; 