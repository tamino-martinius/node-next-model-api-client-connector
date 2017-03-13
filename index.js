'use strict';

(function() {
  const context = (typeof window === 'object' && window) || {};

  if (typeof require === 'function') {
    context.lodash = require('lodash');
    context.pluralize = require('pluralize');
    context.request = require('then-request');
  }

  const request = context.request;
  const pluralize = context.pluralize;
  const lodash = context.lodash || context._;

  const assign = lodash.assign;
  const compact = lodash.compact;
  const endsWith = lodash.endsWith;
  const find = lodash.find;
  const includes = lodash.includes;
  const isArray = lodash.isArray;
  const isPlainObject = lodash.isPlainObject;
  const map = lodash.map;
  const startsWith = lodash.startsWith;
  const toUpper = lodash.toUpper;
  const trim = lodash.trim;
  const trimEnd = lodash.trimEnd;

  const NextModelApiClientConnector = class NextModelApiClientConnector {
    constructor(options) {
      this.router = options.router;
    }

    all(Klass) {
      return this.collectionAction(Klass, 'all');
    }

    first(Klass) {
      return this.collectionAction(Klass, 'first');
    }

    last(Klass) {
      return this.collectionAction(Klass, 'last');
    }

    count(Klass) {
      return this.collectionAction(Klass, 'count');
    }

    save(klass) {
      const Klass = klass.constructor;
      if (klass.isNew) {
        return this.memberAction(klass, 'create')
          .then( attrs => {
            klass[Klass.identifier] = attrs[Klass.identifier];
            return klass;
          });
      } else {
        return this.memberAction(klass, 'update');
      }
    }

    delete(klass) {
      return this.memberAction(klass, 'delete');
    }

    collectionAction(Klass, action) {
      return this._query({ Klass, action });
    }

    memberAction(klass, action) {
      const Klass = klass.constructor;
      return this._query({ Klass, klass, action });
    }

    _query(options) {
      const routeOptions = this._routeOptions(options);
      const method = toUpper(routeOptions.method) || 'POST';
      const params = this._params(options);
      let url = trimEnd(this.router.root, '/') + routeOptions.url;
      // console.log(url, klass && );
      if (options.klass && options.klass.isPersisted) {
        url = url.replace(':' + routeOptions.identifier, options.klass[options.Klass.identifier]);
      }
      const requestOptions = {};
      if (includes(['POST', 'PUT', 'PATCH'], method)) {
        requestOptions.json = params;
      } else {
        requestOptions.qs = params;
      }
      return request(method, url, requestOptions)
        .then(response => JSON.parse(response.getBody()))
        .then(data => {
          let result;
          if (isArray(data)) {
            result = map(data, item => new options.Klass(item));
          } else if (isPlainObject(data)) {
            result = new options.Klass(data);
          } else {
            result = data
          }
          return result;
        });
    }

    _routeOptions(options) {
      return find(this.router.routes, (route) => {
        return route.modelName === options.Klass.modelName &&
          route.action === options.action;
      });
    }

    _params(options) {
      const params = this._scopeParams(options);
      if (options.klass) {
        assign(params, this._itemParams(options));
      }
      return params;
    }

    _scopeParams(options) {
      const Klass = options.Klass;
      return {
        scope: JSON.stringify(Klass.defaultScope || {}),
        order: JSON.stringify(Klass.defaultOrder || {}),
        skip: Klass._skip || 0,
        limit: Klass._limit || 0,
      }
    }

    _itemParams(options) {
      return {
        attributes: JSON.stringify(options.klass.attributes),
      }
    }
  }

  if (typeof module === 'object') {
    module.exports = NextModelApiClientConnector;
  } else {
    context.NextModelApiClientConnector = NextModelApiClientConnector;
  }
}());
