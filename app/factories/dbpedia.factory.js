(function () {
   
'use strict';

angular.module('TIMECAPSULE').factory('DBpediaFactory', DBpediaFactory);

DBpediaFactory.$inject = ['$http','Global'];

function DBpediaFactory($http,Global)
{

    var api = "http://dbpedia.org/sparql?query=";
    var format = "&format=json";

    var factory = {};
    
    factory.Query = Query;
     
 

    return factory;
    
     
    
    // Execute the query and get the results
    function Query(query)
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