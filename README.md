# AllGasKlima CRM

## Σκοπός

Ανάπτυξη ενός ολοκληρωμένου CRM για την AllGasKlima.

Το CRM θα διαχειρίζεται:

- Αναγνώριση εισερχόμενων κλήσεων
- Πελάτες
- Παραγγελίες
- Διανομές
- Tablet οδηγού
- Ιστορικό παραγγελιών
- Χάρτη και διευθύνσεις
- Dashboard
- Διαχείριση χρηστών

---

# Ημερολόγιο Ανάπτυξης

## Session 001

### Δημιουργία Project

Δημιουργήθηκε το project:

```
AllGasKlima-CRM
```

με την παρακάτω δομή:

```
AllGasKlima-CRM
│
├── backend
├── frontend
├── database
├── docs
└── README.md
```

---

### Git

Ολοκληρώθηκαν επιτυχώς:

- git init
- git add
- git commit

Έγιναν τα πρώτα commits.

Το repository είναι καθαρό:

```
git status

nothing to commit, working tree clean
```

---

### Backend

Δημιουργήθηκε:

```
backend/server.js
```

με απλό HTTP Server.

Ο server ακούει στην πόρτα:

```
3000
```

---

### Browser Test

Ο browser άνοιξε επιτυχώς:

```
http://localhost:3000
```

και εμφανίζει:

```
AllGasKlima CRM Backend ξεκίνησε!
```

---

### Express

Εγκαταστάθηκε επιτυχώς:

```
npm install express
```

Δημιουργήθηκαν:

- node_modules
- package-lock.json

χωρίς vulnerabilities.

---

### Πρόβλημα που λύθηκε

Το PowerShell μπλόκαρε το npm λόγω Execution Policy.

Λύση:

```
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Μετά το:

```
npm install express
```

εκτελέστηκε κανονικά.

---

### Server

Εκτέλεση:

```
cd backend

node server.js
```

Αποτέλεσμα:

```
Server running on http://127.0.0.1:5000
```

---

# Τρέχουσα κατάσταση

✅ Git λειτουργεί

✅ Node.js λειτουργεί

✅ Express εγκαταστάθηκε

✅ Backend λειτουργεί

✅ Localhost λειτουργεί

✅ Browser επικοινωνεί με τον Server

---

# Επόμενα Βήματα

Θα μετατρέψουμε το Backend σε πραγματική εφαρμογή Express.

Θα δημιουργηθούν οι φάκελοι:

```
backend
│
├── config
├── controllers
├── routes
├── middleware
├── models
├── services
├── database
└── server.js
```

---

# Πρώτη λειτουργία του CRM

Η πρώτη λειτουργία που θα υλοποιηθεί θα είναι:

**Αναγνώριση εισερχόμενης κλήσης**

Ροή:

1. Ο πελάτης καλεί.
2. Το CRM λαμβάνει τον αριθμό.
3. Αναζητά τον πελάτη στη βάση.
4. Αν υπάρχει, ανοίγει αυτόματα την καρτέλα του.
5. Αν δεν υπάρχει, εμφανίζει φόρμα δημιουργίας νέου πελάτη.

Από αυτό το σημείο θα ξεκινήσει η ανάπτυξη ολόκληρου του CRM της AllGasKlima, βήμα-βήμα.