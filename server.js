const express = require("express");
const session = require('express-session');
const bodyParser = require("body-parser");
const request = require("request");
const ejs = require("ejs");
const emailvalidator = require("email-validator");
var secure = require('ssl-express-www');
const {
  v4: uuidv4
} = require('uuid');

// Nos conectamos con el resto de ficheros
const formLogic = require(__dirname + "/form-logic.js");
const db = require(__dirname + "/db.js");
const emailconfig = require(__dirname + "/emailconfig.js");
const inputs = require(__dirname + "/inputs.js");
const api = require(__dirname + "/api-connection.js");


// Configuramos la app
const oneDay = 1000 * 60 * 60 * 24;
const secret = inputs.secret;
const codigocorreo = inputs.codigocorreo;
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public")); //Esto sirve para "enviar" al servidor la carpeta "public" y poder utilizar css y las imagenes en el html
app.listen(8000);
app.use(session({
  secret: secret,
  saveUninitialized: true,
  cookie: {
    maxAge: oneDay
  },
  resave: false
}));

app.use(secure);

// Definimos variables globales
const meses = formLogic.meses;
const dias = formLogic.dias;
const dias_l = formLogic.dias_l;
const anyos = formLogic.anyos;
const anyosLength = formLogic.anyosLength;
const topStep = 8;

//const tiempo_espera_por_vuelta = 3000;
const tiempo_total_espera = 180000;
const tiempo_espera_por_busqueda = 2000;

// Definimos variables mail y txt
let filepath = __dirname + "/exports/";
let transporter = emailconfig.transporter;
const pass = inputs.pass;
const email = inputs.email;

//Conexión a la BD
//Desconectar si estamos offline
db.conectarBD().catch(err => console.log(err));



// ZONA DE PRUEBAS

// app.get("/pr", function(req, res) {
//   req.session.userID = req.session.id
//   req.session.contador = 0
//   req.session.encontrado = 0
//   req.session.solucion = []
//   res.render("landing", {
//     step: 0
//   });
// });
//
// app.get("/prueba", function(req, res) {
//   req.session.cod_error = -1;
//   req.session.uniqueID = "ea9a457f-cc76-466d-9919-1a6679434414";
//   req.session.mes = "Marzo";
//   req.session.anyo = 2023;
//
//   req.session.dias_mes = 31;
//   req.session.weekArray = ['X', 'J', 'V', 'S', 'D', 'L', 'M', 'X', 'J', 'V', 'S', 'D', 'L', 'M', 'X', 'J', 'V', 'S', 'D', 'L', 'M', 'X', 'J', 'V', 'S', 'D', 'L', 'M', 'X', 'J', 'V']
//   req.session.n_resis = 3;
//   req.session.nombre = ["medico1", "medico2", "medico3"]
//
//   req.session.tiempo_max_espera = req.session.n_resis * 10000;
//
//
//   req.session.contador_total = Math.max(Math.ceil(req.session.tiempo_max_espera / tiempo_espera_por_vuelta)+20,10)
//   console.log('Tiempo max de espera: ' + req.session.contador_total)
//
//
//   function buscarSolucion() {
//     console.log("Vamos a buscar la solución")
//
//     db.Petition.findOne({
//       uniqueID: req.session.uniqueID
//
//     }, null, {
//
//     }, (err, unaSolucion) => {
//       if (err) {
//         console.error(err)
//         console.log("Ha dado error")
//         req.session.solucion = []
//         req.session.cod_error = 10 // Error en la query
//       } else {
//
//         if (unaSolucion == null) {
//           console.log("Todavía no hay solución")
//           req.session.solucion = []
//           req.session.cod_error = 20 // No hay solución
//
//         } else {
//           console.log("Tenemos el resultado: ")
//           console.log(req.session.solucion)
//           req.session.encontrado = 1
//           req.session.cod_error = 0 // Hay solución
//           req.session.solucion = unaSolucion['soluciones']
//
//         }
//
//       }
//     });
//
//
//
//     if (req.session.contador >= req.session.contador_total) {
//       req.session.tiempoAlcanzado = 1
//       req.session.cod_error = 30 // Tiempo alcanzado
//       console.log("Tiempo máximo alcanzado")
//     } else {
//       req.session.contador = req.session.contador + 1
//       console.log("Contador actualizado: " + req.session.contador)
//     }
//
//     if ((req.session.encontrado == 1) | (req.session.tiempoAlcanzado == 1)) {
//       clearInterval(req.session.refresh);
//       console.log("Cerramos la paraeta")
//
//       res.render("landing-solucion", {
//         solucion: req.session.solucion,
//         topStep: topStep,
//         dias_mes: req.session.dias_mes,
//         weekArray: req.session.weekArray,
//         n_resis: req.session.n_resis,
//         nombre: req.session.nombre,
//         mes: req.session.mes,
//         anyo: req.session.anyo,
//         cod_error: req.session.cod_error
//       });
//     }
//
//
//
//   };
//
//   req.session.refresh = setInterval(buscarSolucion, tiempo_espera_por_vuelta)
//
//
// });

