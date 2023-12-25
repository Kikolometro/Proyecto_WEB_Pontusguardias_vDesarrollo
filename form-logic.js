const fs = require('fs');

const anyos = ["2024", "2025"];
const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const dias_l = ["D", "L", "M", "X", "J", "V", "S"];
exports.dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
exports.meses = meses;
exports.dias_l = dias_l;
exports.anyos = anyos;
exports.anyosLength = anyos.length;

exports.mes_num = function (mes) {
  let num = 2
  num = meses.indexOf(mes) + 1;
  return num
}
exports.daysInMonth = function (month, year) {
  return new Date(year, month, 0).getDate();
}

exports.daysOfWeek = function (month, year) {
  var day = new Date(year, month - 1, 1).getDay();
  //console.log("Dia de la semana:" + dias_l[day] )
  return dias_l[day];
}


exports.weekArray = function (dias_mes, dia_1_mes) {
  //console.log("Los dias del mes son: " + dias_mes);
  dia_ini = dias_l.indexOf(dia_1_mes);
  dia_aux = dia_ini;
  var weekArray = [];

  for (var i = dia_ini; i < (dias_mes + dia_ini); i++) {
    weekArray.push(dias_l[dia_aux]);

    if (dia_aux == 6) {
      dia_aux = 0;
    } else ++dia_aux;

  };

  return weekArray;
}

exports.createTXT = function (completefilepath, mes, anyo, n_resis, medicosDeGuardia, nombre, festivosArray, guardiasMatrix, vacacionesMatrix, comentario, correo) {
  let fileContent = mes + '\n' + anyo + '\n' + n_resis + '\n' + medicosDeGuardia + '\n' + nombre + '\n' + festivosArray + '\n' + guardiasMatrix + '\n' + vacacionesMatrix + '\n' + comentario + '\n' + correo;

  fs.writeFile(completefilepath, fileContent, (err) => {
    if (err) throw err;
    console.log("The file was succesfully saved!");
  });

}

exports.makeid = function (length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

exports.v_Viernes = function (d) {
  let dia = "";
  switch (d) {
    case 'L':
      dia = 'lunes'
      break;
    case 'M':
      dia = 'martes'
      break;
    case 'X':
      dia = 'miércoles'
      break;
    case 'J':
      dia = 'jueves'
      break;
    case 'V':
      dia = 'viernes'
      break;
    case 'S':
      dia = 'sábado'
      break;
    case 'D':
      dia = 'domingo'
      break;
    default:
      dia = "";
  }
  return dia;
}
//console.log(makeid(5));