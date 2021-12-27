(function () {
  "use strict";

  // Create the Controller
  angular.module("TIMECAPSULE").controller("menuController", menuController);

  // Inject services to the Controller
  menuController.$inject = ["$scope", "$state", "Navigation"];

  // Controller Logic
  function menuController($scope, $state, Navigation) {
    $scope.menu = Navigation.menu;

    $scope.goTo = function (newState) {
      Navigation.menu.display = false;
      $state.go(newState);
    };

    $scope.init = function () {};

    $scope.init();
  }
})();

