const sinon = require('sinon')
const expect = require('chai').expect
const assert = require('assert')
const parseQueryParams = require('./parser')
require('sinon-as-promised')

let req = {}, res = {}, next
describe('#Query parser', () => {

  beforeEach(() => {
    next = sinon.spy()
  })

  describe('parseQueryParams', () => {

    it('parse correctly', () => {
      req.query = {something: `{"x": "y"}`}
      parseQueryParams(req, res, next)
      expect(req.query.something).to.have.property("x", "y")
      expect(next.calledOnce).to.be.true
    })

    it('does not parse if it cannot', () => {
      req.query = {something: `{"x": "y}`}
      parseQueryParams(req, res, next)
      expect(next.calledWith()).to.be.true
    })

  })


})
