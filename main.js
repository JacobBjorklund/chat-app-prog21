import { initializeApp } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-app.js"
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js"
import { getFirestore, query, collection, onSnapshot, orderBy, addDoc, Timestamp } from 'https://www.gstatic.com/firebasejs/9.5.0/firebase-firestore.js'

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDNjIEFfborFcreOMGFPZyhzcsyMF3s-MU",
    authDomain: "chat-app-fae41.firebaseapp.com",
    projectId: "chat-app-fae41",
    storageBucket: "chat-app-fae41.appspot.com",
    messagingSenderId: "147293462691",
    appId: "1:147293462691:web:1174036f74cd178dde5f16"
};

// Initialize Firebase
initializeApp(firebaseConfig)

// Auth
// -----------------------------
const auth = getAuth()
const loginModal = new bootstrap.Modal(document.getElementById('login-modal'))
let userData

// Check if user is authenticated, if not, show login modal
onAuthStateChanged(auth, (user) => {
    if (user) {
        userData = user
        initDb()
        loginModal.hide()
        console.log('logged in: ', user)
    } else {
        loginModal.show()

        console.log('not logged in')
    }
})

// Login
const login = async e => {
    e.preventDefault() // don't reload page on submit

    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    try {
        await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
        console.log(error)
    }
}

document.getElementById('login').addEventListener('submit', login)

// Firestore (database)
// --------------------------------
const initDb = () => {
    const db = getFirestore()

    // Subscribe to messages
    const q = query(collection(db, 'messages'), orderBy('timestamp'))

    onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            const data = change.doc.data()
            const niceTimestamp = new Date(data.timestamp.toDate()).toLocaleTimeString('fi-Fi')
            const main = document.getElementById('main')
            const li = document.createElement('li')

            li.innerHTML = `
            <span class="fw-light text-muted">${niceTimestamp}</span>
            <span class="fw-bold text-muted">${data.userName}</span>
            <span class="fw-bold px-2">${data.message}</span>
            `

            document.getElementById('messages').appendChild(li)
            main.scrollTop = main.scrollHeight // scroll to the bottom
        })
    })


    // New message
    const newMessage = async e => {
        e.preventDefault() // don't reload page on submit

        if (!document.getElementById('input').value) {
            return
        }
        try {
            // Add to database
            await addDoc(collection(db, "messages"), {
                userId: userData.uid,
                userName: userData.email.split('@')[0],
                timestamp: Timestamp.fromDate(new Date()),
                message: document.getElementById('input').value
            })

            // clear input
            document.getElementById('input').value = ''
        } catch (error) {
            console.log(error)
        }
    }

    document.getElementById('new-message').addEventListener('submit', newMessage)
}