//页面
var view = new ol.View({
  // 设置中心点坐标，因为加载的腾讯瓦片地图的坐标系是墨卡托投影坐标系（'EPSG:3857'），所以要对经纬度坐标点进行投影，ol.proj.transform既是openlayer自带的坐标系转换函数，支持WGS84和墨卡托投影的互换。
  center: ol.proj.transform([104, 30.6], "EPSG:4326", "EPSG:3857"),
  // 比例尺级数为9
  zoom: 11,
});

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
  layers: layers,
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
    // map.getLayers().item(5).setVisible(true);
  }
});

function openMenu() {
  console.log("ok");
  var tmp = document.getElementById("plane");
  if (tmp.style.display == "block") {
    tmp.style.display = "none";
  } else {
    tmp.style.display = "block";
  }
}

var wfsVectorLayer = null;
var layerChosed = null; //普适性的选中的数据
var existData = [];
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

function LoadDat() {
  GetData(layerChosed);
  existData.push(layerChosed);
  map.addLayer(wfsVectorLayer);
}

//地图点击事件
//线上线下访问url不同，可变配置提出
var baseurl = "http://localhost:8080/";
$("#map").click(function (e) {
  //获取地图上点击的地理坐标，平面墨卡托坐标系
  var t3857 = map.getEventCoordinate(e.originalEvent);
  console.log(t3857);
  t4326 = ol.proj.transform(t3857, "EPSG:3857", "EPSG:4326");
  console.log(t4326);
  // BBOX,minlng,minlat,maxlng,maxlat,平面墨卡托就是minx,miny,maxx,maxy，下面的url3857里的bbox是一个2m×2m的小矩形
  //构造请求url的时候，把坐标系写成3857，虽然后台数据是4326坐标系的，但geoserver能内部转换
  var url3857 =
    baseurl +
    "geoserver/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&QUERY_LAYERS=cite%3A" +
    chosedLayer +
    "&LAYERS=cite%3A" +
    chosedLayer +
    "&exceptions=application%2Fvnd.ogc.se_inimage&INFO_FORMAT=application/json&FEATURE_COUNT=50&X=50&Y=50&SRS=EPSG%3A3857&STYLES=&WIDTH=101&HEIGHT=101&BBOX=" +
    (t3857[0] - 1).toString() +
    "%2C" +
    (t3857[1] - 1).toString() +
    "%2C" +
    (t3857[0] + 1).toString() +
    "%2C" +
    (t3857[1] + 1).toString();
  console.log(url3857);
  $.ajax({
    url: url3857,
    type: "GET",
    dataType: "json",
    headers: { "Content-Type": "application/json;charset=utf8" },
    success: function (data) {
      //这个方法直接把geojson转为feature数组
      features = new ol.format.GeoJSON().readFeatures(data);
      //新建矢量资源
      var vectorSource = new ol.source.Vector({
        features: features,
      });
      //新建矢量图层
      var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: polygonStyleFunction,
      });
      //将矢量图层添加到map
      map.addLayer(vectorLayer);
    },
    error: function (data) {
      console.log("faile");
      console.log(data);
    },
  });
});
//制图风格，标注内容要从要素中获取，每个要素的name_ch属性不同，所以制图风格是方法，而不是静态的
function polygonStyleFunction(feature) {
  return new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "rgba(192, 0, 0, 1)",
      width: 2,
    }),
    fill: new ol.style.Fill({
      color: "rgba(192, 192, 192, 0.5)",
    }),
    text: createTextStyle(feature),
  });
}
//创建注记
function createTextStyle(feature) {
  return new ol.style.Text({
    font: "20px Microsoft YaHei",
    text: getText(feature),
    fill: new ol.style.Fill({
      color: "rgba(192, 0, 0, 1)",
    }),
    stroke: new ol.style.Stroke({ color: "rgba(255, 255, 255, 1)", width: 1 }),
  });
}
//获取要素属性内容
function getText(feature) {
  return feature.get("NAME").toString();
}

var Trefer = {
  basecounty: "成都市部分县级面数据",
  road84: "成都市部分路网数据",
  land84: "成都市部分土地利用数据",
  poi84: "成都市部分POI数据",
};

var referT = {
  成都市部分县级面数据: "basecounty",
  成都市部分路网数据: "road84",
  成都市部分土地利用数据: "land84",
  成都市部分POI数据: "poi84",
};

