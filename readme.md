Documentation mengenai pembuatan backend

1. Folder Struktur:

- middleware: penghubung antara backend dan frontend
- models: penghubung ke data base. databasenya mongo_DB
- routes: penghubung antar folder

2. Files:

- .env: menghubungkan ke mongo_DB sama yg jwt itu buat membuat token rahasia biar aman
- package.json: daftar list libary yang mau di install, buat jd org lain tuh tau apa aja library yang dipake/install
- server.js: buat ngerun backend
- /middleware/auth.js : untuk membuat token
- /models/Category.js: menghubungkan dan mengecek ke database
- /models/Item.js: manajemen inventori/stok
  Item Schema ini mendefinisikan struktur data untuk barang/produk dengan field:
  name - Nama barang (maks 100 karakter)
  description - Deskripsi barang (opsional, maks 500 karakter)
  categoryId - Referensi ke kategori barang (misal: Elektronik, Makanan, dll)
  userId - Referensi ke user yang membuat/memiliki item ini
  quantity - Jumlah/stok barang
  price - Harga barang
- /models/User.js: Schema ini untuk membuat model User dengan sistem autentikasi yang otomatis meng-hash password saat registrasi dan bisa memverifikasi password saat login
- /routes/categories.js: router/controller untuk CRUD (Create, Read, Update, Delete) operasi kategori dengan autentikasi user dan validasi kepemilikan data.

  GET / - Ambil semua kategori user + hitung jumlah item per kategori
  GET /:id - Ambil detail satu kategori berdasarkan ID
  POST / - Buat kategori baru (dengan validasi nama tidak duplikat)
  PUT /:id - Update kategori yang sudah ada
  DELETE /:id - Hapus kategori (hanya jika tidak ada item di dalamnya)
  Semua endpoint dilindungi middleware auth yang memastikan hanya user yang login bisa akses dan hanya bisa kelola kategori milik sendiri.

- /routes/item.js:
- /routes/user.js:

3. Instalisasi
   -> Program dimulai dari buat folder backend
   buka terminal dan tulis cd backend -> tulis npm install

-> install library (npm i bcrypt cors dotenv express jsonwebtoken mongoose)
library:

- bcrypt
- cors: kaya polisi gt jd dia bakal nentui data yang diminta frontend boleh dikasih oleh backend atau engga
- dotenv: penghubung antara file .env dan kode Node.js
- express
- jsonwebtoken
- mongoose

cara cek postman:

1. cek port
2.
