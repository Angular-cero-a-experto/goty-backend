import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();


export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.json({
    mensaje: "Hola Mundo desde Firebase!!!!"
  });
});

export const getGOTY = functions.https.onRequest(async(request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  
  // const nombre = request.query.nombre || 'Sin Nombre';

  const gotyRef = db.collection('goty');
  const docsSnap = await gotyRef.get();

  const juegos = docsSnap.docs.map( doc => doc.data() );

  response.json( juegos);

});

// Express 
const app = express();
app.use( cors({ origin: true }) );

app.get('/goty', async(req, resp) => {

  const gotyRef = db.collection('goty');
  const docsSnap = await gotyRef.get();

  const juegos = docsSnap.docs.map( doc => doc.data() );

  resp.json( juegos);
});

app.post('/goty/:id', async(req, resp) => {

  const id  = req.params.id;
  const gameRef = db.collection('goty').doc(id);
  const gameSnap = await gameRef.get();

  if( !gameSnap.exists ) {
    resp.status(404).json({
      ok: false,
      mensaje: 'No existe un juego con ese ID' + id
    });
  } else {
    const antes = gameSnap.data() || {votos: 0};

    await gameRef.update({
      votos: antes.votos + 1
    })

    resp.json({
      ok: true,
      mensaje: `Gracias por tu voto ${antes.name}`
    });

  }

});


exports.api = functions.https.onRequest(app);
