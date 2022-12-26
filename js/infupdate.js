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
  //每更改一次选择，更新一下界面的div
  var div = document.getElementById("attributethead");
  div.innerHTML = "";
  div = document.getElementById("attributetbody");
  div.innerHTML = "";
  div = document.getElementById("map");
  div.innerHTML = "";
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
        "第一步获取到的layNameCol，此时已经构建了cite中对应图层的字典结构"
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
  //获取选择的数据对应的属性信息
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
      //在地图上显示选中的图层
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

//地图
var map = new ol.Map();
var isClick = 0;
var newId = 1;
var wfsVectorLayer = null; //显示选中的数据要素
var drawedFeature = null;
var modifiedFeatures = null;

// 添加图层
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
  map.addInteraction(select);
}

// 点击按钮向geoserver提交数据
function ClearD() {
  //添加
  var newFeature = null;
  if (isClick == 1) {
    // 转换坐标
    var geometry = drawedFeature.getGeometry().clone();
    geometry.applyTransform(function (
      flatCoordinates,
      flatCoordinates2,
      stride
    ) {
      for (var j = 0; j < flatCoordinates.length; j += stride) {
        var y = flatCoordinates[j];
        var x = flatCoordinates[j + 1];
        flatCoordinates[j] = x;
        flatCoordinates[j + 1] = y;
      }
    });

    // 设置feature对应的属性，这些属性是根据数据源的字段来设置的
    newFeature = new ol.Feature();
    newFeature.set("fid", newId);
    newFeature.setId(newId);
    for (var i = 1; i <= LL; i++) {
      tmp = $("#At" + String(i)).val();
      newFeature.set(layNameCol[chosed][i], tmp);
    }
    newFeature.setGeometry(new ol.geom.Polygon([geometry.getCoordinates()]));
    // 更新id
    newId = newId + 1;
    select.getFeatures().clear();
  }

  //修改
  var modifiedFeature = null;
  if (isClick == 2) {
    if (modifiedFeatures && modifiedFeatures.getLength() > 0) {
      // 转换坐标
      modifiedFeature = modifiedFeatures.item(0).clone();
      // 注意ID是必须，通过ID才能找到对应修改的feature
      modifiedFeature.setId(modifiedFeatures.item(0).getId());
      // 调换经纬度坐标，以符合wfs协议中经纬度的位置
      modifiedFeature
        .getGeometry()
        .applyTransform(function (flatCoordinates, flatCoordinates2, stride) {
          for (var j = 0; j < flatCoordinates.length; j += stride) {
            var y = flatCoordinates[j];
            var x = flatCoordinates[j + 1];
            flatCoordinates[j] = x;
            flatCoordinates[j + 1] = y;
          }
        });
    }
    select.getFeatures().clear();
    modifiedFeatures = null;
  }
  //删除
  var tmp = null;
  if (isClick == 3) {
    // 删选择器选中的feature
    if (select.getFeatures().getLength() > 0) {
      //tmp = select.getFeatures().item(0);
      let featureId = select.getFeatures().getArray()[0].getId();
      tmp = wfsVectorLayer.getSource().getFeatureById(featureId);
      // 从地图删除
      wfsVectorLayer.getSource().removeFeature(tmp);
      select.getFeatures().clear();
    }
  }
  console.log(
    "AddFeature:" +
      newFeature +
      ",modifiedFeature:" +
      modifiedFeature +
      ",deleteFeature:" +
      tmp
  );
  WWfs([newFeature], [modifiedFeature], [tmp]);
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
  //source.addFeature(e.feature);
  //console.log("drawend里面的source的feature：" + source.getFeatures());
});

modify.on("modifyend", function (e) {
  console.log("modifyend");
  modify.setActive(false);
  modifiedFeatures = e.features;
  //source.addFeature(e.feature);
  //console.log("drawend里面的source的feature：" + source.getFeatures());
});

// 把修改提交到服务器端
function WWfs(features1, features2, features3) {
  var WFSTSerializer = new ol.format.WFS();
  var featObject = WFSTSerializer.writeTransaction(
    features1,
    features2,
    features3,
    {
      featureNS: "http://www.opengeospatial.net/cite", // 注意这个值必须为创建工作区时的命名空间URI
      featureType: chosed,
      srsName: "EPSG:4326",
    }
  );
  // 转换为xml内容发送到服务器端
  var serializer = new XMLSerializer();
  var featString = serializer.serializeToString(featObject);
  // 打印到控制台看看效果，openlayer默认生成的GML中几何字段名为geometry
  console.log(featString);
  //上传到geoserver
  $.ajax({
    type: "POST",
    url: "http://localhost:8080/geoserver/wfs?service=wfs",
    contentType: "text/xml",
    data: featString,
    dataType: "json",
    success: function (data) {
      console.log("success:" + data);
    },
    error: function (data) {
      console.log("fail to upload the data:" + data);
    },
  });
}

//点击查询实现对数据更新与否的查看
function QueD() {
  isClick = 0;
  //source.clear();
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
  });
  map.addLayer(wfsVectorLayer);
}

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
