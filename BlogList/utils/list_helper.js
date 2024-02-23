const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    let init = 0;
    blogs.map((blog) => init += blog.likes)
    return init
}

const favoriteBlog = (blogs) => {
    let favorite = {
        likes : 0
    }
    blogs.forEach(blog => {
        if (blog.likes > favorite.likes) {
            favorite = {
                title : blog.title,
                author: blog.author,
                likes : blog.likes
            }
        }
    })
    if (favorite.likes != 0) {
        return favorite
    } else {
        return {}
    }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}