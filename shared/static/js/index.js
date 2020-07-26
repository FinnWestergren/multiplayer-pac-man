"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _GameObject = require("./GameObject");

Object.keys(_GameObject).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _GameObject[key];
    }
  });
});

var _SocketObject = require("./SocketObject");

Object.keys(_SocketObject).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _SocketObject[key];
    }
  });
});

var _ducks = require("./ducks");

Object.keys(_ducks).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _ducks[key];
    }
  });
});