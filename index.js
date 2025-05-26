const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const JWT_SECRET = "tu_clave_secreta"; // Usa una clave segura en producción

const pool = mysql.createPool({
  host: "bx0oz38dea8m0th8insy-mysql.services.clever-cloud.com",
  user: "unp10qja5xt1e9xw",
  password: "xqiMCPSMTvJh6R56DdCI",
  database: "bx0oz38dea8m0th8insy",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Obtener todos los eventos
app.get("/eventos", async (req, res) => {
  try {
    // Consulta para obtener todos los registros de la tabla "eventos"
    const [rows] = await pool.query("SELECT * FROM eventos");
    res.json(rows); // Respuesta con los datos obtenidos
  } catch (err) {
    res.status(500).json({ error: err.message }); // Manejo de errores
  }
});

// Obtener un evento por ID
app.get("/eventos/:id_evento", async (req, res) => {
  try {
    const { id_evento } = req.params; // ID del evento recibido en la URL
    // Consulta para obtener un evento específico por su ID
    const [rows] = await pool.query("SELECT * FROM eventos WHERE id_evento = ?", [id_evento]);

    if (rows.length === 0) {
      // Si no se encuentra el evento, devolver un error 404
      return res.status(404).json({ error: "Evento no encontrado." });
    }

    res.json(rows[0]); // Respuesta con el evento encontrado
  } catch (err) {
    res.status(500).json({ error: err.message }); // Manejo de errores
  }
});

// Crear un nuevo evento
app.post("/eventos", async (req, res) => {
  try {
    const {
      lugar,
      tipo_evento,
      descripcion_evento,
      fecha_inicio,
      fecha_fin,
      capacidad_maxima,
      estado,
    } = req.body;

    // Validación de los campos requeridos
    if (!lugar || !tipo_evento || !descripcion_evento || !fecha_inicio || !fecha_fin || !capacidad_maxima) {
      return res.status(400).json({ error: "Faltan datos requeridos." });
    }

    // Consulta para insertar un nuevo evento en la base de datos
    const [result] = await pool.query(
      `INSERT INTO eventos (lugar, tipo_evento, descripcion_evento, fecha_inicio, fecha_fin, capacidad_maxima, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [lugar, tipo_evento, descripcion_evento, fecha_inicio, fecha_fin, capacidad_maxima, estado || "activo"]
    );

    // Respuesta con el ID del evento creado
    res.json({ id_evento: result.insertId, message: "Evento creado exitosamente." });
  } catch (err) {
    res.status(500).json({ error: err.message }); // Manejo de errores
  }
});

// Actualizar un evento por ID
app.put("/eventos/:id_evento", async (req, res) => {
  try {
    const { id_evento } = req.params; // ID del evento recibido en la URL
    const {
      lugar,
      tipo_evento,
      descripcion_evento,
      fecha_inicio,
      fecha_fin,
      capacidad_maxima,
      estado,
    } = req.body;

    // Validación de los campos requeridos
    if (!lugar || !tipo_evento || !descripcion_evento || !fecha_inicio || !fecha_fin || !capacidad_maxima) {
      return res.status(400).json({ error: "Faltan datos requeridos." });
    }

    // Consulta para actualizar un evento existente
    const [result] = await pool.query(
      `UPDATE eventos 
       SET lugar = ?, tipo_evento = ?, descripcion_evento = ?, fecha_inicio = ?, fecha_fin = ?, capacidad_maxima = ?, estado = ? 
       WHERE id_evento = ?`,
      [lugar, tipo_evento, descripcion_evento, fecha_inicio, fecha_fin, capacidad_maxima, estado, id_evento]
    );

    if (result.affectedRows === 0) {
      // Si no se encuentra el evento, devolver un error 404
      return res.status(404).json({ error: "Evento no encontrado." });
    }

    res.json({ message: "Evento actualizado exitosamente." }); // Respuesta de éxito
  } catch (err) {
    res.status(500).json({ error: err.message }); // Manejo de errores
  }
});

// Eliminar un evento por ID
app.delete("/eventos/:id_evento", async (req, res) => {
  try {
    const { id_evento } = req.params; // ID del evento recibido en la URL

    // Consulta para verificar si el evento existe
    const [rows] = await pool.query("SELECT * FROM eventos WHERE id_evento = ?", [id_evento]);

    if (rows.length === 0) {
      // Si no se encuentra el evento, devolver un error 404
      return res.status(404).json({ error: "Evento no encontrado." });
    }

    // Consulta para eliminar el evento
    await pool.query("DELETE FROM eventos WHERE id_evento = ?", [id_evento]);

    res.json({ message: "Evento eliminado exitosamente." }); // Respuesta de éxito
  } catch (err) {
    res.status(500).json({ error: err.message }); // Manejo de errores
  }
});

//------------ FIN CRUD PARA LA TABLA EVENTOS ------------------//

// Registro de usuario (por defecto rol visitante)
app.post("/auth/register", async (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: "Faltan datos requeridos." });
  }
  try {
    // Guardar la contraseña tal cual (sin encriptar)
    await pool.query(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, password, "visitante"]
    );
    res.json({ message: "Usuario registrado correctamente." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login de usuario
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Faltan datos requeridos." });
  }
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(401).json({ error: "Credenciales inválidas." });

    const usuario = rows[0];
    // Comparar la contraseña directamente (sin bcrypt)
    if (password !== usuario.password) return res.status(401).json({ error: "Credenciales inválidas." });

    // Generar token JWT
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, rol: usuario.rol, nombre: usuario.nombre },
      JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.json({ token, usuario: { id_usuario: usuario.id_usuario, nombre: usuario.nombre, rol: usuario.rol } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware para verificar JWT
function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token requerido." });

  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ error: "Token inválido." });
    req.usuario = usuario;
    next();
  });
}

// Middleware para verificar rol admin
function soloAdmin(req, res, next) {
  if (req.usuario.rol !== "admin") {
    return res.status(403).json({ error: "Acceso solo para administradores." });
  }
  next();
}

// Middleware para verificar rol gestor
function soloGestor(req, res, next) {
  if (req.usuario.rol !== "gestor") {
    return res.status(403).json({ error: "Acceso solo para gestores." });
  }
  next();
}

// Rutas protegidas para gestión de usuarios (solo admin)
app.get("/usuarios", autenticarToken, soloAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id_usuario, nombre, email, rol FROM usuarios");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/usuarios/:id_usuario/rol", autenticarToken, soloAdmin, async (req, res) => {
  const { id_usuario } = req.params;
  const { rol } = req.body;
  if (!["admin", "gestor", "visitante"].includes(rol)) {
    return res.status(400).json({ error: "Rol no válido." });
  }
  try {
    await pool.query("UPDATE usuarios SET rol = ? WHERE id_usuario = ?", [rol, id_usuario]);
    res.json({ message: "Rol actualizado correctamente." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/usuarios/:id_usuario", autenticarToken, soloAdmin, async (req, res) => {
  const { id_usuario } = req.params;
  try {
    await pool.query("DELETE FROM usuarios WHERE id_usuario = ?", [id_usuario]);
    res.json({ message: "Usuario eliminado correctamente." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Proteger rutas de eventos solo para gestores autenticados
app.post("/eventos", autenticarToken, soloGestor, async (req, res, next) => {
  req.body = req.body; // Solo para que pase al handler original
  next();
});
app.put("/eventos/:id_evento", autenticarToken, soloGestor, async (req, res, next) => {
  req.body = req.body;
  next();
});
app.delete("/eventos/:id_evento", autenticarToken, soloGestor, async (req, res, next) => {
  req.body = req.body;
  next();
});

const PORT = 3000;

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));