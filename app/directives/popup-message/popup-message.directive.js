(function () {
  "use strict";

  angular
    .module("TIMECAPSULE")
    .directive("popupMessage", popupMessageDirective);

  function popupMessageDirective() {
    return {
      restrict: "E",
      templateUrl: "app/directives/popup-message/popup-message.template.html",
      scope: {
        message: "=",
        type: "@",
        close: "=",
      },
      controller: popupMessageController,
    };
  }

  function popupMessageController($scope) {
    $scope.isType = function (type) {
      return $scope.type == type;
    };
  }
})();

 
