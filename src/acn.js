//Codigo javaScript

//************************************************* Declaraciones y librerias
const socket = io();

//***************************************************************** Variables
let Label1 = document.getElementById('label1'); //Tiempo actual
let Label2 = document.getElementById('label2'); //Tiempo de inicio
let Label3 = document.getElementById('label3'); //Tiempo final
let Label4 = document.getElementById('label4'); //% barra
let Barra  = document.getElementById('barra');  //Elemento barra
let Dato1  = document.getElementById('D1');     //Nombre del equipo
let Dato2  = document.getElementById('D2');     //Estado del equipo
let Dato3  = document.getElementById('D3');     //Usuario actual
let Dato4  = document.getElementById('D4');     //Set point
let Dato5  = document.getElementById('D5');     //email notificacion
let Dato6  = document.getElementById('D6');     //Hora de notificacion
let popAcerca 	= document.getElementById('acerca_btn'); //abre popup acercade
let ovlyAcerca  = document.getElementById('overlay-acerca'); //overlay acerca de
let winAcerca 	= document.getElementById('pop_acerca');     //ventana acerca de
let closeAcerca = document.getElementById('btn1');     //Cerrar acerca de
let popBitacora = document.getElementById('bitacora_btn');  //abre pop up bitacora
let ovlyBitacora= document.getElementById('overlay-bitacora');
let winBitacora = document.getElementById('pop_bitacora');
let closeBitacora=document.getElementById('btn2');
let popAltas 	= document.getElementById('altas_btn');
let ovlyAltas 	= document.getElementById('overlay-altas');
let winAltas 	= document.getElementById('pop_altas');
let closeAltas 	= document.getElementById('btn3');
let popMant 	= document.getElementById('mant_btn');
let ovlyMant 	= document.getElementById('overlay-mantenimiento');
let winMant 	= document.getElementById('pop_mantenimiento');
let closeMant 	= document.getElementById('btn4');
let popAdmin 	= document.getElementById('admin_btn');
let ovlyAdmin 	= document.getElementById('overlay-admin');
let winAdmin 	= document.getElementById('pop_admin');
let closeAdmin 	= document.getElementById('btn5');
let changeUS	= document.getElementById('btn6');
let changePS	= document.getElementById('btn7');
let ovlyModif	= document.getElementById('overlay-modif');
let winModif	= document.getElementById('pop_modif');
let closeModif	= document.getElementById('btn8');
let Edit1	= document.getElementById('edit1');
let Dele1	= document.getElementById('dele1');
let Edit2       = document.getElementById('edit2');
let Dele2       = document.getElementById('dele2');
let Edit3       = document.getElementById('edit3');
let Dele3       = document.getElementById('dele3');
let Edit4       = document.getElementById('edit4');
let Dele4       = document.getElementById('dele4');
let Actualizar = true;				//Realizar peticiones por tiempo
//Variables del popup de edicion
let RanID = document.getElementById('mod_ID');	//.value
let RanUS = document.getElementById('mod_US');
let RanFC = document.getElementById('mod_FC');
let RanHI = document.getElementById('mod_IN');
let RanHF = document.getElementById('mod_FN');
let RanEQ = document.getElementById('mod_EQ');
let Hi;						//Hora inicial
let Mi;						//Minuto inicial
let Hf;						//Hora final
let Mf;						//Minuto final
let Ha;						//Hora actual
let Ma;						//Minuto actual
let PS_change = 0;				//Bandera de cambio de password
let US_change = 0;				//Bandera de cambio de administrador
let FreeEQ = false; 				//Bandera de disponibilidad del equipo
let cont = 1;

//***************************************************************** Funciones
function Peticiones(){
	if (Actualizar){
		socket.emit('tiempo_actual', 1);
	}
	//Else si necesito actualizar otra cosa solamente
}

