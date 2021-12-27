(function () {
  "use strict";

  angular.module("TIMECAPSULE").factory("Company", Company);

  Company.$inject = ["$http", "$state", "Global", "Util"];

  function Company($http, $state, Global, Util) {
    var api = Global.api;

    var factory = {};

    factory.companies = [];
    factory.company = null;

    factory.getCompanies = getCompanies;
    factory.initCompanies = initCompanies;
    factory.clearCompanies = clearCompanies;
    factory.checkCompanies = checkCompanies;
    factory.getCurrentCompany = getCurrentCompany;
    factory.setCurrentCompany = setCurrentCompany;
    factory.updateCurrentCompany = updateCurrentCompany;

    factory.WriteCompanies = WriteCompanies;

    return factory;

    // Get all companies of a subscriber
    function getCompanies(subscriberId) {
      return $http
        .get(api + "/subscribers/" + subscriberId + "/companies")
        .then(handleSuccess, handleError);
    }

    // Get the current company from the SESSION
    function getCurrentCompany() {
      return $http
        .get(api + "/session/company")
        .then(handleSuccess, handleError);
    }

    // Sets the current company to the SESSION
    function setCurrentCompany(index) {
      return $http
        .put(api + "/session/company", index)
        .then(handleSuccess, handleError);
    }

    // This updates the factory's current company and stores the data in a Cookie
    function updateCurrentCompany(companyIndex) {
      this.company = this.companies[companyIndex];
      Util.setCookieObject("company", this.company);
    }

    // Saves the current state of companies to Cookies
    function WriteCompanies() {
      Util.setCookieObject("companies", this.companies);
      Util.setCookieObject("company", this.company);
    }

    // Sets the Company Data to the factory variables and to cookies
    function initCompanies(companies) {
      if (!Util.isEmpty(companies)) {
        this.companies = companies;
        this.company = companies[0];
        Util.setCookieObject("companies", this.companies);
        Util.setCookieObject("company", this.company);
      }
    }

    // Clears the login data & cookies
    function clearCompanies() {
      this.companies = [];
      this.company = null;
      Util.setCookieObject("companies", null);
      Util.setCookieObject("company", null);
    }

    // Checks if the user has any companies assigned in in order to redirect to "NO-COMPANIES" screen
    function checkCompanies() {
      if (Util.isEmpty(this.companies) || !this.company) {
        this.companies = Util.getCookieObject("companies");
        this.company = Util.getCookieObject("company");

        if (Util.isEmpty(this.companies) || !this.company) {
          $state.go("login");
        }
      }
    }

    // Handle a succesful response [ Status code: 200 ]
    function handleSuccess(response) {
      return response.data;
    }

    // Handle the response if status code is > 299
    function handleError(response) {
      return {
        error: true,
        code: response.status,
        message: response.data.message,
      };
    }
  }
})();
