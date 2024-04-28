import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import React, { MutableRefObject, useEffect, useMemo, useRef } from "react";
import { useGeographic } from "ol/proj";

import "ol/ol.css";
import { useVehicleLayer } from "./useVehicleLayer";

import "./app.css";
import { Draw } from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Circle as CircleStyle, Fill, Icon, Stroke, Style } from "ol/style";
import { Circle, Point } from "ol/geom";
import { MapboxVectorLayer } from "ol-mapbox-style";

useGeographic();

const openStreetMapLayer = new TileLayer({ source: new OSM() });
const vectorTileLayer = new MapboxVectorLayer({
  styleUrl: "mapbox://styles/mapbox/dark-v9",
  accessToken:
    "pk.eyJ1IjoiYWRtaW5kYXZpZCIsImEiOiJjbHZqZWhlcjUxa2NvMnFwZXRhbTdrM3A4In0.eK-JWXHHH5VHtEyirzOmtw",
});

const map = new Map({
  view: new View({ center: [9.5, 59.5], zoom: 8.2 }),
});

const drawingSource = new VectorSource();
const drawingLayer = new VectorLayer({
  source: drawingSource,
});

const trainStationStyle = [
  new Style({
    image: new CircleStyle({
      fill: new Fill({ color: "lightgray" }),
      stroke: new Stroke({ color: "black", width: 2 }),
      radius: 20,
    }),
  }),
  new Style({
    image: new Icon({ src: "icons/subway.svg" }),
  }),
];

const ferryStyle = [
  new Style({
    image: new CircleStyle({
      fill: new Fill({ color: "lightblue" }),
      stroke: new Stroke({ color: "black", width: 2 }),
      radius: 20,
    }),
  }),
  new Style({
    image: new Icon({ src: "icons/directions_boat.svg" }),
  }),
];

const highlightedVehicleStyle = new Style({
  image: new CircleStyle({
    radius: 5,
    stroke: new Stroke({ color: "red" }),
  }),
});

export function MapApplication() {
  const { vehicleLayer, vehicleTrailLayer } = useVehicleLayer();
  const layers = useMemo(
    () => [vectorTileLayer, vehicleTrailLayer, vehicleLayer, drawingLayer],
    [vehicleLayer, vehicleLayer],
  );
  useEffect(() => map.setLayers(layers), [layers]);

  const mapRef = useRef() as MutableRefObject<HTMLDivElement>;
  useEffect(() => {
    map.setTarget(mapRef.current);
  }, []);

  function handleClickAddStation() {
    const draw = new Draw({ type: "Point", source: drawingSource });
    map.addInteraction(draw);
    drawingSource.once("addfeature", (event) => {
      map.removeInteraction(draw);
      event.feature?.setStyle(trainStationStyle);
    });
  }

  function handleClickAddFerry() {
    const draw = new Draw({ type: "Point", source: drawingSource });
    map.addInteraction(draw);
    drawingSource.once("addfeature", (event) => {
      map.removeInteraction(draw);
      event.feature?.setStyle(ferryStyle);
    });
  }

  function handleClickAddCircle() {
    const draw = new Draw({ type: "Circle", source: drawingSource });
    map.addInteraction(draw);
    drawingSource.once("addfeature", (event) => {
      map.removeInteraction(draw);
      const circle = event.feature!.getGeometry() as Circle;
      const center = circle.getCenter();
      const radius = circle.getRadius();
      const coordinates = circle.getCoordinates();

      const extent = circle.getExtent();

      const features =
        vehicleLayer
          .getSource()
          ?.getFeaturesInExtent(extent)
          .filter((f) =>
            circle.intersectsCoordinate(
              (f.getGeometry() as Point).getCoordinates(),
            ),
          )
          .map((feature) => feature.getProperties().routeId) || [];
      console.log({ center, radius, coordinates, extent, features });

      for (const feature of features) {
        //feature.setStyle(highlightedVehicleStyle);
      }
    });
  }

  return (
    <>
      <header>
        <button onClick={handleClickAddStation}>Add train station</button>
        <button onClick={handleClickAddFerry}>Add ferry</button>
        <button onClick={handleClickAddCircle}>Add circle</button>
      </header>
      <div ref={mapRef}></div>
    </>
  );
}
