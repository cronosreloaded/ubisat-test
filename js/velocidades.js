var velocidades = {    
    token : JSON.parse(localStorage.getItem("ubi-token")), 
    inicializar: function(){
        app.buscarVehiculos(this.agregarVehiculos);             
    },
    buscarVelocidades: function(){
        let vehiculo = $("#vehiculo").val();
        let fechaDesde = $("#fechaDesde").val();
        let fechaHasta = $("#fechaHasta").val();
        let velocidad = $("#velocidad").val();
        let cliente = JSON.parse(localStorage.getItem("ubi-token")).id_cliente;
        if (vehiculo != "" && fechaDesde != "" && fechaHasta != "" && velocidad > 0){            
            $.ajax({
                type: "POST",
                url: "http://dev.ubisat.com.ar/api/velocidades/getVelocidades",
                data: "vehiculo="+vehiculo+"&fechaDesde="+fechaDesde+"&fechaHasta="+fechaHasta+"&velocidad="+velocidad+"&cliente="+cliente,
                success:function(data){                    
                    app.json = data;
                    try{
                        let lista = JSON.parse(data);
                        $("#reporte").html('');
                        velocidades.renderReporte(lista);
                    }catch(err){
                        app.mostrarError("Se produjo un error al cargar los datos");
                    }                    
                },
                error: function(data){
                    app.mostrarError(data);
                }
            })
        }  
    },
    agregarVehiculos:function(){
        let tmp_Vehiculo = $("#tmp_vehiculo").html();
        for(i=0;i<app.vehiculos.length; i++){
            let html = "<option value=\""+app.vehiculos[i].ID+"\">"+app.vehiculos[i].Nombre+"</option>";          
            $("#vehiculo").append(html);
        }        
    },
    renderReporte: function(lista){
        let tipo = 0;
        let id_alerta = 0;
        let reporte = "";
        $("#reporte").html("");
        if (lista.length == 0){
            reporte = "<p>No se han encontrado registros</p>";
        }else{
            reporte=this.getHtmlHeader(lista[0].vehiculo)
            for(i=0;i<lista.length;i++){               
                reporte+=this.getHtmlItem(lista[i]);
               
            }             
            $("#reporte").append(reporte+"</tbody></table>");               
        }
        
        $("#reporte").append(reporte);
    },
    getHtmlHeader: function(vehiculo){            
        return "<h4>"+vehiculo+"</h4><table class=\"table table-stripped\"><tbody>";
    },
    getHtmlItem: function(item){
        let html=$("#td-itemAlerta tbody").html();        
        html = html.replace("{{hora}}", item.fecha).replace("{{velocidad}}", item.speed+" km/h").replace("{{ubicacion}}", item.Address.replace(", Argentina", ""));
        return html;
    }

    
}