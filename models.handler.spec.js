const sinon = require('sinon')
const expect = require('chai').expect
const assert = require('assert')
const handler = require('./models.handler')
require('sinon-as-promised')

describe('#Models request handlers', () => {
  let ModelStub
  beforeEach(() => {
    ModelStub = {
      find: sinon.stub(),
      count: sinon.stub(),
      aggregate: sinon.stub(),
      findById: sinon.stub(),
      create: sinon.stub(),
      limit: sinon.stub(),
      select: sinon.stub(),
      populate: sinon.stub(),
      exec: sinon.stub()
    }

    ModelStub.find.returns(ModelStub)
    ModelStub.count.returns(ModelStub)
    ModelStub.aggregate.returns(ModelStub)
    ModelStub.findById.returns(ModelStub)
    ModelStub.limit.returns(ModelStub)
    ModelStub.select.returns(ModelStub)
    ModelStub.populate.returns(ModelStub)
  })
  describe('parseQueryParams', () => {
    it('parse correctly', () => {
      const parsed = handler.parseQueryParams({something: `{"x": "y"}`})
      expect(parsed.something).to.have.property("x", "y")
    })
    it('catches errors', () => {
      const parsed = handler.parseQueryParams({something: `{"x": "y}`})
      expect(parsed).to.be.a("string").and.to.equal("invalid query params")
    })
  })
  describe('index', () => {
    let req, res
    beforeEach(() => {
      req = {
        query: {
          q: `{"foo": "bar"}`,
          limit: 10,
          select: `"desc -_id"`,
        }
      }
      req.__proto__.test = 'test'
      res = {
        json: sinon.spy(),
        send: sinon.spy(),
        status: sinon.stub()
      }
      res.status.returns(res)
    })
    it('respond with result', () => {
      ModelStub.exec.resolves([{id: 1, name: 'ya'}])

      return handler.index(ModelStub)(req, res).then(x => {
        assert(res.json.calledWith([{id: 1, name: 'ya'}]), 'Response.send not called with correct args')
        assert(ModelStub.limit.calledWith(10), 'limit not called with 10')
        assert(ModelStub.select.calledWith('desc -_id'), 'limit not called with 10')
        assert(ModelStub.exec.calledOnce, 'Query not executed')
        assert(res.status.calledWith(200), 'incorrect status code')
      })
    })

    it('even with a missing prop', () => {
      ModelStub.exec.resolves([{id: 2, name: 'ya'}])

      return handler.index(ModelStub)({query: {q: `{"foo": "bar"}`}}, res).then(x => {
        assert(res.json.calledWith([{id: 2, name: 'ya'}]), 'Response.send not called with correct args')
        assert(ModelStub.limit.calledWith(0), 'limit not called with 0')
        assert(ModelStub.select.calledWith(false), 'limit not called with 1')
        assert(ModelStub.exec.calledOnce, 'Query not executed')
        assert(res.status.calledWith(200), 'incorrect status code')
      })
    })

    it('handle errors', () => {
      ModelStub.exec.rejects('some error')

      return handler.index(ModelStub)(req, res).then(() => {
        assert(res.send.calledWith(new Error('some error')), 'did not handled the error')
        assert(res.status.calledWith(500), 'incorrect status code')
      })
    })

    it('handle invalid query q params', () => {
      handler.index(ModelStub)({
        query: {
          q:"{'invalid: json"
        }
      }, res)
      assert(res.status.calledWith(400), 'status is not invalid request')
    })

    it('makes a count if exists in query', () => {
      ModelStub.exec.resolves([{id: 2, name: 'ya'}])
      return handler.index(ModelStub)({query: {count: `{"foo": "bar"}`}}, res).then(x => {
        expect(ModelStub.find.notCalled, 'Find should not be called').to.eql(true)
        expect(ModelStub.count.calledOnce, 'Count should be called').to.eql(true)
        expect(ModelStub.count.args[0][0]).to.eql({"foo": "bar"})
      })
    })

    it('calls aggregate if exists in query', () => {
      ModelStub.exec.resolves([{id: 2, name: 'ya'}])
      return handler.index(ModelStub)({query: {aggregate: `{"foo": "bar"}`}}, res).then(x => {
        expect(ModelStub.find.notCalled, 'Find should not be called').to.eql(true)
        expect(ModelStub.count.notCalled, 'Count should not be called').to.eql(true)
        expect(ModelStub.aggregate.calledOnce, 'aggregate should be called').to.eql(true)
        expect(ModelStub.aggregate.args[0][0]).to.eql({"foo": "bar"})
      })
    })
  })

  describe('create', () => {
    let req, res
    beforeEach(() => {
      req = {
        body: {}
      }
      res = {
        json: sinon.spy(),
        status: sinon.stub(),
        send: sinon.stub(),
      }
      res.status.returns(res)
      res.send.returns(res)
    })

    it('Creating a collection returns an array of {_id: ids}', () => {
      ModelStub.create.resolves(Array.from([
        { name: 'Zildjian', _id: '58824947d8977f43b2e94b37' },
        { name: 'Steve Jobs', _id: '58824947d8977f43b2e94b39' }
      ]))
      return handler.create(ModelStub)(req, res).then(x => {
        expect(res.json.args[0][0]).to.be.an("array")
        expect(res.json.args[0][0]).to.eql([{_id: '58824947d8977f43b2e94b37'}, {_id: '58824947d8977f43b2e94b39'}])
      })
    })

    it('Creating an entity returns a single {_id: id}', () => {
      ModelStub.create.resolves({ name: 'Zildjian', _id: '58824947d8977f43b2e94b37' })
      return handler.create(ModelStub)(req, res).then(x => {
        expect(res.json.args[0][0]).to.be.an("object")
        expect(res.json.args[0][0]).to.eql({_id: '58824947d8977f43b2e94b37'});
      })
    })

    it('handles errors', () => {
      ModelStub.create.rejects('some error')
      return handler.create(ModelStub)(req, res).then(x => {
        expect(res.send.args[0][0]).to.eql(new Error('some error'))
      })
    })
  })

  describe('show', () => {
    let req, res
    beforeEach(() => {
      req = {params: {id: 'something'}}
      res = {
        json: sinon.spy(),
        status: sinon.stub(),
        send: sinon.stub(),
      }
      res.status.returns(res)
      res.send.returns(res)
    })

    it('sends an element', () => {
      ModelStub.exec.resolves({id: 'something'})
      return handler.show(ModelStub)(req, res).then(x => {
        expect(res.json.args[0][0]).to.eql({id: 'something'})
      })
    })

    it('handles errors', () => {
      ModelStub.exec.rejects('some error')
      return handler.show(ModelStub)(req, res).then(x => {
        expect(res.send.args[0][0]).to.eql(new Error('some error'))
      })
    })

  })

  describe('update', () => {
    beforeEach(() => {
      req = {
        params: {id: 'something'},
        body: {desc: 'update description'},
      }
      res = {
        json: sinon.spy(),
        status: sinon.stub(),
        send: sinon.stub(),
        end: sinon.spy()
      }
      res.status.returns(res)
      res.send.returns(res)
    })

    it('updates an entity', () => {
      let entityStub = {extra: 'extra field', save: sinon.stub()}
      entityStub.save.resolves(Object.assign(entityStub, {desc: 'update description'}))
      ModelStub.exec.resolves(entityStub)
      return handler.update(ModelStub)(req, res).then(x => {
        expect(res.status.args[0][0]).to.eql(204)
        expect(res.json.notCalled).to.eql(true)
        expect(res.end.calledOnce).to.eql(true)
      })
    })

    it('handles entity not found', () => {
      ModelStub.exec.resolves(null)
      return handler.update(ModelStub)(req, res).then(x => {
        expect(res.status.args[0][0]).to.eql(404)
        expect(res.json.notCalled).to.eql(true)
        expect(res.end.calledOnce).to.eql(true)
      })
    })

    it('handles errors', () => {
      ModelStub.exec.rejects('some error')
      return handler.update(ModelStub)(req, res).then(x => {
        expect(res.status.args[0][0]).to.eql(500)
        expect(res.send.args[0][0]).to.eql(new Error('some error'))
      })
    })

    it('removes _id', () => {
      ModelStub.exec.resolves(null)
      const req2 = Object.assign({}, req, {body: {_id: 'someid'}})
      return handler.update(ModelStub)(req2, res).then(x => {
        expect(req2.body._id).to.eql(undefined);
      })
    })
  })

  describe('delete', () => {
    let entityStub
    beforeEach(() => {
      req = {
        params: {id: 'something'},
        body: {desc: 'update description'},
      }
      res = {
        json: sinon.spy(),
        status: sinon.stub(),
        send: sinon.stub(),
        end: sinon.spy()
      }
      res.status.returns(res)
      res.send.returns(res)
      entityStub = {extra: 'extra field', remove: sinon.stub()}
    })

    it('deletes an entity', () => {
      entityStub.remove.resolves(null)
      ModelStub.exec.resolves(entityStub)
      return handler.destroy(ModelStub)(req, res).then(x => {
        expect(res.status.args[0][0]).to.eql(204)
        expect(res.json.notCalled).to.eql(true)
        expect(res.end.calledOnce).to.eql(true)
      })
    })
    it('handles entity not found', () => {
      entityStub.remove.resolves(null)
      ModelStub.exec.resolves(null)
      return handler.destroy(ModelStub)(req, res).then(x => {
        expect(res.status.args[0][0]).to.eql(404)
        expect(res.json.notCalled).to.eql(true)
        expect(res.end.calledOnce).to.eql(true)
      })
    })
    it('handles errors', () => {
      ModelStub.exec.rejects('some error')
      return handler.destroy(ModelStub)(req, res).then(x => {
        expect(res.status.args[0][0]).to.eql(500)
        expect(res.json.notCalled).to.eql(true)
        expect(res.send.calledOnce).to.eql(true)
      })
    });
  })
})