// Pendientes:
// 1.- Buscar y cambiar salidas por consola pasarlas a salida por REG.txt

//******************************************************* Modulos importados
let express = require('express');
let app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
let mysql = require('mysql');
let os = require('os');
let nodemailer = require('nodemailer');
let fs = require('fs');

//************************************************* Declaracion de variables
let tiempo_ob = new Date();			//Objeto de tiempo
let Hora_i = tiempo_ob.getHours();		//Hora inicial server
let Minutos_i = tiempo_ob.getMinutes();		//Minutos iniciales server
let Segundos_i = tiempo_ob.getSeconds();	//Segundos iniciales server
let hora_i;					//Inicio del equipo
let hora_f;					//Fin del equipo
let hora_actual;				// :)
let equipo_nombre;				//Nombre asignado DB
let equipo_estado;				//ENC APG o DIS
let usuario_equipo;				//Actual (en uso)
let equipo_SP;					//Setpoint de temperatura
let usuario_correo;				//Actual (3en uso)
let notificacion_H;				//Hora de envio de email
let Envio;					//Salida de socket.io
let login_A = false;				//Bandera de logeo
let NR = 0;					//Numero de registros en la bitacora
let correoNot;					//Correo del admin para notificacion
let horaNot;					//hora de notificacion
let minNot;					//minuto de notificacion
let fechaNot;					//Fecha de notificacion
let horaAct;					//Hora actual
let minAct;					//minuto actual
let fechaAct;					//Fecha actual
let retasoCorreo = 15;				//Min de anticipacion del correo
let lecHardware = true;				//Bandera de lectura de hardware
let NotMail = false;				//Bandera de notificacion por email
let freeEQ = false;				//Bandera de equipo libre
let borradoActual = false;			//Borrado de la DB del actual
let nuevo_evento = false;			//Bandera de nuevo evento para hoy
let fileReg = 'REG.txt';			//Nombre del archivo de registro de eventos


//****************************************************************** express
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use("/src", express.static('./src/'));

http.listen(3000, () => {
	notifyRegister(fileReg, 'Servidor Industria 4.0 en el puerto: 3000, activo');
});

//******************************************************************** mySQL
var dataBase = mysql.createConnection ({
	host: 'localhost',
	user: 'admin',
	password: '1234'
});

