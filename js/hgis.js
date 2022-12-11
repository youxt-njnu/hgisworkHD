//================================lineH
var names = []; //类别数组（实际用来盛放X轴坐标值）
var series = [];
$.ajax({
  url: "../datmp/example.json",
  data: {},
  type: "GET",
  success: function (data) {
    //请求成功时执行该函数内容，data即为服务器返回的json对象
    $.each(data.nodes, function (index, item) {
      names.push(item.name); //挨个取出类别并填入类别数组
      series.push(item.value);
    });
    hFun(names, series);
  },
});

var hrChart = echarts.init(document.getElementById("lineH"));

function hFun(x_data, y_data) {
  hrChart.setOption(
    {
      color: ["#b1191a"],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          // 坐标轴指示器，坐标轴触发有效
          type: "line", // 默认为直线，可选为：'line' | 'shadow'
        },
      },
      legend: {
        data: ["次数"],
      },
      left: "center", //组件离容器左侧的距离,'left', 'center', 'right','20%'
      top: "top", //组件离容器上侧的距离,'top', 'middle', 'bottom','20%'
      grid: {
        left: "3%",
        right: "3%",
        bottom: "10%",
        containLabel: true,
      },
      xAxis: {
        splitLine: {
          show: false,
        },
        /* 改变x轴颜色 */
        axisLine: {
          lineStyle: {
            color: "#b1191a",
            width: 1, // 这里是为了突出显示加上的
          },
        },
        type: "category",
        data: x_data,
      },
      yAxis: {
        // 纵轴标尺固定
        splitLine: {
          show: false,
        },

        type: "value",
        scale: true,
        name: "关键词频率(/100)",
        min: 0, // 就是这两个 最小值
        max: "dataMax", // 最大值
        splitNumber: 10,
        /* 改变y轴颜色 */
        axisLine: {
          lineStyle: {
            color: "#b1191a",
            width: 1, // 这里是为了突出显示加上的
          },
        },
        boundaryGap: [0.2, 0.2],
      },
      series: [
        {
          name: "频率(/100)",
          type: "line",
          symbol: "circle", // 折线点设置为实心点
          symbolSize: 6, // 折线点的大小
          itemStyle: {
            normal: {
              color: "#d4c395", // 折线点的颜色
              lineStyle: {
                color: "#b7a166", // 折线的颜色
              },
            },
          },
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(
                0,
                1,
                0,
                0,
                [
                  {
                    offset: 0,
                    color: "#8b8a52", // 0% 处的颜色
                  },
                  {
                    offset: 0.6,
                    color: "#c2c064", // 60% 处的颜色
                  },
                  {
                    offset: 1,
                    color: "#d5d4a3", // 100% 处的颜色
                  },
                ],
                false
              ),
            },
          },
          data: y_data,
        },
      ],
    },
    true
  );
}

//==================================graphH
var dom = document.getElementById("graphH");
var chartGraph = echarts.init(dom, null, {
  renderer: "canvas",
  useDirtyRect: false,
});
// var app = {};
// var option;

chartGraph.showLoading();
var linksL = [];
var categoriesL = [];
$.ajax({
  url: "../datmp/LinkCategory.json",
  data: {},
  type: "GET",
  success: function (data) {
    //请求成功时执行该函数内容，data即为服务器返回的json对象
    console.log(data);
    linksL = data.links;
    categoriesL = data.categories;
    console.log(linksL);
    console.log(categoriesL);
  },
  error: function (data) {
    console.log("faile");
    console.log(data);
  },
});
$.getJSON("../datmp/example.json", function (graph) {
  chartGraph.hideLoading();
  graph.nodes.forEach(function (node) {
    node.label = {
      show: node["symbolSize"] > 30,
    };
  });
  option = {
    title: {
      text: "关键词图谱",
      subtext: "Default layout",
      top: "bottom",
      left: "right",
    },
    tooltip: {},
    legend: [
      {
        // selectedMode: 'single',
        data: categoriesL.map(function (a) {
          return a.name;
        }),
      },
    ],
    animationDuration: 1500,
    animationEasingUpdate: "quinticInOut",
    series: [
      {
        name: "关键词图谱",
        type: "graph",
        layout: "force",
        data: graph.nodes,
        links: linksL,
        categories: categoriesL,
        label: {
          position: "right",
          formatter: "{b}",
        },
        lineStyle: {
          color: "source",
          curveness: 0.3,
        },
        emphasis: {
          focus: "adjacency",
          lineStyle: {
            width: 10,
          },
        },
        force: {
          //力引导布局相关的配置项
          repulsion: 300, //节点之间的斥力因子。
          edgeLength: 200, //边的两个节点之间的距离，这个距离也会受 repulsion。
        },
        legendHoverLink: true, //可以点击图例来隐藏一个组
        roam: true, //开启鼠标平移及缩放
        draggable: false, //节点支持鼠标拖拽
        labelLayout: {
          moveOverlap: "shiftX", //标签重叠时，挪动标签防止重叠
          draggable: true, //节点标签允许鼠标拖拽定位
        },
      },
    ],
  };
  chartGraph.setOption(option);
});

// if (option && typeof option === "object") {
//   chartGraph.setOption(option);
// }

window.addEventListener("resize", chartGraph.resize);

//==========================mapH
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
    title: "streets",
    source: new ol.source.XYZ({
      url: "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGlua2xpbmsiLCJhIjoiY2t5azNveG05MnRwdTJ4bzhxM2JmNGg3aCJ9.giuzL5T9qkSSl9EWMUK9dg",
      //https://api.mapbox.com/styles/v1/{my_username}/{my_style_id}/tiles/256/{z}/{x}/{y}?access_token={my_access_token}
      //url: "http://rt{0-3}.map.gtimg.com/realtimerender?z={z}&x={x}&y={-y}&type=vector&style=0",
    }),
  }),
  topiclayer,
];

//地图
var map = new ol.Map({
  target: "mapH", //指向div
  layers: layers,
  view: view,
});

//======================交互
//TODO 前后端交互，访问到数据对应的属性表

//TODO 针对折线图的mouseover，获取到停留在的地方对应到关键词属性，这样就能获取到对应的其他属性：几何数据

//TODO 针对获取到的对应的几何数据，在地图上展示，并且缩放到视图范围内

// //地图渲染完成后的事件
// map.once("rendercomplete", function () {
//   viewFitLayer(topiclayer);
//   console.log("ok");
// });
// //把地图视图缩放到geojson测试数据视图范围内

// //视图缩放至图层范围
// function viewFitLayer(layer) {
//   var extent = layer.getSource().getExtent();
//   if (extent) {
//     view.fit(extent, {
//       duration: 1000,
//       easing: ol.easing.UpAndDown,
//     });
//   }
// }

//TODO 针对得到的停留地的关键词属性，突出显示关系图中对应的圆

//TODO 针对得到的停留地的关键词属性，查找所有与之相关的关键词，利用的是links
