const supertest = require('supertest')
const { app, server } = require('../index')
const jwt = require('jsonwebtoken')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { initialBlogs, blogsInDb, usersInDb } = require('./test_helper')

describe('API tests', async () => {
  describe('Blog tests', async () => {
    let authToken

    beforeAll(async () => {
      await Blog.remove({})
      await User.remove({})

      const user = new User({
        username: 'testuser',
        name: 'Test User',
        adult: true,
        password: 'sekret'
      })
      const createdUser = await user.save()

      const blogObjects = initialBlogs.map(b => {
        b.user = createdUser._id
        return new Blog(b)
      })
      await Promise.all(blogObjects.map(b => b.save()))

      const blogs = await blogsInDb()
      const userWithBlogs = {
        blogs: blogs.map(b => b.id)
      }
      await User.findByIdAndUpdate(createdUser._id, userWithBlogs, { new: true })

      const userForToken = {
        username: createdUser.username,
        id: createdUser._id
      }
      authToken = jwt.sign(userForToken, process.env.SECRET)
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

        const newBlogPostBody = {
          title: 'New blog entry from POST test',
          author: 'Mr. author',
          url: 'magic url',
          likes: 5
        }

        await api
          .post('/api/blogs')
          .set('Authorization', 'Bearer ' + authToken)
          .send(newBlogPostBody)
          .expect(201)
          .expect('Content-Type', /application\/json/)

        const blogsAfterPost = await blogsInDb()
        expect(blogsAfterPost.length).toBe(blogsAtStart.length + 1)

        const titles = blogsAfterPost.map(r => r.title)
        expect(titles).toContain('New blog entry from POST test')
      })

      test('blog with no initial likes is correctly initialized to 0', async () => {
        const newBlogPostBody = {
          title: 'New blog entry from POST test without likes',
          author: 'Mr. author',
          url: 'magic url'
        }

        const response = await api
          .post('/api/blogs')
          .set('Authorization', 'Bearer ' + authToken)
          .send(newBlogPostBody)
          .expect(201)
          .expect('Content-Type', /application\/json/)

        expect(response.body.likes).toBe(0)
      })

      test('blog with initial likes is not initialized to 0', async () => {
        const newBlogPostBody = {
          title: 'New blog entry from POST test with likes',
          author: 'Mr. author',
          url: 'magic url',
          likes: 9
        }

        const response = await api
          .post('/api/blogs')
          .set('Authorization', 'Bearer ' + authToken)
          .send(newBlogPostBody)
          .expect(201)
          .expect('Content-Type', /application\/json/)

        expect(response.body.likes).toBe(9)
      })

      test('blog is not added if title is missing', async () => {
        const blogsAtStart = await blogsInDb()

        const newBlogPostBody = {
          author: 'Mr. author',
          url: 'magic url'
        }

        await api
          .post('/api/blogs')
          .set('Authorization', 'Bearer ' + authToken)
          .send(newBlogPostBody)
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
          .set('Authorization', 'Bearer ' + authToken)
          .send(newBlog)
          .expect(400)

        const blogsAfterPost = await blogsInDb()
        expect(blogsAfterPost.length).toBe(blogsAtStart.length)
      })
    })
  })

  describe('User tests', async() => {
    describe('POST /api/users', async () => {
      test('succeeds with a fresh username', async () => {
        const usersBeforeOperation = await usersInDb()

        const newUser = {
          username: 'mluukkai',
          name: 'Matti Luukkainen',
          password: 'salainen'
        }

        await api
          .post('/api/users')
          .send(newUser)
          .expect(200)
          .expect('Content-Type', /application\/json/)

        const usersAfterOperation = await usersInDb()
        expect(usersAfterOperation.length).toBe(usersBeforeOperation.length+1)
        const usernames = usersAfterOperation.map(u => u.username)
        expect(usernames).toContain(newUser.username)
      })

      test('fails with proper statuscode and message if username already taken', async () => {
        const usersBeforeOperation = await usersInDb()

        const newUser = {
          username: 'testuser',
          name: 'Useer',
          password: 'salainen'
        }

        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)

        expect(result.body).toEqual({ error: 'username must be unique' })

        const usersAfterOperation = await usersInDb()
        expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
      })

      test('fails proper statuscode and message if password is too short', async () => {
        const usersBeforeOperation = await usersInDb()

        const newUser = {
          username: 'newUser1564',
          name: 'Useer',
          password: 'ps'
        }

        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)

        expect(result.body).toEqual({ error: 'password must be at least 3 characters long' })

        const usersAfterOperation = await usersInDb()
        expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
      })

      test('succeeds defaulting adult to true when not given', async () => {
        const usersBeforeOperation = await usersInDb()

        const newUser = {
          username: 'newUser7894',
          name: 'Useer54489',
          password: 'password'
        }

        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(200)
          .expect('Content-Type', /application\/json/)

        expect(result.body.adult).toBe(true)

        const usersAfterOperation = await usersInDb()
        expect(usersAfterOperation.length).toBe(usersBeforeOperation.length + 1)
      })
    })
  })

  afterAll(() => {
    server.close()
  })
})
