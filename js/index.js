/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    version : 1,
    cliente: 0,
    usuario: 0,
    centroMapaLat: 0,
    centroMapaLng: 0,
    initialize: function() {
        this.bindEvents();
        $("#content").load("vw_home.html");
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        $(".btn-login").click(this.login);
        $(".menuItem").click(function(){
            var cont = $(this).data("content")+".html";
            $("#content").load(cont);
            $(".ma-backdrop").click()    
        })
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);

    },

    checkCredentials: function(){        
        var credentials = JSON.parse(localStorage.getItem("ubi-token"));                     
        if (credentials == null || credentials.id == null || credentials.id == undefined){
            $("#splash").animate({'margin-top':'-150px'}, 700, function() {
                $(".login-content").show();
            });
        }else{            
            window.location.replace("home.html");
        }
    },
    isValid: function(credentials){
        return Date.parse(credentials.dueDate) > new Date();
    },
    login: function(){
        var usr = new Object();
        usr.name = $("#ubi-usuario").val();
        usr.pwd = $("#ubi-password").val();
        $.ajax({
            type: "POST",
            url:"http://dev.ubisat.com.ar/api/usuario/login",
            //contentType: "application/json; charset=utf-8",
            data:"user="+JSON.stringify(usr),
            success:function(data){
                if (data.status == 1){
                    localStorage.setItem("ubi-token", JSON.stringify(data.payload));
                    window.location.replace("home.html");                    
                }else{
                    app.mostrarError("Usuario/Contraseña no válidos o inhabilitado. Contacte a Soporte para obtener ayuda");
                }
            },
            error:function(data){
                app.mostrarError(data);
            }
        })
    },
    buscarVehiculos: function(fcallback){
        var vehiculos = sessionStorage.getItem("ubi-vehiculos");
        if (vehiculos == null){                        
            let id = JSON.parse(localStorage.getItem("ubi-token")).id_cliente;
            $.ajax({
                type: "POST",
                url:"http://dev.ubisat.com.ar/api/usuario/getVehiculos",
                //contentType: "application/json; charset=utf-8",
                data:"data="+id,
                success:function(data){
                    if (data.status == 1){
                        sessionStorage.setItem("ubi-vehiculos", JSON.stringify(data.payload));
                        app.vehiculos=data.payload;
                        fcallback();
                    }else{
                        alert("ERROR");
                    }
                },
                error: function(data){
                    app.mostrarError(data);
                } 
            })
        }else{
            //cargar vehiculos en variable
            app.vehiculos = JSON.parse(vehiculos);
            fcallback();
        }
    },
    loginSuccess: function(data){
        
    },
    mostrarError: function(data){
        var html = $("#htmlAlerta").html();
        $("#textoError").html(data);
        $("#modalError").modal('show');
    }
    
};
