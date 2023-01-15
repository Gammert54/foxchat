import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import {
  isPushNotificationSupported,
  sendNotification,
  initializePushNotifications,
  registerServiceWorker
} from './notifications.js';

firebase.initializeApp({
  apiKey: 'AIzaSyCcorQBu-fmGkNflH4reeSd-z_O0DJ4uBg',
  authDomain: 'foxchat-90931.firebaseapp.com',
  projectId: 'foxchat-90931',
  storageBucket: 'foxchat-90931.appspot.com',
  messagingSenderId: '803019859609',
  appId: '1:803019859609:web:ccb87fdad5930b2c10ba08',
  measurementId: 'G-DQ5SG1G67Y'
});
const auth = firebase.auth();
const firestore = firebase.firestore();
var canSendPushNotification;
function App() {
  const pushNotificationSuported = isPushNotificationSupported();
  if (pushNotificationSuported) {
    registerServiceWorker();
    initializePushNotifications().then(function (consent) {
      if (consent === 'granted') {
        canSendPushNotification = true;
      }
    });
  }
  const [user] = useAuthState(auth);

  return (
    <div className='App'>
      <header>
        <h1>FOXXOCHAT</h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className='sign-in' onClick={signInWithGoogle}>
        Sign in with <span className='google-colors-text'>Google</span>
      </button>
      <p>More options will be available later on.</p>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className='sign-out' onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder='Say something Cool 😊'
        />

        <button type='submit' id='send' disabled={!formValue}>
          <i className='fa-solid fa-paper-plane'></i>
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  
  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          src={
            photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'
          }
          alt={photoURL}
        />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
