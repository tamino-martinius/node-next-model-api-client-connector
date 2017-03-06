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
  const startsWith = lodash.startsWith;
  const toUpper = lodash.toUpper;
  const trim = lodash.trim;
  const trimEnd = lodash.trimEnd;

  const NextModelApiClientConnector = class NextModelApiClientConnector {
    constructor(options) {
      this.router = options.router;
    }

    all(Klass) {
      return this._query({ Klass, action: 'all' });
    }

    first(Klass) {
      return this._query({ Klass, action: 'first' });
    }

    last(Klass) {
      return this._query({ Klass, action: 'last' });
    }

    count(Klass) {
      return this._query({ Klass, action: 'count' });
    }

    save(klass) {
      const Klass = klass.constructor;
      if (klass.isNew) {
        return this._query({ Klass, klass, action: 'create' })
          .then( attrs => {
            klass[Klass.identifier] = attrs[Klass.identifier];
            return klass;
          });
      } else {
        return this._query({ Klass, klass, action: 'update' });
      }
    }

    delete(klass) {
      const Klass = klass.constructor;
      return this._query({ Klass, klass, action: 'delete' });
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
            result = data.map(item => new Klass(item));
          } else if (isPlainObject(data)) {
            result = new Klass(data);
          } else {
            result = data
          }
          return result;
        });
    }

    _routeOptions(options) {
      return find(this.router.routes, (route) => {
        return route.Klass.modelName === options.Klass.modelName &&
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
