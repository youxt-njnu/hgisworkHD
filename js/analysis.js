// properties: {
//   description:
//     '<img src="img/hangzhou.png" alt="" style="width: 60%;"><br/><span style="font-size: 16px; padding: 10px;"><a href="http://iqh.ruc.edu.cn/zglsdlyj/lsdl_lzjj/gjxt/e8165bd4f0e2406a985c25affab43693.htm">详情</a></span><span style="font-size: 16px; padding: 10px;"><a href="#">收藏</a></span><span style="font-size: 16px; padding: 10px;"><a href="#">共享</a></span>',
//   icon: "theatre-15",
// }
var valueFromPageA = decodeURI(window.location.search);
console.log("valueFromPageA: " + valueFromPageA);
var reg = valueFromPageA.split("=");
// console.log(reg[1]);
var chosedText = reg[1].trim();

//页面
var view = new ol.View({
  // 设置中心点坐标，因为加载的腾讯瓦片地图的坐标系是墨卡托投影坐标系（'EPSG:3857'），所以要对经纬度坐标点进行投影，ol.proj.transform既是openlayer自带的坐标系转换函数，支持WGS84和墨卡托投影的互换。
  center: ol.proj.transform([104, 30.6], "EPSG:4326", "EPSG:3857"),
  // 比例尺级数为9
  zoom: 11,
});

// //----------geoserver发布的WTMS底图,其实数据源是4326坐标系的，但是geoserver会适配前端的坐标系。
// var topiclayer = new ol.layer.Image({
//   title: "land84",
//   source: new ol.source.ImageWMS({
//     ratio: 1,
//     url: "http://localhost:8080/geoserver/cite/wms?", //这个可以打开geoserver的preview，看openlayer页面截取url
//     // 请求参数
//     params: {
//       SERVICE: "WMS",
//       VERSION: "1.1.1",
//       REQUEST: "GetMap",
//       FORMAT: "image/png",
//       TRANSPARENT: true,
//       tiled: true,
//       LAYERS: "cite:land84", //图层，前面是工作空间，后面是图层名，
//       exceptions: "application/vnd.ogc.se_inimage",
//       singleTile: true, //单瓦片，渲染成一张图片
//     },
//   }),
// });

// 加载mapbox底图和geoserver发布的WTMS底图
var layers = [
  new ol.layer.Tile({
    title: "satellite",
    visible: false,
    source: new ol.source.XYZ({
      url: "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGlua2xpbmsiLCJhIjoiY2t5azNveG05MnRwdTJ4bzhxM2JmNGg3aCJ9.giuzL5T9qkSSl9EWMUK9dg",
    }),
  }),
  new ol.layer.Tile({
    title: "light",
    visible: false,
    source: new ol.source.XYZ({
      url: "https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGlua2xpbmsiLCJhIjoiY2t5azNveG05MnRwdTJ4bzhxM2JmNGg3aCJ9.giuzL5T9qkSSl9EWMUK9dg",
    }),
  }),
  new ol.layer.Tile({
    title: "dark",
    visible: false,
    source: new ol.source.XYZ({
      url: "https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGlua2xpbmsiLCJhIjoiY2t5azNveG05MnRwdTJ4bzhxM2JmNGg3aCJ9.giuzL5T9qkSSl9EWMUK9dg",
    }),
  }),
  new ol.layer.Tile({
    title: "streets",
    source: new ol.source.XYZ({
      url: "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGlua2xpbmsiLCJhIjoiY2t5azNveG05MnRwdTJ4bzhxM2JmNGg3aCJ9.giuzL5T9qkSSl9EWMUK9dg",
      //https://api.mapbox.com/styles/v1/{my_username}/{my_style_id}/tiles/256/{z}/{x}/{y}?access_token={my_access_token}
      //url: "http://rt{0-3}.map.gtimg.com/realtimerender?z={z}&x={x}&y={-y}&type=vector&style=0",
    }),
  }),
  new ol.layer.Tile({
    title: "outdoors",
    visible: false,
    source: new ol.source.XYZ({
      url: "https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGlua2xpbmsiLCJhIjoiY2t5azNveG05MnRwdTJ4bzhxM2JmNGg3aCJ9.giuzL5T9qkSSl9EWMUK9dg",
    }),
  }),
];

//地图
var map = new ol.Map({
  target: "map", //指向div
  layers: layers, //5层
  view: view,
});

