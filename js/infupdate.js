var baseurl = "http://localhost:8080/";
var LL = 1;
var chosed = "";
var layNameCol = {};
// 获取选中的图层对应的属性表
var referT = {
  成都市部分县级面数据: "basecounty",
  成都市部分路网数据: "road84",
  成都市部分土地利用数据: "land84",
  成都市部分POI数据: "poi84",
};
function viewDataAttri(a) {
  //显示选中的图层的文本信息
  const btnDat = document.getElementById("dropmenuData");
  btnDat.innerHTML = a + '&nbsp;<span class="caret">';

  //获取cite工作区下的图层列表
  var data = {
    service: "wfs",
    version: "1.1.1",
    request: "DescribeFeatureType",
  };

  $.ajax({
    url: baseurl + "geoserver/cite/wfs", //wfs服务地址,http://localhost:8080/geoserver/cite/wfs?SERVICE=WFS&VERSION=1.1.1&REQUEST=DescribeFeatureType
    data: data,
    type: "GET",
    contentType: "text/plain;charset=UTF-8",
    async: false,
    success: function (data) {
      //console.log(data);
      var layerlist = data.getElementsByTagName("xsd:complexType");
      for (var i = 0; i < layerlist.length; i++) {
        var info = layerlist[i].getElementsByTagName("xsd:element");
        var inflist = new Array();
        for (var j = 0; j < info.length; j++) {
          inflist.push(info[j].getAttribute("name"));
        }
        layNameCol[layerlist[i].getAttribute("name").slice(0, -4)] = inflist;
      }
      //验证是否获取到了图层的名字和对应的属性列表名字;
      console.log(
        "第一步获取到的layNameCol，此时已经构建了cite中对应图层的字典结构："
      );
      for (var key in layNameCol) {
        console.log(key + " : " + layNameCol[key]);
      }
    },
    error: function () {
      alert("wrong");
    },
  });

  console.log("这边第一步首先查看下，选择的图层对应的参考对不对：" + referT[a]);
  data = {
    service: "wfs",
    version: "1.1.0",
    request: "GetFeature",
    typeName: "cite:" + referT[a],
    outputFormat: "application/json",
  };

  $.ajax({
    url: "http://localhost:8080/geoserver/cite/wfs",
    data: data,
    type: "GET",
    async: false,
    // dataType: "json",
    headers: { "Content-Type": "application/json;charset=utf8" },
    success: function (data) {
      //更新属性表
      var tablehead = "<th>";
      for (var i = 1; i < layNameCol[referT[a]].length - 1; i++) {
        tablehead += layNameCol[referT[a]][i] + "</th><th>";
      }
      tablehead +=
        layNameCol[referT[a]][layNameCol[referT[a]].length - 1] + "</th>";
      $("#attributethead").append(tablehead);

      for (var i = 0; i < data["features"].length; i++) {
        var properties = data["features"][i]["properties"]; //一行
        var tabletxt = "<tr><td>";
        for (var j = 1; j < layNameCol[referT[a]].length - 1; j++) {
          tabletxt += properties[layNameCol[referT[a]][j]] + "</td><td>";
        }
        tabletxt +=
          properties[layNameCol[referT[a]][layNameCol[referT[a]].length - 1]] +
          "</td><tr>";
        //console.log(tabletxt);
        $("#attributetbody").append(tabletxt);
      }
      LL = layNameCol[referT[a]].length - 1;
      chosed = referT[a];
      console.log("这一步是为了获取得到选中图层和其属性");
      //把外面的map放到了里面
      console.log("在map之前看看chosed是啥样的:" + chosed);
      map = new ol.Map({
        target: "map", //指向div
        layers: [
          new ol.layer.Tile({
            title: "streets",
            source: new ol.source.XYZ({
              url: "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGlua2xpbmsiLCJhIjoiY2t5azNveG05MnRwdTJ4bzhxM2JmNGg3aCJ9.giuzL5T9qkSSl9EWMUK9dg",
            }),
          }),
          // new ol.layer.Image({
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
          //       LAYERS: "cite:" + chosed, //图层，前面是工作空间，后面是图层名，
          //       exceptions: "application/vnd.ogc.se_inimage",
          //       singleTile: true, //单瓦片，渲染成一张图片
          //     },
          //   }),
          // }),
        ],
        view: new ol.View({
          center: [104, 30.7],
          // 比例尺级数为9
          zoom: 11,
          projection: "EPSG:4326",
        }),
      });
      if (wfsVectorLayer) {
        map.removeLayer(wfsVectorLayer);
      }
      wfsVectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
          format: new ol.format.GeoJSON({
            geometryName: "the_geom",
          }),
          url:
            "http://localhost:8080/geoserver/wfs?service=wfs&version=1.1.0&request=GetFeature&typeNames=cite:" +
            chosed +
            "&outputFormat=application/json&srsname=EPSG:4326",
        }),
        // style: function (feature, resolution) {
        //   return new ol.style.Style({
        //     stroke: new ol.style.Stroke({
        //       color: "blue",
        //       width: 5,
        //     }),
        //   });
        // },
      });
      map.addLayer(wfsVectorLayer);
      map.addLayer(vector);
    },
    error: function (data) {
      console.log("这一步是为了获取得到选中图层和其属性：faile");
      console.log(data);
    },
  });
}
// // 获取坐标系
// var proj4326 = ol.proj.get("EPSG:4326");
// // 打印坐标系的轴方向，默认的轴方向为neu，生成GML文件，经纬度会是反的
// console.log(proj4326.getAxisOrientation());
// // 新建坐标系，修改轴方向为enu，经度、纬度、高程
// var proj = new ol.proj.Projection({
//   code: "EPSG:4326",
//   axisOrientation: "enu",
//   units: proj4326.getUnits(),
//   canWrapX: true,
//   extent: proj4326.getExtent(),
//   global: true,
//   worldExtent: proj4326.getWorldExtent(),
// });
// // 覆盖原来的4326坐标系，目的是为了保证生成GML文件中经纬度不反
// ol.proj.addProjection(proj);
// var proj4326new = ol.proj.get("EPSG:4326");
// console.log("构建的新投影：" + proj4326new);

