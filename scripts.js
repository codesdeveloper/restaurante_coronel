// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfUy7dca73ZiGwRqSCcifSEnJuALPzshs",
  authDomain: "portal-cliente-1fc3c.firebaseapp.com",
  projectId: "portal-cliente-1fc3c",
  storageBucket: "portal-cliente-1fc3c.appspot.com",
  messagingSenderId: "328465113579",
  appId: "1:328465113579:web:f86c47d56df2ec6cb879ae"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const db = firebase.firestore();
const auth = firebase.auth();

document.querySelector('section .cliente-form').addEventListener('submit', (e) => {
  e.preventDefault();
  let name = document.querySelector('section .cliente-form input[type=text]').value;
  let phone = document.querySelector('section .cliente-form input[type=number]').value;
  let text = document.querySelector('section .cliente-form textarea').value;
  let file = document.querySelector('section .cliente-form input[type=file]').files[0];
  let msg = document.querySelector('section .cliente-form .msg');

  text = text.replace('\n', '<br/>');

  if (file == null) {
    msg.style.display = 'block';
    msg.innerHTML = 'Escolha um arquivo...';
    return;
  }

  let uploadTask = storage.ref('documentos/' + file.name).put(file);
  let progress = document.querySelector('section .cliente-form progress');
  document.querySelector('section .cliente-form button').disabled = true;
  progress.style.display = 'block';
  uploadTask.on('state_changed', snap => {
    progress.value = (snap.bytesTransferred / snap.totalBytes) * 1;
  },

    (erro) => {
      msg.style.display = 'block';
      msg.innerHTML = erro;
    },

    () => {

      storage.ref('documentos/' + file.name).getDownloadURL().then(url => {
        db.collection('documentos').add({
          name: name,
          phone: phone,
          text: text,
          urlComprovante: url
        })
      });

      document.querySelector('section .cliente-form button').disabled = false;
      document.querySelector('section .cliente-form').reset();
      msg.style.display = 'none';
      msg.innerHTML = '';
      setTimeout(() => {
        progress.style.display = 'none';
        progress.value = '';
      }, (1500));
    }

  )

})

const urlParams = new URLSearchParams(window.location.search);

const myParam = urlParams.get('admin');
let btn_link = document.querySelector('.link-adm');

if (myParam != null) {

  btn_link.href = '?';
  btn_link.innerHTML = 'Fazer pedido!'


  auth.onAuthStateChanged((user) => {
    if (user) {

      document.querySelector('section h2').innerHTML = 'Lista de Pedidos';
      document.querySelector('section ul').style.display = 'block';

      db.collection('documentos').onSnapshot(data => {
        let ul = document.querySelector('section ul');
        ul.innerHTML = '';

        data.docs.map(e => {
          let val = e.data();
          ul.innerHTML += `
        <li>
          <span class="txt">
            <b>${val.name}, ${val.phone}:</b><br/>
            <p>${val.text}</p>
          </span>
          <span>
            <img src="${val.urlComprovante}">
          </span>
        </li>
      `;
        });

      });

    } else {

      document.querySelector('section img').style.display = 'none';
      document.querySelector('section .login-adm').style.display = 'block';

      document.querySelector('.login-adm').addEventListener('submit', (e) => {
        e.preventDefault();
        let email = document.querySelector('.login-adm input[type=email]').value;
        let pass = document.querySelector('.login-adm input[type=password]').value;

        auth.signInWithEmailAndPassword(email, pass)
          .then((userCredential) => {
            alert('Administrador logado com sucesso!! ')   
            window.location.reload();        
          })
          .catch((error) => {
            alert('Esse usuario não é o administrador!!');
            document.querySelector('.login-adm').reset();
          });

      });

    }
  });


} else {
  btn_link.href = '/?admin';
  btn_link.innerHTML = 'Gerenciar pedidos!'
  document.querySelector('section h2').innerHTML = 'Faça seu Pedido';
  document.querySelector('section .cliente-form').style.display = 'block';
}

setTimeout(() => {
  firebase.auth().signOut();
  window.location.reload();
}, 180000);