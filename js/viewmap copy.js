//页面
var view = new ol.View({
  // 设置中心点坐标，因为加载的腾讯瓦片地图的坐标系是墨卡托投影坐标系（'EPSG:3857'），所以要对经纬度坐标点进行投影，ol.proj.transform既是openlayer自带的坐标系转换函数，支持WGS84和墨卡托投影的互换。
  center: ol.proj.transform([104, 30.6], "EPSG:4326", "EPSG:3857"),
  // 比例尺级数为9
  zoom: 11,
});

//----------geoserver发布的WTMS底图,其实数据源是4326坐标系的，但是geoserver会适配前端的坐标系。
var topiclayer = new ol.layer.Image({
  title: "land84",
  source: new ol.source.ImageWMS({
    ratio: 1,
    url: "http://localhost:8080/geoserver/cite/wms?", //这个可以打开geoserver的preview，看openlayer页面截取url
    // 请求参数
    params: {
      SERVICE: "WMS",
      VERSION: "1.1.1",
      REQUEST: "GetMap",
      FORMAT: "image/png",
      TRANSPARENT: true,
      tiled: true,
      LAYERS: "cite:land84", //图层，前面是工作空间，后面是图层名，
      exceptions: "application/vnd.ogc.se_inimage",
      singleTile: true, //单瓦片，渲染成一张图片
    },
  }),
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
  topiclayer,
];

//地图
var map = new ol.Map({
  target: "map", //指向div
  layers: layers,
  view: view,
});

//地图渲染完成后的事件
//map.once("rendercomplete", function () { viewFitLayer(geoJsonLayer) });
//把地图视图缩放到geojson测试数据视图范围内

//视图缩放至图层范围
// function viewFitLayer(layer) {
//   var extent = layer.getSource().getExtent();
//   if (extent) {
//     view.fit(extent, {
//       duration: 1000,
//       easing: ol.easing.UpAndDown,
//     });
//   }
// }

//切换底图
function openMenu() {
  console.log("ok");
  const layerList = document.getElementById("menu");
  layerList.style.display = "inline";
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
      map.getLayers().item(5).setVisible(true);
    }
  });
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
    "geoserver/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&QUERY_LAYERS=cite%3Aland84&LAYERS=cite%3Aland84&exceptions=application%2Fvnd.ogc.se_inimage&INFO_FORMAT=application/json&FEATURE_COUNT=50&X=50&Y=50&SRS=EPSG%3A3857&STYLES=&WIDTH=101&HEIGHT=101&BBOX=" +
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
      //更新属性表
      for (var i = 0; i < data["features"].length; i++) {
        var properties = data["features"][i]["properties"];
        var idHD = properties["id_0"];
        var categoryHD = properties["les-miserables_category"];
        var nameHD = properties["les-miserables_name"];
        var valueHD = properties["nles-miserables_value"];

        var tabletxt = "<tr><td>" + idHD + "</td><td>";
        categoryHD +
          "</td><td>" +
          nameHD +
          "</td><td>" +
          valueHD +
          "</td></tr>";
        $("#attributetbody").append(tabletxt);
      }
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
  return feature.get("les-miserables_name").toString();
}

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
  $("#myModal,#myModal1,#myModal2").on("shown.bs.modal", function () {
    console.log("展示之后执行2");
  });
  $("#myModal,#myModal1,#myModal2").on("hide.bs.modal", function () {
    console.log("调用hide执行1");
  });
  $("#myModal,#myModal1,#myModal2").on("hidden.bs.modal", function () {
    console.log("完全隐藏之后执行2");
  });
});

function btnclose(str) {
  $(str).modal("hide");
  console.log("hide");
}
