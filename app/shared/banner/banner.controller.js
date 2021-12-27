(function () {
  "use strict";

  // Create the Controller
  angular
    .module("TIMECAPSULE")
    .controller("bannerController", bannerController);

  // Inject services to the Controller
  bannerController.$inject = ["$scope", "Navigation", "Auth"];

  // Controller Logic
  function bannerController($scope, Navigation, Auth) {
    $scope.role = Auth.getUserRoleDisplayText();

    $scope.toggleUserMenu = function () {
      $scope.userMenu = !$scope.userMenu;
    };

    $scope.init = function () {};

    $scope.init();
  }
})();

