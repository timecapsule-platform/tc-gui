(function () {
  "use strict";

  angular.module("TIMECAPSULE").directive("checkbox", checkboxDirective);

  function checkboxDirective() {
    return {
      restrict: "E",
      templateUrl: "app/directives/popup-message/popup-message.template.html",
      scope: {
        options: "=",
        selectValue: "=",
      },
      controller: checkboxController,
    };
  }

  function checkboxController($scope) {}
})();

 