//地图
var map = new ol.Map();
var isClick = 0;
var wfsVectorLayer = null; //显示选中的数据要素
var drawedFeature = null;
var modifiedFeature=null;

// 添加工具图层，新增、修改、删除选择都在这个图层上进行
var source = new ol.source.Vector({ wrapX: false });
var vector = new ol.layer.Vector({
  source: source,
  style: polygonStyleFunction,
});
// 仅以绘制面举例
var draw = new ol.interaction.Draw({
  source: source,
  type: "Polygon", //'LineString', // 设定为线条
});
// 定义选择控件与修改控件
var select = new ol.interaction.Select({
  wrapX: false,
});
var modify = new ol.interaction.Modify({
  features: select.getFeatures(),
});

// 变化时触发
function AddD() {
  isClick = 1;
  map.removeInteraction(select);
  map.removeInteraction(modify);
  map.removeInteraction(draw);
  map.addInteraction(draw);
}

function ModifyD() {
  isClick = 2;
  map.removeInteraction(select);
  map.removeInteraction(modify);
  map.removeInteraction(draw);
  map.addInteraction(select);
  map.addInteraction(modify);
}

function DeleteD() {
  isClick = 3;
  map.removeInteraction(select);
  map.removeInteraction(modify);
  map.removeInteraction(draw);
}

function RelatedD() {
  isClick = 4;
  map.removeInteraction(select);
  map.removeInteraction(modify);
  map.removeInteraction(draw);
}

