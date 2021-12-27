(function () {
  "use strict";

  angular.module("TIMECAPSULE").factory("UsersFactory", UsersFactory);

  UsersFactory.$inject = ["$http", "Global"];

  function UsersFactory($http, Global) {
    var api = Global.api;

    var factory = {};

    factory.GetAll = GetAll;
    factory.GetById = GetById;
    factory.Create = Create;
    factory.Update = Update;
    factory.Delete = Delete;

    return factory;

    // Get all users
    function GetAll() {
      return $http.get(api + "/users").then(handleSuccess, handleError);
    }

    // Get a user by {id}
    function GetById(id) {
      return $http.get(api + "/users/" + id).then(handleSuccess, handleError);
    }

    // Create a new user
    function Create(user) {
      return $http.post(api + "/users", user).then(handleSuccess, handleError);
    }

    // Update a user
    function Update(user) {
      return $http
        .put(api + "/users/" + user.id, user)
        .then(handleSuccess, handleError);
    }

    // Delete the user with {id}
    function Delete(id) {
      return $http
        .delete(api + "/users/" + id)
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
