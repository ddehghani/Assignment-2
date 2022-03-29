const User = require('../models/user.model')
const Book = require('../models/book.model')

module.exports = {
  //Search a user by username and/or phone number
  search: async ({query}, res) => {
    const userQuery = {
      ...query.username  && {'username': query.username},
      ...query.phone  && {'phone': query.phone}
    }
    try {
      const users = await User.find(userQuery).populate('borrowed_books').lean()
      return res.render('user-search',{...userQuery, users})
    } catch (e) {
      return res.render('user-search',{...userQuery})
    }
  },

  //Create a new user
  create: async ({body}, res) => {
    try {
      const user = new User(body)
      await user.save()
      return res.render('user-create',{...body, success: true})
    } catch (e) {
      return res.render('user-create',{...body, error: e.message})
    }
  },

  //Update an existing user
  update: async ({body}, res) => {
    const query = {
      ...body.username  && {'username': body.username},
      ...body.phone  && {'phone': body.phone}
    }
    const newInfo = {
      ...body.newUsername  && {'username': body.newUsername},
      ...body.newPhone  && {'phone': body.newPhone}
    } 
    if (!Object.keys(query).length) //no user or phone specified
      return res.render('user-update',{...body, error: 'You need to at least specify a username or a phone number to find the user!'})
    try {
      const result = await User.updateMany(query, newInfo)
      if (result.modifiedCount > 0)
        return res.render('user-update',{...body, success: result.modifiedCount})
      else
        return res.render('user-update',{...body, error: 'No user with the specified information was found or user data matches with the new information!'})
    } catch (e) {
      return res.render('user-update',{...body, error: e.message})
    }
  },

  //Delete a user by username and/or phone number
  delete: async ({body}, res) => {
    const query = {
      ...body.username  && {'username': body.username},
      ...body.phone  && {'phone': body.phone}
    }
    if (!Object.keys(query).length) //no user or phone specified
      return res.render('user-delete',{...body, error: 'You need to at least specify a username or a phone number!'})
    try {
      const result = await User.deleteMany(query)
      if (result.deletedCount > 0)
        return res.render('user-delete',{...body, success: result.deletedCount})
      else
        return res.render('user-delete',{...body, error: 'No user with the specified information was found!'})
    } catch (e) {
      return res.render('user-delete',{...body, error: e.message})
    }
  },

  borrow: async ({body}, res) => {
    const userQuery = {
      ...body.username  && {'username': body.username},
      ...body.phone  && {'phone': body.phone}
    }
    const users = await User.find(userQuery).populate('borrowed_books').lean()
    body.users = users;

    if (body.userSelect)
    {
      body.users.find( user => user.username === body.userSelect).checked = true
      const bookQuery = {
        ...body.id  && {'id': body.id},
        ...body.title  && {'title': body.title}
      }
      const books = await Book.find(bookQuery).lean()
      body.books = books;
      if (body.bookSelect)
        body.books.find( book => book.id == body.bookSelect).checked = true
    }

    if (body.borrow === 'true')
    {
      try {
        const user = await User.findOne({username: body.userSelect})
        if (user.borrowed_books.length >= 3)
          return res.render('user-borrow',{...body, error: "The user: ${user.username} has already borrowed the maximum number of books each user is allowed to borrow."})
        const book = await Book.findOne({id: body.bookSelect})
        if (book.inventory_count == 0)
          return res.render('user-borrow',{...body, error: "We have no copy of this book in our inventory"})
        user.borrowed_books.push(book)
        book.inventory_count -= 1
        await Promise.all([user.save(), book.save()])
        body.success = true
      } catch (e) {
        body.error = e.message
      }
    }
    return res.render('user-borrow', body)
  },

  return: async ({body}, res) => {
    const userQuery = {
      ...body.username  && {'username': body.username},
      ...body.phone  && {'phone': body.phone}
    }
    body.users = await User.find(userQuery).populate('borrowed_books').lean()
    if (body.userSelect)
    {
      body.user = body.users.find( user => user.username === body.userSelect)
      body.user.checked = true
    }
    if (body.bookSelect)
      body.user.borrowed_books.find( book => book.id == body.bookSelect).checked = true

    if (body.return === 'true')
    {
      try {
        let users = await User.find(userQuery).populate('borrowed_books')
        let user = users.find( user => user.username === body.userSelect)
        let book
        let i = user.borrowed_books.length
        while (i--)
          if (user.borrowed_books[i].id == body.bookSelect) {
            book = user.borrowed_books[i]
            user.borrowed_books.splice(i, 1)
            break
          }
        book.inventory_count += 1
        await Promise.all([user.save(), book.save()])
        body.success = true
      } catch (e) {
        body.error = e.message
      }
    }
    return res.render('user-return', body)
  }
}