//**************************************************************** socket.io
io.on('connection', (socket) => {

	socket.on('Datos_iniciales', (data3)=>{
		//Inicio DB query
		dataBase.query("USE cimav_test", function (err, result, fields){
			if (err) throw err;
		});
		dataBase.query("SELECT * FROM datos WHERE id=1;", function (err, result, fields){
			if (err) throw err;
			equipo_nombre = result[0].equipo;
			equipo_estado = result[0].estado;
			usuario_correo = result[0].usuario;
			hora_i = result[0].t_inicio;
			hora_f = result[0].t_final;
			equipo_SP = result[0].temp_sp;
			tiempo_ob = new Date();
			let hora_a    = tiempo_ob.getHours();
			let minutos_a = tiempo_ob.getMinutes();
			let dia_a     = tiempo_ob.getDate();
			let mes_a     = tiempo_ob.getMonth() + 1;
			let anio_a    = tiempo_ob.getFullYear();
			if (minutos_a < 10)
			{
				minutos_a = "0" + minutos_a;
			}
			Envio = equipo_nombre + '#' + equipo_estado + '#' + usuario_correo + '#';
			Envio = Envio + hora_i + '#' + hora_a + ':' + minutos_a + ':';
			Envio = Envio + dia_a + ':' + mes_a + ':' + anio_a  + '#';
			Envio = Envio + hora_f + '#' + equipo_SP;
			let Sal = "SELECT * FROM administrador ORDER BY id ASC LIMIT 1;";
			dataBase.query(Sal, function (err, result2, fields){
				if (err) throw err;
				Envio = Envio + "#" + result2[0].usuario + "#";
				io.to(socket.id).emit('Datos_iniciales', Envio)
			});
		});
        });

	socket.on('tiempo_actual', (data3)=>{
		tiempo_ob = new Date();
		let hora_a = tiempo_ob.getHours();
		let minutos_a = tiempo_ob.getMinutes();
		if (minutos_a < 10)
		{
			minutos_a = "0" + minutos_a;
		}
		Envio = hora_a + ':' + minutos_a
		if (freeEQ){
			Envio = Envio + ':Done';
		} else {
			if (nuevo_evento == true){
				Envio = Envio + ':New';
				nuevo_evento = false;
			} else {
				Envio = Envio + ':Active';
			}
		}
		io.to(socket.id).emit('tiempo_actual', Envio);
	});

	socket.on('getBitacora', (data4)=>{
		dataBase.query("USE cimav_test", function (err, result, fields){
			if (err) throw err;
		});

		dataBase.query("SELECT COUNT(*) FROM bitacora;", function (err, result, fields){
			if (err) throw err;
			NR = result[0]['COUNT(*)'];
			if (NR > 3){
				let command = 'SELECT * FROM bitacora ORDER BY id ASC LIMIT 4;'
        			dataBase.query(command, function (err, result, fields){
                			let Salida = "4#";
                			for (let i=0; i<4; i++){
                		       		Salida = Salida + result[i].id + "#";
                		        	Salida = Salida + result[i].usuario + "#";
                		        	Salida = Salida + result[i].fecha + "#";
                		        	Salida = Salida + result[i].t_inicio + "#";
                		        	Salida = Salida + result[i].t_final + "#";
						Salida = Salida + result[i].equipo + "#";
                			}
                			io.to(socket.id).emit('getBitacora', Salida);
        			});
			} else {
				let command = 'SELECT * FROM bitacora ORDER BY id ASC LIMIT ';
				command = command + NR + ';';
				dataBase.query(command, function (err, result, fields){
					let Salida = NR + '#';
					for (let i=0; i<NR; i++){
						Salida = Salida + result[i].id + "#";
						Salida = Salida + result[i].usuario + "#";
						Salida = Salida + result[i].fecha + "#";
						Salida = Salida + result[i].t_inicio + "#";
						Salida = Salida + result[i].t_final + "#";
						Salida = Salida + result[i].equipo + "#";
					}
					io.to(socket.id).emit('getBitacora', Salida);
				});
			}
		});
	});

	socket.on('alta', (data6)=>{
		//Actualizando la base de datos con el evento nuevo
		let command = 'INSERT INTO bitacora (usuario, fecha, t_inicio, t_final, equipo) ';
		let Datos = data6.split('#');
		let DateIN = Datos[4].split('-');
		let fechaIN = DateIN[2] + '/' + DateIN[1] + '/' + DateIN[0];
		command = command + 'VALUES("' + Datos[0] + '", "' + fechaIN + '", "';
		command = command + Datos[2] + '", "' + Datos[3] + '", "' + Datos[1];
		command = command + '");';
		dataBase.query("USE cimav_test;", function (err, result, fields){
			if (err) throw err;
		});
		dataBase.query(command, function (err, result, fields){
			if (result.affectedRows > 0){
				io.to(socket.id).emit('alta', 'success');
			} else {
				io.to(socket.id).emit('alta', 'DB error');
			}
		});
	});

	socket.on('getMantenimiento', (data7)=>{
		dataBase.query("USE cimav_test;", function (err, result, fields){
			if (err) throw err;
		});
		dataBase.query("SELECT * FROM mantenimiento ORDER BY id ASC LIMIT 1;", function (err, result, fields){
			let Salida = result[0].id + '#' + result[0].equipo + '#';
			Salida = Salida + result[0].descripcion + '#' + result[0].fecha + '#';
			io.to(socket.id).emit('getMantenimiento', Salida);
		});
	});

	socket.on('nuevoMantenimiento', (data8)=>{
		let Datos = data8.split('#');
		dataBase.query("USE cimav_test;", function (err, result, fields){
			if (err) throw err;
		});
		dataBase.query("SELECT password FROM administrador WHERE id=1;", function (err, result, fields){
			if (err) throw err;
			if (result[0].password === Datos[3]){
				let command = 'INSERT INTO mantenimiento (equipo, descripcion, fecha) ';
				let fecha_v = Datos[2].split('-');
				var fecha = fecha_v[2] + '/' + fecha_v[1] + '/' + fecha_v[0] ;
				command = command + 'VALUES("' + Datos[0] + '", "' + Datos[1] + '", "';
				command = command + fecha + '");';
				dataBase.query(command, function (err, result, fields){
					if (result.affectedRows > 0){
						io.to(socket.id).emit('alta', 'success');
					} else {
						io.to(socket.id).emit('alta', 'DB error');
					}
				});
			} else {
				io.to(socket.id).emit('alta', 'login error');
			}
		});
	});

	socket.on('cambioUsuario', (data9)=>{
		let Datos = data9.split('#');
		dataBase.query("USE cimav_test;", function (err, result, fields){
			if (err) throw err;
		});
		dataBase.query("SELECT * FROM administrador WHERE id=1;", function (err, result, fields){
			if (Datos[0] == result[0].usuario && Datos[1]== result[0].password){
				io.to(socket.id).emit('login', 1);
				login_A = true;
			} else {
				io.to(socket.id).emit('login', 0);
			}
		});
	});

	socket.on('cambioPassword', (data10)=>{
		let Datos = data10.split('#');
		dataBase.query("USE cimav_test;", function (err, result, fields){
			if (err) throw err;
		});
		dataBase.query("SELECT * FROM administrador WHERE id=1;", function (err, result, fields){
			if (Datos[0] == result[0].usuario && Datos[1]== result[0].password){
				io.to(socket.id).emit('login', 1);
				login_A = true;
			} else {
				io.to(socket.id).emit('login', 0);
			}
		});
	});

	socket.on('cambiaUsuario',(data11)=>{
		if (login_A === true){
			dataBase.query("USE cimav_test;", function (err, result, fields){
				if (err) throw err;
			});
			let command = "UPDATE administrador SET usuario='";
			command = command + data11 + "' WHERE id=1;";
			dataBase.query(command, function (err, result, fields){
				if (result.changedRows == 1){
					io.to(socket.id).emit('cambiaUsuario', 'Efectuado');
				} else {
					io.to(socket.id).emit('cambiaUsuario', 'Falla: base de datos');
				}
			});
		} else {
			io.to(socket.id).emit('cambiaUsuario', 'Falla: login');
		}
		login_A = false;
	});

	socket.on('cambiaPassword', (data12)=>{
		if (login_A === true){
			dataBase.query("USE cimav_test;", function (err, result, fields){
				if (err) throw err;
			});
			let command = "UPDATE administrador SET password='";
			command = command + data12 + "' WHERE id=1;";
			dataBase.query(command, function (err, result, fields){
				if (result.changedRows == 1){
					io.to(socket.id).emit('cambiaPassword', 'Efectuado');
				} else {
					io.to(socket.id).emit('cambiaPassword', 'Falla: base de datos');
				}
			});
		} else {
			io.to(socket.id).emit('cambiaPassword', 'Falla: login');
		}
		login_A = false;
	});

	socket.on('borrarBitacora', (data13)=>{
		dataBase.query("USE cimav_test;", function (err, result, fields){
			if (err) throw err;
		});
		let command = "DELETE FROM bitacora WHERE id=" + data13 + ";";
		dataBase.query(command, function (err, result, fields){
			if (err) throw err;
			if (result.affectedRows == 1){
				io.to(socket.id).emit('borrarBitacora', 'Registro borrado');
			} else {
				io.to(socket.id).emit('borrarBitacora', 'Falla de ejecución');
			}
		});
	});

	socket.on('cambioBitacora', (data13)=>{
		let Dat = data13.split('#');
		//Comparativo de password
		dataBase.query("USE cimav_test;", function (err, result, fields){
			if (err) throw err;
		});
		dataBase.query("SELECT * FROM administrador WHERE id=1;", function (err, result, fields){
			if (result[0].password === Dat[6]){
				let command = "UPDATE bitacora SET usuario='" + Dat[1] + "', fecha='";
				command = command + Dat[2] + "', t_inicio='" + Dat[3] + "', t_final='";
				command = command + Dat[4] + "', equipo='" + Dat[5] + "' WHERE id=";
				command = command + Dat[0] + ";";
				dataBase.query(command, function (err, result, fields){
					if (err) throw err;
					if (result.changedRows == 1){
						io.to(socket.id).emit('cambioBitacora', 'Cambio efectuado');
					} else {
						io.to(socket.id).emit('cambioBitacora', 'Error: cambio no efectuado');
					}
				});
			} else {
				io.to(socket.id).emit('cambioBitacora', 'Error: no login');
			}
		});
	});
});


