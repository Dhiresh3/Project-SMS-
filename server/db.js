const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dbConfig = {
  host:     process.env.DB_HOST || 'localhost',
  port:     process.env.DB_PORT || 3306,
  user:     process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'student_db',
  ssl:      { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
};

const pool = mysql.createPool(dbConfig);
async function initDB() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      ssl: dbConfig.ssl,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await connection.query(`USE \`${dbConfig.database}\`;`);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        year INT NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS students (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        email       VARCHAR(100) NOT NULL UNIQUE,
        phone       VARCHAR(20),
        dob         DATE,
        gender      ENUM('Male','Female','Other'),
        address     TEXT,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        code        VARCHAR(20) NOT NULL UNIQUE,
        name        VARCHAR(100) NOT NULL,
        description TEXT,
        credits     INT DEFAULT 3,
        instructor  VARCHAR(100),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        student_id  INT NOT NULL,
        course_id   INT NOT NULL,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE,
        UNIQUE KEY uq_enroll (student_id, course_id)
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        student_id  INT NOT NULL,
        course_id   INT NOT NULL,
        date        DATE NOT NULL,
        status      ENUM('Present','Absent','Late') DEFAULT 'Present',
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS grades (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        student_id  INT NOT NULL,
        course_id   INT NOT NULL,
        marks       DECIMAL(5,2),
        grade       VARCHAR(5),
        remarks     TEXT,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE,
        UNIQUE KEY uq_grade (student_id, course_id)
      );
    `);

    const [students] = await connection.query('SELECT COUNT(*) AS count FROM students');
    if (students[0].count === 0) {
      await connection.query(`
        INSERT INTO students (name, email, phone, dob, gender, address) VALUES
          ('Aarav Sharma',   'aarav@example.com',   '9876543210', '2002-03-15', 'Male',   'Mumbai, MH'),
          ('Priya Patel',    'priya@example.com',   '9876543211', '2003-07-22', 'Female', 'Ahmedabad, GJ'),
          ('Rohan Mehta',    'rohan@example.com',   '9876543212', '2001-11-08', 'Male',   'Delhi, DL'),
          ('Sneha Iyer',     'sneha@example.com',   '9876543213', '2002-05-30', 'Female', 'Chennai, TN'),
          ('Karan Singh',    'karan@example.com',   '9876543214', '2003-01-17', 'Male',   'Jaipur, RJ');
      `);

      await connection.query(`
        INSERT INTO courses (code, name, description, credits, instructor) VALUES
          ('CS101', 'Introduction to Programming', 'Basics of programming with Python', 4, 'Dr. Verma'),
          ('CS201', 'Data Structures',             'Arrays, lists, trees, graphs',       4, 'Prof. Nair'),
          ('MA101', 'Mathematics I',               'Calculus and linear algebra',         3, 'Dr. Gupta'),
          ('EN101', 'English Communication',       'Technical and business English',      2, 'Ms. Sharma'),
          ('CS301', 'Database Management',         'SQL, NoSQL, ER diagrams',            3, 'Prof. Khan');
      `);

      await connection.query(`
        INSERT INTO enrollments (student_id, course_id) VALUES
          (1,1),(1,2),(1,3),(2,1),(2,4),(3,2),(3,3),(3,5),(4,1),(4,5),(5,2),(5,3);
      `);

      await connection.query(`
        INSERT INTO grades (student_id, course_id, marks, grade) VALUES
          (1,1,88,'A'),(1,2,74,'B'),(1,3,91,'A+'),(2,1,65,'C'),(2,4,78,'B+'),
          (3,2,55,'D'),(3,3,82,'A'),(4,1,93,'A+'),(4,5,70,'B'),(5,2,67,'C+');
      `);

      await connection.query(`
        INSERT INTO attendance (student_id, course_id, date, status) VALUES
          (1,1,'2026-09-01','Present'),(1,1,'2026-09-02','Present'),(1,1,'2026-09-03','Absent'),
          (2,1,'2026-09-01','Present'),(2,1,'2026-09-02','Late'),
          (3,2,'2026-09-01','Present'),(3,2,'2026-09-02','Present'),
          (4,1,'2026-09-01','Absent'),(4,1,'2026-09-02','Present'),
          (5,2,'2026-09-01','Present'),(5,2,'2026-09-03','Present');
      `);
      console.log(' Database initialized with sample data.');
    }

    console.log(' Connected to MySQL database:', dbConfig.database);
  } catch (err) {
    console.error(' MySQL Initialization Error:', err.message);
    console.error(' Please make sure your MySQL service is running and credentials in .env are correct (user: root, password: ' + dbConfig.password + ')');
  } finally {
    if (connection) await connection.end();
  }
}
initDB();
module.exports = pool;
