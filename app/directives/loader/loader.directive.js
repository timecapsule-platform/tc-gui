(function () {
  "use strict";

  angular.module("TIMECAPSULE").directive("loader", loaderDirective);

  function loaderDirective() {
    return {
      restrict: "E",
      templateUrl: "app/directives/loader/loader.template.html",
      controller: loaderController,
      scope: { message: "@?" },
    };

    function loaderController($scope) {
      $scope.text = "";
    }
  }
})();

 
