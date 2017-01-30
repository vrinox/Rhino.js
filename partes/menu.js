class Elemento{
	constructor(data){
		this.codigo = data.codigo;
		this.estado = 'porConstriur';
		this.contenido = data.nombre;
		this.nodo = null;
		this.enlace = data.enlace || '#';
		this.enlaceSecundario = data.enlaceSecundario || null;

		this.construirNodo();
	}

	construirNodo(){
		var nodo = document.createElement('section');
		nodo.innerHTML = this.contenido;
		var seleccionado = UI.elementos.url.actual();
		if(seleccionado == UI.elementos.url.obtenerArchivodeURl(this.enlace)){
			this.estado = 'seleccionado';
		}else if (this.enlaceSecundario) {
			if(seleccionado == UI.elementos.url.obtenerArchivodeURl(this.enlaceSecundario)){
					this.estado = 'seleccionado';
			}
		}
		nodo.setAttribute('enlace',this.enlace);
		if(this.enlace.substring(0,1)=='>'){
			nodo.onclick=function(e){
				UI.elementos.menu.avanzar(this);
			};
		}else{
			nodo.onclick=function(e){
				location.href=this.getAttribute('enlace');
			};
		}
		this.nodo = nodo;
	};
};

class SubCapa {
	constructor(yo,padre){
		
		this.estado='porConstruir';
		this.nodo = null;
		this.elementos=[];
		this.codigo = yo.codigo;

		//funcionamiento arbol
		this.padre = padre;
		this.yo = yo;
		this.hijos = [];

		this.construir();
	}

	construir(){
		var nodo = document.createElement('div');
		nodo.setAttribute('subCapaMenu',this.yo.codigo);
		this.nodo=nodo;

		//estilos
		this.nodo.classList.add('siguiente');

		//creacion de hijos
		var hijos=this.yo.hijos;
		UI.elementos.menu.nodo.appendChild(this.nodo);

		//se arma la primera capa
		var capaNueva;
		for(var x=0;x<hijos.length;x++){
			//verifico el url del nodo u hoja
			hijos[x].URL = hijos[x].URL || '>'+hijos[x].codigo;
			//agrego los elementos
			var data={
				codigo:hijos[x].codigo,
				nombre:hijos[x].titulo,
				enlace:hijos[x].URL,
				enlaceSecundario:hijos[x].URLSecundario
			};

			var elementoNuevo = this.agregarElemento(data);
			if(elementoNuevo.estado==='seleccionado'){
				UI.elementos.menu.seleccionado = this;
				elementoNuevo.nodo.setAttribute('seleccionado','');
			}
			//creo las capas de aquellas que su URL sea continuar
			if(hijos[x].URL.substring(0,1)==='>'){
				capaNueva = new SubCapa(hijos[x],this);
				//agrego las capas al padre
				this.hijos.push(capaNueva);
			}
		}

	};
	agregarElemento(contenido,enlace){
		var elementoNuevo = new Elemento(contenido,enlace);
		this.nodo.appendChild(elementoNuevo.nodo);
		this.elementos.push(elementoNuevo);
		return elementoNuevo;
	};
	buscarElemento(codigo){
		for(var x=0;x<this.elementos.length;x++){
			if(this.elementos[x].enlace.substring(1,this.elementos[x].enlace.length)==codigo){
				return this.elementos[x];
			}
		}
		return false;
	};
};

class Menu {

	constructor(){	
		this.estado = 'porConstriur';
		this.capaActiva = null;
		this.partes = [];
		this.nodo = null;
		this.seleccionado = false;

		this.intervaloCarga=null;

		this.construir();
	}

