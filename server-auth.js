// server-auth.js
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables from secret.env file
dotenv.config({ path: './secret.env' });

// Import the necessary modules
const app = express();
const port = 3001; // Define the port to run the server

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Middleware to check user role
const verifyRole = (roles) => {
    return (req, res, next) => {
        console.log(req.user.role);
        if (!roles.includes(req.user.role)) {
            console.log(`Not Authorized : ${req.user.role} - ${roles}`);
            return res.sendStatus(403);
        }
        next();
    };
};

app.use(cors());
app.use(express.json());

// Mock user data - this should be replaced with actual user validation logic
const users = [
    { id: 1, email: 'admin@example.com', password: '123', role: 'admin' },
    { id: 2, email: 'user@example.com', password: 'user123', role: 'user' },
    { id: 3, email: 'afif@gmail.com', password: '111', role: 'user' },
];

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Find the user
    const user = users.find(u => u.email === email && u.password === password);
    console.log(`email : ${email} password : ${password} -> user : ${user}`);

    // If user not found or password is incorrect, return an error
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate a token with the user's email and role
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.SECRET_KEY, { expiresIn: '1h' });

    // Respond with the generated token
    res.json({ token });
});

app.get('/api/rules', verifyToken, (req, res) => {
    res.json({
        loanQuota: 2,
        loanDuration: 2,
    });
    console.log('/api/rules hit');
});

// Define a route for the mock API
app.get('/api/example', (req, res) => {
    res.json({
        message: 'Hello, this is a mock API response!',
        data: {
            id: 1,
            name: 'Sample Data',
            description: 'This is a sample description.'
        }
    });
    console.log('/api/example hit');
});

// Protected Routes
// admin routes
app.get('/api/users', verifyToken, verifyRole(['admin']), (req, res) => {
    res.json([
        {
            id: 1, imageUrl: 'https://media.licdn.com/dms/image/D5603AQGD9pO7whRepQ/profile-displayphoto-shrink_200_200/0/1707034334939?e=1727308800&v=beta&t=h7YezQKKVPgi1netvtiDUjFkqwbL14r_oxgHMGCYaZI',
            fullName: 'Afif Rana M', username: 'afifr', point: 12, gender: 'Male', status: 'Deactive'
        },
        {
            id: 2, imageUrl: 'https://media.licdn.com/dms/image/D5603AQHKz4J5YGqr8w/profile-displayphoto-shrink_200_200/0/1715589330416?e=1727308800&v=beta&t=8VyW51tP3C90HhBt6pW9GXvFjEKjKswL8-ITXs2UxLg',
            fullName: 'Putri Melenia', username: 'putrim', point: 12, gender: 'Female', status: 'Active'
        }
    ]);
    console.log('/api/stats hit');
});

app.get('/api/users/:id', verifyToken, verifyRole(['admin']), (req, res) => {
    const users = [
        {
            id: 1, imageUrl: 'https://media.licdn.com/dms/image/D5603AQGD9pO7whRepQ/profile-displayphoto-shrink_200_200/0/1707034334939?e=1727308800&v=beta&t=h7YezQKKVPgi1netvtiDUjFkqwbL14r_oxgHMGCYaZI',
            fullName: 'Afif Rana M', username: 'afifr', point: 12, gender: 'Male', status: 'Deactive', birthPlace: 'Bandar Lampung', birthDate: new Date('1999-10-04').toLocaleDateString('id'),
            address: 'Jakarta Selatan', phoneNumber: '08123456789', additionalLoanQuota: 2, additionalLoanDuration: 2, status: 'Deactive',
        },
        {
            id: 2, imageUrl: 'https://media.licdn.com/dms/image/D5603AQHKz4J5YGqr8w/profile-displayphoto-shrink_200_200/0/1715589330416?e=1727308800&v=beta&t=8VyW51tP3C90HhBt6pW9GXvFjEKjKswL8-ITXs2UxLg',
            fullName: 'Putri Melenia', username: 'putrim', point: 12, gender: 'Female', status: 'Active', birthPlace: 'Banjarsari', birthDate: new Date('1999-10-04').toLocaleDateString('id'),
            address: 'Jakarta Selatan', phoneNumber: '08123456789', additionalLoanQuota: 2, additionalLoanDuration: 2, status: 'Active',
        }
    ];

    res.json(users.find((user) => user.id == req.params.id));
    console.log('/api/stats hit');
});