//******************************************************** FUNCIONES PROPIAS

function revision_estados(){
	//Lectura de hardware
	if (lecHardware){
		const {exec} = require("child_process");
		exec("./I2C_SQL D", (error, stdout, stderr) => {
			if (error) {
				if (error.code != 1){
					notifyRegister(fileReg,'Error de lectura de hardware por I2C');
				}
				return;
			}
			if (stderr) {
				notifyRegister(fileReg,`stderr: ${stderr}`);
				notifyRegister(fileReg,'Error 2');
				return;
			}
			notifyRegister(fileReg,`stdout: ${stdout}`);
		});
	} else {
		if (borradoActual == false){
			borrarActual();
		} else {
			nuevaEntrada();
		}
	}

	if (freeEQ == false){
		//Adquisiscion de hora y fecha actual
		tiempo_ob = new Date();
		horaAct = parseInt(tiempo_ob.getHours());
		minAct  = parseInt(tiempo_ob.getMinutes());
		let DD  = tiempo_ob.getDate();
		let MM  = tiempo_ob.getMonth() + 1;
		let AA  = tiempo_ob.getFullYear();
		fechaAct = DD + '/' + MM + '/' + AA;

		//Adquirir fecha y hora de notificacion
		dataBase.query("USE cimav_test", function (err, result, fields){
			if (err) throw err;
		});

		let cmd1 = "SELECT * FROM datos ORDER BY id ASC LIMIT 1;";
		dataBase.query(cmd1, function (err, result, fields){
			if (err) throw err;
			let HHMM = result[0].t_final.split(':');
			horaNot  = parseInt(HHMM[0]);
			let HHFF = horaNot;
			minNot  = parseInt(HHMM[1]);
			let MMFF = minNot;
			minNot = minNot - retasoCorreo;
			if (minNot < 0){
				horaNot = horaNot - 1;
				minNot = 60 + minNot;
			}
			calcular_notificacion(horaNot, minNot, horaAct, minAct, HHFF, MMFF);
		});
	}
}

