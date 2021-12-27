(function () {
   
'use strict';

angular.module('TIMECAPSULE').factory('DataFactory', DataFactory);

DataFactory.$inject = ['$http','Global'];

function DataFactory($http,Global)
{

    var api = Global.api;

    var factory = {};

    factory.GetLocations = GetLocations;
    factory.GetCargo = GetCargo;
    factory.GetShips = GetShips;
    factory.GetArrivals = GetArrivals;
    factory.GetDepartures = GetDepartures;
    factory.GetSources = GetSources;
    factory.GetPlantParts = GetPlantParts;
    factory.GetFamilies = GetFamilies;
    factory.GetPublicationLocations = GetPublicationLocations;
    
    
    return factory;

    
    // Get all Families
    function GetPublicationLocations(searchText)
    {   
        return $http.get( api + '/data/source-locations'+'?search='+searchText).then(handleSuccess, handleError);
    }
    
    // Get all Families
    function GetFamilies(searchText)
    {   
        return $http.get( api + '/data/families'+'?search='+searchText).then(handleSuccess, handleError);
    }
    
    // Get all Plant Parts
    function GetPlantParts(searchText)
    {   
        return $http.get( api + '/data/plant-parts'+'?search='+searchText).then(handleSuccess, handleError);
    }
    
    // Get all Reference Sources
    function GetSources(searchText)
    {   
        return $http.get( api + '/data/sources'+'?search='+searchText).then(handleSuccess, handleError);
    }
    
    // Get all Departures
    function GetDepartures(searchText)
    {   
        return $http.get( api + '/data/departures'+'?search='+searchText).then(handleSuccess, handleError);
    }
    
    // Get all Arrivals
    function GetArrivals(searchText)
    {   
        return $http.get( api + '/data/arrivals'+'?search='+searchText).then(handleSuccess, handleError);
    }
    
    // Get all Ships
    function GetShips(searchText)
    {   
        return $http.get( api + '/data/ships'+'?search='+searchText).then(handleSuccess, handleError);
    }
    
    // Get all Cargo
    function GetCargo(searchText)
    {   
        return $http.get( api + '/cargo'+'?search='+searchText).then(handleSuccess, handleError);
    }
     
    
    // Get all Locations
    function GetLocations(searchText)
    {   
        return $http.get( api + '/locations'+'?search='+searchText).then(handleSuccess, handleError);
    }

 
    
     // Handle a succesful response [ Status code: 200 ]
    function handleSuccess(response) 
    {   
            return response.data;
    }

    // Handle the response if status code is > 299
    function handleError(response)
    { 
        return { error : true, code: response.status, message: response.data.message  }
    }
    

}

})();