app.get('/api/stats', verifyToken, verifyRole(['admin']), (req, res) => {
    res.json({
        totalCollection: 137,
        totalMembers: 63,
        totalLoanTransactions: 35,
        totalOverdueBooks: 4
    });
    console.log('/api/stats hit');
});

app.get('/api/popular-books', verifyToken, verifyRole(['admin']), (req, res) => {
    res.json([
        { name: 'The Postmistress', count: 5 },
        { name: 'Tentang Kamu', count: 19 }
    ]);
    console.log('/api/popular-books hit');
});

app.get('/api/top-borrowers', verifyToken, verifyRole(['admin']), (req, res) => {
    res.json([
        { name: 'Afif Rana', count: 27 },
        { name: 'Putri Melenia', count: 19 }
    ]);
    console.log('/api/top-borrowers hit');
});

app.get('/api/recent-orders', verifyToken, verifyRole(['admin']), (req, res) => {
    res.json([
        { name: 'The Postmistress', status: 'Proses' },
        { name: 'Tentang Kamu', status: 'Proses' }
    ]);
    console.log('/api/recent-orders hit');
});

// user routes
app.get('/api/user-stats', verifyToken, verifyRole(['user']), (req, res) => {
    res.json({
        status: 'ACTIVE',
        membershipStartDate: new Date('2022-10-04').toLocaleDateString('id'),
        points: 63,
        currentLoans: 2,
        reservedCollections: 3,
        totalLoanHistory: 4,
        additionalLoanQuota: 2,
        additionalLoanDuration: 2
    });
    console.log('/api/user-stats hit');
});

app.get('/api/user-profile/:userId', verifyToken, verifyRole(['user']), (req, res) => {
    if (req.params.userId) {
        // res.json({
        //     avatarUrl: 'https://media.licdn.com/dms/image/D5603AQGD9pO7whRepQ/profile-displayphoto-shrink_200_200/0/1707034334939?e=1727308800&v=beta&t=h7YezQKKVPgi1netvtiDUjFkqwbL14r_oxgHMGCYaZI',
        //     fullName: 'Afif', memberId: 123659439462, username: 'afif111', gender: 'Male', phoneNumber: '01234', birthPlace: 'Lampung', birthDate: new Date('1999-10-04').toLocaleDateString('id'), address: 'Jakarta Selatan', registrationDate: new Date('2022-10-04').toLocaleDateString('id')
        // });
        res.json({
            avatarUrl: 'https://media.licdn.com/dms/image/D5603AQHKz4J5YGqr8w/profile-displayphoto-shrink_200_200/0/1715589330416?e=1727308800&v=beta&t=8VyW51tP3C90HhBt6pW9GXvFjEKjKswL8-ITXs2UxLg',
            fullName: 'Putri', memberId: 123659439462, username: 'afif111', gender: 'Male', phoneNumber: '01234', birthPlace: 'Lampung', birthDate: new Date('1999-10-04').toLocaleDateString('id'), address: 'Jakarta Selatan', registrationDate: new Date('2022-10-04').toLocaleDateString('id')
        });
    } else {
        res.status(400);
    }
    console.log(`/api/user-profile/${req.params.userId} hit`);
});

app.get('/api/loans', verifyToken, verifyRole(['user']), (req, res) => {
    res.json([
        { id: 1, title: 'Dasar Pemrograman', status: 'Telat', borrowDate: new Date('2022-10-04').toLocaleDateString('id'), returnDate: new Date('2022-11-04').toLocaleDateString('id') }
    ]);
    console.log('/api/loans hit');
});

