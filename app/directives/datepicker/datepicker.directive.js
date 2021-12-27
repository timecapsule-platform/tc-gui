(function () {
  "use strict";

  angular.module("TIMECAPSULE").directive("datepicker", datepickerDirective);

  function datepickerDirective() {
    return {
      restrict: "E",
      templateUrl: "app/directives/datepicker/datepicker.template.html",
      scope: {
        title: "@",
        date: "=",
        enabled: "=",
      },
      link: datepickerLink,
    };
  }

  function datepickerLink($scope, element, attrs) {
    var datepickerDivText =
      element[0].getElementsByClassName("date-box-text")[0];

    $scope.isEnabled = function () {
      return $scope.enabled;
    };

    $(element.find("input")).datepicker({
      onSelect: function (dateText, inst) {
        $(element.find("input")).val(dateText);

        var date = dateText;

        var dt = new Date(date);
        var day = dt.getDate();
        var month = dt.getMonth() + 1; //January is 0!
        var year = dt.getFullYear();

        $(datepickerDivText).html(day + "/" + month + "/" + year);
        $(datepickerDivText).css("font-weight", "bold");

        $scope.$apply(function () {
          $scope.date = dateText;
        });

        //$scope.$apply();
      },
    });

    $scope.showDatepicker = function () {
      if ($scope.isEnabled()) {
        $(element.find("input")).datepicker("show");
      }
    };

    $scope.isDateSet = function () {
      return $scope.date;
    };
  }
})();

 
