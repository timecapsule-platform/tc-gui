(function () {
  "use strict";

  angular
    .module("TIMECAPSULE")
    .factory("SubscriptionFactory", SubscriptionFactory);

  SubscriptionFactory.$inject = ["$http", "Global"];

  function SubscriptionFactory($http, Global) {
    var api = Global.api;

    var factory = {};

    factory.subscription = null;

    factory.GetSubscription = GetSubscription;
    factory.GetSubscriber = GetSubscriber;

    return factory;

    // Get the subscriber
    function GetSubscriber(id) {
      return $http
        .get(api + "/subscribers/" + id)
        .then(handleSuccess, handleError);
    }

    // Get the subscriber's subscriptions
    function GetSubscription(id) {
      return $http
        .get(api + "/subscribers/" + id + "/subscription")
        .then(handleSuccess, handleError);
    }

    // Handle a succesful response [ Status code: 200 ]
    function handleSuccess(response) {
      return response.data;
    }

    // Handle the response if status code is > 299
    function handleError(response) {
      return {
        error: true,
        code: response.status,
        message: response.data.message,
      };
    }
  }
})();
