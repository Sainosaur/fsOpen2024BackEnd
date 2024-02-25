const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)
const {test} = require('node:test')
const assert = require('node:assert')

test('Get request returns data', async () => {
    const res = await api
    .get('/api/blogs')
    .expect(200)
    .expect('content-type', /application\/json/)
    assert(res.body.length, 1)
})