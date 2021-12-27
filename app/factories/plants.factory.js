(function () {
  "use strict";

  angular.module("TIMECAPSULE").factory("PlantsFactory", PlantsFactory);

  PlantsFactory.$inject = ["$http", "Global"];

  function PlantsFactory($http, Global) {
    var api = Global.api;

    var factory = {};

    factory.GetAll = GetAll;
    factory.GetById = GetById;
    factory.Create = Create;
    factory.Update = Update;
    factory.Delete = Delete;

    factory.GetSnipendalImages = GetSnipendalImages;

    factory.GetPlantOfVariant = GetPlantOfVariant;

    factory.GetRaw = GetRaw;

    return factory;

    // Get all Snippendal images
    function GetSnipendalImages() {
      return $http
        .get("assets/data/snipendal-images.json")
        .then(handleSuccess, handleError);
    }

    // Get the plant name of a name variant
    function GetPlantOfVariant(variant) {
      return $http
        .get(api + "/plants/variants/" + variant)
        .then(handleSuccess, handleError);
    }

    // Get all plants
    function GetAll(searchText) {
      return $http
        .get(api + "/plants" + "?search=" + searchText)
        .then(handleSuccess, handleError);
    }

    // Get all plants
    function GetRaw() {
      return $http
        .get("assets/data/ecob-plants-raw.json")
        .then(handleSuccess, handleError);
    }

    // Get a plant by {id}
    function GetById(id) {
      return $http.get(api + "/plants/" + id).then(handleSuccess, handleError);
    }

    // Create a new plant
    function Create(plant) {
      return $http
        .post(api + "/plants", plant)
        .then(handleSuccess, handleError);
    }

    // Update a worker
    function Update(plant) {
      return $http
        .put(api + "/plants/" + plant.id, plant)
        .then(handleSuccess, handleError);
    }

    // Delete the plant with {id}
    function Delete(id) {
      return $http
        .delete(api + "/plants/" + id)
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