// 点击按钮向geoserver提交数据
function Clear() {
  // if (typeInteraction.value == "search") {
  //   alert("支持insert update delete");
  // }
  // 获取feature列表
  var features = source.getFeatures();
  console.log("clear函数里面获取到的source的features" + features);
  // 获取一个feature
  var feature = features[features.length - 1];
  var tmp = "";
  tmp = $("#At1").val();
  // 转换坐标
  var geometry = feature.getGeometry().clone();
  geometry.applyTransform(function (flatCoordinates, flatCoordinates2, stride) {
    for (var j = 0; j < flatCoordinates.length; j += stride) {
      var y = flatCoordinates[j];
      var x = flatCoordinates[j + 1];
      flatCoordinates[j] = x;
      flatCoordinates[j + 1] = y;
    }
  });
  // update和delete的时候需要fid
  feature.setId(tmp);
  for (var i = 1; i <= LL; i++) {
    tmp = $("#At" + String(i)).val();
    feature.set(layNameCol[chosed][i], tmp);
  }

  feature.setGeometry(new ol.geom.Polygon([geometry.getCoordinates()]));
  // 创建WFS解析器
  var WFSTSerializer = new ol.format.WFS();
  var insertFeatures = [];
  var updateFeatures = [];
  var deleteFeatures = [];
  if (isClick == 1) {
    insertFeatures.push(feature);
  }
  if (isClick == 2) {
    var updatefeature = select.getFeatures().getArray()[0];
    updatefeature.setId($("#At1").val());
    for (var i = 1; i <= LL; i++) {
      tmp = $("#At" + String(i)).val();
      updatefeature.set(layNameCol[chosed][i], tmp);
    }
    updateFeatures.push(updatefeature);
  }
  if (isClick == 3) {
    deleteFeatures.push(feature);
  }
  // 格式：writeTransaction(inserts, updates, deletes, options)
  // updates和deletes都需要要素有唯一ID，进行索引
  // insert因为是新增，所以不需要
  var featObject = WFSTSerializer.writeTransaction(
    insertFeatures,
    updateFeatures,
    deleteFeatures,
    {
      featureNS: "http://localhost:8080/geoserver/cite", //工作区URI,或者http://geoserver.org/cite
      // featurePrefix: "cite", //工作区名称
      featureType: chosed, //图层名称
      srsName: "EPSG:4326", //坐标系
    }
  );
  var serializer = new XMLSerializer();
  var featString = serializer.serializeToString(featObject);
  // 打印到控制台看看效果，openlayer默认生成的GML中几何字段名为geometry
  console.log(featString);

  // 上传到geoserver
  // $.ajax({
  //   type: "POST",
  //   url: "http://localhost:8080/geoserver/wfs?service=wfs",
  //   contentType: "text/xml",
  //   data: featString,
  //   dataType: "json",
  //   success: function (data) {
  //     source.removeFeature(feature);
  //     console.log("success:" + data);
  //   },
  //   error: function (data) {
  //     source.removeFeature(feature);
  //     console.log("fail to upload the data:" + data);
  //   },
  // });
  var request = new XMLHttpRequest();
  request.open("POST", "http://localhost:8080/geoserver/wfs?service=wfs");
  request.setRequestHeader("Content-Type", "text/xml");
  request.send(featString);
}

// 完成绘制（drawend）时激活
draw.on("drawend", function (e) {
  //原来是：draw.once
  console.log("drawend");
  // draw工具不可用
  draw.setActive(false);
  // 属性框
  div = document.getElementById("attributethead");
  div.innerHTML = "";
  div = document.getElementById("attributetbody");
  div.innerHTML = "";
  tablehead = "<th>";
  for (var i = 1; i < LL; i++) {
    tablehead += layNameCol[chosed][i] + "</th><th>";
  }
  tablehead += layNameCol[chosed][layNameCol[chosed].length - 1] + "</th>";
  $("#attributetbody").append(tablehead);
  tabletxt = "<tr><td>";
  for (var i = 1; i < LL; i++) {
    tabletxt +=
      '<input type="text" id=' +
      String("At" + i) +
      ' style="width: 100px"/>' +
      "</td><td>";
  }
  tabletxt +=
    '<input type="text" id=' +
    String("At" + LL) +
    ' style="width: 100px"/>' +
    "</td></tr>";
  $("#attributetbody").append(tabletxt);

  // 绘制结束时暂存绘制的feature
  drawedFeature = e.feature;
  source.addFeature(e.feature);
  console.log("drawend里面的source的feature：" + source.getFeatures());
});

