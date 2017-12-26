var ultimapos = {
    markerVehiculos: new Array(),
    token : JSON.parse(localStorage.getItem("ubi-token")),
    initMap: function(){        
        center = this.token.centerMap;
        centroMapaLat = parseFloat(center.split(',')[0]);
        centroMapaLng = parseFloat(center.split(',')[1]);
    
        map = new google.maps.Map(document.getElementById('map'), {
              center: {lat: centroMapaLat, lng: centroMapaLng},
              zoom: 13
        });
        $(".btn-dropdown").click(function(){
            var target = $(this).data("target");    
            $("#"+target).toggle();
        })
        app.buscarVehiculos(this.agregarVehiculos);
        //this.buscarPosiciones();

    },

    buscarPosiciones: function(){
        var lista = new Array();
        $(".vehiculos").each(function(i,v){
            if(i>0 && $(v).is(":checked")){			
                lista.push($(v).val());
            }
        })
        if (lista.length >0){
            //$("#preloader").show();
            $.ajax({
                type: "POST",
                url: "http://dev.ubisat.com.ar/api/usuario/getPosiciones",
                data: "lista="+lista,
                success:function(data){
                    $("#mensaje").html(data);
                    ultimapos.mostrarPos(JSON.parse(data));                
                    //centrarMapa();
                },
                error: function(data){
                    app.mostrarError(data);
                }
            })
        }else{
            this.borrarMarcadores();
        }   
    },
    mostrarPos: function(data){
        this.borrarMarcadores();
        var markerBounds = new google.maps.LatLngBounds();
        var mostrarNombre = $("#mostrarNombre").is(":checked");
        this.markerVehiculos = new Array();
        lista = data;
        for(i=0;i<data.length;i++){
            var image = {
                url: 'img/iconovehiculos/'+this.getIcon(data[i].TipoVehiculo,data[i].speed, data[i].Icono),
                origin: new google.maps.Point(0,0),	
                scaledSize:  new google.maps.Size(60, 60)       	    
            };
            var ubicacion = { lat: parseFloat(data[i].latitude), lng: parseFloat(data[i].longitude) };	
            
            if (mostrarNombre){
                var marker = new MarkerWithLabel({
                    position: ubicacion,
                    icon: image,
                    map:map,
                    labelAnchor: new google.maps.Point(40, 10),
                    labelClass: "labels", 
                    labelContent: data[i].name,		    
                    labelStyle: {opacity: 0.8},
                });
            }else{
                var marker = new google.maps.Marker({
                    position: ubicacion,
                    icon: image,
                    map:map,			   
                });
            }	
            marker.id = i;	
            google.maps.event.addListener(marker, 'click', function () {                	
                var content = getIWContent(lista[this.id]);
                infowindow.setContent(content);
                infowindow.open(map, this);
            });
            this.markerVehiculos.push(marker);
            //map.setCenter(ubicacion);
        }
    },

    agregarVehiculos: function(){
        let tmp_Vehiculo = $("#tmp_vehiculo").html();
        for(i=0;i<app.vehiculos.length; i++){
            let html= tmp_Vehiculo.replace('{{id}}', app.vehiculos[i].ID).replace('{{vehiculo}}',app.vehiculos[i].Nombre);
            html = html.replace("{{class}}", "vehiculos");
            $("#listaVehiculos").append(html);
        }
        
        $(".vehiculos").unbind('click');
        $(".vehiculos").click(function(){        
            if ($(this).val() == "Todos"){
                var estado = $(this).is(":checked");
                $(".vehiculos").each(function(i,v){
                    $(v).prop("checked", estado);
                })
            }
            ultimapos.buscarPosiciones();
        })
        ultimapos.buscarPosiciones();
    },
    getIcon: function(tipo, speed, icon){
        var t= icon+"_";	
        if (speed == 0){
            t = t+"rojo.png";
        }else if(speed > 0 && speed <=10){
            t = t+"amarillo.png";
        }else{
            t = t+"verde.png";
        }
        return t;
    },
    temporizador : setInterval(this.buscarPosiciones, 15000),

    borrarMarcadores: function(){
        for(i=0;i< this.markerVehiculos.length;i++){		
            this.markerVehiculos[i].setMap(null);
        }
    }

}