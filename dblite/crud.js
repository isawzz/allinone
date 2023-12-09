//#region trial 2
// // Step 7: Insert sample data
function insertSampleData() {
	const users = [
		{ id: 1, name: 'Alice', color: 'red' },
		{ id: 2, name: 'Bob', color: 'blue' },
		{ id: 3, name: 'Charlie', color: 'green' },
	];

	const events = [
		{ userid: 1, text: 'Event 1', time: '12:00 PM', date: '2023-11-15', shared: 'all', period: 'friday' },
		{ userid: 2, text: 'Event 2', time: '3:30 PM', date: '2023-11-20', shared: 'friends', period: 'none' },
	];

	const ownEvents = [
		{ userid: 1, eventid: 1 },
		{ userid: 2, eventid: 2 },
	];

	const subscribedEvents = [
		{ userid: 2, eventid: 1 },
		{ userid: 1, eventid: 2 },
	];

	const friends = [
		{ userid1: 1, userid2: 2 },
		{ userid1: 2, userid2: 3 },
	];

	users.forEach((user) => db.run('INSERT INTO users VALUES (?, ?, ?)', [user.id, user.name, user.color]));
	events.forEach((event) => db.run('INSERT INTO events VALUES (NULL, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)', [event.userid, event.text, event.time, event.date, event.shared, event.period]));
	ownEvents.forEach((row) => db.run('INSERT INTO ownEvents VALUES (?, ?)', [row.userid, row.eventid]));
	subscribedEvents.forEach((row) => db.run('INSERT INTO subscribedEvents VALUES (?, ?)', [row.userid, row.eventid]));
	friends.forEach((row) => db.run('INSERT INTO friends VALUES (?, ?)', [row.userid1, row.userid2]));
}

// // Step 8: Retrieve events for a specific userid and month
// function getEventsByUserIdAndMonth(userid, month) {
//   const selectQuery = `
//     SELECT events.*
//     FROM events
//     JOIN ownEvents ON events.id = ownEvents.eventid
//     WHERE ownEvents.userid = ? AND strftime('%Y-%m', events.date) = ?
//   `;

//   db.all(selectQuery, [userid, month], (err, rows) => {
//     if (err) {
//       console.error('Error getting events:', err.message);
//     } else {
//       console.log(`Events for ${userid} in ${month}:`, rows);
//     }
//   });
// }

// // Step 9: Insert sample data and retrieve events
//insertSampleData();
// getEventsByUserIdAndMonth(1, '2023-11');

// // Step 10: Close the SQLite database connection
// db.close((err) => {
//   if (err) {
//     console.error('Error closing database:', err.message);
//   } else {
//     console.log('Closed the SQLite database connection');
//   }
// });


//#endregion

//#region trial 1

const sqlite3 = require('sqlite3');

// Step 1: Open a SQLite database connection
const db = new sqlite3.Database('users.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database');
  }
});

// Step 2: Create a users table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
  )
`);

// CRUD operations

// Step 3: Create (Insert) a new user
function createUser(name, email) {
  const insertQuery = 'INSERT INTO users (name, email) VALUES (?, ?)';
  const values = [name, email];

  db.run(insertQuery, values, function (err) {
    if (err) {
      console.error('Error creating user:', err.message);
    } else {
      console.log(`User created with ID: ${this.lastID}`);
    }
  });
}

// Step 4: Read (Get) all users
function getAllUsers() {
  const selectQuery = 'SELECT * FROM users';

  db.all(selectQuery, (err, rows) => {
    if (err) {
      console.error('Error getting users:', err.message);
    } else {
      console.log('All users:', rows);
    }
  });
}

// Step 5: Read (Get) a user by ID
function getUserById(userId) {
  const selectQuery = 'SELECT * FROM users WHERE id = ?';

  db.get(selectQuery, [userId], (err, row) => {
    if (err) {
      console.error('Error getting user by ID:', err.message);
    } else {
      console.log('User by ID:', row);
    }
  });
}

// Step 6: Update a user by ID
function updateUser(userId, newName) {
  const updateQuery = 'UPDATE users SET name = ? WHERE id = ?';

  db.run(updateQuery, [newName, userId], function (err) {
    if (err) {
      console.error('Error updating user:', err.message);
    } else {
      console.log(`User updated: ${this.changes} row(s) affected`);
    }
  });
}

// Step 7: Delete a user by ID
function deleteUser(userId) {
  const deleteQuery = 'DELETE FROM users WHERE id = ?';

  db.run(deleteQuery, [userId], function (err) {
    if (err) {
      console.error('Error deleting user:', err.message);
    } else {
      console.log(`User deleted: ${this.changes} row(s) affected`);
    }
  });
}

// Example usage
createUser('John Doe', 'john@example.com');
createUser('Jane Doe', 'jane@example.com');

getAllUsers();

getUserById(1);

updateUser(1, 'Updated John Doe');

deleteUser(2);

getAllUsers();

// Step 8: Close the SQLite database connection
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Closed the SQLite database connection');
  }
});


//************************************************ */
const sqlite3 = require('sqlite3').verbose();

// Step 1: Open a SQLite database connection
db = new sqlite3.Database('database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database');
  }
});

// Step 2: Create 'users' table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    color TEXT
  )
`);