modify.on("modifyend", function (e) {
  console.log("modifyend");
  modify.setActive(false);
  modifiedFeature=e.features;
  source.addFeature(e.feature);
  console.log("drawend里面的source的feature：" + source.getFeatures());
});

// function Clear() {
//   var div = document.getElementById("attributethead");
//   div.innerHTML = "";
//   div = document.getElementById("attributetbody");
//   div.innerHTML = "";
// }

//查询设置
function QueD() {
  isClick = 0;
  source.clear();
  if (wfsVectorLayer) {
    map.removeLayer(wfsVectorLayer);
  }

  wfsVectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      format: new ol.format.GeoJSON({
        geometryName: "the_geom",
      }),
      url:
        "http://localhost:8080/geoserver/wfs?service=wfs&version=1.1.0&request=GetFeature&typeNames=cite:" +
        chosed +
        "&outputFormat=application/json&srsname=EPSG:4326",
    }),
    // style: function (feature, resolution) {
    //   return new ol.style.Style({
    //     stroke: new ol.style.Stroke({
    //       color: "blue",
    //       width: 5,
    //     }),
    //   });
    // },
  });
  map.addLayer(wfsVectorLayer);
}
//地图点击事件
$("#map").click(function (e) {
  if (isClick != 0) {
    console.log("clicked");
    return;
  }
  //获取地图上点击的地理坐标，WGS84坐标系
  var t4326 = map.getEventCoordinate(e.originalEvent);
  console.log(chosed);
  //构造请求url
  var url4326 =
    baseurl +
    "geoserver/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&QUERY_LAYERS=cite%3A" +
    chosed +
    "&LAYERS=cite%3A" +
    chosed +
    "&exceptions=application%2Fvnd.ogc.se_inimage&INFO_FORMAT=application/json&FEATURE_COUNT=50&X=50&Y=50&SRS=EPSG%3A4326&STYLES=&WIDTH=101&HEIGHT=101&BBOX=" +
    (t4326[0] - 0.0001).toString() +
    "%2C" +
    (t4326[1] - 0.0001).toString() +
    "%2C" +
    (t4326[0] + 0.0001).toString() +
    "%2C" +
    (t4326[1] + 0.0001).toString();
  console.log(url4326);
  $.ajax({
    url: url4326,
    type: "GET",
    dataType: "json",
    // async: false,
    headers: { "Content-Type": "application/json;charset=utf8" },
    success: function (data) {
      console.log(data);
      //这个方法直接把geojson转为feature数组
      features = new ol.format.GeoJSON().readFeatures(data);
      // 将feature数组中第一个feature放到source中
      source.addFeature(features[0]);
      console.log(
        "点击图层得出属性后就是click里的source的feature:" + source.getFeatures()
      );
      // //更新属性表
      // for (var i = 0; i < data["features"].length; i++) {
      //   var properties = data["features"][i]["properties"]; //一行
      //   var tabletxt = "<tr><td>";
      //   for (var j = 1; j < layNameCol[chosed].length - 1; j++) {
      //     tabletxt += properties[layNameCol[chosed][j]] + "</td><td>";
      //   }
      //   tabletxt +=
      //     properties[layNameCol[chosed][layNameCol[chosed].length - 1]] +
      //     "</td><tr>";
      //   //console.log(tabletxt);
      //   $("#attributetbody").append(tabletxt);
      // }
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
  if (feature.get("les-miserables_name")) {
    return feature.get("les-miserables_name").toString();
  } else {
    return "tool";
  }
}
