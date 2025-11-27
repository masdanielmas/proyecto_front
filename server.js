const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require("mongoose");
require('dotenv').config();
const corsOptions = require('./cors-config');

// Importación de rutas
const authRoutes = require("./routes/authentication");
const articleRoutes = require("./routes/article");
const courseRoutes = require("./routes/courses");
const lessonRoutes = require("./routes/lessons");
const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/categories");

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors(corsOptions)); // Usar la configuración de CORS
app.options('*', cors(corsOptions)); // Habilitar pre-flight para todas las rutas
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de seguridad básica
app.use((req, res, next) => {
    res.header('X-Frame-Options', 'DENY');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-XSS-Protection', '1; mode=block');
    next();
});

// Rutas
app.use("/api", authRoutes);
app.use("/api", articleRoutes);
app.use("/api", courseRoutes);
app.use("/api", lessonRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "¡Ops! Algo salió mal",
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ message: "Ruta no encontrada" });
});

// Conexión a la base de datos
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("Conexión a MongoDB establecida");
    // Iniciar servidor solo después de conectar a la BD
    app.listen(port, () => {
        console.log(`Servidor corriendo en http://localhost:${port}`);
    });
})
.catch((error) => {
    console.error("Error conectando a MongoDB:", error);
    process.exit(1);
});
