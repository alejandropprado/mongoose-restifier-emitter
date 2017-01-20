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
