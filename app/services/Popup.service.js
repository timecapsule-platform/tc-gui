(function () {
  "use strict";

  angular.module("TIMECAPSULE").factory("PopupService", PopupService);

  PopupService.$inject = [];

  function PopupService() {
    var factory = {};

    factory.dialog = null;
    factory.resource = null;
    factory.selectDialog = null;
    factory.selector = null;

    factory.closeAll = closeAll;

    return factory;

    function closeAll() {
      if (this.dialog) {
        this.dialog.close();
      }

      if (this.selectDialog) {
        this.selectDialog.close();
      }

      if (this.selector) {
        this.selector.close();
      }
    }
  }
})();