socket.on('Datos_iniciales', function(data2){
	let Dat = data2.split('#');
	//console.log(Dat);
	//Validar si llego la info o error
	Dato1.innerHTML = Dat[0];
	let Edo_eq;
	let calculos;
	switch (Dat[1]){
		case 'ENC':
			Edo_eq = 'Encendido';
			calculo = true;
			break;
		case 'APG':
			Edo_eq = 'Apagado';
			calculo = true;
			break;
		case 'DIS':
			Edo_eq = 'Disponible';
			calculo = false;
			break;
		default:
			Edo_eq = 'Sin datos';
			calculo = false;
			break;
	}
	Dato2.innerHTML = Edo_eq;   //Estado del equipo
	if (calculo){
		Dato3.innerHTML = Dat[2];
		Label2.innerHTML = Dat[3];  //Tiempo inicio
		//Label1.innerHTML = Dat[4];  //Tiempo actual
		Label3.innerHTML = Dat[5];  //Tiempo final
		Dato4.innerHTML = Dat[6];
		let Ti = Dat[3].split(':');
		Hi = parseFloat(Ti[0]);
		Mi = parseFloat(Ti[1]);
		let Tf = Dat[5].split(':');
		Hf = parseFloat(Tf[0]);
		Mf = parseFloat(Tf[1]);
		actualizar_tiempo(Dat[4]);
		//Hora de envio de correo
		let Me;
		let He
		Me = Mf - 15;
		if (Me >= 0){
			He = Hf;
		} else {
			He = Hf - 1;
			Me = 60 + Me;
		}
		if (Me < 10){
			Me = '0' + Me;
		}
		Dato5.innerHTML = Dat[7];
		Dato6.innerHTML = He + ':' + Me;
	}
});

socket.on('tiempo_actual', function(data3){
	//falta el estado del equipo
	actualizar_tiempo(data3);
});

socket.on('getBitacora', function(data5){
	actualizar_bitacora(data5);
});

socket.on('alta', function(data6){
	alert(data6);
});

socket.on('getMantenimiento', function(data7){
	actualizarMantenimiento(data7);
});

socket.on('login', function(data8){
	if (data8 == 1){
		alert('login: OK');
		if (US_change === 1){
			let new_US  = prompt('Nuevo administrador:');
			console.log(new_US);
			let new_US2 = prompt('Reingresa el nuevo administrador:');
			if (new_US == new_US2){
				//alert('paso');
				socket.emit('cambiaUsuario', new_US);
			} else {
				aler('No coiciden');
			}
		}
		if (PS_change === 1){
			let new_PS = prompt('Nueva contraseña:');
			console.log(new_PS);
			let new_PS2 = prompt('Reingresa la nueva contraseña:');
			if (new_PS === new_PS2){
				//alert('paso');
				socket.emit('cambiaPassword', new_PS);
			} else {
				alert('No coinciden');
			}
		}
	} else if (data8 == 0){
		alert('login: ERR');
	} else {
		alert('server: ERR');
	}
});

socket.on('cambiaUsuario', function(data9){
	alert('Cambio de usuario: ' + data9);
});

socket.on('cambiaPassword', function(data10){
	alert('Cambio de contraseña: ' + data10);
});

socket.on('borrarBitacora', function(data11){
	alert(data11);
});

socket.on('cambioBitacora', function(data12){
	alert(data12);
});

socket.on('datos_finales', function(data13){
	alert(data13);
	Label2.innerHTML = '00:00';
	Label3.innerHTML = '00:00';
	Dato1.innerHTML  = '--';
	Dato2.innerHTML  = '--';
	Dato3.innerHTML  = '--';
	Dato4.innerHTML  = '--';
	Dato6.innerHTML  = '--';
	Actualizar = false;
});

