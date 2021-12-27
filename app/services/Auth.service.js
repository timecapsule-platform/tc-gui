(function () {
  "use strict";

  angular.module("TIMECAPSULE").factory("Auth", Auth);

  Auth.$inject = ["$http", "Global", "$state", "Util", "Navigation"];

  function Auth($http, Global, $state, Util, Navigation) {
    var api = Global.api;

    var factory = {};
    factory.login = false;
    factory.user = null;

    factory.Authenticate = Authenticate;
    factory.Authorize = Authorize;
    factory.signIn = signIn;
    factory.signOut = signOut;
    factory.checkLogin = checkLogin;
    factory.clearLogin = clearLogin;
    factory.getUserRoleDisplayText = getUserRoleDisplayText;

    factory.getUser = getUser;

    return factory;

    function getUserRoleDisplayText() {
      switch (this.user.role) {
        case "admin":
          return "Administrator";
          break;
        case "guest":
          return "Guest";
          break;
        default:
          $state.go("login");
      }
    }

    // Returns the current user
    function getUser() {
      return this.user;
    }

    // Checks if a user is authorized to view a specific page. If not -> redirects to unauthorized.

    function Authorize(page) {
      if (this.user) {
        if (!Navigation.isAuthorized(this.user.role, page)) {
          $state.go("unauthorized");
        }
      }
    }

    // Authenticates the user from the Database (Server Login)
    function Authenticate(credentials) {
      return $http
        .post(api + "/login", credentials)
        .then(handleSuccess, handleError);
    }

    // Sets the login Data (Client Login)
    function signIn(user) {
      if (user) {
        this.login = true;
        this.user = user;
        Util.setCookieObject("login", this.login);
        Util.setCookieObject("user", this.user);
      }
    }

    // Removes the user from the SESSION (server logout)
    function signOut() {
      return $http.get(api + "/logout").then(handleSuccess, handleError);
    }

    // Clears the login data & cookies
    function clearLogin() {
      this.login = false;
      this.user = null;
      Util.setCookieObject("login", false);
      Util.setCookieObject("user", null);
    }

    // Checks if the user is logged in in order to redirect to "Login" screen otherwise
    function checkLogin() {
      if (!this.login) {
        this.login = Util.getCookieObject("login");
        this.user = Util.getCookieObject("user");

        if (!this.login) {
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
