(function () {
  "use strict";

  angular.module("TIMECAPSULE").directive("activityRow", activityRowDirective);

  function activityRowDirective() {
    return {
      restrict: "E",
      templateUrl: "app/pages/dashboard/directives/activity-row.template.html",
      scope: { activity: "=" },
    };
  }
})();

 
