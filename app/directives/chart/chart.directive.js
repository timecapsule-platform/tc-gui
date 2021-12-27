(function () {
  "use strict";

  angular.module("TIMECAPSULE").directive("chart", chartDirective);

  function chartDirective() {
    return {
      restrict: "E",
      scope: {
        data: "=",
        colors: "=",
        labels: "=",
      },
      templateUrl: "app/directives/chart/chart.template.html",
      link: chartLink,
    };
  }

  function chartLink($scope, element, attrs) {
    $scope.canvas = element[0].querySelector(".chart-canvas");

    $scope.showIncomeChart = function (canvas) {
      var options = {};

      var chartData = [];

      for (var i = 0; i < $scope.data.length; i++) {
        var element = {
          value: $scope.data[i],
          color: $scope.colors[i],
          label: $scope.labels[i],
        };

        chartData.push(element);
      }

      var context = canvas.getContext("2d");
      var myPieChart = new Chart(context).Pie(chartData, options);
    };

    $scope.showIncomeChart($scope.canvas);
  }
})();