//切换底图
let layerList = document.getElementById("menu");
layerList.addEventListener("click", (event) => {
  if (event.target.checked) {
    // 如果选中某一复选框
    // 通过DOM元素的id值来判断应该对哪个图层进行显示
    for (ie = 0; ie < 5; ie++) {
      map.getLayers().item(ie).setVisible(false);
    }
    switch (event.target.id) {
      case "satellite-v9":
        map.getLayers().item(0).setVisible(true);
        break;
      case "light-v10":
        map.getLayers().item(1).setVisible(true);
        break;
      case "dark-v10":
        map.getLayers().item(2).setVisible(true);
        break;
      case "streets-v11":
        map.getLayers().item(3).setVisible(true);
        break;
      case "outdoors-v11":
        map.getLayers().item(4).setVisible(true);
        break;
      default:
        break;
    }
  }
});

var referL = {
  四川省: ["road84", "basecounty"],
  土地利用: ["land84"],
  "1900至今": ["land84", "poi84"],
};
var Trefer = {
  basecounty: "成都市部分县级面数据",
  road84: "成都市部分路网数据",
  land84: "成都市部分土地利用数据",
  poi84: "成都市部分POI数据",
};

var wfsVectorLayer = null;

function GetData(a) {
  wfsVectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      format: new ol.format.GeoJSON({
        geometryName: "the_geom",
      }),
      url:
        "http://localhost:8080/geoserver/wfs?service=wfs&version=1.1.0&request=GetFeature&typeNames=cite:" +
        a +
        "&outputFormat=application/json&srsname=EPSG:4326",
    }),
  });
}

//查询的部分========
var searchQueryElem = document.getElementById("js-search-query");

searchQueryElem.addEventListener("keyup", function () {
  wfsVectorLayer.changed();
  wfsVectorLayer.setStyle(styleFunction);
});

var styleFunction = function (feature) {
  var cityName = feature.get("NAME");
  var searchQuery = searchQueryElem.value;
  var opacity = 1;

  if (searchQuery && cityName.search(new RegExp(searchQuery, "i")) === -1) {
    opacity = 0.3;
  }

  return [
    new ol.style.Style({
      fill: new ol.style.Fill({
        color: [128, 128, 128, opacity - 0.3],
      }),
      stroke: new ol.style.Stroke({
        color: [192, 0, 0, opacity - 0.3],
        width: 1,
      }),
      text: new ol.style.Text({
        text: cityName,
        fill: new ol.style.Fill({
          color: [192, 0, 0, opacity - 0.3],
        }),
        stroke: new ol.style.Stroke({
          color: [255, 255, 255, opacity - 0.3],
          width: 1,
        }),
        font: '11px "Helvetica Neue", Arial',
      }),
    }),
  ];
};

$(function () {
  //模态框处理开始----
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
  //模态框处理结束----

  console.log(chosedText);
  var inf = "";
  for (var i = 0; i < referL[chosedText].length; i++) {
    GetData(referL[chosedText][i]);
    map.addLayer(wfsVectorLayer);
    inf =
      inf +
      "<input value=" +
      referL[chosedText][i] +
      ' type="radio" name="Llist" /><label for=' +
      referL[chosedText][i] +
      ">" +
      Trefer[referL[chosedText][i]] +
      "</label><br />";
  }
  $("#chooseData").append(inf);
});

//TODO 看这个数据的属性，选择对应的作图方式来作图
let choseList = document.getElementById("chooseData");
choseList.addEventListener("click", (event) => {
  if (event.target.checked) {
    // 如果选中某一复选框
    // 通过DOM元素的id值来判断应该对哪个图层进行显示
    for (ie = 0; ie < referL[chosedText].length; ie++) {
      map
        .getLayers()
        .item(ie + 5)
        .setVisible(false);
      console.log(event.target.value);
      if (event.target.value == referL[chosedText][ie]) {
        map
          .getLayers()
          .item(ie + 5)
          .setVisible(true);
        wfsVectorLayer = map.getLayers().item(ie + 5);
        // console.log("wfsVectorLayer:" + wfsVectorLayer);
        document.getElementById("insideHtml").innerHTML =
          "<object type='text/html' data='plotly.html?name=" +
          referL[chosedText][ie] +
          "' width='100%' height='100%'></object>";
      }
    }
  }
});