function actualizar_tiempo(t_str){
	let Ta = t_str.split(':');
	Ha = parseInt(Ta[0]);
	Ma = parseInt(Ta[1]);
	let Activo = Ta[2];
	//console.log(Activo);
	if (Activo == 'Done'){
		//console.log('Borrar datos');
		liberar_equipo();
	} else {
		FreeEQ = false;
	}
	if (Activo == 'New'){
		socket.emit('Datos_iniciales',1);
	}
	let M_tot;
	M_tot = ((Hf - Hi) * 60) - Mi + Mf;
	let M_eje;
	M_eje = ((Ha - Hi) * 60) - Mi + Ma;
	let Por_avance;
	if (M_tot > 0){
		Por_avance = (M_eje / M_tot) * 100;
		let avance;
		avance = Math.trunc(Por_avance);
		if (avance > 99){avance = 100;}
		Label4.innerHTML = avance + ' %';
		Barra.value = avance;
	}
	if (FreeEQ == false){
		if (Ma < 10){
			label1.innerHTML = Ta[0] + ':0' + Ma;
		} else {
			label1.innerHTML = Ta[0] + ':' + Ma;
		}
		if (Ta.length > 3){
			let fecha_alta = document.getElementById('al_fc');
			let fecha_mant = document.getElementById('mt_fc');
			let Today = Ta[4] + '-';
			if (Ta[3] < 10){
				Today = Today + '0' +  Ta[3];
			} else {
				Today = Today + Ta[3];
			}
			if (Ta[2] < 10){
 				Today = Today + '-0' + Ta[2];
			} else {
				Today = Today + '-' + Ta[2];
			}
			let Day_I = Ta[4] + '-01-01';
			let Day_F = Ta[4] + '-12-31';
			fecha_alta.value = Today;
			fecha_alta.min   = Day_I;
			fecha_alta.max   = Day_F;
			//console.log(Today);
			fecha_mant.value = Today;
			fecha_mant.min   = Day_I;
			fecha_mant.max   = Day_F;
		}
	} else {
		Barra.value = 0;
		Label2.innerHTML = '0:00';
		Label3.innerHTML = '0:00';
		Label4.innerHTML = '0%';
	}
}

function actualizar_bitacora(d_str){
	let Datos = d_str.split('#');
	let id1, id2, id3, id4;	//Por renglon
	if (Datos[0] > 3){
		for (let j=1; j<7; j++){
			id1 = "bt_a" + j;
			id2 = "bt_b" + j;
			id3 = "bt_c" + j;
			id4 = "bt_d" + j;
			let Sal1 = document.getElementById(id1);
			let Sal2 = document.getElementById(id2);
			let Sal3 = document.getElementById(id3);
			let Sal4 = document.getElementById(id4);
			Sal1.innerHTML = Datos[j];
			Sal2.innerHTML = Datos[j+6];
			Sal3.innerHTML = Datos[j+12];
			Sal4.innerHTML = Datos[j+18];
		}
	} else if (Datos[0] == 3){
		for (let j=1; j<7; j++){
			id1 = "bt_a" + j;
			id2 = "bt_b" + j;
			id3 = "bt_c" + j;
			id4 = "bt_d" + j;
			let Sal1 = document.getElementById(id1);
			let Sal2 = document.getElementById(id2);
			let Sal3 = document.getElementById(id3);
			let Sal4 = document.getElementById(id4);
			Sal1.innerHTML = Datos[j];
			Sal2.innerHTML = Datos[j+6];
			Sal3.innerHTML = Datos[j+12];
			Sal4.innerHTML = '--';
		}
	} else if (Datos[0] == 2){
		for (let j=1; j<7; j++){
			id1 = "bt_a" + j;
			id2 = "bt_b" + j;
			id3 = "bt_c" + j;
			id4 = "bt_d" + j;
			let Sal1 = document.getElementById(id1);
			let Sal2 = document.getElementById(id2);
			let Sal3 = document.getElementById(id3);
			let Sal4 = document.getElementById(id4);
			Sal1.innerHTML = Datos[j];
			Sal2.innerHTML = Datos[j+6];
			Sal3.innerHTML = '--';
			Sal4.innerHTML = '--';
		}
	} else if (Datos[0] == 1){
		for (let j=1; j<7; j++){
			id1 = "bt_a" + j;
			id2 = "bt_b" + j;
			id3 = "bt_c" + j;
			id4 = "bt_d" + j;
			let Sal1 = document.getElementById(id1);
			let Sal2 = document.getElementById(id2);
			let Sal3 = document.getElementById(id3);
			let Sal4 = document.getElementById(id4);
			Sal1.innerHTML = Datos[j];
			Sal2.innerHTML = '--';
			Sal3.innerHTML = '--';
			Sal4.innerHTML = '--';
		}
	}
}

