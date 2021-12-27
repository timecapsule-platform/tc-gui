(function () {
   
    'use strict';
 
     
    angular.module('TIMECAPSULE').factory('Navigation', Navigation);
 
    Navigation.$inject = ['$http','Global', '$state', 'Util'];
  
 function Navigation($http, Global, $state, Util) {
       
    var api = Global.api;

    var  menuIndex = 
    { 
        dashboard           : 0, 
        queryMachine        : 1,
        naturalia           : 2,
        drugs               : 3,
        sources             : 4,
        cargo               : 5
    };

    var factory = {};

    factory.menu =
    {
        display: false,
        pages: 
        [
            {
                id: 0,
                name: 'Home',
                link: 'dashboard',
                icon: 'menu-home-normal.svg',
                iconActive: 'menu-home-active.svg',
                active: true,
                authorize: ['admin','guest'],
                authorized: false
            },
            {
                id: 1,
                name: 'Query Machine',
                link: 'query-machine',
                icon: 'menu-query-machine-normal.svg',
                iconActive: 'menu-query-machine-active.svg',
                active: false,
                authorize: ['admin','guest'],
                authorized: false
            },
            {
                id: 2,
                name: 'Naturalia',
                link: 'plants',
                icon: 'menu-plants-normal.svg',
                iconActive: 'menu-plants-active.svg',
                active: false,
                authorize: ['admin','guest'],
                authorized: false
            },
            {
                id: 3,
                name: 'Drug Components',
                link: 'drugs',
                icon: 'menu-drugs-normal.svg',
                iconActive: 'menu-drugs-active.svg',
                active: false,
                authorize: ['admin','guest'],
                authorized: false
            },
            {
                id: 4,
                name: 'Reference Sources',
                link: 'sources',
                icon: 'menu-sources-normal.svg',
                iconActive: 'menu-sources-active.svg',
                active: false,
                authorize: ['admin','guest'],
                authorized: false
            },
            {
                id: 5,
                name: 'Cargo & Trade',
                link: 'cargo',
                icon: 'menu-cargo-normal.svg',
                iconActive: 'menu-cargo-active.svg',
                active: false,
                authorize: ['admin','guest'],
                authorized: false
            }

        ]
    };

    factory.page = factory.menu.pages[0];

    factory.isPage = isPage;
    factory.setPage = setPage;
    factory.initMenu = initMenu;
    factory.isAuthorized = isAuthorized; 
     
    factory.navBar = []; 
    factory.navBarClear = navBarClear;
    factory.navBarPush = navBarPush;
    
    return factory;

     /****************************  Navigation Bar ***********************************/ 
     
    function navBarClear()
    {
     this.navBar = [];
    }
     
    function navBarPush(navItem)
    {
        this.navBar.push(navItem);
    }
     
    /****************************  Main Menu ***********************************/ 

     
    // Answers if a user role is authorized to view a specific page 
    function isAuthorized(role,page)
    {
        if ( this.menu.pages[menuIndex[page]].authorize.indexOf(role) > -1)
        {
            return true;
        }
        return false;
    }
     
    function initMenu(role)
    {
         for(var i=0;i<this.menu.pages.length;i++)
         {
             if(this.menu.pages[i].authorize.indexOf(role) > -1)
             {
                 this.menu.pages[i].authorized = true;
             }
         }
    }


    function isPage(page)
    {
        if(this.page.name === page)
        {
            return true;
        }

        return false;
    }


    function setPage(newPage)
    {
        this.page.active = false;
        this.page = this.menu.pages[menuIndex[newPage]];
        this.page.active = true;
    }


}
 
})();