app.get('/api/orders', verifyToken, verifyRole(['user']), (req, res) => {
    res.json([
        { title: 'Programming React Js', id: 111, status: 'Dipesan', orderDate: new Date('2022-10-04').toLocaleDateString('id'), pickupDate: new Date('2022-11-04').toLocaleDateString('id') },
        { title: 'Kumpulan Puisi', id: 112, status: 'Dipesan', orderDate: new Date('2022-10-04').toLocaleDateString('id'), pickupDate: new Date('2022-11-04').toLocaleDateString('id') },
        { title: 'Investasi Saham Untuk Pemula', id: 113, status: 'Dipesan', orderDate: new Date('2022-10-04').toLocaleDateString('id'), pickupDate: new Date('2022-11-04').toLocaleDateString('id') }
    ]);
    console.log('/api/orders hit');
});

app.get('/api/books', verifyToken, verifyRole(['user', 'admin']), (req, res) => {
    res.json([
        { id: 1, title: 'Programming React Js', author: 'Afif', category: 'Non Fiksi', language: 'Indonesia', positon: '123', availableCopies: 12 },
        { id: 2, title: 'Basic Programming', author: 'Afif', category: 'Non Fiksi', language: 'Indonesia', positon: '123', availableCopies: 12 },
        { id: 3, title: 'Resep Masakan Anak Kos', author: 'Putri', category: 'Non Fiksi', language: 'Indonesia', positon: '123', availableCopies: 12 },
        { id: 4, title: 'Tips Perawatan Diri', author: 'Putri', category: 'Non Fiksi', language: 'Indonesia', positon: '123', availableCopies: 12 },
        { id: 5, title: 'Mengelola Keuangan', author: 'Afif', category: 'Non Fiksi', language: 'Indonesia', positon: '123', availableCopies: 12 }
    ]);
    console.log('/api/books hit');
});

app.get('/api/books/stock', verifyToken, verifyRole(['admin']), (req, res) => {
    res.json([
        { id: 1, bookId: 'B001', title: 'Programming React Js', totalStock: 12 },
        { id: 2, bookId: 'B002', title: 'Basic Programming', totalStock: 12 },
        { id: 3, bookId: 'B003', title: 'Resep Masakan Anak Kos', totalStock: 12 },
        { id: 4, bookId: 'B004', title: 'Tips Perawatan Diri', totalStock: 12 },
        { id: 5, bookId: 'B005', title: 'Mengelola Keuangan', totalStock: 12 }
    ]);
    console.log('/api/books/stock hit')
});

app.get('/api/books/:id', verifyToken, verifyRole(['user', 'admin']), (req, res) => {
    if (req.params.id) {
        res.json({
            id: 1, imageUrl: 'https://m.media-amazon.com/images/I/51j1nrM7ETL._SL1360_.jpg', title: 'Programming React Js', author: 'Afif', publisher: 'Erlangga', category: 'Non Fiksi', year: '2012', language: 'Indonesia', positon: '123', availableCopies: 12, isbn: '12134287632', pages: 101,
            synopsis: 'React JS adalah pustaka JavaScript yang di gunakan untuk membangun antarmuka pengguna yang interaktif. Dengan React, pengembang dapat membuat aplikasi web yang dinamis dan responsif dengan mudah. React menggunakan pendekatan berbasis komponen, di mana UI di bagi menjadi komponen-komponen yang independen dan dapat di gunakan kembali.'
        });
    } else {
        res.status(400);
    }
    console.log(`/api/books/${req.params.id} hit`);
});

