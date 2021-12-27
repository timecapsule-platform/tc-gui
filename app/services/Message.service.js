(function () {
   
    'use strict';

    angular.module('TIMECAPSULE').factory('MessageService', MessageService);

     MessageService.$inject = [];

     function MessageService()
    {

        var factory = {};
        
         factory.text = 
         {
             error: "",
             success: "",
             info: ""
         }
         
        factory.clear = clear;
        factory.exists = exists;
        factory.isInfo = isInfo;
        factory.isError = isError;
        factory.isSuccess = isSuccess;
        
        return factory;
        
        function clear()
        { 
            this.text.error = "";
            this.text.success = "";
            this.text.info = "";
            
        }
        
        function exists()
        {
             return (this.text.success.length || this.text.info.length || this.text.error.length );
        }
        
        function isInfo()
        {
             return this.text.info.length;
        }
        
        function isError()
        { 
             return this.text.error.length;
        }
        
        function isSuccess()
        {  
             return  this.text.success.length;
        }
          

    }
 
})();