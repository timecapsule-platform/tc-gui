(function () {
  "use strict";

  angular.module("TIMECAPSULE").directive("gMap", gMapDirective);

  function gMapDirective() {
    return {
      restrict: "E",
      templateUrl: "app/directives/gmap/gmap.template.html",
      scope: {
        title: "@",
        references: "=",
      },
      controller: gMapController,
    };
  }

  function gMapController($scope, Util, PopupService, NgMap) {
    $scope.popupUrl = "app/directives/map/popup/";
    $scope.popup = PopupService;

    $scope.squares = [
      "color1",
      "color2",
      "color3",
      "color4",
      "color5",
      "color6",
      "color7",
      "color8",
      "color9",
      "color10",
      "color11",
      "color12",
      "color13",
      "color14",
      "color15",
    ];

    $scope.colors = [
      "#354047",
      "#6a8a70",
      "#b58e8b",
      "#d9b658",
      "#b397a1",
      "#5a6a73",
      "#3e5542",
      "#6f5351",
      "#4e6f54",
      "#378143",
      "#8d3c61",
    ];

    // The concepts array
    $scope.markers = [];

    /************************** Watchers **********************************/

    $scope.$watch(
      function () {
        return $scope.references;
      },
      function () {
        $scope.markers = [];

        $scope.buildVisualizationData();
      },
      true
    );

    /************************** Business Logic **********************************/

    $scope.buildVisualizationData = function () {
      //1. Generate the concepts from the references
      $scope.generateMarkers();
    };

    $scope.generateMarkers = function () {
      NgMap.getMap().then(function (map) {
        for (var i = 0; i < $scope.references.length; i++) {
          var markerIcon = "assets/images/marker-undefined.svg";

          if ($scope.references[i].type) {
            if ($scope.references[i].type.value == "Grows")
              markerIcon = "assets/images/marker-grows.svg";
            else if ($scope.references[i].type.value == "ArchaeologicalFinding")
              markerIcon = "assets/images/marker-arcaeological.svg";
            else if ($scope.references[i].type.value == "Cargo")
              markerIcon = "assets/images/marker-cargo.svg";
          }

          $scope.markers[i] = new google.maps.Marker({
            title: "Uknown",
            icon: markerIcon,
            position: {
              lat: Number($scope.references[i].latitude.value),
              lng: Number($scope.references[i].longitude.value),
            },
            map: map,
          });

          if ($scope.references[i].name) {
            $scope.markers[i].title = $scope.references[i].name.value;
          }
        }
      });
    };

    $scope.clearMarkers = function () {
      if ($scope.markers && $scope.markers.length) {
        for (var i = 0; i < $scope.markers.length; i++) {
          $scope.markers[i].setMap(null);
        }
      }
    };

    $scope.init = function () {
      $scope.buildVisualizationData();
    };

    $scope.init();
  }
})();

 
