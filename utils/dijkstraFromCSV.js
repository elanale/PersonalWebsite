import Papa from "papaparse";

export async function loadCSVGraph() {
  const response = await fetch("/graph.csv");
  const text = await response.text();

  return new Promise((resolve) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const graph = {};
        results.data.forEach(({ u, v, length_meters }) => {
          const a = parseInt(u), b = parseInt(v), w = parseFloat(length_meters);
          if (!graph[a]) graph[a] = [];
          if (!graph[b]) graph[b] = [];
          graph[a].push([b, w]);
          graph[b].push([a, w]); // if graph is undirected
        });
        resolve(graph);
      },
    });
  });
}

export function dijkstra(graph, start, end) {
    const dist = {}, prev = {}, visited = new Set();
    for (const node in graph) dist[node] = Infinity;
    dist[start] = 0;
  
    const queue = [start];
  
    while (queue.length) {
      queue.sort((a, b) => dist[a] - dist[b]);
      const u = queue.shift();
      visited.add(u);
  
      if (u == end) break;
  
      for (const [v, w] of graph[u]) {
        if (visited.has(v)) continue;
        const alt = dist[u] + w;
        if (alt < dist[v]) {
          dist[v] = alt;
          prev[v] = u;
          queue.push(v);
        }
      }
    }
  
    const path = [];
    let node = end;
    while (node !== undefined) {
      path.push(node);
      node = prev[node];
    }
    path.reverse();
  
    const segmentDistances = [];
    let totalDistance = 0;
  
    // Calculate the actual segment distances
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i + 1];
      
      // Find the distance between u and v
      let distance = 0;
      const neighbors = graph[u];
      if (neighbors) {
        for (const [neighbor, weight] of neighbors) {
          if (neighbor === v) {
            distance = weight;
            break;
          }
        }
      }
      
      segmentDistances.push({ from: u, to: v, distance });
      totalDistance += distance;
    }
  
    return { path, segmentDistances, totalDistance };
  }