//************************************** Envio de correo de server en linea
function sendMail(mail_to, title, body){
	let transporte = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: 'glucimav@gmail.com',
			pass: '_industria40'
		}
	});
	let mailOptions = {
		from: 'glucimav@gmail.com',
		to:   mail_to,
		subject: title,
		text: body
	};
	transporte.sendMail(mailOptions, function(error, info){
		if (error){
			notifyRegister(fileReg, error);
		} else {
			let MSG = 'Email enviado: ' + info.response;
			notifyRegister(fileReg, MSG);
			//Poner el equipo en disponible
			 dataBase.query("USE cimav_test", function (err, result, fields){
				if (err) throw err;
			});
			NotMail = true; //Bandera de envio de correo levantada
		}
	});
}

//********************************************* Calculo post evento
function nuevaEntrada(){
	//console.log('Revision de nueva entrada de bitacora');
	tiempo_ob = new Date();
	let hora_a    = tiempo_ob.getHours();
	let minutos_a = tiempo_ob.getMinutes();
 	let dia_a     = tiempo_ob.getDate();
 	let mes_a     = tiempo_ob.getMonth() + 1;
 	let anio_a    = tiempo_ob.getFullYear();
	let Hoy = dia_a + '/';
	let id_a;
	if (parseInt(mes_a)<10){
		Hoy = Hoy +'0' + mes_a + '/' + anio_a;
	} else {
		Hoy = Hoy + mes_a + '/' + anio_a;
	}
	dataBase.query("USE cimav_test", function (err, result, fields){
		if (err) throw err;
	});
	let command2 = "SELECT * FROM bitacora ORDER BY fecha ASC LIMIT 1;";
	dataBase.query(command2, function (err, result, fields){
		if (result.length != 0) {
			//cachar error para tratar bitacora vacia
			id_a = result[0].id;
			let fechaA = result[0].fecha;
			if (Hoy == result[0].fecha){
				let command3 = "UPDATE datos SET estado='APG', usuario='" + result[0].usuario;
				command3 = command3 +  "', t_inicio='";
				command3 = command3 + result[0].t_inicio + "', t_final='" + result[0].t_final;
				//El cambio de set point de temperatura  queda para despues de revision
				command3 = command3 + "', temp_sp='350' WHERE id=1;"
				dataBase.query(command3, function (err, result, fields){
					if (err) throw err;
					lecHardware = true;
					freeEQ = false;
					nuevo_evento = true;
					NotMail = false;
					let command4 = "DELETE FROM bitacora WHERE id=" + id_a + ';';
					dataBase.query(command4, function (err, result, fields){
						if (err) throw err;
					});
				});
			} else {
				//Verificar si hay datos en las variables a analizar (por posible falta de entrada en la bitacora)
				let HoyV = Hoy.split('/');
				let fechaAV = fechaA.split('/');
				let anio_i = parseInt(HoyV[2]);
				let anio_f = parseInt(fechaAV[2]);
				let dia_i = (31 * parseInt(HoyV[1])) + (parseInt(HoyV[0]));
				let dia_f = (31 * parseInt(fechaAV[1])) +(parseInt(fechaAV[0]));
				//Borrar por id (conflicto por fechas posteriores)
				let cmd0 = "DELETE FROM bitacora WHERE id=";
				cmd0 = cmd0 + id_a + ';';
				if (anio_f !== anio_i){
					dataBase.query(cmd0, function (err, result, fields){
						if (err) throw err;
					});
				} else {
					if (dia_f < dia_i){
						dataBase.query(cmd0, function (err, result, fields){
							if (err) throw err;
						});
					}
				}
			}
		}
	});
}

