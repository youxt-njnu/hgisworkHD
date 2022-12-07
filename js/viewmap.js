mapboxgl.accessToken =
  "pk.eyJ1IjoibGlua2xpbmsiLCJhIjoiY2t5azNveG05MnRwdTJ4bzhxM2JmNGg3aCJ9.giuzL5T9qkSSl9EWMUK9dg";
const map = new mapboxgl.Map({
  container: "map",
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: "mapbox://styles/mapbox/streets-v11",
  //mapbox://styles/linklink/cl0t7nvvs00jc14qyybip4kkv
  center: [120.3, 30.3],
  zoom: 7,
});

map.on("load", () => {
  map.addSource("wms-source", {
    type: "raster",
    tiles: [
      "http://localhost:8080/geoserver/cite/wms?service=WMS&version=1.1.0&request=GetMap&layers=cite%3Ariver&bbox=2.0353862E7%2C2913237.5%2C2.0383676E7%2C2942737.5&width=768&height=759&srs=EPSG%3A21420&styles=&format=application/openlayers",
    ],
    tileSize: 256,
  });
  map.addLayer(
    {
      id: "wms-layer",
      type: "raster",
      source: "wms-source",
      paint: {
        "raster-opacity": 0.3,
      },
    },
    "aeroway-line"
  );

  map.addSource("places", {
    // This GeoJSON contains features that include an "icon"
    // property. The value of the "icon" property corresponds
    // to an image in the Mapbox Streets style's sprite.
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            description:
              '<img src="img/hangzhou.png" alt="" style="width: 60%;"><br/><span style="font-size: 16px; padding: 10px;"><a href="http://iqh.ruc.edu.cn/zglsdlyj/lsdl_lzjj/gjxt/e8165bd4f0e2406a985c25affab43693.htm">详情</a></span><span style="font-size: 16px; padding: 10px;"><a href="#">收藏</a></span><span style="font-size: 16px; padding: 10px;"><a href="#">共享</a></span>',
            icon: "theatre-15",
          },
          geometry: {
            type: "Point",
            coordinates: [120.2, 30.2],
          },
        },
        {
          type: "Feature",
          properties: {
            description:
              '<img src="img/hangzhou.png" alt="" style="width: 60%;"><br/><span style="font-size: 16px; padding: 10px;"><a href="http://iqh.ruc.edu.cn/zglsdlyj/lsdl_lzjj/gjxt/e8165bd4f0e2406a985c25affab43693.htm">详情</a></span><span style="font-size: 16px; padding: 10px;"><a href="#">收藏</a></span><span style="font-size: 16px; padding: 10px;"><a href="#">共享</a></span>',
            icon: "bar-15",
          },
          geometry: {
            type: "Point",
            coordinates: [120.2, 30.1],
          },
        },
        {
          type: "Feature",
          properties: {
            description:
              '<img src="img/hangzhou.png" alt="" style="width: 60%;"><br/><span style="font-size: 16px; padding: 10px;"><a href="http://iqh.ruc.edu.cn/zglsdlyj/lsdl_lzjj/gjxt/e8165bd4f0e2406a985c25affab43693.htm">详情</a></span><span style="font-size: 16px; padding: 10px;"><a href="#">收藏</a></span><span style="font-size: 16px; padding: 10px;"><a href="#">共享</a></span>',
            icon: "art-gallery-15",
          },
          geometry: {
            type: "Point",
            coordinates: [120.3, 30.3],
          },
        },
        {
          type: "Feature",
          properties: {
            description:
              '<img src="img/hangzhou.png" alt="" style="width: 60%;"><br/><span style="font-size: 16px; padding: 10px;"><a href="http://iqh.ruc.edu.cn/zglsdlyj/lsdl_lzjj/gjxt/e8165bd4f0e2406a985c25affab43693.htm">详情</a></span><span style="font-size: 16px; padding: 10px;"><a href="#">收藏</a></span><span style="font-size: 16px; padding: 10px;"><a href="#">共享</a></span>',
            icon: "bicycle-15",
          },
          geometry: {
            type: "Point",
            coordinates: [120.3, 30.4],
          },
        },
        {
          type: "Feature",
          properties: {
            description:
              '<img src="img/hangzhou.png" alt="" style="width: 60%;"><br/><span style="font-size: 16px; padding: 10px;"><a href="http://iqh.ruc.edu.cn/zglsdlyj/lsdl_lzjj/gjxt/e8165bd4f0e2406a985c25affab43693.htm">详情</a></span><span style="font-size: 16px; padding: 10px;"><a href="#">收藏</a></span><span style="font-size: 16px; padding: 10px;"><a href="#">共享</a></span>',
            icon: "rocket-15",
          },
          geometry: {
            type: "Point",
            coordinates: [120.3, 30.5],
          },
        },
        {
          type: "Feature",
          properties: {
            description:
              '<img src="img/hangzhou.png" alt="" style="width: 60%;"><br/><span style="font-size: 16px; padding: 10px;"><a href="http://iqh.ruc.edu.cn/zglsdlyj/lsdl_lzjj/gjxt/e8165bd4f0e2406a985c25affab43693.htm">详情</a></span><span style="font-size: 16px; padding: 10px;"><a href="#">收藏</a></span><span style="font-size: 16px; padding: 10px;"><a href="#">共享</a></span>',
            icon: "music-15",
          },
          geometry: {
            type: "Point",
            coordinates: [120.4, 30.2],
          },
        },
      ],
    },
  });
  // Add a layer showing the places.
  map.addLayer({
    id: "places",
    type: "symbol",
    source: "places",
    layout: {
      "icon-image": "{icon}",
      "icon-allow-overlap": true,
    },
  });

  // When a click event occurs on a feature in the places layer, open a popup at the
  // location of the feature, with description HTML from its properties.
  map.on("click", "places", (e) => {
    // Copy coordinates array.
    const coordinates = e.features[0].geometry.coordinates.slice();
    const description = e.features[0].properties.description;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup().setLngLat(coordinates).setHTML(description).addTo(map);
  });

  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on("mouseenter", "places", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  // Change it back to a pointer when it leaves.
  map.on("mouseleave", "places", () => {
    map.getCanvas().style.cursor = "";
  });
});