function actualizarMantenimiento(e_str){
	let Datos = e_str.split('#');
	let IDmt = document.getElementById('mt_a1');
	let EQmt = document.getElementById('mt_a2');
	let DSmt = document.getElementById('mt_a3');
	let FCmt = document.getElementById('mt_a4');
	IDmt.innerHTML = Datos[0];
	EQmt.innerHTML = Datos[1];
	DSmt.innerHTML = Datos[2];
	FCmt.innerHTML = Datos[3];
}

function liberar_equipo(){
	if (FreeEQ==false)
	{
		//cambiar los elementos del DOM de datos
		Dato2.innerHTML = 'Disponible';
		Dato3.innerHTML = '--';
		Dato4.innerHTML = '--';
		Dato6.innerHTML = '--';
		FreeEQ = true;
	}
}

//********************************************************** Manejo de popups
popAcerca.addEventListener('click', function(){
	ovlyAcerca.classList.add('active');
	winAcerca.classList.add('active');
});

closeAcerca.addEventListener('click', function(e){
	e.preventDefault();
	ovlyAcerca.classList.remove('active');
	winAcerca.classList.remove('active');
});

popBitacora.addEventListener('click', function(){
	socket.emit('getBitacora',1);
	ovlyBitacora.classList.add('active');
	winBitacora.classList.add('active');
});

//Botones de edición
Edit1.addEventListener('click', function(e){
	//Capturar datos del registro
	let DatID = document.getElementById('bt_a1'); //.innerHTML
	let DatUS = document.getElementById('bt_a2');
	let DatFC = document.getElementById('bt_a3');
	let DatHI = document.getElementById('bt_a4');
	let DatHF = document.getElementById('bt_a5');
	let DatEQ = document.getElementById('bt_a6');
	//Asignacion
	RanID.value = DatID.innerHTML;
	RanUS.value = DatUS.innerHTML;
	RanFC.value = DatFC.innerHTML;
	RanHI.value = DatHI.innerHTML;
	RanHF.value = DatHF.innerHTML;
	RanEQ.value = DatEQ.innerHTML;
	//Cerrar bitacora
	e.preventDefault();
	ovlyBitacora.classList.remove('active');
	winBitacora.classList.remove('active');
	//Mostrat popup de edicion
	ovlyModif.classList.add('active');
	winModif.classList.add('active');
});

Edit2.addEventListener('click', function(e){
	//Capturar datos del registro
	let DatID = document.getElementById('bt_b1'); //.innerHTML
	let DatUS = document.getElementById('bt_b2');
	let DatFC = document.getElementById('bt_b3');
	let DatHI = document.getElementById('bt_b4');
	let DatHF = document.getElementById('bt_b5');
	let DatEQ = document.getElementById('bt_b6');
	//Asignacion
	RanID.value = DatID.innerHTML;
	RanUS.value = DatUS.innerHTML;
	RanFC.value = DatFC.innerHTML;
	RanHI.value = DatHI.innerHTML;
	RanHF.value = DatHF.innerHTML;
	RanEQ.value = DatEQ.innerHTML;
	//Cerrar bitacora
	e.preventDefault();
	ovlyBitacora.classList.remove('active');
	winBitacora.classList.remove('active');
	//Mostrat popup de edicion
	ovlyModif.classList.add('active');
	winModif.classList.add('active');
});