function calcular_notificacion(HN, MN, HA, MA, HF, MF)
{
	let Con = 0;
	let hhN = parseInt(HN);
	let mmN = parseInt(MN);
	let hhA = parseInt(HA);
	let mmA = parseInt(MA);
	let TN = (hhN * 60) + mmN;
	let TA = (hhA * 60) + mmA;
	let hhf = parseInt(HF);
	let mmf = parseInt(MF);
	let TF = (hhf * 60) + mmf;
	if (TA >= TN && NotMail == false){
		notificacion();
		NotMail = true;
	}
	if (TA >= TF){
		if (lecHardware == true){
			freeEQ = true;
			console.log('Equipo liberado');
		}
		lecHardware = false;
		//Lamada de funcion de nueva entrada (dejar en variables la entrada futura
	}
}

function notificacion(){
	//Consulta de la base de datos de usuario y sp)
	let correoNot;
	let equipoNot;
	let fechaNot;
	let usuarioNot;
	let SPNot;
	tiempo_ob = new Date();
	fechaNot = tiempo_ob.getDate() + '/';
	fechaNot = fechaNot + (tiempo_ob.getMonth() + 1) + '/';
	fechaNot = fechaNot + tiempo_ob.getFullYear();
	dataBase.query("USE cimav_test", function (err, result, fields){
		if (err) throw err;
	});
	let command1 = "SELECT * FROM administrador WHERE id=1;";
	dataBase.query(command1, function (err, result, fields){
		if (err) throw err;
		correoNot = result[0].usuario;
		let command2 = "SELECT * FROM datos WHERE id=1;";
		dataBase.query(command2, function (err, result, fields){
			if (err) throw err;
			equipoNot = result[0].equipo;
			usuarioNot = result[0].usuario;
			SPNot = result[0].temp_sp;
			let Titulo = "Finalización de operación equipo a nombre de: ";
			Titulo = Titulo + usuarioNot;
			let Mensaje = "Monitor de equipo:\n\r";
			Mensaje = Mensaje + 'Por medio del presente se notifica del fin '
			Mensaje = Mensaje + 'de operación del equipo: ' + equipoNot + ', ';
			Mensaje = Mensaje + 'operado por: ' + usuarioNot + ', ';
			Mensaje = Mensaje + 'en el día: ' + fechaNot + ' ';
			Mensaje = Mensaje + 'con una temperatura de operacion de: ';
			Mensaje = Mensaje + SPNot;
			sendMail(correoNot, Titulo, Mensaje);
		});
	});
}

