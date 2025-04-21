// Create the intro overlay container
if (typeof window !== 'undefined') {
  document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.createElement("div");
    overlay.id = "introOverlay";
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(15, 32, 39, 0.75)";
    overlay.style.zIndex = "9999";
    overlay.style.color = "#f1f1f1";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.textAlign = "center";
    overlay.style.backdropFilter = "blur(3px)";
    overlay.style.opacity = 1;
    overlay.style.transition = "opacity 0.6s ease";

    const title = document.createElement("h1");
    title.innerText = "Before You Explore";
    title.style.fontSize = "2.5rem";
    title.style.marginBottom = "1rem";

    const message = document.createElement("p");
    message.innerText = "Please agree to our terms before using the application.";
    message.style.fontSize = "1.2rem";
    message.style.maxWidth = "600px";
    message.style.marginBottom = "1.5rem";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "agreeCheckbox";
    checkbox.style.marginTop = "10px";
    checkbox.style.transform = "scale(1.2)";

    const label = document.createElement("label");
    label.htmlFor = "agreeCheckbox";
    label.innerText = " I agree to the Terms & Conditions";
    label.style.marginLeft = "10px";
    label.style.fontSize = "1rem";
    label.style.color = "#f1f1f1";

    const checkboxContainer = document.createElement("div");
    checkboxContainer.style.display = "flex";
    checkboxContainer.style.alignItems = "center";
    checkboxContainer.style.justifyContent = "center";
    checkboxContainer.style.marginBottom = "1.5rem";
    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);

    const button = document.createElement("button");
    button.innerText = "I Understand";
    button.style.marginTop = "10px";
    button.style.padding = "12px 24px";
    button.style.fontSize = "1rem";
    button.style.background = "#00c6ff";
    button.style.border = "none";
    button.style.borderRadius = "6px";
    button.style.color = "black";
    button.style.cursor = "pointer";
    button.disabled = true;
    button.style.opacity = 0.6;

    checkbox.addEventListener("change", () => {
      button.disabled = !checkbox.checked;
      button.style.opacity = checkbox.checked ? 1 : 0.6;
    });

    button.onclick = () => {
      overlay.style.opacity = 0;
      document.body.classList.remove("lock-scroll");
      setTimeout(() => overlay.style.display = "none", 600);
    };

    overlay.appendChild(title);
    overlay.appendChild(message);
    overlay.appendChild(checkboxContainer);
    overlay.appendChild(button);
    document.body.appendChild(overlay);
    document.body.classList.add("lock-scroll");
  });

  const style = document.createElement("style");
  style.textContent = `
    body.lock-scroll {
      overflow: hidden;
    }
  `;
  document.head.appendChild(style);
}

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import axios from "axios";
import { dijkstra } from "../utils/dijkstraFromCSV";



const Map = dynamic(() => import("../components/Map"), { ssr: false });

