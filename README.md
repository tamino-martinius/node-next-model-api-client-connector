# NextModelApiClientConnector

Api client for [ApiServer](https://github.com/tamino-martinius/node-next-model=api-server-connector) using [NextModel](https://github.com/tamino-martinius/node-next-model) package.

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

## Changelog

See [history](HISTORY.md) for more details.

* `0.1.0` **2017-03-??** First release compatible with NextModel 0.4.0
