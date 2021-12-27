(function () {
  "use strict";

  // Create the Controller
  angular
    .module("TIMECAPSULE")
    .controller("mineralsController", mineralsController);

  // Inject services to the Controller
  mineralsController.$inject = [
    "$scope",
    "$state",
    "Auth",
    "Navigation",
    "Util",
    "MessageService",
    "ErrorHandler",
    "PopupService",
  ];

  // Controller Logic
  function mineralsController(
    $scope,
    $state,
    Auth,
    Navigation,
    Util,
    MessageService,
    ProductsFactory,
    ErrorHandler,
    PopupService
  ) {
    // Urls for the View
    $scope.url = "app/pages/naturalia/minerals/";
    $scope.popupUrl = "app/pages/naturalia/minerals/popup/";

    // Get the utility functions to this scope
    $scope.util = Util;

    // The service to handle all messages
    $scope.message = MessageService;

    // The popup service
    $scope.popup = PopupService;

    // All loading elements
    $scope.isLoading = {
      page: false,
      create: false,
      edit: false,
      delete: false,
    };

    // Use this object as a model for CRUD data
    $scope.item = {};

    // The items list
    $scope.items = [];

    $scope.sortOrder = "name";

    $scope.filters = {
      search: "",
    };

    // Defines what is the current stock status for a product
    $scope.isStock = function (product, status) {
      if (!product.low_stock) {
        product.low_stock = 10;
      }
      if (status === "normal") {
        if (product.stock >= product.low_stock) {
          return true;
        }
      } else if (status === "low") {
        if (product.stock < product.low_stock && product.stock > 0) {
          return true;
        }
      } else if (status === "depleted") {
        if (product.stock == 0) {
          return true;
        }
      }

      return false;
    };

    // Sets the sorting order of the results according to 'orderValue'.
    // E.g., "name" or "-name", "price" or "-price"
    $scope.orderBy = function (orderValue) {
      $scope.sortOrder = orderValue;
      $scope.popup.dialog.close();
    };

    $scope.applyFilter = function (worker) {
      if (
        $scope.filter === "All" ||
        ($scope.filter === "Pending" &&
          questionnaire.status === "Running" &&
          Number(questionnaire.submited) === 0) ||
        ($scope.filter === "Completed" &&
          Number(questionnaire.submited) === 1) ||
        ($scope.filter === "Expired" &&
          questionnaire.status === "Expired" &&
          Number(questionnaire.submited) === 0) ||
        ($scope.filter === "Canceled" && questionnaire.status === "Canceled")
      ) {
        return true;
      }

      return false;
    };

    /*********************  Popups  *********************************/

    $scope.showDeletePopup = function (item) {
      $scope.message.clear();
      $scope.item = item;

      $scope.popup.dialog = Util.showPopup(
        $scope.popupUrl + "delete.popup.html",
        $scope
      );
    };

    $scope.showEditPopup = function (item) {
      $scope.message.clear();
      $scope.item = Object.assign({}, item);

      $scope.popup.dialog = Util.showPopup(
        $scope.popupUrl + "edit.popup.html",
        $scope
      );
    };

    $scope.showCreatePopup = function () {
      $scope.message.clear();
      $scope.item = {};

      $scope.popup.dialog = Util.showPopup(
        $scope.popupUrl + "create.popup.html",
        $scope
      );
    };

    $scope.showSortFiltersPopup = function () {
      $scope.popup.dialog = Util.showPopup(
        $scope.popupUrl + "sort.popup.html",
        $scope
      );
    };

    /********************* Data Collectors  *********************************/

    /********************* CRUD actions *********************************/

    /********************* Initialization *********************************/

    $scope.initNavigation = function () {
      Navigation.setPage("naturalia");
      Navigation.navBarClear();
      Navigation.navBarPush({
        name: "Προϊόντα",
        link: "products",
        current: true,
      });
    };

    $scope.init = function () {
      Auth.checkLogin();
      Auth.Authorize("naturalia");
      $scope.initNavigation();
    };

    $scope.init();
  }
})();

