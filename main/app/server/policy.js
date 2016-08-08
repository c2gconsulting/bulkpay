/*
 * set browser policies
 */

if (process.env.NODE_ENV === "development") {
  BrowserPolicy.content.allowOriginForAll("localhost:*");
  BrowserPolicy.content.allowConnectOrigin("ws://localhost:*");
  BrowserPolicy.content.allowOriginForAll("*.example.com:*");
  BrowserPolicy.content.allowConnectOrigin("ws://*.example.com:*");
  BrowserPolicy.content.allowConnectOrigin("http://localhost:*");
  BrowserPolicy.content.allowConnectOrigin("https://localhost:*");
  BrowserPolicy.framing.allowAll();
}

BrowserPolicy.content.allowFontDataUrl();

BrowserPolicy.content.allowOriginForAll("*.intercomcdn.com");
BrowserPolicy.content.allowOriginForAll("*.intercom.io");
BrowserPolicy.content.allowOriginForAll("*.intercomassets.com");
BrowserPolicy.content.allowOriginForAll("*.googleapis.com");
BrowserPolicy.content.allowConnectOrigin("ws://*.tradedepot.co");
BrowserPolicy.content.allowConnectOrigin("ws://*.tradedepot.io");
BrowserPolicy.content.allowOriginForAll("*.tradedepot.co");
BrowserPolicy.content.allowOriginForAll("*.tradedepot.io");
BrowserPolicy.content.allowOriginForAll("fonts.googleapis.com");
BrowserPolicy.content.allowOriginForAll("fonts.gstatic.com");
BrowserPolicy.content.allowOriginForAll("fonts.gstatic.com");
BrowserPolicy.content.allowOriginForAll("*.facebook.com");
BrowserPolicy.content.allowOriginForAll("*.fbcdn.net");
BrowserPolicy.content.allowOriginForAll("connect.facebook.net");
BrowserPolicy.content.allowOriginForAll("*.googleusercontent.com");

BrowserPolicy.content.allowImageOrigin("graph.facebook.com");
BrowserPolicy.content.allowImageOrigin("fbcdn-profile-a.akamaihd.net");
BrowserPolicy.content.allowImageOrigin("secure.gravatar.com");
BrowserPolicy.content.allowImageOrigin("i0.wp.com");
BrowserPolicy.content.allowImageOrigin("*.intercomassets.com");

BrowserPolicy.content.allowEval(__meteor_runtime_config__.ROOT_URL);