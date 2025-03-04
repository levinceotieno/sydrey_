const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../public/uploads/blog-images');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter function to accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Handle image uploads for TinyMCE
router.post('/blogs/upload-image', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // Return the URL to the uploaded file
        const imageUrl = `/uploads/blog-images/${req.file.filename}`;
        return res.status(200).json({ 
            location: imageUrl // TinyMCE expects a "location" property
        });
    } catch (err) {
        console.error('Error uploading image:', err);
        return res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Get all blog posts
router.get('/blogs', async (req, res) => {
   try {
       const [blogs] = await db.execute('SELECT * FROM blogs ORDER BY created_at DESC');
       const user = req.session.user || null;

       let cartCount = 0;
       if (user) {
         const [cartItems] = await db.execute('SELECT COUNT(*) as count FROM cart WHERE user_id = ?', [user.id]);
         cartCount = cartItems[0].count;
       }

       res.render('blogs', { blogs, user, cartCount });
   } catch (err) {
       console.error('Error fetching blogs:', err);
       res.status(500).send('Internal Server Error');
   }
});

// Render the blog creation form
router.get('/blogs/new', async (req, res) => {
    const user = req.session.user || null;
    
    // Check if user is admin
    if (!user || !user.isAdmin) {
        return res.status(403).send('Unauthorized: Admin access required');
    }
    
    let cartCount = 0;
    if (user) {
      const [cartItems] = await db.execute('SELECT COUNT(*) as count FROM cart WHERE user_id = ?', [user.id]);
      cartCount = cartItems[0].count;
    }
    res.render('createBlog', { user, cartCount });
});

// Add a new blog post with image upload
router.post('/blogs', upload.single('cover_image'), async (req, res) => {
    try {
        const { title, content, author } = req.body;
        let coverImagePath = null;
        
        if (req.file) {
            coverImagePath = `/uploads/blog-images/${req.file.filename}`;
        }
        
        await db.execute(
            'INSERT INTO blogs (title, content, author, cover_image) VALUES (?, ?, ?, ?)', 
            [title, content, author, coverImagePath]
        );
        
        res.redirect('/blogs');
    } catch (err) {
        console.error('Error creating blog post:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Edit a blog post
router.get('/blogs/:id/edit', async (req, res) => {
  try {
     const [blog] = await db.execute('SELECT * FROM blogs WHERE id = ?', [req.params.id]);
     if (blog.length === 0) {
        return res.status(404).send('Blog post not found');
     }
     
     const user = req.session.user || null;
     
     // Check if user is admin
     if (!user || !user.isAdmin) {
         return res.status(403).send('Unauthorized: Admin access required');
     }
     
     let cartCount = 0;
     if (user) {
       const [cartItems] = await db.execute('SELECT COUNT(*) as count FROM cart WHERE user_id = ?', [user.id]);
       cartCount = cartItems[0].count;
     }
     res.render('editBlog', { blog: blog[0], user, cartCount });
  } catch (err) {
     console.error('Error fetching blog post:', err);
     res.status(500).send('Internal Server Error');
  }
});

// Update a blog post with image upload
router.post('/blogs/:id', upload.single('cover_image'), async (req, res) => {
    try {
        const { title, content } = req.body;
        const blogId = req.params.id;
        
        // First, get the existing blog post
        const [existingBlog] = await db.execute('SELECT cover_image FROM blogs WHERE id = ?', [blogId]);
        
        if (existingBlog.length === 0) {
            return res.status(404).send('Blog post not found');
        }
        
        let coverImagePath = existingBlog[0].cover_image;
        
        // If a new image is uploaded, update the cover image path
        if (req.file) {
            coverImagePath = `/uploads/blog-images/${req.file.filename}`;
            
            // Delete the old image if it exists
            if (existingBlog[0].cover_image) {
                const oldImagePath = path.join(__dirname, '../public', existingBlog[0].cover_image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }
        
        await db.execute(
            'UPDATE blogs SET title = ?, content = ?, cover_image = ? WHERE id = ?', 
            [title, content, coverImagePath, blogId]
        );
        
        res.redirect('/blogs');
    } catch (err) {
        console.error('Error updating blog post:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Delete a blog post
router.post('/blogs/:id/delete', async (req, res) => {
    try {
        const blogId = req.params.id;
        
        // Get the blog post to find its image
        const [blog] = await db.execute('SELECT cover_image FROM blogs WHERE id = ?', [blogId]);
        
        if (blog.length > 0 && blog[0].cover_image) {
            // Delete the associated image file
            const imagePath = path.join(__dirname, '../public', blog[0].cover_image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        // Delete the blog post from the database
        await db.execute('DELETE FROM blogs WHERE id = ?', [blogId]);
        res.redirect('/blogs');
    } catch (err) {
        console.error('Error deleting blog post:', err);
        res.status(500).send('Internal Server Error');
    }
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

       let cartCount = 0;
       if (user) {
         const [cartItems] = await db.execute('SELECT COUNT(*) as count FROM cart WHERE user_id = ?', [user.id]);
         cartCount = cartItems[0].count;
       }
       res.render('blogDetail', { blog, user, cartCount });
    } catch (err) {
       console.error('Error fetching blog post:', err);
       res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
