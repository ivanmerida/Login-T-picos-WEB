const bcrypt = require('bcrypt');

var usuario_name_login = '';


function login(req, res) {
    if (req.session.loggedin != true) {
        res.render('login/index');
    } else {
        res.redirect('/');
    }
}

function auth(req, res) {
    const data = req.body;
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM musuario WHERE NomUser = ?', [data.user], (err, userdata) => {
            if (userdata.length > 0) {
                userdata.forEach(element => {
                    var fechaInicio = new Date(element.FechaIni);
                    var fechaFin = new Date(element.FechaFin);

                    var dia_fin = fechaFin.getDate() + 1;
                    let mes_fin = fechaFin.getMonth();
                    let anio_fin = fechaFin.getFullYear();

                    var fecha_fin = new Date(anio_fin, mes_fin, dia_fin);
                    var fechaActual = new Date();

                    if (element.Contrasena != data.password) {
                        res.render('login/index', {
                            error: 'Error: Contraseña incorrecta!!!'
                        });
                    } else if (!element.EdoCta) {
                        res.render('login/index', {
                            error: 'Error: Cuenta vencida, pongase en contacto con el administrador!!!'
                        });
                    } else if (fechaActual <= fechaInicio) {
                        res.render('login/index', {
                            error: 'Error: Cuenta por activar!!!'
                        });

                    } else if (fecha_fin <= fechaActual) {
                        req.getConnection((err, conn) => {
                            conn.query('UPDATE musuario SET EdoCta = false WHERE NomUser = ?', [data.user], (err, userdata) => {
                                if (err) throw err;
                            });
                        });
                        res.render('login/index', {
                            error: 'Error: Cuenta vencida, pongase en contacto con el administrador!!!'
                        });
                    } else {
                        req.getConnection((err, conn) => {
                            conn.query('SELECT CONCAT(nombre.DsNombre, " ", apepat.DsApellid, " ", apemat.DsApellid, " (",tipoper.DsTipoPerso ,")" ) as nombress FROM ' +
                                'cNombre AS nombre, cApellid AS apepat, cApellid AS apemat, mUsuario AS usuario, mPerso AS persona, ' +
                                'cTipoPerso AS tipoper WHERE ' +
                                '(nombre.CvNombre = persona.CvNombre) ' +
                                'AND (apepat.CvApellid = persona.CvApePat) ' +
                                'AND (apemat.CvApellid = persona.CvApeMat) ' +
                                'AND (usuario.CvPerso = persona.CvPerso) ' +
                                'AND (tipoper.CvTipoPerso = persona.CvTipoPerso) ' +
                                'AND usuario.NomUser = ? LIMIT 1', [data.user], (err, userdata) => {
                                    if (userdata.length > 0) {
                                        userdata.forEach(element => {
                                            console.log(element.nombress);
                                            req.session.loggedin = true;
                                            req.session.name = element.nombress;
                                            usuario_name_login = element.nombress
                                            res.redirect('/');
                                        });
                                    }
                                });
                        });
                    }
                    /*
                    bcrypt.compare(data.password, element.Contrasena, (err, isMatch) => {
                        if (!isMatch) {
                            res.render('login/index', {
                                error: 'Error: Contraseña incorrecta!!!'
                            });
                        } else {
                            req.session.loggedin = true;
                            req.session.name = element.NomUser;
                            res.redirect('/');
                        }
                    });*/
                });
            } else {
                res.render('login/index', {
                    error: 'Error: Usuario No registrado!!!'
                });
            }
        });
    });
}

function register(req, res) {
    if (req.session.loggedin == true) {
        obtener_usuarios();
        res.render('login/register');
    } else {
        res.redirect('/');
    }
}

function storeUser(req, res) {
    const data = req.body;
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM musuario WHERE NomUser = ?', [data.user], (err, userdata) => {
            if (userdata.length > 0) {
                res.render('login/register', {
                    error: 'Error: El usuario ya existe!!!'
                });
            } else {
                bcrypt.hash(data.password, 12).then(hash => {
                    data.password = hash;
                    req.getConnection((err, conn) => {

                        conn.query('INSERT INTO musuario SET ?', [data], (err, rows) => {
                            req.session.loggedin = true;
                            req.session.name = data.user;
                            res.redirect('/');
                        });
                    });
                });
            }
        });
    });
}

function logout(req, res) {
    if (req.session.loggedin) {
        req.session.destroy();
    }
    res.redirect('/login');
}

function obtener_usuarios(req, res) {
    req.getConnection((err, conn) => {
        conn.query('SELECT CONCAT(nombre.DsNombre, " ", apepat.DsApellid, " ", apemat.DsApellid, " (",tipoper.DsTipoPerso ,")" ) as nombress FROM ' +
            'cNombre AS nombre, cApellid AS apepat, cApellid AS apemat, mUsuario AS usuario, mPerso AS persona, ' +
            'cTipoPerso AS tipoper WHERE ' +
            '(nombre.CvNombre = persona.CvNombre) ' +
            'AND (apepat.CvApellid = persona.CvApePat) ' +
            'AND (apemat.CvApellid = persona.CvApeMat) ' +
            'AND (usuario.CvPerso = persona.CvPerso) ' +
            'AND (tipoper.CvTipoPerso = persona.CvTipoPerso) ' +
            '', (err, userdata) => {
                if (userdata.length > 0) {
                    console.log(userdata);
                    let data = {};
                    data = userdata;
                    res.render('login/register', {data});
                    
                    userdata.forEach(element => {
                    });
                }
            });
    });
}

function pass(req, res) {
    if (req.session.loggedin) {
        res.render('login/password', {
            name: usuario_name_login
        });
    } else {
        res.render('login/index');
    }
}


function changePass(req, res) {
    const data = req.body;
    console.log(data);
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM musuario WHERE Contrasena = ?', [data.password], (err, userdata) => {

            if (userdata.length > 0) {
                console.log(userdata);
                userdata.forEach(element => {
                    if (data.password2 != data.password3) {
                        res.render('login/password', {
                            name: usuario_name_login,
                            error: 'Error: Las contraseñas nuevas no coinciden!!!'
                        });
                    } else {
                        req.getConnection((err, conn) => {
                            conn.query('SELECT Contrasena FROM musuario WHERE Contrasena = ?', [data.password2], (err, userdata) => {
                                console.log(userdata);
                                if (userdata.length > 0) {
                                    res.render('login/password', {
                                        name: usuario_name_login,
                                        error: 'Error: No puedes usar esa contraseña!!!'
                                    });
                                } else {
                                    req.getConnection((err, conn) => {
                                        let update = 'UPDATE musuario SET Contrasena = "' + data.password2 + '" WHERE Contrasena = "' + element.Contrasena + '"';
                                        conn.query(update, (err, userdata) => {
                                            if (err) throw err;
                                        });
                                    });
                                    res.render('login/password', {
                                        name: usuario_name_login,
                                        success: 'Contraseña actualizada correctamente!!!'

                                    });
                                }
                            });
                        });
                    }
                });
            } else {
                res.render('login/password', {
                    name: usuario_name_login,
                    error: 'Error: La contraseña anterior no es correcta!!!'
                });
            }
        });
    });
}


module.exports = {
    login,
    register,
    storeUser,
    auth,
    logout,
    pass,
    changePass,
    obtener_usuarios
}