//FIN ZONA DE PRUEBAS



// Definimos las rutas del servidor
app.get("/", function(req, res) {
  req.session.userID = req.session.id
  res.render("landing", {
    step: 0
  });
});

app.get("/buscador", function(req, res) {
  req.session.userID = req.session.id
  res.render("landing-buscador");
});


  app.get('/buscarSolucion', function(req, res) {
    req.session.ind_sol = 0
    req.session.dias_mes = 30
    req.session.weekArray = []
    req.session.n_resis = 2
    req.session.nombre = []
    req.session.mes = ""
    req.session.anyo = 2020
    req.session.idSolBuscada = req.query.idSol

    db.Petition.findOne({
      //idSol: req.params.idSol
      idSol: req.query.idSol

    }, null, {

    }, (err, unaSolucion) => {
      if (err) {
        console.error(err)
        req.session.solucion = []
        req.session.cod_error = 10 // Error en la query
        console.log("Hay un error en la query")

        res.render("landing-solucion", {
          ind_sol: req.session.ind_sol,
          solucion: req.session.solucion,
          topStep: topStep,
          dias_mes: req.session.dias_mes,
          weekArray: req.session.weekArray,
          n_resis: req.session.n_resis,
          nombre: req.session.nombre,
          mes: req.session.mes,
          anyo: req.session.anyo,
          cod_error: req.session.cod_error,
          idSolBuscada: req.session.idSolBuscada
        });
      } else {

        if (unaSolucion == null) {
          req.session.solucion = []
          req.session.cod_error = 20 // No hay solución para ese problema
          console.log("No hay solucion")

          res.render("landing-solucion", {
            ind_sol: req.session.ind_sol,
            solucion: req.session.solucion,
            topStep: topStep,
            dias_mes: req.session.dias_mes,
            weekArray: req.session.weekArray,
            n_resis: req.session.n_resis,
            nombre: req.session.nombre,
            mes: req.session.mes,
            anyo: req.session.anyo,
            cod_error: req.session.cod_error,
            idSolBuscada: req.session.idSolBuscada
          });

        } else if (unaSolucion['ind_sol'] == 1){
          req.session.encontrado = 1
          req.session.cod_error = 0 // Hay solución
          if(unaSolucion['soluciones'].length > 0){
            req.session.ind_sol = 1
            req.session.solucion = unaSolucion['soluciones']

            req.session.n_resis = unaSolucion['n_medicos']
            req.session.nombre = unaSolucion['nombres_medicos']
            req.session.mes = unaSolucion['mes']
            req.session.anyo = unaSolucion['anio']

            req.session.mes_num = formLogic.mes_num(req.session.mes);
            req.session.dias_mes = formLogic.daysInMonth(req.session.mes_num, req.session.anyo);
            req.session.dia_1_mes = formLogic.daysOfWeek(req.session.mes_num, req.session.anyo);
            req.session.weekArray = formLogic.weekArray(req.session.dias_mes, req.session.dia_1_mes);

          } else {
            req.session.solucion = []
            req.session.cod_error = 20
          }

          console.log("Hay solucion: ")
          console.log(req.session.solucion)

          res.render("landing-solucion", {
            ind_sol: req.session.ind_sol,
            solucion: req.session.solucion,
            topStep: topStep,
            dias_mes: req.session.dias_mes,
            weekArray: req.session.weekArray,
            n_resis: req.session.n_resis,
            nombre: req.session.nombre,
            mes: req.session.mes,
            anyo: req.session.anyo,
            cod_error: req.session.cod_error,
            idSolBuscada: req.session.idSolBuscada
          });

        } else {
          console.log("Estamos esperando la solución")
          req.session.solucion = []
          req.session.cod_error = 40 // No hay solución actualizada

          res.render("landing-solucion", {
            ind_sol: req.session.ind_sol,
            solucion: req.session.solucion,
            topStep: topStep,
            dias_mes: req.session.dias_mes,
            weekArray: req.session.weekArray,
            n_resis: req.session.n_resis,
            nombre: req.session.nombre,
            mes: req.session.mes,
            anyo: req.session.anyo,
            cod_error: req.session.cod_error,
            idSolBuscada: req.session.idSolBuscada
          });
        }

      }
    });



});

