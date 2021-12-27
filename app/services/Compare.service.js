(function () {
  "use strict";

  angular.module("TIMECAPSULE").factory("Compare", Compare);

  Compare.$inject = [
    "$http",
    "Global",
    "ErrorHandler",
    "QueryBuilder",
    "QueryFactory",
  ];

  function Compare($http, Global, ErrorHandler, QueryBuilder, QueryFactory) {
    var factory = {};

    factory.queries = [];

    factory.Clear = Clear;

    factory.init = init;

    return factory;

    function Clear() {
      factory.queries = [];
    }

    function init() {}
  }
})();
