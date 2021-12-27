(
	function()
	{

		"use strict";
		
		var app = angular.module('TIMECAPSULE', ['ui.router','ngAnimate','ngDialog','rzModule','chart.js', 'ngMap','angularMoment']);
		
		app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider','$animateProvider', stateDefinition]);
		
		 
		
		function stateDefinition($stateProvider, $urlRouterProvider, $locationProvider, $animateProvider)
		{
            // Enables ng-animate only for elements with this class
            //$animateProvider.classNameFilter(/ng-animate-enabled/);
            
            // Disables ng-animate for elements of this class
            // Removes the Flickering for ng-show ng-hide
            $animateProvider.classNameFilter(/^(?:(?!ng-animate-disabled).)*$/);
    
            
            
    		$urlRouterProvider.otherwise('dashboard');
		  	
            /*************** Main States *****************/
            
			$stateProvider
            .state('dashboard', 
            {  
                url: '/dashboard',  
                templateUrl: 'app/pages/dashboard/dashboard.view.html',
                controller: 'dashboardController',
                data: {}
            } 
            );
             
			 
            $stateProvider
            .state('login',
            {  
                url: '/login',  
                templateUrl: 'app/pages/login/login.view.html'
                
            }
            );
            
			  
            
            $stateProvider
            .state('unauthorized', 
            {  
                url: '/unauthorized',  
                templateUrl: 'app/pages/access/unauthorized.view.html',
                params: { role: null }
            } 
            );
            
            
            /*******************  Query Machine  *************************/
            
            $stateProvider
            .state('query-machine',
            { 
                url: '/query-machine',  
                templateUrl: 'app/pages/query-machine/query-machine.view.html',
                controller: 'queryMachineController'
            }
            );
            
               
            
            /******************* Naturalia:  Plants - Minerals - Animals  *************************/ 
			
            
            $stateProvider
            .state('plants',
            { 
                url: '/naturalia/plants',  
                templateUrl: 'app/pages/naturalia/plants/plants.view.html',
                controller: 'plantsController'
            }
            );
            
            $stateProvider
            .state('animals',
            { 
                url: '/naturalia/animals',  
                templateUrl: 'app/pages/naturalia/animals/animals.view.html',
                controller: 'animalsController'
            }
            );
            
            $stateProvider
            .state('minerals',
            { 
                url: '/naturalia/minerals',  
                templateUrl: 'app/pages/naturalia/minerals/minerals.view.html',
                controller: 'mineralsController'
            }
            );
            
            
             /*******************  Drug Components  *************************/ 
            
            $stateProvider
            .state('drugs',
            { 
                url: '/drug-components',  
                templateUrl: 'app/pages/drugs/drugs.view.html',
                controller: 'drugsController'
            }
            );
            
             /*******************  Sources  *************************/ 
            
            $stateProvider
            .state('sources',
            { 
                url: '/sources',  
                templateUrl: 'app/pages/sources/sources.view.html',
                controller: 'sourcesController'
            }
            );
            
            
             /*******************  Cargo  *************************/ 
            
            $stateProvider
            .state('cargo',
            { 
                url: '/cargo',  
                templateUrl: 'app/pages/cargo/cargo.view.html',
                controller: 'cargoController'
            }
            );
            
            
            
            
            
			  
		}
		  
	
	 	
 	}
	
	
)();