app.post('/buscarSolucion', function(req, res) {
  req.session.ind_sol = 0
  req.session.dias_mes = 30
  req.session.weekArray = []
  req.session.n_resis = 2
  req.session.nombre = []
  req.session.mes = ""
  req.session.anyo = 2020
  req.session.idSolBuscada = req.query.idSol

  db.Petition.findOne({
    //idSol: req.params.idSol
    idSol: req.query.idSol

  }, null, {

  }, (err, unaSolucion) => {
    if (err) {
      console.error(err)
      req.session.solucion = []
      req.session.cod_error = 10 // Error en la query
      console.log("Hay un error en la query")

      res.render("landing-solucion", {
        ind_sol: req.session.ind_sol,
        solucion: req.session.solucion,
        topStep: topStep,
        dias_mes: req.session.dias_mes,
        weekArray: req.session.weekArray,
        n_resis: req.session.n_resis,
        nombre: req.session.nombre,
        mes: req.session.mes,
        anyo: req.session.anyo,
        cod_error: req.session.cod_error,
        idSolBuscada: req.session.idSolBuscada
      });
    } else {

      if (unaSolucion == null) {
        req.session.solucion = []
        req.session.cod_error = 20 // No hay solución para ese problema
        console.log("No hay solucion")

        res.render("landing-solucion", {
          ind_sol: req.session.ind_sol,
          solucion: req.session.solucion,
          topStep: topStep,
          dias_mes: req.session.dias_mes,
          weekArray: req.session.weekArray,
          n_resis: req.session.n_resis,
          nombre: req.session.nombre,
          mes: req.session.mes,
          anyo: req.session.anyo,
          cod_error: req.session.cod_error,
          idSolBuscada: req.session.idSolBuscada
        });

      } else if (unaSolucion['ind_sol'] == 1){
        req.session.encontrado = 1
        req.session.cod_error = 0 // Hay solución
        if(unaSolucion['soluciones'].length > 0){
          req.session.ind_sol = 1
          req.session.solucion = unaSolucion['soluciones']

          req.session.n_resis = unaSolucion['n_medicos']
          req.session.nombre = unaSolucion['nombres_medicos']
          req.session.mes = unaSolucion['mes']
          req.session.anyo = unaSolucion['anio']

          req.session.mes_num = formLogic.mes_num(req.session.mes);
          req.session.dias_mes = formLogic.daysInMonth(req.session.mes_num, req.session.anyo);
          req.session.dia_1_mes = formLogic.daysOfWeek(req.session.mes_num, req.session.anyo);
          req.session.weekArray = formLogic.weekArray(req.session.dias_mes, req.session.dia_1_mes);

        } else {
          req.session.solucion = []
          req.session.cod_error = 20
        }

        console.log("Hay solucion: ")
        console.log(req.session.solucion)

        res.render("landing-solucion", {
          ind_sol: req.session.ind_sol,
          solucion: req.session.solucion,
          topStep: topStep,
          dias_mes: req.session.dias_mes,
          weekArray: req.session.weekArray,
          n_resis: req.session.n_resis,
          nombre: req.session.nombre,
          mes: req.session.mes,
          anyo: req.session.anyo,
          cod_error: req.session.cod_error,
          idSolBuscada: req.session.idSolBuscada
        });

      } else {
        console.log("Estamos esperando la solución")
        req.session.solucion = []
        req.session.cod_error = 40 // No hay solución actualizada

        res.render("landing-solucion", {
          ind_sol: req.session.ind_sol,
          solucion: req.session.solucion,
          topStep: topStep,
          dias_mes: req.session.dias_mes,
          weekArray: req.session.weekArray,
          n_resis: req.session.n_resis,
          nombre: req.session.nombre,
          mes: req.session.mes,
          anyo: req.session.anyo,
          cod_error: req.session.cod_error,
          idSolBuscada: req.session.idSolBuscada
        });
      }

    }
  });



});

