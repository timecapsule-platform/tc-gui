(function () {
  "use strict";

  angular.module("TIMECAPSULE").directive("selectBox", selectBoxDirective);

  function selectBoxDirective() {
    return {
      restrict: "E",
      templateUrl: "app/directives/select-box/select-box.template.html",
      scope: {
        title: "@",
        dataset: "=",
        selected: "=",
        boxText: "@",
      },
      controller: selectBoxController,
    };
  }

  function selectBoxController($scope, Util, PopupService) {
    $scope.popupUrl = "app/directives/select-box/";

    $scope.popup = PopupService;

    $scope.selectItem = function (item) {
      $scope.selected = item;
      $scope.popup.selector.close();
    };

    $scope.isSelected = function () {
      if ($scope.selected) {
        return true;
      }
      return false;
    };

    $scope.showDatasetPopup = function () {
      $scope.popup.selector = Util.showPopup(
        $scope.popupUrl + "select-box-popup.html",
        $scope
      );
    };
  }
})();

 
