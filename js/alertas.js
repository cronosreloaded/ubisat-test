var alertas = {    
    token : JSON.parse(localStorage.getItem("ubi-token")), 
    inicializar: function(){
        app.buscarVehiculos(this.agregarVehiculos);
        $("#btnBuscar").unbind('click').click(alertas.buscarAlertas);                
    },
    buscarAlertas: function(){
        let vehiculo = $("#vehiculo").val();
        let fecha = $("#fecha").val();
        let cliente = JSON.parse(localStorage.getItem("ubi-token")).id_cliente;
        if (vehiculo != "" && fecha != ""){            
            $.ajax({
                type: "POST",
                url: "https://dev.ubisat.com.ar/api/alertas/getAlertas",
                data: "vehiculo="+vehiculo+"&fecha="+fecha+"&cliente="+cliente,
                success:function(data){                    
                    app.json = data;
                    try{
                        let lista = JSON.parse(data);
                        $("#reporte").html('');
                        alertas.renderReporte(lista);
                    }catch(err){
                        app.mostrarError("Se produjo un error al cargar los datos");
                    }                    
                },
                error: function(data){
                    app.mostrarError(data);
                }
            })
        }else{
            this.borrarMarcadores();
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
            reporte = "<p>No se han encontrado alertas producidas para este día</p>";
        }else{
            for(i=0;i<lista.length;i++){
                if (tipo != lista[i].Tipo_Alerta || id_alerta != lista[i].ID_Alerta){
                    //Nueva alerta - Mostrar encabezado
                    let html = i > 0 ? "</tbody></table>" : "";                 
                    //$("#reporte").append(html + this.getHtmlHeader(lista[i]));
                    reporte+=html+this.getHtmlHeader(lista[i])
                    tipo = lista[i].Tipo_Alerta;
                    id_alerta = lista[i].ID_Alerta;
                }
                reporte+=this.getHtmlItem(lista[i]);
                //$("#reporte").append(this.getHtmlItem(lista[i]));
            }
        }
        
        $("#reporte").append(reporte);
    },
    getHtmlHeader: function(alerta){
        let nombre = "";
        if (alerta.Tipo_Alerta == 1){
            nombre = alerta.NombreAV;
        }else if(alerta.Tipo_Alerta == 2){
            nombre = alerta.NombreAU;
        }else{
            nombre = alerta.NombreAZ;
        }        
        return "<h4>"+nombre+"</h4><table class=\"table table-stripped\"><tbody>";
    },
    getHtmlItem: function(alerta){
        let html=$("#td-itemAlerta tbody").html();
        let hora = alerta.Fecha.substr(11,8);
        html = html.replace("{{hora}}", hora).replace("{{velocidad}}", alerta.Velocidad+" km/h").replace("{{ubicacion}}", alerta.Address.replace(", Argentina", ""));
        return html;
    }

    
}