# Mongoose Restifier Emitter
It helps you building restful APIs and it emit events

first, register the parser in express
```javascript
import { parser } from 'mongoose-restifier-emitter'

...
/*
 * this will parse all query params into objects, it uses
 * a forin and JSON.parse and will replace req.query
 */ 
app.use(parser) 
...

```

then, in your routes
```javascript
const mongoose = require('mongoose')
const { handler } = require('mongoose-restifier-emitter')

const todosSchema = mongoose.Schema({
    title: String,
    desc: String,
    created_at: Date,
})

const Todos = mongoose.model('Todo', todosSchema)
const omitSeveralAttributes = ['created_at', 'desc']
const omitOnlyAttribute = 'created_at'
const softDeleteAttrUpdate = {
	booleanAttrOne: true, // return true
	booleanAttrTwo: [Boolean, false], // return false
	booleanAttrCallMethod: [Boolean, false, 'toString'], // return "false"
	update_at: [Date, null, 'toISOString'], // return "2019-01-01T00:00:00.000Z"
	deleted_at: [Date, null], // return new Date()
	otherAttr: [Date, '2019'], // return Tue Jan 01 2019 00:00:00
}

router.get('/', handler.index(Todos, omitSeveralAttributes || omitOnlyAttribute))
router.get('/:id', handler.show(Todos, omitSeveralAttributes || omitOnlyAttribute))
router.post('/', handler.create(Todos))
router.put('/:id', handler.update(Todos))

router.delete('/:id', handler.destroy(Todos))
router.delete('/', handler.destroyBatch(Todos))
// or 
router.delete('/:id', handler.softDelete(Todos, softDeleteAttrUpdate))
router.delete('/', handler.softDeleteBatch(Todos, softDeleteAttrUpdate))
```

After every action, an event will be dispatched:

### index
The dispatched event will contain the request object and the collection found.
```javascript
const { events } = require('mongoose-restifier-emitter')
events.on('Todo:listed', function(req, collection) {
	// code here...
})
```
### show
The dispatched event will contain the request object and the object found.
```javascript
const { events } = require('mongoose-restifier-emitter')
events.on('Todo:detailed', function(req, doc) {
	// code here...
})
```
### create
The dispatched event will contain the request object and the id of the created object.
```javascript
const { events } = require('mongoose-restifier-emitter')
events.on('Todo:created', function(req, id) {
	// code here...
})
```
### update
The dispatched event will contain the request object.
```javascript
const { events } = require('mongoose-restifier-emitter')
events.on('Todo:updated', function(req) {
	// code here...
})
```
### delete
The dispatched event will contain the request object.
```javascript
const { events } = require('mongoose-restifier-emitter')
events.on('Todo:deleted', function(req) {
	// code here...
})
```

## Events format
The events format is based on the model name, so, if you have a model with this structure:
```javascript
const mongoose = require('mongoose')

const todosSchema = mongoose.Schema({
    desc: String,
})
// Model name here, first argument of model method
const Todos = mongoose.model('Todo', todosSchema)
```

The events dispatched will have the structure `Todo:action`

## The index method
The most important endpoint in a RESTful API is the index method. You can make queries to this endpoint:
```javascript
GET
http://localhost:3000/?q={"desc":"foo"}
```
Will return the elements that match the attribute with `foo`
```javascript
GET
http://localhost:3000/?select="desc -_id"
```
Will return the objects but only with the `desc` field and will omit the `_id` field

```javascript
GET
http://localhost:3000/?limit=10
```

Will get only the first 10 elements

You can also retrieve the total amount of certain documents:

```javascript
GET
http://localhost:3000/?count={"desc":"lala"}
```
This will return an integer and not the actual documents.

You can also make aggregate queries:
```javascript
GET
http://localhost:3000/?aggregate={"$match":{"desc":"lala"},{"$sort":{"_id":-1}}}
```

Of course you can compose this queries:
```javascript
http://localhost:3000/?q={"desc":"lala"}&limit=10&select="desc -_id"
```
