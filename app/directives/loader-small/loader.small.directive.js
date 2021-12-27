(function () {
  "use strict";

  angular.module("TIMECAPSULE").directive("loaderSmall", loaderSmallDirective);

  function loaderSmallDirective() {
    return {
      restrict: "E",
      templateUrl: "app/directives/loader-small/loader.small.template.html",
      controller: loaderSmallController,
      scope: { message: "@?" },
    };

    function loaderSmallController($scope) {
      $scope.text = "";
    }
  }
})();

 
