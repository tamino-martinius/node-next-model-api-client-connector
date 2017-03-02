'use strict';

const NextModelApiClientConnector = require('..');
const NextModel = require('next-model');
const expect = require('expect.js');
const expectChange = require('expect-change');
const sinon = require('sinon');
const request = require('then-request');
const pluralize = require('pluralize');
const URL = require('url');
const querystring = require('querystring');

const lodash = require('lodash');
const includes = lodash.includes;
const words = lodash.words;

def('BaseModel', () => class BaseModel extends NextModel {
  static get connector() {
    return NextModelApiClientConnector;
  }
});

def('User', () => class User extends $BaseModel {
  static get modelName() { return 'User'; }

  static get schema() {
    return {
      id: { type: 'integer' },
      name: { type: 'string' },
      age: { type: 'integer' },
    };
  }

  static get tableName() { return $tableName;}

  static get defaultScope() { return $defaultScope; }
  static get defaultOrder() { return $defaultOrder; }

  static get _skip() { return $skip; }
  static get _limit() { return $limit; }

  static get routeDomain() { return $routeDomain; }
  static get routeIsRelative() { return $routeIsRelative; }
  static get routePath() { return $routePath; }
  static get routeVersion() { return $routeVersion; }
  static get routePostfix() { return $routePostfix; }

  static get allActionPath() { return $allActionPath; }
  static get allActionMethod() { return $allActionMethod; }
  static get firstActionPath() { return $firstActionPath; }
  static get firstActionMethod() { return $firstActionMethod; }
  static get lastActionPath() { return $lastActionPath; }
  static get lastActionMethod() { return $lastActionMethod; }
  static get countActionPath() { return $countActionPath; }
  static get countActionMethod() { return $countActionMethod; }
  static get insertActionPath() { return $insertActionPath; }
  static get insertActionMethod() { return $insertActionMethod; }
  static get updateActionPath() { return $updateActionPath; }
  static get updateActionMethod() { return $updateActionMethod; }
  static get deleteActionPath() { return $deleteActionPath; }
  static get deleteActionMethod() { return $deleteActionMethod; }
});

def('tableName', () => 'users');

def('defaultScope', () => undefined);
def('defaultOrder', () => undefined);

def('skip', () => undefined);
def('limit', () => undefined);

def('routeDomain', () => undefined);
def('routeIsRelative', () => undefined);
def('routePath', () => undefined);
def('routeVersion', () => undefined);
def('routePostfix', () => undefined);

def('allActionPath', () => undefined);
def('allActionMethod', () => undefined);
def('firstActionPath', () => undefined);
def('firstActionMethod', () => undefined);
def('lastActionPath', () => undefined);
def('lastActionMethod', () => undefined);
def('countActionPath', () => undefined);
def('countActionMethod', () => undefined);
def('insertActionPath', () => undefined);
def('insertActionMethod', () => undefined);
def('updateActionPath', () => undefined);
def('updateActionMethod', () => undefined);
def('deleteActionPath', () => undefined);
def('deleteActionMethod', () => undefined);

const requestStub = sinon.stub(request, '_request');