// Step 3: Create 'events' table
db.run(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY,
    userid INTEGER,
    text TEXT,
    time TEXT,
    date TEXT,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shared TEXT,
    period TEXT,
    FOREIGN KEY (userid) REFERENCES users (id)
  )
`);

// Step 4: Create 'ownEvents' table
db.run(`
  CREATE TABLE IF NOT EXISTS ownEvents (
    userid INTEGER,
    eventid INTEGER,
    FOREIGN KEY (userid) REFERENCES users (id),
    FOREIGN KEY (eventid) REFERENCES events (id),
    PRIMARY KEY (userid, eventid)
  )
`);

// Step 5: Create 'subscribedEvents' table
db.run(`
  CREATE TABLE IF NOT EXISTS subscribedEvents (
    userid INTEGER,
    eventid INTEGER,
    FOREIGN KEY (userid) REFERENCES users (id),
    FOREIGN KEY (eventid) REFERENCES events (id),
    PRIMARY KEY (userid, eventid)
  )
`);

// Step 6: Create 'friends' table
db.run(`
  CREATE TABLE IF NOT EXISTS friends (
    userid1 INTEGER,
    userid2 INTEGER,
    FOREIGN KEY (userid1) REFERENCES users (id),
    FOREIGN KEY (userid2) REFERENCES users (id),
    PRIMARY KEY (userid1, userid2)
  )
`);

// Step 7: Insert sample data
function insertSampleData() {
  const users = [
    { id: 1, name: 'Alice', color: 'red' },
    { id: 2, name: 'Bob', color: 'blue' },
    { id: 3, name: 'Charlie', color: 'green' },
  ];

  const events = [
    { userid: 1, text: 'Event 1', time: '12:00 PM', date: '2023-11-15', shared: 'all', period: 'weekday' },
    { userid: 2, text: 'Event 2', time: '3:30 PM', date: '2023-11-20', shared: 'friends', period: 'none' },
  ];

  const ownEvents = [
    { userid: 1, eventid: 1 },
    { userid: 2, eventid: 2 },
  ];

  const subscribedEvents = [
    { userid: 2, eventid: 1 },
    { userid: 1, eventid: 2 },
  ];

  const friends = [
    { userid1: 1, userid2: 2 },
    { userid1: 2, userid2: 3 },
  ];

  users.forEach((user) => db.run('INSERT INTO users VALUES (?, ?, ?)', [user.id, user.name, user.color]));
  events.forEach((event) => db.run('INSERT INTO events VALUES (NULL, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)', [event.userid, event.text, event.time, event.date, event.shared, event.period]));
  ownEvents.forEach((row) => db.run('INSERT INTO ownEvents VALUES (?, ?)', [row.userid, row.eventid]));
  subscribedEvents.forEach((row) => db.run('INSERT INTO subscribedEvents VALUES (?, ?)', [row.userid, row.eventid]));
  friends.forEach((row) => db.run('INSERT INTO friends VALUES (?, ?)', [row.userid1, row.userid2]));
}

// Step 8: Retrieve events for a specific userid and month
function getEventsByUserIdAndMonth(userid, month) {
  const selectQuery = `
    SELECT events.*
    FROM events
    JOIN ownEvents ON events.id = ownEvents.eventid
    WHERE ownEvents.userid = ? AND strftime('%Y-%m', events.date) = ?
  `;

  db.all(selectQuery, [userid, month], (err, rows) => {
    if (err) {
      console.error('Error getting events:', err.message);
    } else {
      console.log(`Events for ${userid} in ${month}:`, rows);
    }
  });
}

// Step 9: Insert sample data and retrieve events
insertSampleData();
getEventsByUserIdAndMonth(1, '2023-11');

// Step 10: Close the SQLite database connection
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Closed the SQLite database connection');
  }
});

//#endregion