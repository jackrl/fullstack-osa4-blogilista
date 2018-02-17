const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const { initialBlogs, blogsInDb } = require('./test_helper')

describe('Blog API', async () => {
  beforeAll(async () => {
    await Blog.remove({})

    const blogObjects = initialBlogs.map(b => new Blog(b))
    await Promise.all(blogObjects.map(b => b.save()))
  })

  describe('GET /api/blogs', async () => {
    test('blogs are returned as json and contain all the blogs', async () => {
      const response = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(response.body.length).toBe(6)
    })
  })

  describe('POST /api/blogs', async () => {
    test('blog is added', async () => {
      const blogsAtStart = await blogsInDb()

      const newBlog = {
        title: 'New blog entry from POST test',
        author: 'Mr. author',
        url: 'magic url',
        likes: 5
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAfterPost = await blogsInDb()
      expect(blogsAfterPost.length).toBe(blogsAtStart.length + 1)

      const titles = blogsAfterPost.map(r => r.title)
      expect(titles).toContain('New blog entry from POST test')
    })

    test('blog with no initial likes is correctly initialized to 0', async () => {
      const newBlog = {
        title: 'New blog entry from POST test without likes',
        author: 'Mr. author',
        url: 'magic url'
      }

      const response = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      expect(response.body.likes).toBe(0)
    })

    test('blog with initial likes is not initialized to 0', async () => {
      const newBlog = {
        title: 'New blog entry from POST test with likes',
        author: 'Mr. author',
        url: 'magic url',
        likes: 9
      }

      const response = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      expect(response.body.likes).toBe(9)
    })

    test('blog is not added if title is missing', async () => {
      const blogsAtStart = await blogsInDb()

      const newBlog = {
        author: 'Mr. author',
        url: 'magic url',
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAfterPost = await blogsInDb()
      expect(blogsAfterPost.length).toBe(blogsAtStart.length)
    })

    test('blog is not added if url is missing', async () => {
      const blogsAtStart = await blogsInDb()

      const newBlog = {
        title: 'New blog entry from POST test with no url',
        author: 'Mr. author'
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAfterPost = await blogsInDb()
      expect(blogsAfterPost.length).toBe(blogsAtStart.length)
    })
  })

  afterAll(() => {
    server.close()
  })
})