Edit3.addEventListener('click', function(e){
	//Capturar datos del registro
	let DatID = document.getElementById('bt_c1'); //.innerHTML
	let DatUS = document.getElementById('bt_c2');
	let DatFC = document.getElementById('bt_c3');
	let DatHI = document.getElementById('bt_c4');
	let DatHF = document.getElementById('bt_c5');
	let DatEQ = document.getElementById('bt_c6');
	//Asignacion
	RanID.value = DatID.innerHTML;
	RanUS.value = DatUS.innerHTML;
	RanFC.value = DatFC.innerHTML;
	RanHI.value = DatHI.innerHTML;
	RanHF.value = DatHF.innerHTML;
	RanEQ.value = DatEQ.innerHTML;
	//Cerrar bitacora
	e.preventDefault();
	ovlyBitacora.classList.remove('active');
	winBitacora.classList.remove('active');
	//Mostrat popup de edicion
	ovlyModif.classList.add('active');
	winModif.classList.add('active');
});

Edit4.addEventListener('click', function(e){
	//Capturar datos del registro
	let DatID = document.getElementById('bt_d1'); //.innerHTML
	let DatUS = document.getElementById('bt_d2');
	let DatFC = document.getElementById('bt_d3');
	let DatHI = document.getElementById('bt_d4');
	let DatHF = document.getElementById('bt_d5');
	let DatEQ = document.getElementById('bt_d6');
	//Asignacion
	RanID.value = DatID.innerHTML;
	RanUS.value = DatUS.innerHTML;
	RanFC.value = DatFC.innerHTML;
	RanHI.value = DatHI.innerHTML;
	RanHF.value = DatHF.innerHTML;
	RanEQ.value = DatEQ.innerHTML;
	//Cerrar bitacora
	e.preventDefault();
	ovlyBitacora.classList.remove('active');
	winBitacora.classList.remove('active');
	//Mostrat popup de edicion
	ovlyModif.classList.add('active');
	winModif.classList.add('active');
});

closeModif.addEventListener('click', function(e){
	let PSS = prompt('Contraseña de administrador:');
	let Salida = RanID.value + '#' + RanUS.value + '#' + RanFC.value;
	Salida = Salida + '#' + RanHI.value + '#' + RanHF.value + '#';
	Salida = Salida + RanEQ.value + '#' + PSS;
	socket.emit('cambioBitacora', Salida);
	e.preventDefault();
	ovlyModif.classList.remove('active');
	winModif.classList.remove('active');
});

Dele1.addEventListener('click', function(a){
	let ID = document.getElementById('bt_a1');
	let Confirm = confirm('Desea borrar el registro: ');
	if (Confirm){
		socket.emit('borrarBitacora',ID.innerHTML);
	}
	cerrarBitacora(a);
});

Dele2.addEventListener('click', function(a){
	let ID = document.getElementById('bt_b1');
	let Confirm = confirm('Desea borrar el registro: ');
	if (Confirm){
		socket.emit('borrarBitacora',ID.innerHTML);
	}
	cerrarBitacora(a);
});

Dele3.addEventListener('click', function(a){
	let ID = document.getElementById('bt_c1');
	let Confirm = confirm('Desea borrar el registro: ');
	if (Confirm){
		socket.emit('borrarBitacora',ID.innerHTML);
	}
	cerrarBitacora(a);
});

Dele4.addEventListener('click', function(a){
	let ID = document.getElementById('bt_d1');
	let Confirm = confirm('Desea borrar el registro: ');
	if (Confirm){
		socket.emit('borrarBitacora',ID.innerHTML);
	}
	cerrarBitacora(a);
});

closeBitacora.addEventListener('click', function(e){
	e.preventDefault();
	ovlyBitacora.classList.remove('active');
	winBitacora.classList.remove('active');
});

