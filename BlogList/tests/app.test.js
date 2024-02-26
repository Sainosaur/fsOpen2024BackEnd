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
        // Checks whether one note has been added to the db
        assert.strictEqual(res1.body.length,  (res0.body.length + 1))
    })
    test('identifier property of the blog posts is named id', async () => {
        const res = await api
        .get('/api/blogs')
        .expect(200)
        let _idExist = false
        res.body.forEach(element => {
            if (element._id) {
                _idExist = true
            }
        })
        assert.strictEqual(_idExist, false)
    })
    test('if likes property is not included it is set to 0 by the server', async () => {
        const testBlog = {
            title : 'Test',
            author : "Me",
            url : 'https://www.google.com',
        }
        const res = await api
        .post('/api/blogs')
        .send(testBlog)
        .expect(201)
        //Checks if the response has 0 likes after the field is missing from the POST request
        assert.strictEqual(res.body.likes, 0)
    })
    test('server responds with 400 (Bad request) when given incomplete blog object', async () => {
        const testBlog = {
            url: "bread",
            likes : 5
        }
        const res = api
        .post('/api/blogs')
        .send(testBlog)
        .expect(400)
    })
    test('server deletes a valid id sucessfully', async () => {
        const res = await api
        .get('/api/blogs')
        const id = res.body[0].id
        api
        .delete(`/api/blogs/${id}`)
        .expect(204)
    })
    test('server returns 400 when attempting to delete an invalid id', async () => {
        api
        .delete('/api/blogs/f2a1k32e2i12d')
        .expect(400)
    })
    test('valid PUT request allows exisiting note to be modified', async () => {
        const updatedBlog = {
            title : "UpdateTest",
            author : "UpdateTest",
            url : "https://www.instagram.com/",
            likes : 69,
        }
        // selects the first available blog from list to run test on
        const resid = await api
        .get('/api/blogs')
        const id = resid.body[0].id

        const res = await api
        .put(`/api/blogs/${id}`)
        .send(updatedBlog)
        .expect(200)
    })
    test('invalid PUT request fails', async () => {
        const id = "65db708acf1736559c1dd4c"
        const res = await api.put(`/api/blogs/${id}`)
        // Server should be throwing a 400 as the request being made is to a non existent id
        .expect(400)
    })
after(async () => {
    // Logic to be executed after each test
    await mongoose.connection.close()
})