export default function Home() {
  const [from, setFrom] = useState("University of Florida");
  const [to, setTo] = useState("Marston Science Library");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [path, setPath] = useState([]);
  const [segmentDistances, setSegmentDistances] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);

  useEffect(() => {
    if (path.length > 1 && step === 0 && !playing) {
      handlePlay();
    }
  }, [path]);

  const handlePlay = () => {
    if (playing || path.length === 0) return;
    setPlaying(true);
    let i = step;
    const interval = setInterval(() => {
      if (i >= path.length - 1) {
        clearInterval(interval);
        setPlaying(false);
        return;
      }
      i++;
      setStep(i);
    }, 500);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleNext = () => {
    if (step < path.length - 1) setStep(step + 1);
  };

  const geocode = async (query) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    const res = await axios.get(url, { headers: { 'Accept-Language': 'en' } });
    if (res.data.length === 0) throw new Error("Address not found");
    return [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)];
  };

  const handleFindPath = async () => {
    try {
      const fromCoords = await geocode(from);
      const toCoords = await geocode(to);
  
      const [graphRes, coordsRes] = await Promise.all([
        fetch("/graph.csv").then(r => r.text()),
        fetch("/node_coords.json").then(r => r.json()),
      ]);
  
      const graph = {};
      const lines = graphRes.trim().split("\n").slice(1);
      for (let line of lines) {
        const [rawU, rawV, rawDist] = line.split(",").map(x => x.trim());
        const u = rawU.toString();
        const v = rawV.toString();
        const dist = parseFloat(rawDist);
        
        if (isNaN(dist)) continue; // Skip if distance is not a valid number
        
        if (!graph[u]) graph[u] = [];
        if (!graph[v]) graph[v] = [];
        graph[u].push([v, dist]);
        graph[v].push([u, dist]);
      }
  
      const findNearestNodeInGraph = (lat, lon, coords, graph) => {
        let closestId = null;
        let minDist = Infinity;
        for (const [rawId, coord] of Object.entries(coords)) {
          const id = rawId.toString();
          if (!Array.isArray(coord) || coord.length !== 2) continue;
          if (!graph[id]) continue;
          const [nodeLon, nodeLat] = coord;
          if (typeof nodeLat !== "number" || typeof nodeLon !== "number") continue;
          const dLat = lat - nodeLat;
          const dLon = lon - nodeLon;
          const dist = dLat * dLat + dLon * dLon;
          if (dist < minDist) {
            minDist = dist;
            closestId = id;
          }
        }
        return closestId;
      };
  
      const startNode = findNearestNodeInGraph(fromCoords[0], fromCoords[1], coordsRes, graph);
      const endNode = findNearestNodeInGraph(toCoords[0], toCoords[1], coordsRes, graph);
  
      if (!startNode || !graph[startNode]) throw new Error(`Start node ${startNode} not found in graph`);
      if (!endNode || !graph[endNode]) throw new Error(`End node ${endNode} not found in graph`);
  
      const { path: nodePath, segmentDistances, totalDistance } = dijkstra(graph, startNode, endNode);
      
      // Convert node IDs to coordinates for the path
      const realCoords = nodePath
        .filter((id) => coordsRes[id] && coordsRes[id].length === 2)
        .map((id) => {
          const [lon, lat] = coordsRes[id];
          return [lat, lon];
        });
  
      // Make sure segment distances have proper coordinate conversions and preserve distance values
      const mappedSegmentDistances = segmentDistances.map(seg => {
        // Make sure we're using string keys to access coordsRes
        const fromId = seg.from.toString();
        const toId = seg.to.toString();
        
        return {
          from: coordsRes[fromId] ? [coordsRes[fromId][1], coordsRes[fromId][0]] : [0, 0],
          to: coordsRes[toId] ? [coordsRes[toId][1], coordsRes[toId][0]] : [0, 0],
          distance: seg.distance
        };
      });
  
      setPath(realCoords);
      setSegmentDistances(mappedSegmentDistances);
      setTotalDistance(totalDistance);
      setStep(0);
      
    } catch (err) {
      alert("Error: " + err.message);
      console.error(err);
    }
  };

  return (
    <main className="h-screen w-screen relative">
      <Map path={path.slice(0, step + 1)} segmentDistances={segmentDistances.slice(0, step)} />
      <div className="controls absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white p-4 rounded-xl flex flex-col gap-3 w-[90%] max-w-xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="From address"
            className="flex-1 p-2 rounded bg-black border border-gray-700"
          />
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="To address"
            className="flex-1 p-2 rounded bg-black border border-gray-700"
          />
          <button className="px-4 py-2 border rounded" onClick={handleFindPath}>Find Path</button>
        </div>
        <div className="text-center text-sm text-gray-300">
        Total Distance: {(totalDistance * 0.000621371).toFixed(1)} miles

        </div>
        <div className="flex justify-center gap-4">
          <button className="px-3 py-1 rounded border" onClick={handleBack} disabled={step === 0 || path.length === 0}>Back</button>
          <button className="px-3 py-1 rounded border" onClick={handlePlay} disabled={playing || path.length === 0}>Play</button>
          <button className="px-3 py-1 rounded border" onClick={handleNext} disabled={step >= path.length - 1 || path.length === 0}>Next</button>
        </div>
      </div>
    </main>
  );
}
