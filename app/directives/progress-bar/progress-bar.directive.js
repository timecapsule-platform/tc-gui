(function () {
  "use strict";

  angular.module("TIMECAPSULE").directive("progressBar", progressBarDirective);

  function progressBarDirective() {
    return {
      restrict: "E",
      scope: {
        curVal: "@",
        maxVal: "@",
        tpl: "@",
      },
      templateUrl: function (attrs) {
        console.log(attrs);
        return "app/directives/progress-bar/progress-bar-small.template.html";
      },
      link: progressBarLink,
    };
  }

  function getTemplate($scope) {
    if ($scope.templateType === "normal")
      return "app/directives/progress-bar/progress-bar.template.html";
    else if ($scope.templateType === "small")
      return "app/directives/progress-bar/progress-bar-small.template.html";
    else return "app/directives/progress-bar/progress-bar.template.html";
  }

  function progressBarLink($scope, element, attrs) {
    function updateProgress() {
      var progress = 0;

      if ($scope.maxVal) {
        progress =
          (Math.min($scope.curVal, $scope.maxVal) / $scope.maxVal) *
          element[0].querySelector(".progress-bar").clientWidth;
      }

      element[0].querySelector(".progress-bar-bar").style.width =
        progress + "px";
    }

    $scope.$watch("curVal", updateProgress);
    $scope.$watch("maxVal", updateProgress);
  }
})();
