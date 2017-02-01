# Mongoose Restifier Emitter
It helps you building restful APIs and it emit events 
```javascript
const mongoose = require('mongoose')
const { handler } = require('mongoose-restifier-emitter')

var todosSchema = mongoose.Schema({
    desc: String,
})

const Todos = mongoose.model('Todo', todosSchema)

router.get('/', handler.index(Todos))
router.get('/:id', handler.show(Todos))
router.post('/', handler.create(Todos))
router.put('/', handler.update(Todos))
router.delete('/', handler.destroy(Product))
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

var todosSchema = mongoose.Schema({
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
```
GET
http://localhost:3000/?aggregate={"$match":{"desc":"lala"},{"$sort":{"_id":-1}}}
```

Of course you can compose this queries:
```
http://localhost:3000/?q={"desc":"lala"}&limit=10&select="desc -_id"
```