function CustomedStyle() {
  var btnDat = document.getElementById("MenuChosed");
  if (btnDat.innerHTML != "") {
    return;
  }
  var inf = '<li><a href="#" onclick="viewDataAttri($(this).text())">';
  for (var i = 0; i < existData.length - 1; i++) {
    inf =
      inf +
      Trefer[existData[i]] +
      '</a></li><li><a href="#" onclick="viewDataAttri($(this).text())">';
  }
  inf = inf + Trefer[existData[existData.length - 1]] + "</a></li>";
  $("#MenuChosed").append(inf);
}
var chosedLayer = null; //表示在符号化中选中的图层
function viewDataAttri(a) {
  //显示选中的图层的文本信息
  var btnDat = document.getElementById("btnCustom");
  btnDat.innerHTML = a + '&nbsp;<span class="caret">';
  chosedLayer = referT[a];
  GetData(referT[a]);
  map.removeLayer(wfsVectorLayer);
  setStyles();
  map.addLayer(wfsVectorLayer);
}

var setStyles = function () {
  wfsVectorLayer.setStyle(
    new ol.style.Style({
      stroke: strokeStyle(),
      fill: fillStyle(),
      image: new ol.style.Circle({
        fill: fillStyle(),
        stroke: strokeStyle(),
        radius: 8,
      }),
    })
  );
};

$("#js-stroke-width").slider({
  min: 1,
  max: 10,
  step: 1,
  value: 1,
  slide: function (event, ui) {
    $("#js-stroke-width-value").text(ui.value);
    setStyles();
  },
});

$("#js-fill-opacity").slider({
  min: 0,
  max: 100,
  step: 1,
  value: 50,
  slide: function (event, ui) {
    $("#js-fill-opacity-value").text(ui.value + "%");
    setStyles();
  },
});

$("#js-stroke-colour, #js-fill-colour").spectrum({
  color: "black",
  change: setStyles,
});

$("#js-stroke-style").on("change", setStyles);

var fillStyle = function () {
  var rgb = $("#js-fill-colour").spectrum("get").toRgb();
  return new ol.style.Fill({
    color: [rgb.r, rgb.g, rgb.b, $("#js-fill-opacity").slider("value") / 100],
  });
};

var strokeStyle = function () {
  return new ol.style.Stroke({
    color: $("#js-stroke-colour").spectrum("get").toHexString(),
    width: $("#js-stroke-width").slider("value"),
    lineDash: $("#js-stroke-style").val() === "solid" ? undefined : [8],
  });
};

//模态框的操作相应
$(function () {
  $("#btn").click(function () {
    $("#myModal").modal("toggle");
  });

  $("#btn0").click(function () {
    //调用方法
    $("#myModal").modal("hide");
  });

  $("#btn1").click(function () {
    // $("#myModal").modal({
    //     show:true,
    // });
    $("#myModal1").modal("toggle");
  });

  $("#btn11").click(function () {
    //调用方法
    $("#myModal1").modal("hide");
  });

  $("#btn2").click(function () {
    // $("#myModal").modal({
    //     show:true,
    // });
    $("#myModal2").modal("toggle");
  });

  $("#btn22").click(function () {
    //调用方法
    $("#myModal2").modal("hide");
    console.log("hide");
  });

  //事件使用 对应组件选择器.on(事件名,事件处理函数)
  $("#myModal,#myModal1,#myModal2").on("show.bs.modal", function () {
    console.log("调用show执行1");
  });
  $("#myModal").on("shown.bs.modal", function () {
    //console.log("展示之后执行2");
    var chosed = document.getElementById("SpecChosed");
    //  chosed.style.display = "inline";
    chosed.addEventListener("click", (event) => {
      if (event.target.checked) {
        layerChosed = event.target.id;
      }
      //event.target.id就对应了选中项的ID号，也就是数据在数据库里面对应的名称
    });
    console.log(layerChosed);
  });
  $("#myModal1").on("show.bs.modal", function () {
    var chosed = document.getElementById("BaseChosed");
    //  chosed.style.display = "inline";
    chosed.addEventListener("click", (event) => {
      if (event.target.checked) {
        layerChosed = event.target.id;
      }
      //event.target.id就对应了选中项的ID号，也就是数据在数据库里面对应的名称
    });
    console.log(layerChosed);
  });
  $("#myModal2").on("show.bs.modal", function () {
    console.log("展示之后执行2");
  });
  $("#myModal,#myModal1,#myModal2").on("hide.bs.modal", function () {
    console.log("调用hide执行1");
  });
  $("#myModal,#myModal1,#myModal2").on("hidden.bs.modal", function () {
    console.log("完全隐藏之后执行2");
  });
});