function borrarActual(){
	dataBase.query("USE cimav_test", function (err, result, fields){
		if (err) throw err;
	});
	let command4 = "UPDATE datos SET estado='DIS', usuario='--', t_inicio='0:00',";
	command4 = command4 + "t_final='0:00', temp_sp=0 WHERE id=1;";
	dataBase.query(command4, function (err, result, fields){
		if (err) throw err;
		borradoActual = true;
	});
}

function validadcion_inicial(){
	dataBase.query("USE cimav_test", function (err, result, fields){
		if (err) throw err;
	});
	let cmd0 ="SELECT * FROM datos WHERE id=1;";
	dataBase.query(cmd0, function (err, result, fields){
		if (err) throw err;
		let Estado = result[0].estado;
		if (Estado == 'DIS'){
			lecHardware = false;
			freeEQ = true;
		} else {
			lecHardware = true;
		}
		borradoActual = false;
	});
}

//******************************************* Escritura el en LOG de notificaciones
function notifyRegister(FileName, InfoTXT){
	//Esta es la unica funcion que se le permite salida a consola
	tiempo_ob = new Date();
	let hora_a    = tiempo_ob.getHours();
	let minutos_a = tiempo_ob.getMinutes();
	let dia_a     = tiempo_ob.getDate();
	let mes_a     = tiempo_ob.getMonth() + 1;
	let anio_a    = tiempo_ob.getFullYear();
	if (parseInt(dia_a)<10){
		dia_a = '0' + dia_a;
	}
	if (parseInt(mes_a)<10){
		mes_a = '0' + mes_a;
	}
	let FechaREG = dia_a + '/' + mes_a + '/' + anio_a;
	let HoraREG = hora_a + ':' + minutos_a;
	let Salida = FechaREG + ' ' + HoraREG + ' ';
	Salida = Salida + InfoTXT + '\n';

	fs.appendFile(FileName, Salida, function(err){
		if (err){
			console.log(err);
		}
	});
}

//******************************************* Fin de funciones inicio de codigo de inicio

validadcion_inicial();
setInterval(revision_estados, 15000);

//************************************************************************ FIN DE ARCHIVO
