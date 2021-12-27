(function () {
   
'use strict';

angular.module('TIMECAPSULE').factory('QueryFactory', QueryFactory);

QueryFactory.$inject = ['$http','Global'];

function QueryFactory($http,Global)
{

    var api = Global.sparql;
    var format = "&format=json";

    var factory = {};
    
    factory.ExecuteQuery = ExecuteQuery;
     
 

    return factory;
    
     
    
    // Execute the query and get the results
    function ExecuteQuery(query)
    {   
        return $http.get(api + query + format).then(handleSuccess, handleError);
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