(function () {
  "use strict";

  angular
    .module("TIMECAPSULE")
    .factory("TimecapsulesFactory", TimecapsulesFactory);

  TimecapsulesFactory.$inject = ["$http", "Global"];

  function TimecapsulesFactory($http, Global) {
    var api = Global.api;

    var factory = {};

    factory.GetAll = GetAll;
    factory.GetById = GetById;
    factory.Create = Create;
    factory.Update = Update;
    factory.Delete = Delete;

    return factory;

    // Get all
    function GetAll(userId) {
      return $http
        .get(api + "/users/" + userId + "/timecapsules")
        .then(handleSuccess, handleError);
    }

    // Get  by {id}
    function GetById(id) {
      return $http
        .get(api + "/users/" + userId + "/timecapsules" + id)
        .then(handleSuccess, handleError);
    }

    // Create
    function Create(item) {
      return $http
        .post(api + "/users/" + item.userId + "/timecapsules", item)
        .then(handleSuccess, handleError);
    }

    // Update
    function Update(item) {
      return $http
        .put(api + "/users/" + userId + "/timecapsules" + item.id, item)
        .then(handleSuccess, handleError);
    }

    // Delete
    function Delete(userId, id) {
      return $http
        .delete(api + "/users/" + userId + "/timecapsules/" + id)
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
