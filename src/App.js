import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: 'AIzaSyCcorQBu-fmGkNflH4reeSd-z_O0DJ4uBg',
  authDomain: 'foxchat-90931.firebaseapp.com',
  projectId: 'foxchat-90931',
  storageBucket: 'foxchat-90931.appspot.com',
  messagingSenderId: '803019859609',
  appId: '1:803019859609:web:22f6c59e53c682dc10ba08',
  measurementId: 'G-8V2QGJ1SQW'
});

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className='App'>
      <header>
        <h1>FOXXOTALK</h1>
      </header>
      {user && <SideBar />}
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
  const query = messagesRef.orderBy('createdAt');

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
          placeholder='Message...'
        />

        <button type='submit' disabled={!formValue}>
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
        />
        <p>{text}</p>
      </div>
    </>
  );
}
function SideBar() {
  const [isActive, setActive] = useState(false);

  const handleToggle = () => {
    setActive(!isActive);
  };
  //  Firebase Stuffs
  // const { uid } = auth.currentUser;
  // const messagesRef = firestore.collection('chats');
  // console.log(messagesRef);
  // const query = messagesRef.orderBy('name');
  // const [chatRooms] = useCollectionData(query, { idField: 'id' });
  return (
    <>
      <div className={isActive ? 'sidebar' : 'sidebar closed'} id='sidebar'>
        <SignOut />
      </div>
      <i className='fa-solid fa-bars hamburger-icon' onClick={handleToggle}></i>
    </>
  );
}

export default App;
