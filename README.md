# NextModelApiClientConnector

Api client for [ApiServer](https://github.com/tamino-martinius/node-next-model-api-server-connector) using [NextModel](https://github.com/tamino-martinius/node-next-model) package.

 [![Build Status](https://travis-ci.org/tamino-martinius/node-next-model-api-client-connector.svg?branch=master)](https://travis-ci.org/tamino-martinius/node-next-model-api-client-connector)

Features:
* **Shared model** for Server and Client.
* Supports **all** server side supported **queries**
* Allows Api-Endpoint to de on a **different domain**
* Api **Versioning**
* Custom **Routes** and **Actions**

### Roadmap / Where can i contribute

See [GitHub project](https://github.com/tamino-martinius/node-next-model-api-client-connector/projects/1) for current progress/tasks

* Fix Typos
* Add **user credentials** to queries
* Add more **examples**
* Add **exists**, **join** and **subqueries**
* There are already some **tests**, but not every test case is covered.

## TOC

* [Example](#example)
* [Custom Routes](#custom-routes)
  * [Domain](#domain)
  * [IsRelative](#isrelative)
  * [Path](#path)
  * [Version](#version)
  * [Name](#name)
  * [Postfix](#postfix)
  * [Action Path](#action-path)
  * [Action Method](#action-method)
* [Changelog](#changelog)

## Example

The connector fetches all settings from the class or base class used.

~~~js
const User = class User extends NextModel {
  static get connector() {
    return NextModelApiClientConnector;
  }

  static get routeDomain() {
    return 'http://api.example.com'
  }

  static get modelName() {
    return 'User';
  }

  static get schema() {
    return {
      id: { type: 'integer' },
      name: { type: 'string' },
    };
  }
}
~~~

Create an base model with the connector to use it with multiple models.

~~~js
const BaseModel = class BaseModel extends NextModel {
  static get connector() {
    return NextModelApiClientConnector;
  }
});

const User = class User extends BaseModel {
  static get modelName() {
    return 'User';
  }

  static get schema() {
    return {
      id: { type: 'integer' },
      name: { type: 'string' },
    };
  }
}

const Address = class Address extends BaseModel {
  static get modelName() {
    return 'Address';
  }

  static get schema() {
    return {
      id: { type: 'integer' },
      street: { type: 'string' },
    };
  }
}
~~~

## Custom Routes

The route configuration is done at the defined _(shared)_ Model.

_Default Routes:_
~~~
all    : POST /users
first  : POST /users/first
last   : POST /users/last
count  : POST /users/count
insert : POST /users/create
update : POST /user/:id
delete : POST /user/:id/delete
~~~

### Domain

The domain needs to be defined when your Api client is running on a different domain than the Backend.

_Default:_ `''`

~~~js
const BaseModel = class BaseModel extends NextModel {
  static get connector() {
    return NextModelApiClientConnector;
  }

  static get routeDomain() {
    return 'http://api.example.com';
  }
}

const User = class User extends BaseModel { ... }
~~~
~~~
all    : POST http://api.example.com/users
first  : POST http://api.example.com/users/first
last   : POST http://api.example.com/users/last
count  : POST http://api.example.com/users/count
insert : POST http://api.example.com/users/create
update : POST http://api.example.com/user/:id
delete : POST http://api.example.com/user/:id/delete
~~~

### IsRelative

Set `routeIsRelative` to `true` to prevent adding the leading `/` to the Url. Setting does not work when [domain](#domain) is present.

_Default:_ `false`

~~~js
const BaseModel = class BaseModel extends NextModel {
  static get connector() {
    return NextModelApiClientConnector;
  }

  static get routeIsRelative() {
    return true;
  }
}

const User = class User extends BaseModel { ... }
~~~
~~~
all    : POST users
first  : POST users/first
last   : POST users/last
count  : POST users/count
insert : POST users/create
update : POST user/:id
delete : POST user/:id/delete
~~~

### Path

The `routePath` defines the base route on the Server which contains the Api.

_Default:_ `''`

~~~js
const BaseModel = class BaseModel extends NextModel {
  static get connector() {
    return NextModelApiClientConnector;
  }

  static get routePath() {
    return 'api';
  }
}

const User = class User extends BaseModel { ... }
~~~
~~~
all    : POST /api/users
first  : POST /api/users/first
last   : POST /api/users/last
count  : POST /api/users/count
insert : POST /api/users/create
update : POST /api/user/:id
delete : POST /api/user/:id/delete
~~~

### Version

The Api can be versioned with `routeVersion`.

_Default:_ `''`

~~~js
const BaseModel = class BaseModel extends NextModel {
  static get connector() {
    return NextModelApiClientConnector;
  }

  static get routePath() {
    return 'api';
  }

  static get routeVersion() {
    return 'v1';
  }
}

const User = class User extends BaseModel { ... }
~~~
~~~
all    : POST /api/v1/users
first  : POST /api/v1/users/first
last   : POST /api/v1/users/last
count  : POST /api/v1/users/count
insert : POST /api/v1/users/create
update : POST /api/v1/user/:id
delete : POST /api/v1/user/:id/delete
~~~

### Name

The model name in the route defaults to the `tableName`, but can be overwritten by `routeName`.

~~~js
const BaseModel = class BaseModel extends NextModel {
  static get connector() {
    return NextModelApiClientConnector;
  }

  static get routeName() {
    return 'account';
  }
}

const User = class User extends BaseModel { ... }
~~~
~~~
all    : POST /accounts
first  : POST /accounts/first
last   : POST /accounts/last
count  : POST /accounts/count
insert : POST /accounts/create
update : POST /account/:id
delete : POST /account/:id/delete
~~~

### Postfix

The `routePostfix` can be used to define a file name for the Url.

_Default:_ `''`

~~~js
const BaseModel = class BaseModel extends NextModel {
  static get connector() {
    return NextModelApiClientConnector;
  }

  static get routePostfix() {
    return '.json';
  }
}

const User = class User extends BaseModel { ... }
~~~
~~~
all    : POST /users.json
first  : POST /users/first.json
last   : POST /users/last.json
count  : POST /users/count.json
insert : POST /users/create.json
update : POST /user/:id.json
delete : POST /user/:id/delete.json
~~~

### Action Path

The action url can be defined for every action.

_Defaults:_
* _all:_ `''`
* _first:_ `'/first'`
* _last:_ `'/last'`
* _count:_ `'/count'`
* _create:_ `'/create'`
* _update:_ `''`
* _delete:_ `'/_delete'`

~~~js
const BaseModel = class BaseModel extends NextModel {
  static get connector() {
    return NextModelApiClientConnector;
  }

  static get allActionPath() {
    return '/all';
  }

  static get firstActionPath() {
    return '';
  }

  static get updateActionPath() {
    return '/update';
  }
}

const User = class User extends BaseModel { ... }
~~~
~~~
all    : POST /users/all
first  : POST /users
last   : POST /users/last
count  : POST /users/count
insert : POST /users/create
update : POST /user/:id/update
delete : POST /user/:id/delete
~~~

### Action Method

The method url can be defined for every action.

_Default:_ `'POST'`

_Please Note:_
The default is POST for every route, cause the filter payload can be too large for query strings.

~~~js
const BaseModel = class BaseModel extends NextModel {
  static get connector() {
    return NextModelApiClientConnector;
  }

  static get allActionMethod() {
    return 'GET';
  }

  static get firstActionMethod() {
    return 'GET';
  }

  static get lastActionMethod() {
    return 'GET';
  }

  static get countActionMethod() {
    return 'GET';
  }

  static get updateActionMethod() {
    return 'PATCH';
  }

  static get deleteActionMethod() {
    return 'DELETE';
  }
}

const User = class User extends BaseModel { ... }
~~~
~~~
all    : GET    /users
first  : GET    /users/first
last   : GET    /users/last
count  : GET    /users/count
insert : POST   /users/create
update : PATCH  /user/:id
delete : DELETE /user/:id/delete
~~~

## Changelog

See [history](HISTORY.md) for more details.

* `0.1.0` **2017-03-15** First release compatible with NextModel 0.4.0
* `0.1.1` **2017-04-05** Updated next-model dependency
