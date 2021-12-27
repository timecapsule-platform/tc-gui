(function(){

	"use strict";

	// Create the Controller
	angular.module("TIMECAPSULE").controller('loginController', loginController);

	// Inject services to the Controller
	loginController.$inject = ["$scope","Auth","$state","ErrorHandler","Company","Data"];
  
    function loginController($scope,Auth,$state,ErrorHandler,Company,Data)
    {

        $scope.auth = Auth;
        $scope.data = Data;
        $scope.username = "";
        $scope.password = "";
        $scope.message = "";
        
        
        $scope.$watch(function () { return $scope.auth.login },function()
        {    
            if($scope.auth.login)
            {   
                $state.go("dashboard");
            }
        });
        
        // All loading elements
         $scope.isLoading =
         {
             page: false,
             create: false,
             edit: false,
             delete: false
         };
        
        $scope.guestSignIn = function()
        {
            $scope.username = 'guest';
            $scope.password = '123qwe##';
            $scope.signIn();
        }
        
        $scope.signIn = function()
        {   
            var credentials = {};
            credentials.username = $scope.username;
            credentials.password = $scope.password;
            
            $scope.isLoading.page = true;
            
            $scope.auth.Authenticate(credentials).then(function(result)
            { 
                console.log(result);
                if(!result.error)
                {   
                    $scope.auth.signIn(result);
                    $scope.data.init();
                }
                else
                {  
                    $scope.isLoading.page = false;
                    ErrorHandler.handleErrorCode(result.code);
                }
            });

        }
        
         
        

    }
    
})();