describe('NextModelApiClientConnector', function() {
  this.timeout(10000);
  afterEach(function() {
    requestStub.reset();
  });

  const itMakesRequest = function(expectedMethod, expectedUrl) {
    it(`makes '${expectedMethod}' request to '${expectedUrl}'`, function() {
      NextModelApiClientConnector[get('action')](get('param'));
      expect(requestStub.calledOnce).to.be(true);
      const method = requestStub.firstCall.args[0];
      const urlObj = URL.parse(requestStub.firstCall.args[1]);
      const url = (urlObj.protocol ? urlObj.protocol + '//' : '') +
        (urlObj.host || '') + urlObj.pathname;
      expect(method).to.be(expectedMethod);
      expect(url).to.be(expectedUrl);
    });

    if (includes(['POST', 'PUT', 'PATCH'], expectedMethod)) {
      it(`has payload in body and empty querystring`, function() {
        NextModelApiClientConnector[get('action')](get('param'));
        const url = URL.parse(requestStub.firstCall.args[1]);
        const contentLength = requestStub.firstCall.args[2].headers['Content-Length'];
        expect(url.search).to.be(null);
        expect(contentLength).to.be.greaterThan(0);
      });
    } else {
      it(`has payload in querystring and empty body`, function() {
        NextModelApiClientConnector[get('action')](get('param'));
        const url = URL.parse(requestStub.firstCall.args[1]);
        const contentLength = requestStub.firstCall.args[2].headers['Content-Length'];
        expect(url.search).to.not.be.empty();
        expect(contentLength).to.be(0);
      });
    }
  };

  const itChecksPayload = function(expected) {
    let specTitle = `
      makes requests with
      scope '${JSON.stringify(expected.scope)}',
      order '${JSON.stringify(expected.order)}',
      skip '${expected.skip}',
      limit '${expected.limit}'
    `;

    if (expected.attributes) {
      specTitle += `and attributes '${JSON.stringify(expected.attributes)}'`;
    }

    it(words(specTitle, /[^\n ]+/g).join(' '), function() {
      NextModelApiClientConnector[get('action')](get('param'));
      const urlObj = URL.parse(requestStub.firstCall.args[1]);
      const qs = querystring.parse(urlObj.query);
      const scope = JSON.parse(qs.scope);
      expect(scope).to.eql(expected.scope);
      const order = JSON.parse(qs.order);
      expect(order).to.eql(expected.order);
      const skip = JSON.parse(qs.skip);
      expect(skip).to.be(expected.skip);
      const limit = JSON.parse(qs.limit);
      expect(limit).to.be(expected.limit);
      if (expected.attributes) {
        const attributes = JSON.parse(qs.attributes);
        expect(attributes).to.eql(expected.attributes);
      }
    });
  };

  const itMakesCommonRequestsTo = function(path) {
    describe('api requests', function() {
      itMakesRequest('POST', `/${path}`);

      context('when domain is present', function() {
        def('routeDomain', () => 'http://example.com');

        itMakesRequest('POST', `http://example.com/${path}`);

        context('when url starts with //', function() {
          def('routeDomain', () => '//example.com');

          itMakesRequest('POST', `//example.com/${path}`);
        });

        context('when url ends with /', function() {
          def('routeDomain', () => 'http://example.com/');

          itMakesRequest('POST', `http://example.com/${path}`);
        });
      });

      context('when isRelative is present', function() {
        def('routeIsRelative', () => true);

        itMakesRequest('POST', `${path}`);

        context('value is false', function() {
          def('routeIsRelative', () => false);

          itMakesRequest('POST', `/${path}`);
        });

        context('when domain is present', function() {
          def('routeDomain', () => 'http://example.com');

          itMakesRequest('POST', `http://example.com/${path}`);
        });
      });

      context('when path is present', function() {
        def('routePath', () => 'api');

        itMakesRequest('POST', `/api/${path}`);

        context('when path starts with /', function() {
          def('routePath', () => '/api');

          itMakesRequest('POST', `/api/${path}`);
        });

        context('when path ends with /', function() {
          def('routePath', () => 'api/');

          itMakesRequest('POST', `/api/${path}`);
        });

        context('when version is present', function() {
          def('routeVersion', () => 'v1');

          itMakesRequest('POST', `/api/v1/${path}`);

          context('when version starts with /', function() {
            def('routeVersion', () => '/v1');

            itMakesRequest('POST', `/api/v1/${path}`);
          });

          context('when version ends with /', function() {
            def('routeVersion', () => 'v1/');

            itMakesRequest('POST', `/api/v1/${path}`);
          });
        });
      });

      context('when postfix is present', function() {
        def('routePostfix', () => '.json');

        itMakesRequest('POST', `/${path}.json`);
      });
    });
  };

  const itMakesActionModificationsFor = function(action, path, pathEnd) {
    describe('action requests', function() {
      context('when action path present', function() {
        def(action + 'ActionPath', () => 'foo');

        itMakesRequest('POST', `/${path}/foo`);

        context('when path starts with /', function() {
          def(action + 'ActionPath', () => '/foo');

          itMakesRequest('POST', `/${path}/foo`);
        });

        context('when path ends with /', function() {
          def(action + 'ActionPath', () => 'foo/');

          itMakesRequest('POST', `/${path}/foo`);
        });
      });

      for (const method of [
        'DELETE',
        'GET',
        'PATCH',
        'POST',
        'PUT',
      ]) {
        context(`when action method '${method}' present`, function() {
          def(action + 'ActionMethod', () => method);

          itMakesRequest(method, `/${path + pathEnd}`);
        });
      }
    });
  };

  const itChecksCollectionPayload = function(action) {
    context('collection request payload', function() {
      def(action + 'ActionMethod', () => 'GET');

      itChecksPayload({
        scope: {},
        order: {},
        skip: 0,
        limit: 0,
      });

      context('when defaultScope is present', function() {
        def('defaultScope', () => {});

        itChecksPayload({
          scope: {},
          order: {},
          skip: 0,
          limit: 0,
        });

        context('when defaultScope contains attributes' , function() {
          def('defaultScope', () => ({ foo: 'bar' }));

          itChecksPayload({
            scope: { foo: 'bar' },
            order: {},
            skip: 0,
            limit: 0,
          });
        });

        context('when defaultScope contains nested attributes' , function() {
          def('defaultScope', () => ({ foo: { bar: 'baz' }}));

          itChecksPayload({
            scope: { foo: { bar: 'baz' }},
            order: {},
            skip: 0,
            limit: 0,
          });
        });
      });

      context('when defaultOrder is present', function() {
        def('defaultOrder', () => {});

        itChecksPayload({
          scope: {},
          order: {},
          skip: 0,
          limit: 0,
        });

        context('when defaultOrder contains attributes' , function() {
          def('defaultOrder', () => ({ foo: 'bar' }));

          itChecksPayload({
            scope: {},
            order: { foo: 'bar' },
            skip: 0,
            limit: 0,
          });
        });

        context('when defaultOrder contains nested attributes' , function() {
          def('defaultOrder', () => ({ foo: { bar: 'baz' }}));

          itChecksPayload({
            scope: {},
            order: { foo: { bar: 'baz' }},
            skip: 0,
            limit: 0,
          });
        });
      });

      context('when skip is present', function() {
        def('skip', () => 0);

        itChecksPayload({
          scope: {},
          order: {},
          skip: 0,
          limit: 0,
        });

        context('when skip is greater than 0' , function() {
          def('skip', () => 1337);

          itChecksPayload({
            scope: {},
            order: {},
            skip: 1337,
            limit: 0,
          });
        });
      });

      context('when limit is present', function() {
        def('limit', () => 0);

        itChecksPayload({
          scope: {},
          order: {},
          skip: 0,
          limit: 0,
        });

        context('when limit is greater than 0' , function() {
          def('limit', () => 1337);

          itChecksPayload({
            scope: {},
            order: {},
            skip: 0,
            limit: 1337,
          });
        });
      });
    });
  };

  const itChecksInstancePayload = function(action) {
    context('instance request payload', function() {
      def(action + 'ActionMethod', () => 'GET');
      def('name', () => 'foo');

      itChecksPayload({
        scope: {},
        order: {},
        skip: 0,
        limit: 0,
        attributes: { id: 1, name: 'foo', age: null },
      });

      context('when name contains special chars', function() {
        def('name', () => '!@#$%^&*()');

        itChecksPayload({
          scope: {},
          order: {},
          skip: 0,
          limit: 0,
          attributes: { id: 1, name: '!@#$%^&*()', age: null },
        });
      });
    });
  };

  const itMakesCollectionRequestsTo = function(pathEnd) {
    const path = 'users';
    itMakesCommonRequestsTo(path + pathEnd);
    return { forAction: function(action) {
      itMakesActionModificationsFor(action, path, pathEnd);
      itChecksCollectionPayload(action);
    }};
  };

  const itMakesInstanceRequestsTo = function(pathEnd) {
    const path = 'user/1';
    itMakesCommonRequestsTo(path + pathEnd);
    return { forAction: function(action) {
      itMakesActionModificationsFor(action, path, pathEnd);
      itChecksCollectionPayload(action);
      itChecksInstancePayload(action);
    }};
  };

  describe('.all()', function() {
    def('action', () => 'all');
    def('param', () => $User);

    itMakesCollectionRequestsTo('').forAction('all');
  });

  describe('.first()', function() {
    def('action', () => 'first');
    def('param', () => $User);

    itMakesCollectionRequestsTo('/first').forAction('first');
  });

  describe('.last()', function() {
    def('action', () => 'last');
    def('param', () => $User);

    itMakesCollectionRequestsTo('/last').forAction('last');
  });

  describe('.count()', function() {
    def('action', () => 'count');
    def('param', () => $User);

    itMakesCollectionRequestsTo('/count').forAction('count');
  });

  describe('.save()', function() {
    def('action', () => 'save');
    def('name', () => 'foo');

    context('when user is new', function() {
      def('param', () => $User.build({ name: $name }));

      itMakesCollectionRequestsTo('/create').forAction('insert');

      context('instance request payload', function() {
        def('insertActionMethod', () => 'GET');
        def('name', () => 'foo');

        itChecksPayload({
          scope: {},
          order: {},
          skip: 0,
          limit: 0,
          attributes: { id: null, name: 'foo', age: null },
        });

        context('when name contains special chars', function() {
          def('name', () => '!@#$%^&*()');

          itChecksPayload({
            scope: {},
            order: {},
            skip: 0,
            limit: 0,
            attributes: { id: null, name: '!@#$%^&*()', age: null },
          });
        });
      });
    });

    context('when user is persisted', function() {
      def('param', () => {
        const user = $User.build({ name: $name });
        user.id = 1;
        return user;
      });

      itMakesInstanceRequestsTo('').forAction('update');
    });
  });

  describe('.delete()', function() {
    def('action', () => 'delete');
    def('name', () => 'foo');
    def('param', () => {
      const user = $User.build({ name: $name });
      user.id = 1;
      return user;
    });

    itMakesInstanceRequestsTo('/delete').forAction('delete');
  });
});
