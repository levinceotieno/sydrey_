const express = require('express');
const router = express.Router();
const db = require('../db'); // Assume you have a db connection setup

// Get all blog posts
router.get('/blogs', async (req, res) => {
   try {
       const [blogs] = await db.execute('SELECT * FROM blogs ORDER BY created_at DESC');
       const user = req.session.user || null;
       res.render('blogs', { blogs, user });
   } catch (err) {
       console.error('Error fetching blogs:', err);
       res.status(500).send('Internal Server Error');
   }
});

// Render the blog creation form
router.get('/blogs/new', (req, res) => {
    const user = req.session.user || null;
    res.render('createBlog', { user });
});

// Add a new blog post
router.post('/blogs', async (req, res) => {
    const { title, content, author } = req.body;
    await db.execute('INSERT INTO blogs (title, content, author) VALUES (?, ?, ?)', [title, content, author]);
    res.redirect('/blogs');
});

// Edit a blog post
router.get('/blogs/:id/edit', async (req, res) => {
  try {
     const [blog] = await db.execute('SELECT * FROM blogs WHERE id = ?', [req.params.id]);
     if (blog.length === 0) {
	return res.status(404).send('Blog post not found');
     }
     const user = req.session.user || null;
     res.render('editBlog', { blog: blog[0], user });
  } catch (err) {
     console.error('Error fetching blog post:', err);
     res.status(500).send('Internal Server Error');
  }
});

/**
router.get('/blogs/:id/edit', async (req, res) => {
    const [blog] = await db.execute('SELECT * FROM blogs WHERE id = ?', [req.params.id]);
    const user = req.session.user || null;
    console.log(req.params.id, blog);
    res.render('editBlog', { blog: blog[0], user });
});**/

// Update a blog post
router.post('/blogs/:id', async (req, res) => {
    const { title, content } = req.body;
    await db.execute('UPDATE blogs SET title = ?, content = ? WHERE id = ?', [title, content, req.params.id]);
    res.redirect('/blogs');
});

// Delete a blog post
router.post('/blogs/:id/delete', async (req, res) => {
    await db.execute('DELETE FROM blogs WHERE id = ?', [req.params.id]);
    res.redirect('/blogs');
});

router.get('/blogs/:id', async (req, res) => {
    try {
       const [result] = await db.execute('SELECT * FROM blogs WHERE id = ?', [req.params.id]);
       if (result.length === 0) {
	   console.log(`Blog with ID ${req.params.id} not found`);
	   return res.status(404).send('Blog post not found');
       }
       const blog = result[0];
       const user = req.session.user || null;
       res.render('blogDetail', { blog, user }); // Render a new view for the single blog post
    } catch (err) {
       console.error('Error fetching blog post:', err);
       res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
