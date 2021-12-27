(function () {
   
    'use strict';
 
     
    angular.module('TIMECAPSULE').factory('Util', Util);
 
    Util.$inject = ["ngDialog"];
  
    function Util(ngDialog) {
       
	    
		var factory = {};
        
        factory.showPopup = showPopup;
        factory.getIndex = getIndex;
        factory.calculateRemainingDays  = calculateRemainingDays;
        factory.isEmpty = isEmpty;
        factory.isEmptyObject = isEmptyObject;
        factory.roundNum = roundNum;
        factory.getCookie = getCookie;
        factory.setCookie = setCookie;
        factory.getCookieObject = getCookieObject;
        factory.setCookieObject = setCookieObject;
        
        factory.exists = exists;
        factory.referenceExists = referenceExists;
        factory.conceptExists = conceptExists;
        
        return factory;
        
        
        
        // Returns true if the string exists in the array
        // Checks Objects. If there is another object with "name" : name then returns true (exists)
         function conceptExists(array,obj)
         {
             if(array && array.length)
             {
                for(var i=0;i<array.length;i++)
                {
                    if(array[i].name == obj.name)
                    {
                        return i;
                    }
                }
             }
             
             return -1;
         }
        
        
        
        // Returns true if the string exists in the array
         function exists(array,str)
         {
             return (array.indexOf(str) > -1);
         }
         
         // Returns true if the reference exists in array
         function referenceExists(array,reference)
         { 
             if(array && array.length)
             { 
                for(var i=0;i<array.length;i++)
                {  
                    if(array[i].name.value == reference.name.value)
                    {  
                            if(reference.lineNumber && array[i].lineNumber && array[i].lineNumber.value == reference.lineNumber.value)
                            {
                                if(reference.drugVariant && array[i].drugVariant && reference.drugVariant != array[i].drugVariant)
                                {
                                    return false;
                                }
                                
                                return true;
                            }
                            else
                            if(reference.barcode && array[i].barcode && array[i].barcode.value == reference.barcode.value)
                            {
                               return true;
                            }
                            else
                            if(reference.id && array[i].id && array[i].id.value == reference.id.value)
                            {
                               return true;
                            }
                        
                    }
                }
             }
                 
             return false;
         }
        
        
        // Show a dialogue popup
        function showPopup(template,scope)
         { 

             var dialog = ngDialog.open({
                    template: template,
                    className: 'ngdialog-theme-default',
                    scope: scope
                });
             
             return dialog;
         }
        
        function isEmptyObject(obj)
        {
           return Object.keys(obj).length === 0 && obj.constructor === Object
        }
        
        
        // Checks if an array is null or empty
        function isEmpty(array)
        {
            if(array)
            {
                if(array.length === 0)
                {
                    return true;
                }
            }
            
            return false;
        }
        
        // Finds the index of the element with id: "id" in the "array" array.
        function getIndex(array,id)
        {
            if(array)
            {
                for(var i=0;i<array.length;i++)
                {
                    if(array[i].id == id)
                    {
                        return i;
                    }
                }
            }
            return -1;
        }
        
        
        
        // Calculates the number of days until now
        function calculateRemainingDays(date)
        {
            var oneDay = 86400000; //24*60*60*1000 	 
            var dateFrom = new Date(date);
            var dateTo = new Date();

            if(dateFrom < dateTo)
            {
                questionnaire.expireDays = 0;
                return;
            }

            var diff =  (dateFrom.getTime() - dateTo.getTime())/(oneDay);
            questionnaire.expireDays = parseInt(diff) + 1;

        }
        /************* Number formating  ***********/
        
        function roundNum(value, decimals)
        {
            return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
        }
        
       
        /************* Cookies **************/
         
        
        // Sets a new cookie
        function setCookie(key,value)
         {
             document.cookie = key+"="+value;
         }
         
        // Retrieves a cookie
         function getCookie(key)
         {
            var name = key + "=";
            var ca = document.cookie.split(';');
            for(var i=0; i<ca.length; i++)
            {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1);
                if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
            }
            return "";
         }
         
        // Sets a new Cookie Object
         function setCookieObject(key,obj)
         {
             var value = JSON.stringify(obj);
             document.cookie = key+"="+value;
         }
         
        // Retrieves an object from the cookie
         function getCookieObject(key)
         {
            var name = key + "=";
            var ca = document.cookie.split(';');
            for(var i=0; i<ca.length; i++)
            {
                var c = ca[i];
                while (c.charAt(0)==' ')
                {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0)
                {
                    var str = c.substring(name.length,c.length);
                    return JSON.parse(str);
                }
            }
            return "";
         }
 
        
    }
 
})();