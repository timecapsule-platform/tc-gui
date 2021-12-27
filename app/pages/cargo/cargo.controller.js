(function () {
  "use strict";

  // Create the Controller
  angular.module("TIMECAPSULE").controller("cargoController", cargoController);

  // Inject services to the Controller
  cargoController.$inject = [
    "$scope",
    "$state",
    "Global",
    "Auth",
    "Navigation",
    "Util",
    "Data",
    "PopupService",
    "MessageService",
    "ErrorHandler",
    "DataFactory",
    "QueryFactory",
    "NgMap",
  ];

  // Controller Logic
  function cargoController(
    $scope,
    $state,
    Global,
    Auth,
    Navigation,
    Util,
    Data,
    PopupService,
    MessageService,
    ErrorHandler,
    DataFactory,
    QueryFactory,
    NgMap
  ) {
    // Urls for the View
    $scope.url = "app/pages/query-machine/";
    $scope.popupUrl = "app/pages/query-machine/popup/";

    // Get the utility functions to this scope
    $scope.util = Util;

    // The popup service
    $scope.popup = PopupService;

    // The service to handle all messages
    $scope.message = MessageService;

    // The Data Factory
    $scope.data = Data;

    // All loading elements
    $scope.isLoading = {
      page: false,
      create: false,
      edit: false,
      delete: false,
    };

    // Use this object as a model for CRUD data
    $scope.item = {};

    $scope.items = [];

    $scope.sortOrder = "name";

    $scope.filters = {
      role: "all",
      search: "",
      ship: { search: "", selected: null },
      arrival: { search: "", selected: null },
      departure: { search: "", selected: null },
      date: null,
    };

    $scope.cargoFilter = {
      all: true,
      plants: false,
      animals: false,
      minerals: false,
      type: "All",
    };

    $scope.item = null;

    $scope.slider = {
      min: 1500,
      max: 1600,
      options: {
        floor: 1400,
        ceil: 1950,
      },
    };

    $scope.resultsLimit = 80;

    $scope.results = [];

    $scope.mapDisplay = false;

    $scope.popupUrl = "app/pages/cargo/popup/";

    $scope.$on("$destroy", function () {
      $scope.clearMarkers();
    });

    /*********************  Watchers  *********************************/

    $scope.$watch(
      function () {
        return $scope.filters.search;
      },
      function () {
        $scope.getCargo();
      }
    );

    $scope.$watch(
      function () {
        return $scope.filters.ship.search;
      },
      function () {
        $scope.getShips();
      }
    );

    $scope.$watch(
      function () {
        return $scope.filters.arrival.search;
      },
      function () {
        $scope.getArrivals();
      }
    );

    $scope.$watch(
      function () {
        return $scope.filters.departure.search;
      },
      function () {
        $scope.getDepartures();
      }
    );

    $scope.$watch(
      function () {
        return $scope.filters.ship.selected;
      },
      function () {
        if ($scope.item && $scope.item.name) {
          $scope.getCargoVoyages($scope.item.name);
        }
      }
    );

    $scope.$watch(
      function () {
        return $scope.filters.departure.selected;
      },
      function () {
        if ($scope.item && $scope.item.name) {
          $scope.countResults($scope.item.name);
          $scope.getCargoVoyages($scope.item.name);
        }
      }
    );

    $scope.$watch(
      function () {
        return $scope.filters.arrival.selected;
      },
      function () {
        if ($scope.item && $scope.item.name) {
          $scope.countResults($scope.item.name);
          $scope.getCargoVoyages($scope.item.name);
        }
      }
    );

    $scope.$watch(
      function () {
        return $scope.filters.date;
      },
      function () {
        if ($scope.item && $scope.item.name) {
          $scope.countResults($scope.item.name);
          $scope.getCargoVoyages($scope.item.name);
        }
      }
    );

    /*********************  Business Logic  *********************************/

    $scope.clearMarkers = function () {
      if ($scope.aMarker) {
        $scope.aMarker.setMap(null);
      }
      if ($scope.dMarker) {
        $scope.dMarker.setMap(null);
      }

      if ($scope.polyline) {
        $scope.polyline.setMap(null);
      }
    };

    $scope.showMap = function () {
      $scope.mapDisplay = true;

      setTimeout(function () {
        $scope.generateMarkers();
      }, 1000);

      $scope.clearMarkers();
    };

    $scope.generateMarkers = function () {
      NgMap.getMap().then(function (map) {
        $scope.clearMarkers();
        $scope.map = map;

        // Add the markers
        $scope.aMarker = new google.maps.Marker({
          //icon: markerIcon,
          position: {
            lat: Number($scope.item.alatitude.value),
            lng: Number($scope.item.alongitude.value),
          },
          map: map,
        });

        $scope.dMarker = new google.maps.Marker({
          //icon: markerIcon,
          position: {
            lat: Number($scope.item.dlatitude.value),
            lng: Number($scope.item.dlongitude.value),
          },
          map: map,
        });

        // Add the route
        $scope.route = [
          {
            lat: Number($scope.item.dlatitude.value),
            lng: Number($scope.item.dlongitude.value),
          },
          {
            lat: Number($scope.item.alatitude.value),
            lng: Number($scope.item.alongitude.value),
          },
        ];

        $scope.polyline = new google.maps.Polyline({
          path: $scope.route,
          strokeColor: "#ff0000",
          strokeOpacity: 0.6,
          strokeWeight: 5,
        });

        $scope.polyline.setMap(map);

        if ($scope.item.alatitude && $scope.item.alongitude) {
          var aInfoText = "<h2>" + $scope.item.arrival.value + "</h2>";
          aInfoText +=
            "<b>Latitude: " + $scope.item.alatitude.value + "</b><br/>";
          aInfoText +=
            "<b>Longitude: " + $scope.item.alongitude.value + "</b><br/>";
          // Add the infowindow
          $scope.addInfoWindow($scope.aMarker, aInfoText);
        }

        if ($scope.item.dlatitude && $scope.item.dlongitude) {
          var dInfoText = "<h2>" + $scope.item.departure.value + "</h2>";
          dInfoText +=
            "<b>Latitude: " + $scope.item.dlatitude.value + "</b><br/>";
          dInfoText +=
            "<b>Longitude: " + $scope.item.dlongitude.value + "</b><br/>";
          // Add the infowindow
          $scope.addInfoWindow($scope.dMarker, dInfoText);
        }
      });
    };

    // Adds an info window to map
    $scope.addInfoWindow = function (marker, message) {
      var infoWindow = new google.maps.InfoWindow({
        content: message,
      });

      google.maps.event.addListener(marker, "click", function () {
        if ($scope.currentInfoWindow) {
          $scope.currentInfoWindow.close();
        }
        infoWindow.open($scope.map, marker);
        $scope.currentInfoWindow = infoWindow;
      });
    };

    $scope.setFilter = function (type, value) {
      if (type == "ship") {
        $scope.filters.ship.selected = value;
      } else if (type == "departure") {
        $scope.filters.departure.selected = value;
      } else if (type == "arrival") {
        $scope.filters.arrival.selected = value;
      } else if (type == "date") {
        if (value) {
          $scope.filters.date = { from: value.min, to: value.max };
        } else {
          $scope.filters.date = null;
        }
      }

      $scope.popup.dialog.close();
    };

    $scope.filterCargo = function (cargo) {
      return (
        $scope.cargoFilter.type == "All" ||
        $scope.cargoFilter.type == cargo.type
      );
    };

    $scope.setCargoFilter = function (filter) {
      if (filter == "All") {
        $scope.cargoFilter = {
          all: true,
          plants: false,
          animals: false,
          minerals: false,
          type: filter,
        };
      } else if (filter == "Plant") {
        $scope.cargoFilter = {
          all: false,
          plants: true,
          animals: false,
          minerals: false,
          type: filter,
        };
      } else if (filter == "Animal") {
        $scope.cargoFilter = {
          all: false,
          plants: false,
          animals: true,
          minerals: false,
          type: filter,
        };
      } else if (filter == "Mineral") {
        $scope.cargoFilter = {
          all: false,
          plants: false,
          animals: false,
          minerals: true,
          type: filter,
        };
      }
    };

    $scope.isSelected = function (item) {
      return $scope.item && item.name == $scope.item.name;
    };

    $scope.selectItem = function (item) {
      $scope.item = angular.copy(item);

      $scope.countResults($scope.item.name);
      $scope.getCargoVoyages($scope.item.name);
    };

    /*********************  Popups  *********************************/

    $scope.showDetailsPopup = function (item) {
      $scope.message.clear();
      $scope.item = item;

      $scope.popup.dialog = Util.showPopup(
        $scope.popupUrl + "details.popup.html",
        $scope
      );
      $scope.showMap();
    };

    $scope.showShipsPopup = function () {
      $scope.message.clear();

      $scope.popup.dialog = Util.showPopup(
        $scope.popupUrl + "ships.popup.html",
        $scope
      );
    };

    $scope.showArrivalsPopup = function () {
      $scope.message.clear();

      $scope.popup.dialog = Util.showPopup(
        $scope.popupUrl + "arrivals.popup.html",
        $scope
      );
    };

    $scope.showDeparturesPopup = function () {
      $scope.message.clear();

      $scope.popup.dialog = Util.showPopup(
        $scope.popupUrl + "departures.popup.html",
        $scope
      );
    };

    $scope.showDatePopup = function () {
      $scope.message.clear();

      $scope.popup.dialog = Util.showPopup(
        $scope.popupUrl + "date.popup.html",
        $scope
      );
    };

    /********************* CRUD actions *********************************/

    ///////////////////////////  Count Voyages     ////////////////////////////////

    $scope.countResults = function (cargo) {
      var sparql = "";
      sparql += "SELECT  (COUNT(*) as ?count) WHERE { {";
      sparql +=
        "SELECT DISTINCT  ?ship ?departure ?arrival ?dateDeparture ?dateArrival ?category ?description ?alatitude ?alongitude ?dlatitude ?dlongitude ?quantityValue ?quantityUnit ";
      sparql +=
        "FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/boekhouder> ";
      sparql += "WHERE { ";

      sparql +=
        "?nv " + Global.ns + 'nameVariant "' + cargo + '"^^xsd:string. ';
      sparql += "?reference " + Global.ns + "refersTo ?nv. ";
      sparql += "?reference " + Global.ns + "cargoIn ?voyage. ";

      sparql += "OPTIONAL {";
      sparql += "?reference " + Global.ns + "category ?category. ";
      sparql += "}. ";

      sparql += "OPTIONAL {";
      sparql += "?reference " + Global.ns + "description ?description. ";
      sparql += "}. ";

      sparql += "OPTIONAL {";
      sparql += "?reference " + Global.ns + "hasQuantity ?quantity. ";
      sparql += "?quantity " + Global.ns + "quantityValue ?quantityValue. ";
      sparql += "?quantity " + Global.ns + "unit ?quantityUnit. ";
      sparql += "}. ";

      sparql += "OPTIONAL {";
      sparql += "?voyage " + Global.ns + "hasShip ?s. ";
      sparql += "?s " + Global.ns + "name ?ship. ";
      sparql += "}. ";

      sparql += "OPTIONAL {";
      sparql += " ?voyage " + Global.ns + "hasDeparture ?d.";
      sparql += " ?d " + Global.ns + "hasLocation ?departureLocation.";
      sparql += " ?departureLocation " + Global.ns + "name ?departure.";
      sparql += "OPTIONAL {";
      sparql += " ?d " + Global.ns + "date ?dateDeparture.";
      if ($scope.filters.date) {
        sparql +=
          ' FILTER(xsd:date(?dateDeparture) > "' +
          $scope.filters.date.from +
          '-01-01"^^xsd:date). ';
      }
      sparql += " }. ";
      sparql += "OPTIONAL {";
      sparql += " ?d " + Global.ns + "hasLocation ?dpoint.";
      sparql += " ?dpoint " + Global.ns + "latitude ?dlatitude.";
      sparql += " ?dpoint " + Global.ns + "longitude ?dlongitude.";
      sparql += " }. ";
      sparql += " }. ";

      sparql += "OPTIONAL {";
      sparql += " ?voyage " + Global.ns + "hasArrival ?a.";
      sparql += " ?a " + Global.ns + "hasLocation ?arrivalLocation.";
      sparql += " ?arrivalLocation " + Global.ns + "name ?arrival.";
      sparql += "OPTIONAL {";
      sparql += " ?a " + Global.ns + "date ?dateArrival.";
      if ($scope.filters.date) {
        sparql +=
          ' FILTER(xsd:date(?dateArrival) < "' +
          $scope.filters.date.to +
          '-01-01"^^xsd:date). ';
      }
      sparql += " }. ";
      sparql += "OPTIONAL {";
      sparql += " ?a " + Global.ns + "hasLocation ?apoint.";
      sparql += " ?apoint " + Global.ns + "latitude ?alatitude.";
      sparql += " ?apoint " + Global.ns + "longitude ?alongitude.";
      sparql += " }. ";
      sparql += " }. ";

      if ($scope.filters.ship.selected) {
        sparql += "?voyage " + Global.ns + "hasShip ?s. ";
        sparql +=
          "?s " +
          Global.ns +
          'name "' +
          $scope.filters.ship.selected.name +
          '"^^xsd:string. ';
      }

      if ($scope.filters.departure.selected) {
        sparql += " ?voyage " + Global.ns + "hasDeparture ?d.";
        sparql += " ?d " + Global.ns + "hasLocation ?departureLocation.";
        sparql +=
          " ?departureLocation " +
          Global.ns +
          'name "' +
          $scope.filters.departure.selected.name +
          '"^^xsd:string. ';
      }

      if ($scope.filters.arrival.selected) {
        sparql += " ?voyage " + Global.ns + "hasArrival ?a.";
        sparql += " ?a " + Global.ns + "hasLocation ?arrivalLocation.";
        sparql +=
          " ?arrivalLocation " +
          Global.ns +
          'name "' +
          $scope.filters.arrival.selected.name +
          '"^^xsd:string. ';
      }

      sparql += " } ";
      sparql += " } } ";

      console.log(sparql);
      $scope.isLoading.resultsCount = true;

      QueryFactory.ExecuteQuery(sparql).then(function (result) {
        $scope.isLoading.resultsCount = false;
        console.log(result);
        if (!result.error) {
          $scope.resultsCount = result.results.bindings[0].count.value;
        } else {
          ErrorHandler.handleErrorCode(result.code);
        }
      });
    };

    ///////////////////////////    Get voyages with limit    ////////////////////////////////////
    $scope.getCargoVoyages = function (cargo) {
      console.log($scope.filters);
      var sparql = "";

      sparql +=
        "SELECT DISTINCT  ?ship ?departure ?arrival ?dateDeparture ?dateArrival ?category ?description ?alatitude ?alongitude ?dlatitude ?dlongitude ?quantityValue ?quantityUnit ";
      sparql +=
        "FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/boekhouder> ";
      sparql += "WHERE { ";

      sparql +=
        "?nv " + Global.ns + 'nameVariant "' + cargo + '"^^xsd:string. ';
      sparql += "?reference " + Global.ns + "refersTo ?nv. ";
      sparql += "?reference " + Global.ns + "cargoIn ?voyage. ";

      sparql += "OPTIONAL {";
      sparql += "?reference " + Global.ns + "category ?category. ";
      sparql += "}. ";

      sparql += "OPTIONAL {";
      sparql += "?reference " + Global.ns + "description ?description. ";
      sparql += "}. ";

      sparql += "OPTIONAL {";
      sparql += "?reference " + Global.ns + "hasQuantity ?quantity. ";
      sparql += "?quantity " + Global.ns + "quantityValue ?quantityValue. ";
      sparql += "?quantity " + Global.ns + "unit ?quantityUnit. ";
      sparql += "}. ";

      sparql += "OPTIONAL {";
      sparql += "?voyage " + Global.ns + "hasShip ?s. ";
      sparql += "?s " + Global.ns + "name ?ship. ";
      sparql += "}. ";

      sparql += "OPTIONAL {";
      sparql += " ?voyage " + Global.ns + "hasDeparture ?d.";
      sparql += " ?d " + Global.ns + "hasLocation ?departureLocation.";
      sparql += " ?departureLocation " + Global.ns + "name ?departure.";
      sparql += "OPTIONAL {";
      sparql += " ?d " + Global.ns + "date ?dateDeparture.";
      if ($scope.filters.date) {
        sparql +=
          ' FILTER(xsd:date(?dateDeparture) > "' +
          $scope.filters.date.from +
          '-01-01"^^xsd:date). ';
      }
      sparql += " }. ";
      sparql += "OPTIONAL {";
      sparql += " ?d " + Global.ns + "hasLocation ?dpoint.";
      sparql += " ?dpoint " + Global.ns + "latitude ?dlatitude.";
      sparql += " ?dpoint " + Global.ns + "longitude ?dlongitude.";
      sparql += " }. ";
      sparql += " }. ";

      sparql += "OPTIONAL {";
      sparql += " ?voyage " + Global.ns + "hasArrival ?a.";
      sparql += " ?a " + Global.ns + "hasLocation ?arrivalLocation.";
      sparql += " ?arrivalLocation " + Global.ns + "name ?arrival.";
      sparql += "OPTIONAL {";
      sparql += " ?a " + Global.ns + "date ?dateArrival.";
      if ($scope.filters.date) {
        sparql +=
          ' FILTER(xsd:date(?dateArrival) < "' +
          $scope.filters.date.to +
          '-01-01"^^xsd:date). ';
      }
      sparql += " }. ";
      sparql += "OPTIONAL {";
      sparql += " ?a " + Global.ns + "hasLocation ?apoint.";
      sparql += " ?apoint " + Global.ns + "latitude ?alatitude.";
      sparql += " ?apoint " + Global.ns + "longitude ?alongitude.";
      sparql += " }. ";
      sparql += " }. ";

      if ($scope.filters.ship.selected) {
        sparql += "?voyage " + Global.ns + "hasShip ?s. ";
        sparql +=
          "?s " +
          Global.ns +
          'name "' +
          $scope.filters.ship.selected.name +
          '"^^xsd:string. ';
      }

      if ($scope.filters.departure.selected) {
        sparql += " ?voyage " + Global.ns + "hasDeparture ?d.";
        sparql += " ?d " + Global.ns + "hasLocation ?departureLocation.";
        sparql +=
          " ?departureLocation " +
          Global.ns +
          'name "' +
          $scope.filters.departure.selected.name +
          '"^^xsd:string. ';
      }

      if ($scope.filters.arrival.selected) {
        sparql += " ?voyage " + Global.ns + "hasArrival ?a.";
        sparql += " ?a " + Global.ns + "hasLocation ?arrivalLocation.";
        sparql +=
          " ?arrivalLocation " +
          Global.ns +
          'name "' +
          $scope.filters.arrival.selected.name +
          '"^^xsd:string. ';
      }

      sparql +=
        " } ORDER BY ASC(?dateDeparture) LIMIT " +
        $scope.resultsLimit +
        " OFFSET 0";

      console.log(sparql);
      $scope.isLoading.results = true;

      QueryFactory.ExecuteQuery(sparql).then(function (result) {
        $scope.isLoading.results = false;
        console.log(result);
        if (!result.error) {
          $scope.results = result.results.bindings;
        } else {
          ErrorHandler.handleErrorCode(result.code);
        }
      });
    };

    ///////////////////////////    Get All remaining cargo voyages   ////////////////////////////////////
    $scope.getAllCargoVoyages = function (cargo) {
      var sparql = "";

      sparql +=
        "SELECT DISTINCT  ?ship ?departure ?arrival ?dateDeparture ?dateArrival ?category ?description ?alatitude ?alongitude ?dlatitude ?dlongitude ?quantityValue ?quantityUnit ";
      sparql +=
        "FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/boekhouder> ";
      sparql += "WHERE { ";

      sparql +=
        "?nv " + Global.ns + 'nameVariant "' + cargo + '"^^xsd:string. ';
      sparql += "?reference " + Global.ns + "refersTo ?nv. ";
      sparql += "?reference " + Global.ns + "cargoIn ?voyage. ";

      sparql += "OPTIONAL {";
      sparql += "?reference " + Global.ns + "category ?category. ";
      sparql += "}. ";

      sparql += "OPTIONAL {";
      sparql += "?reference " + Global.ns + "description ?description. ";
      sparql += "}. ";

      sparql += "OPTIONAL {";
      sparql += "?reference " + Global.ns + "hasQuantity ?quantity. ";
      sparql += "?quantity " + Global.ns + "quantityValue ?quantityValue. ";
      sparql += "?quantity " + Global.ns + "unit ?quantityUnit. ";
      sparql += "}. ";

      sparql += "OPTIONAL {";
      sparql += "?voyage " + Global.ns + "hasShip ?s. ";
      sparql += "?s " + Global.ns + "name ?ship. ";
      sparql += "}. ";

      sparql += "OPTIONAL {";
      sparql += " ?voyage " + Global.ns + "hasDeparture ?d.";
      sparql += " ?d " + Global.ns + "hasLocation ?departureLocation.";
      sparql += " ?departureLocation " + Global.ns + "name ?departure.";
      sparql += "OPTIONAL {";
      sparql += " ?d " + Global.ns + "date ?dateDeparture.";
      if ($scope.filters.date) {
        sparql +=
          ' FILTER(xsd:date(?dateDeparture) > "' +
          $scope.filters.date.from +
          '-01-01"^^xsd:date). ';
      }
      sparql += " }. ";
      sparql += "OPTIONAL {";
      sparql += " ?d " + Global.ns + "hasLocation ?dpoint.";
      sparql += " ?dpoint " + Global.ns + "latitude ?dlatitude.";
      sparql += " ?dpoint " + Global.ns + "longitude ?dlongitude.";
      sparql += " }. ";
      sparql += " }. ";

      sparql += "OPTIONAL {";
      sparql += " ?voyage " + Global.ns + "hasArrival ?a.";
      sparql += " ?a " + Global.ns + "hasLocation ?arrivalLocation.";
      sparql += " ?arrivalLocation " + Global.ns + "name ?arrival.";
      sparql += "OPTIONAL {";
      sparql += " ?a " + Global.ns + "date ?dateArrival.";
      if ($scope.filters.date) {
        sparql +=
          ' FILTER(xsd:date(?dateArrival) < "' +
          $scope.filters.date.to +
          '-01-01"^^xsd:date). ';
      }
      sparql += " }. ";
      sparql += "OPTIONAL {";
      sparql += " ?a " + Global.ns + "hasLocation ?apoint.";
      sparql += " ?apoint " + Global.ns + "latitude ?alatitude.";
      sparql += " ?apoint " + Global.ns + "longitude ?alongitude.";
      sparql += " }. ";
      sparql += " }. ";

      if ($scope.filters.ship.selected) {
        sparql += "?voyage " + Global.ns + "hasShip ?s. ";
        sparql +=
          "?s " +
          Global.ns +
          'name "' +
          $scope.filters.ship.selected.name +
          '"^^xsd:string. ';
      }

      if ($scope.filters.departure.selected) {
        sparql += " ?voyage " + Global.ns + "hasDeparture ?d.";
        sparql += " ?d " + Global.ns + "hasLocation ?departureLocation.";
        sparql +=
          " ?departureLocation " +
          Global.ns +
          'name "' +
          $scope.filters.departure.selected.name +
          '"^^xsd:string. ';
      }

      if ($scope.filters.arrival.selected) {
        sparql += " ?voyage " + Global.ns + "hasArrival ?a.";
        sparql += " ?a " + Global.ns + "hasLocation ?arrivalLocation.";
        sparql +=
          " ?arrivalLocation " +
          Global.ns +
          'name "' +
          $scope.filters.arrival.selected.name +
          '"^^xsd:string. ';
      }

      sparql +=
        " } ORDER BY ASC(?dateDeparture) OFFSET " +
        $scope.resultsLimit +
        " LIMIT 1000";

      console.log(sparql);
      $scope.isLoading.resultsAll = true;

      QueryFactory.ExecuteQuery(sparql).then(function (result) {
        $scope.isLoading.resultsAll = false;
        console.log(result);
        if (!result.error) {
          for (var i = 0; i < result.results.bindings.length; i++) {
            $scope.results.push(result.results.bindings[i]);
          }
        } else {
          ErrorHandler.handleErrorCode(result.code);
        }
      });
    };

    /********************* Data Collectors  *********************************/

    $scope.getDepartures = function () {
      DataFactory.GetDepartures($scope.filters.departure.search).then(function (
        result
      ) {
        if (!result.error) {
          $scope.departures = result;
        } else {
          ErrorHandler.handleErrorCode(result.code);
        }
      });
    };

    $scope.getArrivals = function () {
      DataFactory.GetArrivals($scope.filters.arrival.search).then(function (
        result
      ) {
        if (!result.error) {
          $scope.arrivals = result;
        } else {
          ErrorHandler.handleErrorCode(result.code);
        }
      });
    };

    $scope.getShips = function () {
      DataFactory.GetShips($scope.filters.ship.search).then(function (result) {
        if (!result.error) {
          $scope.ships = result;
        } else {
          ErrorHandler.handleErrorCode(result.code);
        }
      });
    };

    $scope.getCargo = function () {
      DataFactory.GetCargo($scope.filters.search).then(function (result) {
        if (!result.error) {
          $scope.items = result;
        } else {
          ErrorHandler.handleErrorCode(result.code);
        }
      });
    };

    /********************* Initialization *********************************/

    $scope.initNavigation = function () {
      Navigation.setPage("cargo");
      Navigation.navBarClear();
    };

    $scope.init = function () {
      Auth.checkLogin();
      Auth.Authorize("cargo");
      $scope.initNavigation();

      $scope.getCargo();
      $scope.getShips();
      $scope.getArrivals();
      $scope.getDepartures();
    };

    $scope.init();
  }
})();