	construir(){
		var contenedor = obtenerContenedor();
		var nodo = document.createElement('div');
		nodo.setAttribute('capaMenu','');
		nodo.setAttribute('estado','oculto');
		nodo.id = 'menu';
		contenedor.insertBefore(nodo,contenedor.firstChild);
		this.nodo = nodo;
		this.estado='enUso';

		//creo la titulo
		var titulo=document.createElement('section');
		titulo.textContent='Menu';
		titulo.setAttribute('titulo','');
		this.partes.titulo = titulo;
		this.nodo.appendChild(titulo);

		//creo el pie
		var pie = document.createElement('section');
		var html ='';
		pie.setAttribute('pie','');
		this.partes.pie = pie;
		this.nodo.appendChild(pie);

		//si la sesion no esta creada dejo el centro vacio
		if(typeof(sesion)!=='undefined'){
			//creo el intervalo y guarda el id
			this.intervaloCarga = setInterval(function(){
				if(sesion.arbol!==null){
					//cierro el intervalo
					clearInterval(UI.elementos.menu.intervaloCarga);
					this.intervaloCarga=null;
					//agrego capas
					var capaNueva;

					capaNueva = new SubCapa(sesion.arbol,null);
					UI.elementos.menu.activarCapa(capaNueva);
					if(UI.elementos.menu.seleccionado){
						UI.elementos.menu.activarSeleccionado(capaNueva);
					}
				}
			},30);
			html+='<article off onclick="sesion.cerrarSesion()"><i></i></article>';

		}
		html+='<article contact><i></i></article>';
		html+='<article seguridad  onclick="location.href=\'vis_Cuenta.html\'"><i></i></article>';
		html+='<article books><i></i></article>';
		pie.innerHTML=html;
	};
	getEstado(){
		return this.estado;
	};
	abrirMenu(){
		var btnMenu = document.getElementById('menuBtn');
		btnMenu.click();
	};
	activarCapa(capa){
		if(this.capaActiva===undefined){
			capa.nodo.classList.remove('siguiente');
		}
		this.capaActiva = capa;
		this.capaActiva.nodo.classList.add('capaActiva');

		//reviso si tiene las clases siguiente o anterior y se las remuevo
		if(this.capaActiva.nodo.classList.contains('siguiente')){
			this.capaActiva.nodo.classList.remove('siguiente');
		}
		if(this.capaActiva.nodo.classList.contains('anterior')){
			this.capaActiva.nodo.classList.remove('anterior');
		}

	};
	avanzar(nodo){
		var codigo = nodo.getAttribute('enlace').substring(1,nodo.getAttribute('enlace').length);
		var lista = this.capaActiva.hijos;
		this.capaActiva.nodo.classList.remove('capaActiva');
		this.capaActiva.nodo.classList.add('anterior');
		for(var x = 0; x < lista.length; x++){
			if(lista[x].codigo==codigo){
				this.activarCapa(lista[x]);
				this.cambiarTitulo(lista[x].yo.titulo);
			}
		}
	};
	regresar(){
		this.capaActiva.nodo.classList.remove('capaActiva');
		this.capaActiva.nodo.classList.add('siguiente');
		this.activarCapa(this.capaActiva.padre);
		var titulo = (this.capaActiva.padre!==null)?this.capaActiva.yo.titulo:'Menu';
		this.cambiarTitulo(titulo);
	};
	activarSeleccionado(capa){
		var ruta =  [];
		do{
			ruta = ruta.concat(this.buscarRuta(capa));
		}while(this.seleccionado!=capa);
		ruta = ruta.reverse();
		for(var x = 0; x < ruta.length; x++){
			ruta[x].nodo.click();
		}
	};
	buscarRuta(capa) {
		seleccionado = this.seleccionado;
		var ruta = [];
		if(capa.codigo!==0){
			var elemento =  capa.buscarElemento(seleccionado.codigo);
			if(elemento){
				this.seleccionado = capa;
				ruta.push(elemento);
				return ruta;
			}
			for(var x = 0;x < capa.hijos.length; x++){
				var semiRuta = this.buscarRuta(capa.hijos[x]);
				if(semiRuta){
					ruta = ruta.concat(semiRuta);
					return ruta;
				}
			}
		}
		return false;
	};
	cambiarTitulo(texto){
		var titulo = this.partes.titulo;
		titulo.classList.remove('retroceso');
		titulo.onclick = function(){};
		if(texto!=='Menu'){
			titulo.classList.add('retroceso');
			titulo.onclick = function(){
				UI.elementos.menu.regresar();
			};
		}
		titulo.textContent = texto;
	};
};