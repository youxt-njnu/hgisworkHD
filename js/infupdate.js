var baseurl = "http://localhost:8080/";
function viewDataAttri() {
  //首先定义一个空的矢量图层，设置样式并添加到当前map中
  var vectorSource = new ol.source.Vector();
  var vector = new ol.layer.Vector({
    source: vectorSource,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: "white",
      }),
      stroke: new ol.style.Stroke({
        color: "red",
        width: 1,
      }),
    }),
  });
  map.addLayer(vector);

  //设置查询参数与条件
  var featureRequest = new ol.format.WFS().writeGetFeature({
    srsName: "EPSG:4326", //坐标系统
    featureNS: baseurl, //命名空间 URI
    featurePrefix: "cite", //工作区名称
    featureTypes: ["cite:land84"], //查询图层，可以是同一个工作区下多个图层，逗号隔开,后期考虑和dropdown的联动
    outputFormat: "application/json",
    filter: ol.format.filter.equalTo(
      "les-miserables_name",
      document.getElementById("st").value
    ), //前者是属性名，后者是对应值
  });

  fetch(baseurl + "geoserver/wfs", {
    //geoserver wfs地址如localhost:8080/geoserver/wfs，我是9999
    method: "POST",
    body: new XMLSerializer().serializeToString(featureRequest),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      var features = new ol.format.GeoJSON().readFeatures(json);
      vectorSource.addFeatures(features);
      map.getView().fit(vectorSource.getExtent()); //缩放到查询出的feature
    });
}
