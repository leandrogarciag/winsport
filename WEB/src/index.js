const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const mysqlStore = require('express-mysql-session')(session);
const passport = require('passport');
const { database } = require('./keys');
const { isLoggedIn, error404 } = require('./lib/auth');
const fileUpload = require('express-fileupload');
const cors = require('cors')
const fs = require('fs');
const http = require('http');
const cookieParser = require('cookie-parser');
const setupSocket = require('./socketManager');


//llamar JSON de configuracion general
const data = fs.readFileSync((path.join(__dirname, '../../config.json')));
const config = JSON.parse(data);

const ports = config.WEB.PORT
let portIndex = 0;
let port = ports[portIndex];


// * Init
const app = express();
const server = http.createServer(app);
app.use(cors({ origin: '*' }));

app.use(cookieParser());
require('./lib/passport');


// * Public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../../WebHookWhasappConnetly/media')));
app.use(express.static(path.join(__dirname, '../../WebHookWhasappConnetly/receivedFiles')));
app.use(express.static(path.join(__dirname, '../node_modules/sweetalert2/dist')));

app.use('/reportes', express.static(path.join(__dirname, '../../WebHookWhasappConnetly/receivedFiles')));
app.use('/reportes', express.static(path.join(__dirname, '../../WebHookWhasappConnetly/media')));

// * Settings
app.set('PORT', port);
app.set('views', path.join(__dirname, 'views'));

app.engine(
  '.hbs',
  exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars'),
  })
);

app.set('view engine', '.hbs');


// * Middleware
const sessionMiddleware = session({
  secret: 'BfIsf83nflolgaj',
  resave: false,
  saveUninitialized: false, 
  store: new mysqlStore(database),
  cookie: { maxAge: 1000 * 60 * 60 * 10, httpOnly: true }
})

  
app.use(sessionMiddleware)
app.use(flash());
app.use(morgan('dev'));
app.use(fileUpload());
app.use(express.urlencoded({ extended: false })); // Aceptar datos sencillos
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// * Global Variables
app.use((req, res, next) => {
  app.locals.messageSuccess = req.flash('messageSuccess');
  app.locals.messageInfo = req.flash('messageInfo');
  app.locals.messageWarning = req.flash('messageWarning');
  app.locals.messageError = req.flash('messageError');
  app.locals.user = req.user;
  //console.log(req.user)
  next();
});

global.array=[]
global.bdd_name="dbp_what_winsport"

// * Routes
app.use(require('./routes/authentication'));
app.use(require('./routes'));
app.use(isLoggedIn); // No entrar a las rutas sin logearse, redirecciona al Login
app.use('/dashboard', require('./routes/dashboard'));
app.use('/mensajeria', require('./routes/mensajeria'));
app.use('/plantillas', require('./routes/plantillas'));
app.use('/reportes', require('./routes/reportes'));
app.use('/usuarios', require('./routes/usuarios'));
app.use('/subtipificaciones', require('./routes/subtipificaciones'));
app.use('/tipificaciones', require('./routes/tipificaciones'));
app.use('/localizaciones', require('./routes/localizaciones'));
app.use('/textoBot', require('./routes/arbolBot'));

// * 404
app.use(error404);

// * Starting Server
const startServer = () => {
  server.listen(app.get('PORT'), () => {
    console.log(`Server WEB principal on port ${app.get('PORT')}`);
    setupSocket(server, sessionMiddleware);
  }).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`Error al iniciar servidor en el puerto: ${port} se encuentra en uso, se intentara con el siguiente puerto.`);
      portIndex++;

      if (portIndex >= ports.length) {
        console.log('No hay puertos disponibles');
        process.exit();
      }

      port = ports[portIndex];
      app.set('PORT', port);
      startServer();
    } else {
      console.error(error);
    }

  });
};


startServer()