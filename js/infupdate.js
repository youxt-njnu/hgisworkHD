var baseurl = "http://localhost:8080/";
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
  var layNameCol = {};

  $.ajax({
    url: baseurl + "geoserver/cite/wfs", //wfs服务地址,http://localhost:8080/geoserver/cite/wfs?SERVICE=WFS&VERSION=1.1.1&REQUEST=DescribeFeatureType
    data: data,
    type: "GET",
    contentType: "text/plain;charset=UTF-8",
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
      //验证是否获取到了图层的名字和对应的属性列表名字
      // for (var key in layNameCol) {
      //   console.log(key + " : " + layNameCol[key]);
      // }
    },
    error: function () {
      alert("wrong");
    },
  });

  // 获取选中的图层对应的属性表
  var referT = {
    成都市部分县级面数据: "basecounty",
    成都市部分路网数据: "road84",
    成都市部分土地利用数据: "land84",
    成都市部分POI数据: "poi84",
  };
  console.log(referT[a]);
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
    },
    error: function (data) {
      console.log("faile");
      console.log(data);
    },
  });
}

function Clear() {
  var div = document.getElementById("attributethead");
  div.innerHTML = "";
  div = document.getElementById("attributetbody");
  div.innerHTML = "";
}
//TODO 进行增删查看和关联
