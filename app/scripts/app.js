/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

(function(document) {
  'use strict';

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');
  var model = new Firebase('https://gume.firebaseio.com');
  // Sets app default base URL
  app.baseUrl = '/';
  if (window.location.port === '') {  // if production
    // Uncomment app.baseURL below and
    // set app.baseURL to '/your-pathname/' if running from folder in production
    // app.baseUrl = '/polymer-starter-kit/';
  }

  app.displayInstalledToast = function() {
    // Check to make sure caching is actually enabled—it won't be in the dev environment.
    if (!Polymer.dom(document).querySelector('platinum-sw-cache').disabled) {
      Polymer.dom(document).querySelector('#caching-complete').show();
    }
  };

  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function() {
    console.log('Our app is ready to rock!');
  });

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {
    // imports are loaded and elements have been registered
    model.onAuth(function(authData) {
      if (authData) {
        var toast = document.getElementById('successToast');
        
        app.authData = authData;
        app.set('isLoggedIn', true);
        if (toast) {
          toast.text = 'Welcome back ' + authData.password.email + '!!!';
          toast.show();
        }
      } else {
        app.set('isLoggedIn', false);
      }
    });
  });

  // Main area's paper-scroll-header-panel custom condensing transformation of
  // the appName in the middle-container and the bottom title in the bottom-container.
  // The appName is moved to top and shrunk on condensing. The bottom sub title
  // is shrunk to nothing on condensing.
  window.addEventListener('paper-header-transform', function(e) {
    var appName = Polymer.dom(document).querySelector('#mainToolbar .app-name');
    var middleContainer = Polymer.dom(document).querySelector('#mainToolbar .middle-container');
    var bottomContainer = Polymer.dom(document).querySelector('#mainToolbar .bottom-container');
    var detail = e.detail;
    var heightDiff = detail.height - detail.condensedHeight;
    var yRatio = Math.min(1, detail.y / heightDiff);
    // appName max size when condensed. The smaller the number the smaller the condensed size.
    var maxMiddleScale = 0.50;
    var auxHeight = heightDiff - detail.y;
    var auxScale = heightDiff / (1 - maxMiddleScale);
    var scaleMiddle = Math.max(maxMiddleScale, auxHeight / auxScale + maxMiddleScale);
    var scaleBottom = 1 - yRatio;

    // Move/translate middleContainer
    Polymer.Base.transform('translate3d(0,' + yRatio * 100 + '%,0)', middleContainer);

    // Scale bottomContainer and bottom sub title to nothing and back
    Polymer.Base.transform('scale(' + scaleBottom + ') translateZ(0)', bottomContainer);

    // Scale middleContainer appName
    Polymer.Base.transform('scale(' + scaleMiddle + ') translateZ(0)', appName);
  });

  // Scroll page to top and expand header
  app.scrollPageToTop = function() {
    app.$.headerPanelMain.scrollToTop(true);
  };

  app.closeDrawer = function() {
    app.$.paperDrawerPanel.closeDrawer();
  };

  app.goToUrl = function(e) {
    var url = e.target.getAttribute('url');
    var target = e.target.getAttribute('target');
    
    if (url && url !== '') {
      window.setTimeout(function() {
        if (target && target !== '') {
          var win = window.open(url, target);
          win.focus();
        } else {
          window.location = url;
        }
      }, 300);
    }
  };

  app.openDialog = function(e) {
    var dialogId = e.target.getAttribute('dialog');

    if (dialogId && dialogId !== '') {
      var dialog = document.getElementById(dialogId);
      if (dialog) {
        dialog.open();      
      }
    }
  };

  app.submitForm = function(e) {
    var frmId = e.target.getAttribute('data-form');

    if (frmId && frmId !== '') {
      var frm = document.getElementById(frmId);
      if (frm) {
        frm.submit();
      }
    }
  };

  app.handleLogin = function(e) {
    var email = document.getElementById('txtEmail');
    var password = document.getElementById('txtPassword');

    e.target.disabled = true;
    if (email.validate() && password.validate()) {
      model.authWithPassword({
        email: email.value,
        password: password.value
      }, function(error, authData) {
        e.target.disabled = false;
        if (authData) {
          var dialogLogin = document.getElementById('modalLogin');
          if (dialogLogin) {
            dialogLogin.close();
          }
        } else {
          app.$.errToast.text = 'Email hoặc password không chính xác, vui lòng thử lại!';
          app.$.errToast.show();
        }
      });
    } else {
      e.target.disabled = false;
      app.$.errToast.text = 'Có lỗi xảy ra, vui lòng thử lại!';
      app.$.errToast.show();
    }
  };

  app.handleLogout = function() {
    app.$.successToast.text = 'Goodbye ' + app.authData.password.email + '!!!';
    app.$.successToast.show();
    model.unauth();
  };

  app.properties = {
    isLoggedIn: {
      type: Boolean,
      value: false
    }
  };

})(document);
