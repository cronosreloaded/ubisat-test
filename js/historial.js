var historial = {
    markerVehiculos : new Array(),
    infowindow : "",
    listado : "",
    lista : "",
    bounds : "",
    lineSymbol : "" ,
    recorrido : "",
    map: "",
    marcadores: "",
    token : JSON.parse(localStorage.getItem("ubi-token")),    
    init : function(){        
        center = this.token.centerMap;
        centroMapaLat = parseFloat(center.split(',')[0]);
        centroMapaLng = parseFloat(center.split(',')[1]);
        
        this.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: centroMapaLat, lng: centroMapaLng},
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP ,
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: true
        });  
        this.infowindow = new google.maps.InfoWindow();
        this.lineSymbol = {path: google.maps.SymbolPath.FORWARD_OPEN_ARROW};
        this.bounds = new google.maps.LatLngBounds();    
        this.infowindow = new google.maps.InfoWindow();
        this.recorrido = new google.maps.Polyline({
            path: [],
            icons: [{icon: this.lineSymbol,
                scale: 15,
                repeat: "100"}],
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
        $(".btn-dropdown").click(function(){            
            var target = $(this).data("target"); 
            if (target == "ddown-vehiculos"){
                $("#ddown-fechas").hide();
            }else{
                $("#ddown-vehiculos").hide();
            }
            $("#"+target).toggle();
        })
        
        $("#btnBuscar").click(function(){
            historial.buscarHistorial();    
        })
        app.buscarVehiculos(this.agregarVehiculos);

    },
    buscarHistorial: function(){
        var data = new Object();
        data.vehiculo = $(".vehiculos:checked").val();
        data.fd = $("#fechaDesde").val();
        data.hd = $("#horaDesde").val();
        data.fh = $("#fechaHasta").val();
        data.hh = $("#horaHasta").val();    
        $.ajax({
                type: "POST",
                url: "http://dev.ubisat.com.ar/api/usuario/getHistorial",
                data: "data="+JSON.stringify(data),
                success:function(data){
                    $("#mensaje").html(data);
                    historial.mostrarHistorial(data);                                
                },
                error: function(data){
                    app.mostrarError(data);
                }
            })
    },
    mostrarHistorial: function(lista){        
        this.marcadores = new Array();
        this.bounds = new google.maps.LatLngBounds();
        this.recorrido.setMap(null);        
        var puntos = new Array();
        lista = JSON.parse(lista);
        for (i=0; i<lista.length; i++){
            puntos.push({lat: parseFloat(lista[i].latitude), lng: parseFloat(lista[i].longitude)});
            var myLatLng = new google.maps.LatLng(parseFloat(lista[i].latitude), parseFloat(lista[i].longitude));	
            var pos = new google.maps.LatLng(parseFloat(lista[i].latitude), parseFloat(lista[i].longitude));	
            
            this.bounds.extend(myLatLng);
    
            var scaledSize = new google.maps.Size(10,10);
            var origin = new google.maps.Point(0,0);
            var anchor = new google.maps.Point(0,0);
    
            var icono = {
                url:"img/iconoposition/icono-"+this.getColorIcon(lista[i].speed)+"-20.png",
                scaledSize: scaledSize,			
                origin: origin,
                anchor: anchor
            }
    
            var marker = new google.maps.Marker({
              position: pos,
              map: this.map,
              icon: icono
            });
    
            marker.id = i;
              
            google.maps.event.addListener(marker, 'click', function () {                	
                var content = historial.getIWContent(lista[this.id]);
                historial.infowindow.setContent(content);
                historial.infowindow.open(this.map, this);
            });
            this.marcadores.push(marker);   
        }	
        this.centrarMapa();
        var rep = 100/lista.length*4;
        this.recorrido.setOptions({icons: [{icon: this.lineSymbol,scale: 10,repeat: rep+"%"}]})
        this.recorrido.setPath(puntos);
    
        this.recorrido.setMap(this.map);    
    },
    getColorIcon: function(velocidad){
        if (velocidad == 0){
            return "rojo";
        }
        if (velocidad > 10){
            return "verde";
        }else{
            return "amarillo";
        }    
    },
    toggleIconos: function(){
        var newMap = null
        if ($("#mostrarIconos").is(":checked")){
            newMap = map
        }
        for(i=0; i< this.marcadores.length; i++){
            this.marcadores[i].setMap(newMap);
        }
    
    },
    agregarVehiculos:function(){
        let tmp_Vehiculo = $("#tmp_vehiculo").html();
        for(i=0;i<app.vehiculos.length; i++){
            let html= tmp_Vehiculo.replace('{{id}}', app.vehiculos[i].ID).replace('{{vehiculo}}',app.vehiculos[i].Nombre);
            html = html.replace("{{class}}", "vehiculos");
            $("#listaVehiculos").append(html);
        }
        
        $(".vehiculos").unbind('click');   
        
    },
    
    centrarMapa: function(){
        var markerBounds = new google.maps.LatLngBounds();
        for(i=0;i<this.marcadores.length;i++){		
            markerBounds.extend(this.marcadores[i].position);
        }
        this.map.fitBounds(markerBounds);
        var listener = google.maps.event.addListener(map, "idle", function() { 
            if (this.map.getZoom() > 13) map.setZoom(13); 
              google.maps.event.removeListener(listener); 
        });
    },

    getIWContent: function(datos){
        var direccion = datos.direccion
        if (datos.direccion == null || datos.direccion == ""){
            direccion = "<span id=\"spBuscarDir\">...</span";
            buscarDireccionIW(datos.latitude, datos.longitude);
        }
        var html = $("#htmlIW").html();
        var fecha = datos.fecha.substr(8,2)+"-"+datos.fecha.substr(5,2)+"-"+datos.fecha.substr(0,4)
        html = html.replace("{fecha}", fecha);
        html = html.replace("{hora}", datos.fecha.substr(11,8));
        html = html.replace("{velocidad}", datos.speed);
        html = html.replace("{direccion}", direccion);	
        
        return html;
    }
};