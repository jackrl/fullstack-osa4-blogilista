const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((acc, blog) => {
    return acc + blog.likes
  }, 0)
}

const favoriteBlog = (blogs) => {
  const blog = blogs.reduce((prev, curr) => {
    return (prev.likes > curr.likes) ? prev : curr
  }, {})

  return {
    title: blog.title,
    author: blog.author,
    likes: blog.likes
  }
}

const mostBlogs = (blogs) => {
  const authors = []
  blogs.forEach(b => {
    const author = authors.find(a => { return a.author === b.author })
    if (!author) {
      authors.push({
        author: b.author,
        blogs: 1
      })
    } else {
      author.blogs++
    }
  })

  return authors
    .reduce((prev, curr) => {
      return (prev.blogs > curr.blogs) ? prev : curr
    }, {})
}

const mostLikes = (blogs) => {
  const authors = []
  blogs.forEach(b => {
    const author = authors.find(a => { return a.author === b.author })
    if (!author) {
      authors.push({
        author: b.author,
        likes: b.likes
      })
    } else {
      author.likes += b.likes
    }
  })

  return authors
    .reduce((prev, curr) => {
      return (prev.likes > curr.likes) ? prev : curr
    }, {})
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
