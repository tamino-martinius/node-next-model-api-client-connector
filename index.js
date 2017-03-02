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
  const includes = lodash.includes;
  const startsWith = lodash.startsWith;
  const toUpper = lodash.toUpper;
  const trim = lodash.trim;
  const trimEnd = lodash.trimEnd;

  const NextModelApiClientConnector = class NextModelApiClientConnector {
    static all(Klass) {
      const action = Klass.allActionPath || '';
      const method = Klass.allActionMethod;
      return this._query({ Klass, action, method });
    }

    static first(Klass) {
      const action = Klass.firstActionPath || '/first';
      const method = Klass.firstActionMethod;
      return this._query({ Klass, action, method });
    }

    static last(Klass) {
      const action = Klass.lastActionPath || '/last';
      const method = Klass.lastActionMethod;
      return this._query({ Klass, action, method });
    }

    static count(Klass) {
      const action = Klass.countActionPath || '/count';
      const method = Klass.countActionMethod;
      return this._query({ Klass, action, method });
    }

    static save(klass) {
      const Klass = klass.constructor;
      if (klass.isNew) {
        const action = Klass.insertActionPath || '/create';
        const method = Klass.insertActionMethod;
        return this._query({ Klass, klass, action, method })
          .then( attrs => {
            klass[Klass.identifier] = attrs[Klass.identifier];
            return klass;
          });
      } else {
        const action = Klass.updateActionPath || '';
        const method = Klass.updateActionMethod;
        return this._query({ Klass, klass, action, method });
      }
    }

    static delete(klass) {
      const Klass = klass.constructor;
      const action = Klass.deleteActionPath || '/delete';
      const method = Klass.deleteActionMethod;
      return this._query({ Klass, klass, action, method });
    }

    static _query(options) {
      const method = toUpper(options.method) || 'POST';
      const params = this._params(options);
      const url = this._url(options);
      const requestOptions = {};
      if (includes(['POST', 'PUT', 'PATCH'], method)) {
        requestOptions.json = params;
      } else {
        requestOptions.qs = params;
      }
      return request(method, url, requestOptions)
        .then(response => response.getBody());
    }

    static _params(options) {
      const params = this._scopeParams(options);
      if (options.klass) {
        assign(params, this._itemParams(options));
      }
      return params;
    }

    static _scopeParams(options) {
      const Klass = options.Klass;
      return {
        scope: JSON.stringify(Klass.defaultScope || {}),
        order: JSON.stringify(Klass.defaultOrder || {}),
        skip: Klass._skip || 0,
        limit: Klass._limit || 0,
      }
    }

    static _itemParams(options) {
      return {
        attributes: JSON.stringify(options.klass.attributes),
      }
    }

    static _url(options) {
      const domain = this._domain(options);
      const path = this._path(options);
      const version = this._version(options);
      const name = this._name(options);
      const id = this._id(options);
      const action = this._action(options);
      const postfix = this._postfix(options);
      const isRelative = !domain && options.Klass.routeIsRelative || false;
      const pathFragments = compact([path, version, name, id, action]);
      // console.log(pathFragments);
      if (!isRelative) pathFragments.unshift(domain || '');
      return pathFragments.join('/') + postfix;
    }

    static _domain(options) {
      return trimEnd(options.Klass.routeDomain, '/');
    }

    static _path(options) {
      return trim(options.Klass.routePath, '/');
    }

    static _version(options) {
      return trim(options.Klass.routeVersion, '/');
    }

    static _name(options) {
      const name = trim(options.Klass.routeName || options.Klass.tableName, '/');
      if (options.klass && options.klass.isPersisted) {
        return pluralize(name, 1);
      } else {
        return pluralize(name);
      }
    }

    static _id(options) {
      if (options.klass && options.klass.isPersisted) {
        return options.klass[options.Klass.identifier].toString();
      }
    }

    static _action(options) {
      return trim(options.action, '/');
    }

    static _postfix(options) {
      return options.Klass.routePostfix || '';
    }
  }

  if (typeof module === 'object') {
    module.exports = NextModelApiClientConnector;
  } else {
    context.NextModelApiClientConnector = NextModelApiClientConnector;
  }
}());
