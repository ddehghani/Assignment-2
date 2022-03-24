const Book = require('../models/book.model')

module.exports = {
  //Search a book by id and/or title
  search: async ({query}, res) => {
    const bookQuery = {
      ...query.id  && {'id': query.id},
      ...query.title  && {'title': query.title}
    }
    const books = await Book.find(bookQuery).lean()
    return res.render('book-search',{...bookQuery, books})
  },

   //Create a new book
  create: async ({body}, res) => {
    try {
      if (!body.inventory_count)
        body.inventory_count = 1
      const latestBook = await Book.findOne().sort('-id')
      const id = latestBook ? latestBook.id + 1 : 1;
      const book = new Book({...body, id})
      await book.save()
      return res.render('book-create',{...body, success: true})
    } catch (e) {
      return res.render('book-create',{...body, error: e.message})
    }
  },

  //Update an existing book
  update: async ({body}, res) => {
    const query = {
      ...body.id  && {'id': body.id},
      ...body.title  && {'title': body.title}
    }
    const newInfo = {
      ...body.inventoryCount  && {'inventory_count': body.inventoryCount},
      ...body.newTitle  && {'title': body.newTitle}
    }
    if (!Object.keys(query).length) //no id or title specified
      return res.render('book-update',{...body, error: 'You need to at least specify an ID or a title!'})
    try {
      const result = await Book.updateMany(query, newInfo)
      if (result.modifiedCount > 0)
        return res.render('book-update',{...body, success: result.modifiedCount})
      else
        return res.render('book-update',{...body, error: 'No book with the specified information was found or book data matches with the new information!'})
    } catch (e) {
      return res.render('book-update',{...body, error: e.message})
    }
  },

  //Delete a book by ID and/or title
  delete: async ({body}, res) => {
    const query = {
      ...body.id  && {'id': body.id},
      ...body.title  && {'title': body.title}
    }
    if (!Object.keys(query).length) //no id or title specified
      return res.render('book-delete',{...body, error: 'You need to at least specify an ID or a title!'})
    try {
      const result = await Book.deleteMany(query)
      if (result.deletedCount > 0)
        return res.render('book-delete',{...body, success: result.deletedCount})
      else
        return res.render('book-delete',{...body, error: 'No book with the specified information was found!'})
    } catch (e) {
      return res.render('book-delete',{...body, error: e.message})
    }
  }
}