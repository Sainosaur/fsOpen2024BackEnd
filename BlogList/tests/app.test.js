const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)
const {test, after} = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')

    test('Get request returns data', async () => {
        const res = await api
        .get('/api/blogs')
        .expect(200)
        .expect('content-type', /application\/json/)
        assert(res.body.length, 1)
    })
    test('POST request correctly adds entry to DB', async () => {
        const testBlog = {
            title : 'Test',
            author : "Me",
            url : 'https://www.google.com',
            likes : 0
        }
        const res0 = await api.get('/api/blogs')
        const res = await api
        .post('/api/blogs')
        .send(testBlog)
        .expect(201)
        const res1 = await api.get('/api/blogs')
        const resBlog = {
            title : res.body.title,
            author : res.body.author,
            url : res.body.url,
            likes : res.body.likes
        }
        // Checks whether one note has been added to the db
        assert.strictEqual(res1 + (res0+1))
    })
after(async () => {
    // Logic to be executed after each test
    await mongoose.connection.close()
})