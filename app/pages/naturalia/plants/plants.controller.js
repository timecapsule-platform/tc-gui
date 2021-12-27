(function () {
  "use strict";

  // Create the Controller
  angular
    .module("TIMECAPSULE")
    .controller("plantsController", plantsController);

  // Inject services to the Controller
  plantsController.$inject = [
    "$scope",
    "$rootScope",
    "$state",
    "Global",
    "Auth",
    "Navigation",
    "Util",
    "MessageService",
    "DBpediaFactory",
    "ErrorHandler",
    "PopupService",
    "PlantsFactory",
    "QueryFactory",
    "Data",
    "Resource",
    "ResourcePlant",
    "NgMap",
  ];

  // Controller Logic
  function plantsController(
    $scope,
    $rootScope,
    $state,
    Global,
    Auth,
    Navigation,
    Util,
    MessageService,
    DBpediaFactory,
    ErrorHandler,
    PopupService,
    PlantsFactory,
    QueryFactory,
    Data,
    Resource,
    ResourcePlant,
    NgMap
  ) {
    // Urls for the View
    $scope.url = "app/pages/naturalia/plants/";
    $scope.popupUrl = "app/pages/naturalia/plants/popup/";
    $scope.resourceUrl = "app/shared/resource/";

    // Get the utility functions to this scope
    $scope.util = Util;

    // Init Data Service
    $scope.data = Data;

    // The service to handle all messages
    $scope.message = MessageService;

    // The popup service
    $scope.popup = PopupService;

    // The resource service
    $scope.resource = Resource;

    // All loading elements
    $scope.isLoading = {
      page: false,
      create: false,
      edit: false,
      delete: false,
      dbpedia: false,
      variants: false,
      pDrugs: false,
      sources: false,
      references: false,
      uses: false,
    };

    // Use this object as a model for CRUD data
    $scope.item = {};

    // The items list
    $scope.items = [];

    $scope.sortOrder = "name";

    $scope.filters = {
      search: "",
    };

    $scope.graphs = [
      {
        name: "Brahms",
        iri: "<http://timecapsule.science.uu.nl/TimeCapsule.owl/brahms>",
        enabled: true,
      },
      {
        name: "Snippendaal",
        iri: "<http://timecapsule.science.uu.nl/TimeCapsule.owl/snippendaal>",
        enabled: true,
      },
      {
        name: "Thesaurus",
        iri: "<http://timecapsule.science.uu.nl/TimeCapsule.owl/thesaurus>",
        enabled: true,
      },
      {
        name: "Economic Botany",
        iri: "<http://timecapsule.science.uu.nl/TimeCapsule.owl/economicBotany>",
        enabled: true,
      },
      {
        name: "Radar",
        iri: "<http://timecapsule.science.uu.nl/TimeCapsule.owl/radar>",
        enabled: true,
      },
      {
        name: "Chronologish",
        iri: "<http://timecapsule.science.uu.nl/TimeCapsule.owl/chrono>",
        enabled: true,
      },
    ];

    $scope.fromGraphs = "";
    $scope.fromGraphs +=
      " FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/brahms> ";
    $scope.fromGraphs +=
      " FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/snippendaal> ";
    $scope.fromGraphs +=
      " FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/thesaurus> ";
    $scope.fromGraphs +=
      " FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/economicBotany> ";
    $scope.fromGraphs +=
      " FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/radar> ";
    $scope.fromGraphs +=
      " FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/chrono> ";

    $scope.item.images = [];
    $scope.item = angular.copy($scope.items[0]);

    NgMap.getMap().then(function (map) {});

    $scope.currentInfoWindow = null;

    $scope.$on("$destroy", function () {
      $scope.clearMarkers();
      $scope.clearSourceMarkers();
    });

    $scope.$watch(
      function () {
        return $scope.filters.search;
      },
      function () {
        $scope.getPlants();
      }
    );

    $scope.isSelected = function (item) {
      return $scope.item && item.name == $scope.item.name;
    };

    $scope.findItemImages = function () {
      for (var i = 0; i < $scope.data.SnipendalImages.length; i++) {
        if (
          $scope.item.name
            .toLowerCase()
            .indexOf($scope.data.SnipendalImages[i].name) != -1
        ) {
          $scope.item.images.push($scope.data.SnipendalImages[i].file);
        }
      }
    };

    $scope.selectItem = function (item) {
      $scope.item = angular.copy(item);

      $scope.item.references = [];
      $scope.item.variants = [];
      $scope.item.drugs = [];
      $scope.item.sources = [];

      $scope.getPlantInfo($scope.item.name, $scope.item.plantName);

      $scope.item.images = [];
      $scope.findItemImages();

      $scope.item.plant = $scope.getPlantNameForDBpedia($scope.item.name);

      $scope.dbpediaFound = false;
      $scope.getPlantDBpediaInfo($scope.item.plant.name);
    };

    /*********************  Popups  *********************************/

    $scope.showResource = function (type, name, concept) {
      $scope.message.clear();
      $scope.resource.Get(type, name, concept);

      $scope.popup.resource = Util.showPopup(
        $scope.resourceUrl + "resource.html",
        $scope
      );
    };

    $scope.showEditPopup = function (item) {
      $scope.message.clear();
      $scope.item = Object.assign({}, item);

      $scope.popup.dialog = Util.showPopup(
        $scope.popupUrl + "edit.popup.html",
        $scope
      );
    };

    $scope.showCreatePopup = function () {
      $scope.message.clear();
      $scope.item = {};

      $scope.popup.dialog = Util.showPopup(
        $scope.popupUrl + "create.popup.html",
        $scope
      );
    };

    $scope.showSortFiltersPopup = function () {
      $scope.popup.dialog = Util.showPopup(
        $scope.popupUrl + "sort.popup.html",
        $scope
      );
    };

    /*********************   DBPedia  *********************************/

    // Creates an object with the plant name, plant family
    $scope.getPlantNameForDBpedia = function (name) {
      var plant = {};
      plant.name = name;

      var words = plant.name.split(" ");

      plant.family = words[0];

      if (words[1]) {
        plant.name = words[0] + " " + words[1];
      } else {
        plant.name = words[0];
      }

      return plant;
    };

    $scope.parseDBpediaResult = function (result) {
      $scope.item.dbpediaURL = null;
      $scope.item.abstract = null;
      $scope.item.thumb = null;

      if (result.results.bindings.length > 0) {
        if (result.results.bindings[0].resource) {
          $scope.item.dbpediaURL = result.results.bindings[0].resource.value;
        }
        if (result.results.bindings[0].abstract) {
          $scope.item.abstract = result.results.bindings[0].abstract.value;
        }
        if (result.results.bindings[0].thumb) {
          $scope.item.thumb = result.results.bindings[0].thumb.value;
        }
      } else {
        if (!$scope.dbpediaFound) {
          $scope.dbpediaFound = true;
          $scope.getPlantDBpediaInfo($scope.item.plant.family);
        }
      }
    };

    $scope.getPlantDBpediaInfo = function (plantName) {
      // In this case we request inforamtion about the Genus
      if ($scope.item.plant.family == plantName) {
        $scope.isGenusInformation = true;
      } else {
        $scope.isGenusInformation = false;
      }

      var query = "";

      query += "SELECT ?resource ?abstract ?thumb ";
      query += "WHERE {";
      query += '?resource rdfs:label "' + plantName + '"@en.';
      query += "?resource  <http://dbpedia.org/ontology/abstract> ?abstract.";
      query += "?resource  <http://dbpedia.org/ontology/thumbnail> ?thumb.";
      query += 'FILTER langMatches(lang(?abstract), "en")';
      query += "}";

      DBpediaFactory.Query(query).then(function (result) {
        $scope.isLoading.dbpedia = true;

        if (!result.error) {
          $scope.parseDBpediaResult(result);
          $scope.isLoading.dbpedia = false;
        } else {
          ErrorHandler.handleErrorCode(result.code);
        }
      });
    };

    /********************* CRUD actions *********************************/

    $scope.getPlantInfo = function (name, plantName) {
      // Get Plant References
      $scope.getReferences(plantName);

      // Count References
      $scope.getReferencesCount(plantName);

      // Load the name variants
      $scope.getNameVariants(plantName);

      // Load all drugs the plant produces
      $scope.getDrugs(plantName);

      // Load all reference sources that mention the plant
      $scope.getSources(plantName);

      // Load all plant uses
      $scope.getUses(plantName);

      // Load all plant locations
      $scope.getLocations(plantName);

      // Load all reference source locations
      $scope.getReferenceSourceLocations(plantName);
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////   MAP /////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    $scope.clearMarkers = function () {
      if ($scope.markers && $scope.markers.length) {
        for (var i = 0; i < $scope.markers.length; i++) {
          $scope.markers[i].setMap(null);
        }
      }

      $scope.markers = [];
    };

    $scope.clearSourceMarkers = function () {
      if ($scope.sourceMarkers && $scope.sourceMarkers.length) {
        for (var i = 0; i < $scope.sourceMarkers.length; i++) {
          $scope.sourceMarkers[i].setMap(null);
        }
      }

      $scope.sourceMarkers = [];
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

    $scope.getLocations = function (name) {
      // Clear old markers & re-init markers array
      $scope.clearMarkers();

      var sparql = "";
      sparql +=
        "SELECT DISTINCT ?nameVariant ?lineNumber ?barcode ?id ?sourceName ?point ?locationName ?locationType ?type ?latitude ?longitude ";
      sparql += $scope.fromGraphs;
      sparql += "WHERE { ";
      sparql += "?p a " + Global.ns + "Plant. ";
      sparql += "?p  " + Global.ns + 'name "' + name + '"^^xsd:string. ';
      sparql += "?p " + Global.ns + "hasNameVariant ?nv. ";
      sparql += "?nv " + Global.ns + "nameVariant ?nameVariant. ";
      sparql += "?reference " + Global.ns + "refersTo ?nv. ";

      sparql +=
        "OPTIONAL { ?reference " + Global.ns + "lineNumber ?lineNumber.  }. ";
      sparql += "OPTIONAL { ?reference " + Global.ns + "barcode ?barcode.  }. ";
      sparql += "OPTIONAL { ?reference " + Global.ns + "id ?id.  }. ";

      sparql += "OPTIONAL {";
      sparql += " ?source " + Global.ns + "hasReference ?reference.";
      sparql += " ?source " + Global.ns + "name ?sourceName.";
      sparql += " }. ";

      sparql += "?reference " + Global.ns + "refersLocation ?point. ";
      sparql +=
        "OPTIONAL{ ?reference " + Global.ns + "locationPropertyType ?type. }.";
      sparql += "?point " + Global.ns + "latitude ?latitude. ";
      sparql += "?point " + Global.ns + "longitude ?longitude. ";
      sparql += " OPTIONAL { ";
      sparql += " ?reference " + Global.ns + "refersLocation ?location. ";
      sparql += " ?location " + Global.ns + "name ?locationName. ";
      sparql +=
        " OPTIONAL { ?location " +
        Global.ns +
        "locationType ?locationType. }. ";
      sparql += " }.";

      sparql += " } OFFSET 0 LIMIT 100";

      QueryFactory.ExecuteQuery(sparql).then(function (result) {
        $scope.isLoading.sources = false;

        if (!result.error) {
          var references = result.results.bindings;

          for (var i = 0; i < references.length; i++) {
            var markerIcon = "assets/images/marker-undefined.svg";
            var markerPointer = "Unknown";

            if (references[i].type) {
              if (references[i].type.value == "Grows") {
                markerIcon = "assets/images/marker-grows.svg";
                markerPointer = "Natural Distribution";
              } else if (references[i].type.value == "ArchaeologicalFinding") {
                markerIcon = "assets/images/marker-arcaeological.svg";
                markerPointer = "Archaeological Finding";
              } else if (references[i].type.value == "Cargo") {
                markerIcon = "assets/images/marker-cargo.svg";
                markerPointer = "Cargo";
              }
            }

            $scope.markers[i] = new google.maps.Marker({
              icon: markerIcon,
              position: {
                lat: Number(references[i].latitude.value),
                lng: Number(references[i].longitude.value),
              },
              map: $scope.map,
            });

            var name = "Unknown";
            var type = "Unknown";

            if (references[i].locationName) {
              name = references[i].locationName.value;
            }
            if (references[i].locationType) {
              type = references[i].locationType.value;
            }

            var id = "";
            var idText = "";

            if (references[i].id) {
              id = references[i].id.value;
              idText = "ID";
            } else if (references[i].barcode) {
              id = references[i].barcode.value;
              idText = "Barcode";
            } else if (references[i].lineNumber) {
              id = references[i].lineNumber.value;
              idText = "Line Number";
            }

            var infoText =
              " <b>Name Variant:</b> " +
              references[i].nameVariant.value +
              " <br/>";
            infoText =
              infoText +
              "<b>Reference Source:</b> " +
              references[i].sourceName.value +
              " <br/>";
            infoText = infoText + "<b>" + idText + ":</b> " + id + " <br/>";
            infoText = infoText + "---------------------------------- <br/>";
            infoText = infoText + "<b>Location name:</b> " + name + " <br/>";
            infoText = infoText + " <b>Location Type:</b> " + type + " <br/>";
            infoText =
              infoText +
              " <b>Latitude:</b> " +
              Number(references[i].latitude.value) +
              " <br/>";
            infoText =
              infoText +
              " <b>Longitude:</b> " +
              Number(references[i].longitude.value) +
              " <br/>";

            $scope.addInfoWindow($scope.markers[i], infoText);
          }
        }
      });
    };

    $scope.getReferenceSourceLocations = function (name) {
      // Clear old markers
      $scope.clearSourceMarkers();

      var sparql = "";

      sparql += "SELECT DISTINCT ?point ?latitude ?longitude  ?locationName ";
      sparql += $scope.fromGraphs;
      sparql += "WHERE { ";
      sparql += "?p a " + Global.ns + "Plant. ";
      sparql += "?p  " + Global.ns + 'name "' + name + '"^^xsd:string. ';
      sparql += "?p " + Global.ns + "hasNameVariant ?nv. ";
      sparql += "?reference " + Global.ns + "refersTo ?nv. ";
      sparql += "?source " + Global.ns + "hasReference ?reference. ";
      sparql += " { ";
      sparql += "?source " + Global.ns + "hasLocation ?point. ";
      sparql += " OPTIONAL { ";
      sparql += " ?source " + Global.ns + "hasLocation ?location. ";
      sparql += " ?location " + Global.ns + "name ?locationName. ";
      sparql += " }.";
      sparql += " } ";
      sparql += " UNION ";
      sparql += " { ";
      sparql += "?source " + Global.ns + "refersLocation ?point. ";
      sparql += " OPTIONAL { ";
      sparql += " ?source " + Global.ns + "refersLocation ?location. ";
      sparql += " ?location " + Global.ns + "name ?locationName. ";
      sparql += " }.";
      sparql += " } ";
      sparql += "?point " + Global.ns + "latitude ?latitude. ";
      sparql += "?point " + Global.ns + "longitude ?longitude. ";
      sparql += " } OFFSET 0 LIMIT 1000";

      QueryFactory.ExecuteQuery(sparql).then(function (result) {
        if (!result.error) {
          var references = result.results.bindings;

          for (var i = 0; i < references.length; i++) {
            var markerIcon = "assets/images/marker-source.svg";
            var markerPointer = "Reference Source Location";

            $scope.sourceMarkers[i] = new google.maps.Marker({
              icon: markerIcon,
              position: {
                lat: Number(references[i].latitude.value),
                lng: Number(references[i].longitude.value),
              },
              map: $scope.map,
            });

            var name = "Unknown";
            var type = "Unknown";

            if (references[i].locationName) {
              name = references[i].locationName.value;
            }
            if (references[i].locationType) {
              type = references[i].locationType.value;
            }

            var infoText = "<b>Location name:</b> " + name + " <br/>";
            infoText = infoText + " <b>Location Type:</b> " + type + " <br/>";
            infoText =
              infoText +
              " <b>Latitude:</b> " +
              Number(references[i].latitude.value) +
              " <br/>";
            infoText =
              infoText +
              " <b>Longitude:</b> " +
              Number(references[i].longitude.value) +
              " <br/>";
            infoText =
              infoText +
              " <b>Pointer Explaination:</b> " +
              markerPointer +
              " <br/>";

            $scope.addInfoWindow($scope.sourceMarkers[i], infoText);
          }
        }
      });
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////  EXTRAS        /////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    $scope.getAllPlantReferences = function (name) {
      $scope.isLoading.referencesAll = true;
      $scope.allLoaded = false;

      var sparql = "";

      sparql +=
        "SELECT DISTINCT  ?name ?language ?reference  ?lineNumber ?barcode ?id  ?drugName ?drugVariant ?locationName ?latitude ?longtitude ?sourceName";
      sparql += $scope.fromGraphs;
      sparql += "WHERE { ";
      sparql += "?p  a ex:Plant. ";
      sparql += "?p " + Global.ns + 'name "' + name + '"^^xsd:string. ';
      sparql += "?p " + Global.ns + "hasNameVariant ?nv. ";
      sparql += "?nv " + Global.ns + "nameVariant ?name. ";
      sparql += "?reference " + Global.ns + "refersTo ?nv. ";
      sparql += "OPTIONAL { ?nv " + Global.ns + "language ?language.  }. ";
      sparql +=
        "OPTIONAL { ?reference " + Global.ns + "lineNumber ?lineNumber.  }. ";
      sparql += "OPTIONAL { ?reference " + Global.ns + "barcode ?barcode.  }. ";
      sparql += "OPTIONAL { ?reference " + Global.ns + "id ?id.  }. ";

      sparql += "OPTIONAL {";
      sparql += " ?source " + Global.ns + "hasReference ?reference.";
      sparql += " ?source " + Global.ns + "name ?sourceName.";
      sparql += " }. ";

      sparql += "OPTIONAL {";
      sparql +=
        " ?drugReference " + Global.ns + "referredToBeProducedBy ?reference.";
      sparql += " ?drugReference " + Global.ns + "refersTo ?drugNameVariant.";
      sparql += " ?drugNameVariant " + Global.ns + "nameVariant ?drugVariant.";
      sparql += " ?drug " + Global.ns + "hasNameVariant ?drugNameVariant.";
      sparql += " ?drug " + Global.ns + "name ?drugName.";
      sparql += " }. ";

      sparql += " } ORDER BY ASC(?name) OFFSET 50 LIMIT 2000";

      QueryFactory.ExecuteQuery(sparql).then(function (result) {
        $scope.isLoading.referencesAll = false;
        $scope.allLoaded = true;
        console.log(result);
        if (!result.error) {
          //angular.extend($scope.item.references, result.results.bindings);
          for (var i = 0; i < result.results.bindings.length; i++) {
            $scope.item.references.push(result.results.bindings[i]);
          }
        } else {
          ErrorHandler.handleErrorCode(result.code);
        }
      });
    };

    $scope.getReferencesCount = function (name) {
      $scope.item.referencesCount = 0;

      var sparql = "";

      sparql += "SELECT  (COUNT(*) as ?count) WHERE { {";
      sparql +=
        "SELECT DISTINCT  ?name ?language ?reference  ?lineNumber ?barcode ?id  ?drugName ?drugVariant  ?sourceName   ";
      sparql += $scope.fromGraphs;
      sparql += "WHERE { ";
      sparql += "?p  a ex:Plant. ";
      sparql += "?p " + Global.ns + 'name "' + name + '"^^xsd:string. ';
      sparql += "?p " + Global.ns + "hasNameVariant ?nv. ";
      sparql += "?nv " + Global.ns + "nameVariant ?name. ";
      sparql += "?reference " + Global.ns + "refersTo ?nv. ";
      sparql += "OPTIONAL { ?nv " + Global.ns + "language ?language.  }. ";
      sparql +=
        "OPTIONAL { ?reference " + Global.ns + "lineNumber ?lineNumber.  }. ";
      sparql += "OPTIONAL { ?reference " + Global.ns + "barcode ?barcode.  }. ";
      sparql += "OPTIONAL { ?reference " + Global.ns + "id ?id.  }. ";

      sparql += "OPTIONAL {";
      sparql += " ?source " + Global.ns + "hasReference ?reference.";
      sparql += " ?source " + Global.ns + "name ?sourceName.";
      sparql += " }. ";

      sparql += "OPTIONAL {";
      sparql +=
        " ?drugReference " + Global.ns + "referredToBeProducedBy ?reference.";
      sparql += " ?drugReference " + Global.ns + "refersTo ?drugNameVariant.";
      sparql += " ?drugNameVariant " + Global.ns + "nameVariant ?drugVariant.";
      sparql += " ?drug " + Global.ns + "hasNameVariant ?drugNameVariant.";
      sparql += " ?drug " + Global.ns + "name ?drugName.";
      sparql += " }. ";

      sparql += " } ";
      sparql += " } } ";

      console.log(sparql);

      QueryFactory.ExecuteQuery(sparql).then(function (result) {
        if (!result.error) {
          $scope.item.referencesCount = result.results.bindings[0].count.value;
        } else {
          ErrorHandler.handleErrorCode(result.code);
        }
      });
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////   MICRO-GETTERS /////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    $scope.getReferences = function (name) {
      $scope.item.references = [];

      $scope.isLoading.references = true;

      var sparql = "";

      sparql +=
        "SELECT DISTINCT  ?name ?language ?reference  ?lineNumber ?barcode ?id  ?drugName ?drugVariant ?locationName ?latitude ?longtitude ?sourceName ?sourceType ";
      sparql += $scope.fromGraphs;
      sparql += "WHERE { ";
      sparql += "?p  a ex:Plant. ";
      sparql += "?p " + Global.ns + 'name "' + name + '"^^xsd:string. ';
      sparql += "?p " + Global.ns + "hasNameVariant ?nv. ";
      sparql += "?nv " + Global.ns + "nameVariant ?name. ";
      sparql += "?reference " + Global.ns + "refersTo ?nv. ";
      sparql += "OPTIONAL { ?nv " + Global.ns + "language ?language.  }. ";
      sparql +=
        "OPTIONAL { ?reference " + Global.ns + "lineNumber ?lineNumber.  }. ";
      sparql += "OPTIONAL { ?reference " + Global.ns + "barcode ?barcode.  }. ";
      sparql += "OPTIONAL { ?reference " + Global.ns + "id ?id.  }. ";

      sparql += "OPTIONAL {";
      sparql += " ?source " + Global.ns + "hasReference ?reference.";
      sparql += " ?source " + Global.ns + "name ?sourceName.";
      sparql += "OPTIONAL { ?source " + Global.ns + "type ?sourceType. }.";
      sparql += " }. ";

      sparql += "OPTIONAL {";
      sparql +=
        " ?drugReference " + Global.ns + "referredToBeProducedBy ?reference.";
      sparql += " ?drugReference " + Global.ns + "refersTo ?drugNameVariant.";
      sparql += " ?drugNameVariant " + Global.ns + "nameVariant ?drugVariant.";
      sparql += " ?drug " + Global.ns + "hasNameVariant ?drugNameVariant.";
      sparql += " ?drug " + Global.ns + "name ?drugName.";
      sparql += " }. ";

      sparql += " } ORDER BY ASC(?name) LIMIT 50 OFFSET 0";

      QueryFactory.ExecuteQuery(sparql).then(function (result) {
        $scope.isLoading.references = false;

        if (!result.error) {
          $scope.item.references = result.results.bindings;
        } else {
          ErrorHandler.handleErrorCode(result.code);
        }
      });
    };

    $scope.getSources = function (name) {
      $scope.item.sources = [];

      $scope.isLoading.sources = true;

      var sparql = "";

      sparql += "SELECT DISTINCT ?sourceName ";
      sparql += $scope.fromGraphs;
      sparql += "WHERE { ";
      sparql += "?p a " + Global.ns + "Plant. ";
      sparql += "?p  " + Global.ns + 'name "' + name + '"^^xsd:string. ';
      sparql += "?p " + Global.ns + "hasNameVariant ?nv. ";
      sparql += "?reference " + Global.ns + "refersTo ?nv. ";

      sparql += " ?source " + Global.ns + "hasReference ?reference.";
      sparql += " ?source " + Global.ns + "name ?sourceName.";

      sparql += " } ORDER BY ASC(?sourceName) ";

      QueryFactory.ExecuteQuery(sparql).then(function (result) {
        $scope.isLoading.sources = false;

        if (!result.error) {
          var references = result.results.bindings;

          for (var i = 0; i < references.length; i++) {
            $scope.item.sources.push(references[i].sourceName.value);
          }
        }
      });
    };

    $scope.getUses = function (name) {
      $scope.item.uses = [];

      $scope.isLoading.uses = true;

      var sparql = "";

      sparql += "SELECT DISTINCT ?use ";
      sparql += $scope.fromGraphs;
      sparql += "WHERE { ";
      sparql += "?p a " + Global.ns + "Plant. ";
      sparql += "?p  " + Global.ns + 'name "' + name + '"^^xsd:string. ';
      sparql += "?p " + Global.ns + "hasNameVariant ?nv. ";
      sparql += "?reference " + Global.ns + "refersTo ?nv. ";

      sparql += " ?reference " + Global.ns + "refersUse ?u.";
      sparql += " ?u " + Global.ns + "description ?use.";

      sparql += " } ORDER BY ASC(?use) ";

      QueryFactory.ExecuteQuery(sparql).then(function (result) {
        $scope.isLoading.uses = false;

        if (!result.error) {
          var references = result.results.bindings;

          for (var i = 0; i < references.length; i++) {
            $scope.item.uses.push(references[i].use.value);
          }
        }
      });
    };

    $scope.getDrugs = function (name) {
      $scope.item.drugs = [];

      $scope.isLoading.pDrugs = true;

      var sparql = "";

      sparql += "SELECT DISTINCT ?drugName  ?drugVariant ";
      sparql += $scope.fromGraphs;
      sparql += "WHERE { ";
      sparql += "?p a " + Global.ns + "Plant. ";
      sparql += "?p  " + Global.ns + 'name "' + name + '"^^xsd:string. ';
      sparql += "?p " + Global.ns + "hasNameVariant ?nv. ";
      sparql += "?reference " + Global.ns + "refersTo ?nv. ";

      sparql +=
        " ?drugReference " + Global.ns + "referredToBeProducedBy ?reference.";
      sparql += " ?drugReference " + Global.ns + "refersTo ?drugNameVariant.";
      sparql += " ?drugNameVariant " + Global.ns + "nameVariant ?drugVariant.";
      sparql += " ?drug " + Global.ns + "hasNameVariant ?drugNameVariant.";
      sparql += " ?drug " + Global.ns + "name ?drugName.";

      sparql += " } ORDER BY ASC(?drugName) ";

      QueryFactory.ExecuteQuery(sparql).then(function (result) {
        $scope.isLoading.pDrugs = false;

        if (!result.error) {
          var references = result.results.bindings;

          for (var i = 0; i < references.length; i++) {
            if (references[i].drugVariant) {
              var drug = {
                name: references[i].drugName.value,
                variants: [],
              };

              var variant = references[i].drugVariant.value;

              var index = Util.conceptExists($scope.item.drugs, drug);

              if (index == -1) {
                drug.variants.push(variant);
                $scope.item.drugs.push(drug);
              } else {
                if (!Util.exists($scope.item.drugs[index].variants, variant)) {
                  $scope.item.drugs[index].variants.push(variant);
                }
              }
            }
          }
        }
      });
    };

    /////////////////////  GET NAME VARIANTS /////////////////////////////////

    $scope.getNameVariants = function (name) {
      $scope.item.variants = [];

      $scope.isLoading.variants = true;

      var sparql = "";

      sparql += "SELECT DISTINCT ?name  ";
      sparql += $scope.fromGraphs;
      sparql += "WHERE { ";
      sparql += "?p a " + Global.ns + "Plant. ";
      sparql += "?p  " + Global.ns + 'name "' + name + '"^^xsd:string. ';
      sparql += "?p " + Global.ns + "hasNameVariant ?nv. ";
      sparql += "?nv " + Global.ns + "nameVariant ?name. ";

      sparql += " } ORDER BY ASC(?name) ";

      QueryFactory.ExecuteQuery(sparql).then(function (result) {
        $scope.isLoading.variants = false;

        if (!result.error) {
          var variants = result.results.bindings;

          for (var i = 0; i < variants.length; i++) {
            $scope.item.variants.push(variants[i].name.value);
          }
        }
      });
    };

    /********************* Data Collectors  *********************************/

    $scope.getPlants = function () {
      PlantsFactory.GetAll($scope.filters.search).then(function (result) {
        if (!result.error) {
          $scope.items = result;
        } else {
          ErrorHandler.handleErrorCode(result.code);
        }
      });
    };

    /********************* Initialization *********************************/

    $scope.initNavigation = function () {
      Navigation.setPage("naturalia");
      Navigation.navBarClear();
    };

    $scope.init = function () {
      Auth.checkLogin();
      Auth.Authorize("naturalia");
      $scope.initNavigation();

      $scope.clearMarkers();
      $scope.clearSourceMarkers();

      $scope.getPlants();
      // $scope.getSnipendalImages();
    };

    $scope.init();
  }
})();

