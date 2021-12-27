angular.module("TIMECAPSULE").value("Global", {
  api: window.__env.api,
  baseURL: window.__env.baseURL,
  ns: window.__env.ns,
  sparql: window.__env.sparql,
});