popAltas.addEventListener('click', function(){
	let usuarioA    = document.getElementById('usuarioAlta');
	let EQAlta      = document.getElementById('equipoAlta');
	let HIAlta      = document.getElementById('H_IAlta');
	let HFAlta      = document.getElementById('H_FAlta');
	usuarioA.value = '';
	EQAlta.value = '';
	HIAlta.value = '';
	HFAlta.value = '';
	ovlyAltas.classList.add('active');
	winAltas.classList.add('active');
});

closeAltas.addEventListener('click', function(e){
	//aqui van las altas
	e.preventDefault();
	let usuarioA 	= document.getElementById('usuarioAlta');
	let EQAlta 	= document.getElementById('equipoAlta');
	let HIAlta	= document.getElementById('H_IAlta');
	let HFAlta	= document.getElementById('H_FAlta');
	let FAlta	= document.getElementById('al_fc');
	let Salida = usuarioA.value + '#'+ EQAlta.value + '#' + HIAlta.value + '#';
	Salida = Salida + HFAlta.value + '#' + FAlta.value;
	if (Salida.length > 31 && usuarioA.value != ''){
		socket.emit('alta',Salida);
	} else {
		alert('Error: Faltante de datos');
	}
	ovlyAltas.classList.remove('active');
	winAltas.classList.remove('active');

});

popMant.addEventListener('click', function(){
	let DSmt = document.getElementById('mt_ds');
	let PSmt = document.getElementById('mt_ps');
	DSmt.value = '';
	PSmt.value = '';
	socket.emit('getMantenimiento',1);
	ovlyMant.classList.add('active');
	winMant.classList.add('active');
});

closeMant.addEventListener('click', function(e){
	e.preventDefault();
	let EQmt = document.getElementById('mt_eq');
	let DSmt = document.getElementById('mt_ds');
	let FCmt = document.getElementById('mt_fc');
	let PSmt = document.getElementById('mt_ps');
	let Salida = EQmt.value + '#' + DSmt.value + '#';
	Salida = Salida + FCmt.value + '#' + PSmt.value + '#';
	//console.log(Salida.length);
	if (DSmt.values != '' && PSmt.value != ''){
		socket.emit('nuevoMantenimiento',Salida);
	} else {
		alert('Sin datos suficientes para nueva entrada de mantenimiento');
	}
	ovlyMant.classList.remove('active');
	winMant.classList.remove('active');
});

popAdmin.addEventListener('click', function(){
	ovlyAdmin.classList.add('active');
	winAdmin.classList.add('active');
});

closeAdmin.addEventListener('click', function(e){
	e.preventDefault();
	ovlyAdmin.classList.remove('active');
	winAdmin.classList.remove('active');
});

changeUS.addEventListener('click', function(e){
	e.preventDefault();
	PS_change = 0;
	US_change = 1;
	let US = document.getElementById('ad_us');
	let PS = document.getElementById('ad_ps');
	let Salida = US.value + '#' + PS.value + '#';
	socket.emit('cambioUsuario',Salida);
	ovlyAdmin.classList.remove('active');
	winAdmin.classList.remove('active');
});

changePS.addEventListener('click', function(e){
	e.preventDefault();
	PS_change = 1;
	US_change = 0;
	let US = document.getElementById('ad_us');
	let PS = document.getElementById('ad_ps');
	let Salida = US.value + '#' + PS.value + '#';
	socket.emit('cambioPassword',Salida);
	ovlyAdmin.classList.remove('active');
	winAdmin.classList.remove('active');
});

function cerrarBitacora(e){
	e.preventDefault();
	ovlyBitacora.classList.remove('active');
	winBitacora.classList.remove('active');
}


//******************************************************************** Inicio
setInterval('Peticiones()',10000);

socket.emit('Datos_iniciales',1); //el 1 es el ID para modificar en sig version
//console.log('Script cargado');
