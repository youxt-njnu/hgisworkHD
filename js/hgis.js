//line
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
        name: "关键词出现频率分布图(/100)",
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

//graph
var dom = document.getElementById("graphH");
var chartGraph = echarts.init(dom, null, {
  renderer: "canvas",
  useDirtyRect: false,
});
// var app = {};
// var option;

chartGraph.showLoading();
$.getJSON("../datmp/example.json", function (graph) {
  chartGraph.hideLoading();
  graph.nodes.forEach(function (node) {
    node.label = {
      show: node["symbolSize"] > 30,
    };
  });
  option = {
    title: {
      text: "Les Miserables",
      subtext: "Default layout",
      top: "bottom",
      left: "right",
    },
    tooltip: {},
    legend: [
      {
        // selectedMode: 'single',
        data: graph.categories.map(function (a) {
          return a.name;
        }),
      },
    ],
    animationDuration: 1500,
    animationEasingUpdate: "quinticInOut",
    series: [
      {
        name: "Les Miserables",
        type: "graph",
        layout: "none",
        data: graph.nodes,
        links: graph.links,
        categories: graph.categories,
        roam: true,
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
      },
    ],
  };
  chartGraph.setOption(option);
});

// if (option && typeof option === "object") {
//   chartGraph.setOption(option);
// }

window.addEventListener("resize", chartGraph.resize);

//map
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