app.get("/mostrarSolucion", function(req, res) {

  // Hay que cambiar el request timeout
  //2022-12-17T23:41:44.438340+00:00 heroku[router]: at=error code=H12 desc="Request timeout" method=GET path="/mostrarSolucion" host=pontusguardias.com request_id=630552bc-2c11-4a2b-8c5c-a9cbea5fd594 fwd="80.174.36.101" dyno=web.1 connect=0ms service=30000ms status=503 bytes=0 protocol=https
  req.session.cod_error = -1;
  //req.session.tiempo_max_espera = req.session.n_resis * 10000;
  //req.session.contador_total = Math.max(Math.ceil(req.session.tiempo_max_espera / tiempo_espera_por_vuelta)+20,20)
  req.session.contador_total = Math.ceil(tiempo_total_espera / tiempo_espera_por_busqueda);
  req.session.contador_total_vueltas = Math.ceil(25000 / tiempo_espera_por_busqueda);


  req.session.contador_24s = 0;
  req.session.tiempoAlcanzadoVuelta = 0;


  function buscarSolucion() {

    db.Petition.findOne({
      uniqueID: req.session.uniqueID

    }, null, {

    }, (err, unaSolucion) => {
      if (err) {
        console.error(err)
        req.session.solucion = []
        req.session.cod_error = 10 // Error en la query
        console.log("Hay un error en la query")
      } else {

        if (unaSolucion == null) {
          req.session.solucion = []
          req.session.cod_error = 20 // No hay solución para ese problema
          console.log("No hay solucion")

        } else if (unaSolucion['ind_sol'] == 1){
          req.session.encontrado = 1
          req.session.cod_error = 0 // Hay solución
          req.session.idSolBuscada = unaSolucion['idSol']
          if(unaSolucion['soluciones'].length > 0){
              req.session.solucion = unaSolucion['soluciones']

          } else {
            req.session.solucion = []
          }

          console.log("Hay solucion: ")
          console.log(req.session.solucion)

        } else {
          console.log("Estamos esperando la solución")
          req.session.solucion = []
          req.session.cod_error = 40 // No hay solución actualizada
        }

      }
    });

    if (req.session.contador_24s >= req.session.contador_total_vueltas) {
      req.session.tiempoAlcanzadoVuelta = 1
      console.log("Tiempo alcanzado vuelta")
    } else {
      req.session.contador_24s = req.session.contador_24s + 1
    }


    if (req.session.contador >= req.session.contador_total) {
      req.session.tiempoAlcanzado = 1
      req.session.cod_error = 30 // Tiempo alcanzado
      console.log("Tiempo alcanzado")
    } else {
      req.session.contador = req.session.contador + 1
    }

    if ((req.session.tiempoAlcanzadoVuelta == 1) ) {
      clearInterval(req.session.refresh);
      console.log("Sigo pensando")
      res.render("landing-loading",{
        topStep: topStep
      });
    }

    if ((req.session.encontrado == 1) | (req.session.cod_error == 20) | (req.session.tiempoAlcanzado == 1)) {
      console.log("Muestro la solución")
      clearInterval(req.session.refresh);

      console.log("La solución.length es: ")
      console.log(req.session.solucion.length)

      if(req.session.solucion.length > 0){
        req.session.ind_sol = 1

      } else {
        req.session.ind_sol = 0;
        req.session.cod_error = 20;
      }

      console.log("el código de error es: ")
      console.log(req.session.cod_error)
      console.log(req.session.ind_sol)

      res.render("landing-solucion", {
        ind_sol: req.session.ind_sol,
        solucion: req.session.solucion,
        topStep: topStep,
        dias_mes: req.session.dias_mes,
        weekArray: req.session.weekArray,
        n_resis: req.session.n_resis,
        nombre: req.session.nombre,
        mes: req.session.mes,
        anyo: req.session.anyo,
        cod_error: req.session.cod_error,
        idSolBuscada: req.session.idSolBuscada
      });
    }

  };

  //req.session.refresh = setInterval(buscarSolucion, tiempo_espera_por_vuelta)
  req.session.refresh = setInterval(buscarSolucion, tiempo_espera_por_busqueda)

});


