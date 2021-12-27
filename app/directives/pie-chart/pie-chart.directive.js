(function () {
  "use strict";

  angular.module("TIMECAPSULE").directive("pieChart", pieChartDirective);

  function pieChartDirective() {
    return {
      restrict: "E",
      templateUrl: "app/directives/pie-chart/pie-chart.template.html",
      scope: {
        title: "@",
        family: "@",
        references: "=",
      },
      controller: pieChartController,
    };
  }

  function pieChartController($scope, Util, PopupService) {
    $scope.popupUrl = "app/directives/pie-chart/popup/";
    $scope.popup = PopupService;

    $scope.colors = [];

    // The concepts array
    $scope.concepts = [];

    // Percentages
    $scope.percentages = [];

    // Occurences
    $scope.occurences = [];

    /************************** Watchers **********************************/

    $scope.$watch(
      function () {
        return $scope.references;
      },
      function () {
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
      //0.Init colors
      for (var i = 0; i < 100; i++) {
        $scope.colors.push($scope.getRandomColor());
      }
      //1. Generate the concepts from the references
      $scope.generateConcepts();

      //2. Generate Statistics (Count of occurences of concept + Percentage)
      $scope.generateStatistics();

      //3. Generate display object (put all  concepts-percentages-occcurencies in an object to be able to sort)
      $scope.generateDisplayConcepts();
    };

    $scope.generateConcepts = function () {
      for (var i = 0; i < $scope.references.length; i++) {
        var concept = $scope.references[i].name.value;

        if (concept && !Util.exists($scope.concepts, concept)) {
          $scope.concepts.push(concept);
        }
      }
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

    // Generate the total occurences of a concept in time and the percentage.
    $scope.generateStatistics = function () {
      var total = 0;

      for (var i = 0; i < $scope.concepts.length; i++) {
        $scope.occurences[i] = 0;
        $scope.percentages[i] = 0;

        for (var j = 0; j < $scope.references.length; j++) {
          var concept = $scope.references[j].name.value;

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
    };

    $scope.init = function () {
      $scope.buildVisualizationData();
    };

    $scope.init();
  }
})();

 