//-----------add map controls----------------------
var nav = new mapboxgl.NavigationControl();
map.addControl(nav, "top-left");
var geolocate = new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true,
  },
  trackUserLocation: true,
});
map.addControl(geolocate);

var scale = new mapboxgl.ScaleControl({
  maxWidth: 80,
  unit: "metric", //meter
});
map.addControl(scale);

var fullScreen = new mapboxgl.FullscreenControl();
map.addControl(fullScreen);
//-----------add map controls----------------------

$(function () {
  $("#btn2").click(function () {
    // $("#myModal").modal({
    //     show:true,
    // });
    $("#myModal2").modal("toggle");
  });

  $("#btn22").click(function () {
    //调用方法
    $("#myModal2").modal("toggle");
  });

  //事件使用 对应组件选择器.on(事件名,事件处理函数)
  $("#myModal2").on("show.bs.modal", function () {
    console.log("调用show执行1");
  });
  $("#myModal2").on("shown.bs.modal", function () {
    console.log("展示之后执行2");
  });
  $("#myModal2").on("hide.bs.modal", function () {
    console.log("调用hide执行1");
  });
  $("#myModal2").on("hidden.bs.modal", function () {
    console.log("完全隐藏之后执行2");
  });
});

function openMenu() {
  console.log("ok");
  const layerList = document.getElementById("menu");
  const inputs = layerList.getElementsByTagName("input");
  layerList.style.display = "inline";
  for (const input of inputs) {
    input.onclick = (layer) => {
      const layerId = layer.target.id;
      map.setStyle("mapbox://styles/mapbox/" + layerId);
    };
  }
}