app.get("/generarplanilla", function(req, res) {
  req.session.completefilepath = filepath + req.session.filename;
  req.session.userID = req.session.id;


  if (req.session.step == null) {
    req.session.step = 0;

    res.render("landing", {
      step: 0
    });
  } else {
    res.render("landing", {
      step: req.session.new_step,
      topStep: topStep,
      meses: meses,
      anyos: anyos,
      anyosLength: anyosLength,
      mes: req.session.mes,
      anyo: req.session.anyo,
      weekArray: req.session.weekArray,
      dias_mes: req.session.dias_mes,
      n_resis: req.session.n_resis,
      nombre: req.session.nombre,
      medicosDeGuardia: req.session.medicosDeGuardia
    });
  };
});


app.post("/generarplanilla", function(req, res) {

  if (req.body.botonAnterior == "-1") {
    req.session.step = req.body.step - 2
  } else req.session.step = req.body.step;


  if (req.session.step == 1 && req.body.botonAnterior != "-1") {

    req.session.mes = req.body.mes;
    req.session.mes_num = formLogic.mes_num(req.session.mes);
    req.session.anyo = req.body.anyo;
    req.session.dias_mes = formLogic.daysInMonth(req.session.mes_num, req.session.anyo);
    req.session.dia_1_mes = formLogic.daysOfWeek(req.session.mes_num, req.session.anyo);
    req.session.tiempoAlcanzado = 0
    req.session.uniqueID = uuidv4();
    req.session.contador = 0
    req.session.encontrado = 0
    req.session.solucion = []
    req.session.medicosDeGuardia = 0
    req.session.idSolBuscada = ""
  };

  if (req.session.step == 2 && req.body.botonAnterior != "-1") {
    req.session.nombre = [];
    req.session.n_resis = req.body.n_resis;
    req.session.weekArray = formLogic.weekArray(req.session.dias_mes, req.session.dia_1_mes);

    for (req.session.i = 0; req.session.i < req.session.n_resis; req.session.i++) {
      req.session.num = req.session.i;
      req.session.id_nom = "Nombre_" + req.session.num.toString();
      req.session.nombre.push(req.body[req.session.id_nom]);
    }
  }

  if (req.session.step == 3 && req.body.botonAnterior != "-1") {
    req.session.medicosDeGuardia = req.body.medicosDeGuardia;

  };

  if (req.session.step == 4 && req.body.botonAnterior != "-1") {
    req.session.festivosArray = [];

    req.session.v_guardias_max_tot = [];
    req.session.v_guardias_min_tot = [];
    req.session.v_guardias_max_fes = [];
    req.session.v_guardias_min_fes = [];

    for (req.session.i = 0; req.session.i < req.session.dias_mes; req.session.i++) {
      req.session.num = req.session.i + 1;
      req.session.id_fes = "Festivo_" + req.session.num.toString();
      if (req.body[req.session.id_fes]) {
        req.session.festivosArray.push(1);
      } else req.session.festivosArray.push(0);
    }

    for (req.session.i = 0; req.session.i < req.session.n_resis; req.session.i++) {
      req.session.v_guardias_max_tot.push(req.body.v_guardias_max_tot[req.session.i]);
      req.session.v_guardias_min_tot.push(req.body.v_guardias_min_tot[req.session.i]);
      req.session.v_guardias_max_fes.push(req.body.v_guardias_max_fes[req.session.i]);
      req.session.v_guardias_min_fes.push(req.body.v_guardias_min_fes[req.session.i]);

    }
    console.log("Estos son los vectores")
    console.log(req.session.v_guardias_max_tot);
    console.log(req.session.v_guardias_min_tot);
    console.log(req.session.v_guardias_max_fes);
    console.log(req.session.v_guardias_min_fes);

  }

  if (req.session.step == 5 && req.body.botonAnterior != "-1") {
    req.session.guardiasMatrix = [];

    for (req.session.j = 0; req.session.j < req.session.n_resis; req.session.j++) {
      req.session.asignacion = [];

      for (req.session.i = 0; req.session.i < req.session.dias_mes; req.session.i++) {
        req.session.num = req.session.i + 1;
        req.session.id_asig = "Asignado_" + req.session.nombre[req.session.j] + "_" + req.session.num.toString();

        if (req.body[req.session.id_asig]) {
          req.session.asignacion[req.session.i] = 1;
        } else req.session.asignacion[req.session.i] = 0;

      }

      req.session.guardiasMatrix.push(req.session.asignacion);
    }

  };

  if (req.session.step == 6 && req.body.botonAnterior != "-1") {
    req.session.vacacionesMatrix = [];

    for (req.session.j = 0; req.session.j < req.session.n_resis; req.session.j++) {
      req.session.asignacion = [];

      for (req.session.i = 0; req.session.i < req.session.dias_mes; req.session.i++) {
        req.session.num = req.session.i + 1;
        req.session.id_vac = "Vacaciones_" + req.session.nombre[req.session.j] + "_" + req.session.num.toString();

        if (req.body[req.session.id_vac]) {
          req.session.asignacion[req.session.i] = 1;
        } else req.session.asignacion[req.session.i] = 0;

      }

      req.session.vacacionesMatrix.push(req.session.asignacion);
    }

  };



  if (req.session.step == 7 && req.body.botonAnterior != "-1") {
    req.session.comentario = req.body.comentario;

  };


  if (req.session.step == 8 && req.body.botonAnterior != "-1") {
    //console.log("User Id:")
    //console.log(req.session.userID)
    if (emailvalidator.validate(req.body.correo)) {
      req.session.correo = req.body.correo;
      req.session.message = req.session.userID + req.session.mes + req.session.anyo + req.session.n_resis + req.session.medicosDeGuardia + req.session.nombre + req.session.festivosArray + req.session.guardiasMatrix + req.session.vacacionesMatrix + req.session.comentario + req.session.correo;

      let n_medicos = parseInt(req.session.n_resis, 10);
      let m_guardia = parseInt(req.session.medicosDeGuardia, 10);
      let nombres_medicos = req.session.nombre;
      let d_festivos = req.session.festivosArray;
      let guardia_asignada_pre = req.session.guardiasMatrix;
      let vacaciones_asignada_pre = req.session.vacacionesMatrix;


      let guardia_asignada = guardia_asignada_pre.flat(1);
      let vacaciones_asignada = vacaciones_asignada_pre.flat(1);

      // Hago un INSERT con la petición
      db.Petition.create({
        user_id: req.session.id,
        mes: req.session.mes,
        anio: req.session.anyo,
        n_medicos: parseInt(req.session.n_resis, 10),
        medicosDeGuardia: parseInt(req.session.medicosDeGuardia, 10),
        nombres_medicos: req.session.nombre,
        festivos: req.session.festivosArray,
        guardias_asignadas: req.session.guardiasMatrix,
        vacaciones_asignadas: req.session.vacacionesMatrix,
        comentario: req.session.comentario,
        mail: req.session.correo,
        uniqueID: req.session.uniqueID,
        soluciones: [],
        ind_sol: 0,
        idSol: formLogic.makeid(8)
      }, function(err, value) {
        if (err) {
          console.error(err)
        } else {
          console.log("Se ha guardado la petición correctamente.")
        };
        // saved!
      });

      // Mando la petición al servidor
      let respuesta_api = api.mandarPeticionApi(parseInt(req.session.n_resis, 10), parseInt(req.session.medicosDeGuardia, 10), req.session.nombre, req.session.festivosArray, req.session.guardiasMatrix.flat(1), req.session.vacacionesMatrix.flat(1)).then(function(solucion) {
        console.log('la solucion es:')
        console.log(solucion['solucion'])
        return solucion['solucion'];

      });

      // Una vez tengo la respuesta del servidor, hago INSERT con la solución
      respuesta_api.then(value => {


        db.Petition.findOneAndUpdate({
          uniqueID: req.session.uniqueID
        }, {
          soluciones: value,
          ind_sol: 1
        }, function(err, value) {
          if (err) {
            console.error(err)
          } else {
            console.log("Se ha actualizado la solucion correctamente: ")

          };
        });

      }).catch(err => {
        console.log(err);
      });




      // Busco el ID de la petición que se ha subido y mando el mail

      function buscarIDpeticionyMandarMail() {

        db.Petition.findOne({
          uniqueID: req.session.uniqueID
          //user_id: id_usuario
        }, null, {

        }, (err, peticion) => {
          if (err) {
            console.error(err)
          } else {
            req.session.KeyPetition = 0;
            req.session.KeyPetition = peticion['petitionId']


            //console.log("KeyPetition: ", req.session.KeyPetition);
            req.session.filename = "Datos_" + req.session.KeyPetition + ".txt";
            req.session.completefilepath = filepath + req.session.filename;


            //formLogic.createTXT(req.session.completefilepath, req.session.mes, req.session.anyo, req.session.n_resis, req.session.medicosDeGuardia, req.session.nombre, req.session.festivosArray, req.session.guardiasMatrix, req.session.vacacionesMatrix, req.session.comentario, req.session.correo);

            req.session.contenidoMensaje = req.session.message + ' \n' + codigocorreo;
            req.session.mailOptions = {
              from: '"PonTusGuardias.com " <' + email + '>', // sender address (who sends)
              to: email, // list of receivers (who receives)
              subject: 'Peticion: ' + req.session.KeyPetition, // Subject line
              text: req.session.contenidoMensaje, // plaintext body
              //html: '<b>Hello world </b><br> This is the first email sent with Nodemailer in Node.js' // html body
              attachments: [{ // file on disk as an attachment
                filename: req.session.filename,
                path: __dirname + '/exports/' + req.session.filename // stream this file
              }]
            };

            // transporter.sendMail(req.session.mailOptions, function(error, info) {
            //   if (error) {
            //     console.log(error);
            //   } else {
            //     console.log('Email sent: ' + info.response);
            //   }
            // });

            req.session.KeyPetition = 0;
          }
        });
      };

      setTimeout(buscarIDpeticionyMandarMail, 3000);



    } else {
      req.session.step = 7
    }
  };


  req.session.new_step = ++req.session.step;

  res.redirect('/generarplanilla#form');

});



app.post("/", function(req, res) {
  req.session.step = 0;
  req.session.new_step = 0;
  req.session.mes = "";
  req.session.anyo = 0;
  req.session.n_resis = 0;
  req.session.nombre = [];
  req.session.festivosArray = [];
  req.session.guardiasMatrix = [];
  req.session.vacacionesMatrix = [];
  req.session.medicosDeGuardia = 0;
  req.session.comentario = "";
  req.session.correo = "";
  req.session.weekArray = [];
  req.session.solucion = [];


  res.render("landing", {
    step: 0
  });
});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started");
});