app.put('/api/books/:id', verifyToken, verifyRole(['user', 'admin']), (req, res) => {
    if (req.params.id) {
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
    console.log(`/api/books/${req.params.id} put hit`);
});

app.get('/api/borrowings', verifyToken, verifyRole(['user']), (req, res) => {
    res.json([
        { title: 'Programming React Js', id: 111, borrowDate: new Date('2022-10-04').toLocaleDateString('id'), returnDate: new Date('2022-11-04').toLocaleDateString('id'), completedDate: new Date('2022-11-04').toLocaleDateString('id') },
        { title: 'Kumpulan Puisi', id: 112, borrowDate: new Date('2022-10-04').toLocaleDateString('id'), returnDate: new Date('2022-11-04').toLocaleDateString('id'), completedDate: new Date('2022-11-04').toLocaleDateString('id') },
        { title: 'Investasi Saham Untuk Pemula', id: 113, borrowDate: new Date('2022-10-04').toLocaleDateString('id'), returnDate: new Date('2022-11-04').toLocaleDateString('id'), completedDate: new Date('2022-11-04').toLocaleDateString('id') }
    ]);
    console.log('/api/borrowings hit')
});

app.get('/api/authors', verifyToken, verifyRole(['admin']), (req, res) => {
    res.json([
        { id: 'AUT001', name: 'Andrea Hirata' },
        { id: 'AUT002', name: 'Tere Liye' }
    ]);
    console.log('/api/authors hit');
});

app.get('/api/publishers', verifyToken, verifyRole(['admin']), (req, res) => {
    res.json([
        { id: 'PUB001', name: 'Erlangga' },
        { id: 'PUB002', name: 'Mizan' }
    ]);
    console.log('/api/publishers hit');
});

app.get('/api/categories', verifyToken, verifyRole(['admin']), (req, res) => {
    res.json([
        { id: 'CTG001', name: 'Fiksi' },
        { id: 'CTG002', name: 'Non Fiksi' }
    ]);
    console.log('/api/categories hit');
});

app.get('/api/bookshelves', verifyToken, verifyRole(['admin']), (req, res) => {
    res.json([
        { id: 'BKS001', code: 'RAK1-BRS1' },
        { id: 'BKS002', code: 'RAK1-BRS2' }
    ]);
    console.log('/api/bookshelves hit');
});

app.get('/api/borrowing-transactions', verifyToken, verifyRole(['admin']), (req, res) => {
    res.json([
        { id: 'BRW001', borrowerName: 'Afif', bookId: 'B001', status: 'Dikembalikan', borrowDate: new Date('2022-10-04').toLocaleDateString('id'), returnDate: new Date('2022-11-04').toLocaleDateString('id'), completedDate: new Date('2022-11-04').toLocaleDateString('id') },
        { id: 'BRW002', borrowerName: 'Afif', bookId: 'B002', status: 'Hilang', borrowDate: new Date('2022-10-04').toLocaleDateString('id'), returnDate: new Date('2022-11-04').toLocaleDateString('id'), completedDate: new Date('2022-11-04').toLocaleDateString('id') },
        { id: 'BRW003', borrowerName: 'Putri', bookId: 'B003', status: 'Dikembalikan', borrowDate: new Date('2022-10-04').toLocaleDateString('id'), returnDate: new Date('2022-11-04').toLocaleDateString('id'), completedDate: new Date('2022-11-04').toLocaleDateString('id') }
    ]);
    console.log('/api/borrowing-transactions hit');
});

app.post('/api/borrowing-transactions', verifyToken, verifyRole(['admin']), (req, res) => {
    if (req.body) {
        res.json({ idTransaction: 'BRW003' });
    } else {
        res.sendStatus(400);
    }
    console.log('/api/borrowing-transactions hit');
});

app.get('/api/late-returns', verifyToken, verifyRole(['admin']), (req, res) => {
    res.json([
        { id: 'BRW001', borrowerName: 'Afif', bookId: 'B001', status: 'Dikembalikan', borrowDate: new Date('2022-10-04').toLocaleDateString('id'), returnDate: new Date('2022-11-04').toLocaleDateString('id') },
        { id: 'BRW002', borrowerName: 'Afif', bookId: 'B002', status: 'Hilang', borrowDate: new Date('2022-10-04').toLocaleDateString('id'), returnDate: new Date('2022-11-04').toLocaleDateString('id') },
        { id: 'BRW003', borrowerName: 'Putri', bookId: 'B003', status: 'Dikembalikan', borrowDate: new Date('2022-10-04').toLocaleDateString('id'), returnDate: new Date('2022-11-04').toLocaleDateString('id') }
    ]);
    console.log('/api/late-returns hit');
});

// Start the server
app.listen(port, () => {
    console.log(`Mock API server is running at http://localhost:${port}`);
});
