(function () {
  "use strict";

  angular
    .module("TIMECAPSULE")
    .directive("piePlantFamily", piePlantFamilyDirective);

  function piePlantFamilyDirective() {
    return {
      restrict: "E",
      templateUrl:
        "app/directives/pie-plant-family/pie-plant-family.template.html",
      scope: {
        title: "@",
        family: "@",
      },
      controller: piePlantFamilyController,
    };
  }

  function piePlantFamilyController(
    $scope,
    Util,
    Global,
    PopupService,
    QueryFactory
  ) {
    $scope.popupUrl = "app/directives/pie-chart/popup/";
    $scope.popup = PopupService;

    $scope.references = [];

    $scope.colors = [];

    // The concepts array
    $scope.concepts = [];

    // Percentages
    $scope.percentages = [];

    // Occurences
    $scope.occurences = [];

    $scope.isLoading = false;

    $scope.chartReady = false;

    /************************** Watchers **********************************/

    $scope.$watch(
      function () {
        return $scope.family;
      },
      function () {
        $scope.chartReady = false;

        $scope.concepts = [];
        $scope.occurences = [];
        $scope.percentages = [];

        $scope.buildVisualizationData();
      },
      true
    );

    /************************** Business Logic **********************************/

    $scope.getRandomColor = function () {
      var letters = "0123456789ABCDEF";
      var color = "#";
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };

    $scope.buildVisualizationData = function () {
      $scope.isLoading = true;

      var sparql = "";

      sparql += "SELECT  ?plantName ";
      sparql += "WHERE { ";
      sparql += "?p a " + Global.ns + "Plant. ";
      sparql += "?p " + Global.ns + "name ?plantName. ";
      sparql += "?p " + Global.ns + "hasFamily ?family. ";
      sparql +=
        "?family  " + Global.ns + 'name "' + $scope.family + '"^^xsd:string. ';

      sparql += " } ";
      console.log(sparql);

      QueryFactory.ExecuteQuery(sparql).then(function (result) {
        $scope.isLoading = false;

        if (!result.error) {
          $scope.references = result.results.bindings;

          for (var i = 0; i < $scope.references.length; i++) {
            if (
              !Util.exists(
                $scope.concepts,
                $scope.references[i].plantName.value
              )
            ) {
              $scope.concepts.push($scope.references[i].plantName.value);
            }
          }

          // Generate Statistics (Count of occurences of concept + Percentage)
          $scope.generateStatistics();
        }
      });
    };

    // Generate the total occurences of a concept in time and the percentage.
    $scope.generateStatistics = function () {
      $scope.initColors();

      var total = 0;

      for (var i = 0; i < $scope.concepts.length; i++) {
        $scope.occurences[i] = 0;
        $scope.percentages[i] = 0;

        for (var j = 0; j < $scope.references.length; j++) {
          var concept = $scope.references[j].plantName.value;

          if (concept && concept == $scope.concepts[i]) {
            $scope.occurences[i] += 1;
          }
        }
      }

      // Count the total number of results in this date period
      for (var i = 0; i < $scope.occurences.length; i++) {
        total += $scope.occurences[i];
      }

      for (var i = 0; i < $scope.occurences.length; i++) {
        $scope.percentages[i] = Util.roundNum(
          ($scope.occurences[i] / total) * 100,
          1
        );
      }

      $scope.generateDisplayConcepts();
    };

    $scope.generateDisplayConcepts = function () {
      $scope.dConcepts = [];

      for (var i = 0; i < $scope.concepts.length; i++) {
        $scope.dConcepts[i] = {
          concept: $scope.concepts[i],
          occurences: $scope.occurences[i],
          percentage: $scope.percentages[i],
          squareColor: $scope.colors[i],
        };
      }
    };

    $scope.initColors = function () {
      //0.Init colors
      for (var i = 0; i < 100; i++) {
        $scope.colors.push($scope.getRandomColor());
      }
    };

    $scope.init = function () {};

    $scope.init();
  }
})();

 
