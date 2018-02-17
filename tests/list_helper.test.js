const listHelper = require('../utils/list_helper')
const blogs = require('./test_helper').initialBlogs.slice()

describe('list helpers', () => {
  describe('dummy', () => {
    test('dummy is called', () => {
      const result = listHelper.dummy([])
      expect(result).toBe(1)
    })
  })

  describe('total likes', () => {
    test('of empty list is zero', () => {
      expect(listHelper.totalLikes([])).toBe(0)
    })

    test('of a single blog matches its own', () => {
      const result = listHelper.totalLikes(blogs.slice(0,1))
      expect(result).toBe(7)
    })

    test('of multiple blogs', () => {
      const result = listHelper.totalLikes(blogs)
      expect(result).toBe(36)
    })
  })

  describe('favorite blog', () => {
    test('of empty list is an empty object', () => {
      expect(listHelper.favoriteBlog([]))
        .toEqual({})
    })

    test('of a single blog is itself', () => {
      const result = listHelper.favoriteBlog(blogs.slice(0,1))
      expect(result)
        .toEqual({
          title: blogs[0].title,
          author: blogs[0].author,
          likes: blogs[0].likes
        })
    })

    test('of multiple blogs', () => {
      const result = listHelper.favoriteBlog(blogs)
      expect(result)
        .toEqual({
          title: blogs[2].title,
          author: blogs[2].author,
          likes: blogs[2].likes
        })
    })
  })

  describe('most blogs', () => {
    test('of empty list is an empty object', () => {
      expect(listHelper.mostBlogs([]))
        .toEqual({})
    })

    test('of a single blog is the author with that blog', () => {
      const result = listHelper.mostBlogs(blogs.slice(0,1))
      expect(result)
        .toEqual({
          author: 'Michael Chan',
          blogs: 1
        })
    })

    test('of multiple blogs', () => {
      const result = listHelper.mostBlogs(blogs)
      expect(result)
        .toEqual({
          author: 'Robert C. Martin',
          blogs: 3
        })
    })
  })

  describe('most likes', () => {
    test('of empty list is an empty object', () => {
      expect(listHelper.mostLikes([]))
        .toEqual({})
    })

    test('of a single blog is the author with that blog', () => {
      const result = listHelper.mostLikes(blogs.slice(0,1))
      expect(result)
        .toEqual({
          author: 'Michael Chan',
          likes: 7
        })
    })

    test('of multiple blogs', () => {
      const result = listHelper.mostLikes(blogs)
      expect(result)
        .toEqual({
          author: 'Edsger W. Dijkstra',
          likes: 17
        })
    })
  })
})
