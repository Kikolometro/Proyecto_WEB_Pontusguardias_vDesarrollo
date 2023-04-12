const {
  MongoClient
} = require('mongodb');
const mongoose = require('mongoose');

const uriFile = require(__dirname + "/NoSubir.js");
const uri = uriFile.uri_address
//const uri = ''

const client = new MongoClient(process.env.MONGODB_URI || uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


exports.conectarBD = async function () {
  await mongoose.connect(process.env.MONGODB_URI || uri, {
    useNewUrlParser: true
  }).then(() => {
    console.log('Conexión Mongoose lograda con éxito')
  });
}

// let solutionSchema = new mongoose.Schema({
//   soluciones: {
//     type: Array
//   },
//   user_id: {
//     type: String
//   },
//   solutionId: {
//     type: Number
//   }
//
// }, {
//   timestamps: {
//     createdAt: 'created_at'
//   }
// });


let petitionSchema = new mongoose.Schema({
  user_id: {
    type: String
  },
  mes: {
    type: String
  },
  anio: {
    type: Number
  },
  n_medicos: {
    type: Number
  },
  medicosDeGuardia: {
    type: Number
  },
  nombres_medicos: {
    type: Array
  },
  festivos: {
    type: Array
  },
  v_guardias_max_tot: {
    type: Array
  },
  v_guardias_min_tot: {
    type: Array
  },
  v_guardias_max_fes: {
    type: Array
  },
  v_guardias_min_fes: {
    type: Array
  },
  guardias_asignadas: {
    type: Array
  },
  vacaciones_asignadas: {
    type: Array
  },
  grupos: {
    type: Array
  },
  condiciones: {
    type: Array
  },
  comentario: {
    type: String
  },
  mail: {
    type: String
  },
  uniqueID: {
    type: String
  },
  petitionId: {
    type: Number
  },
  soluciones: {
    type: Array
  },
  ind_sol: {
    type: Number
  },
  idSol: {
    type: String
  },
  clientStatus: {
    type: Number
  }


}, {
  timestamps: {
    createdAt: 'created_at'
  }
});

exports.Petition = mongoose.model('Petition', petitionSchema);
//exports.Solution = mongoose.model('Solution', solutionSchema);