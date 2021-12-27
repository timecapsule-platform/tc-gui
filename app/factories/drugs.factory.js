(function () {
   
'use strict';

angular.module('TIMECAPSULE').factory('DrugsFactory', DrugsFactory);

DrugsFactory.$inject = ['$http','Global'];

function DrugsFactory($http,Global)
{

    var api = Global.api;

    var factory = {};

    factory.GetAll = GetAll;
    factory.GetById = GetById;
    factory.Create = Create;
    factory.Update = Update;
    factory.Delete = Delete;
     
    
    
    return factory;

    
     
    
    // Get all drugs
    function GetAll(searchText)
    {   
        return $http.get( api + '/drugs'+'?search='+searchText).then(handleSuccess, handleError);
    }


    // Get a drug by {id} 
    function GetById(id)
    {
        return $http.get(api + '/drugs/' + id).then(handleSuccess, handleError);
    }


    // Create a new drug
    function Create(drug)
    {
        return $http.post(api + '/drugs', drug).then(handleSuccess, handleError);
    }


    // Update a worker
    function Update(drug)
    {
        return $http.put(api + '/drugs/'+drug.id, drug).then(handleSuccess, handleError);
    }


    // Delete the drug with {id}
    function Delete(id) 
    {   
        return $http.delete(api + '/drugs/' + id).then(handleSuccess, handleError);
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