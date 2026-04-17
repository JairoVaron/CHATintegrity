const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static("cliente"));


// =========================
// USUARIOS ONLINE
// =========================
let usuarios = []; 
// { socketId, userId, nombre }


// =========================
// REGISTER
// =========================
app.post("/register", async (req, res) => {

    const { email, password, nickname } = req.body;

    try {
        const hash = await bcrypt.hash(password, 10);

        await db.execute(
            "INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)",
            [email, hash, nickname || "Usuario"]
        );

        res.json({ ok: true });

    } catch {
        res.json({ ok: false, error: "Email ya existe" });
    }
});


// =========================
// LOGIN
// =========================
app.post("/login", async (req, res) => {

    const { email, password } = req.body;

    const [rows] = await db.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    if (rows.length === 0) return res.json({ ok: false });

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ ok: false });

    const token = jwt.sign(
        { id: user.id, nickname: user.nickname },
        "SECRET"
    );

    res.json({
        ok: true,
        token,
        user: {
            id: user.id,
            nickname: user.nickname
        }
    });
});


// =========================
// SOCKET.IO
// =========================
io.on("connection", (socket) => {

    console.log("conectado:", socket.id);

    socket.emit("lista_usuarios", usuarios);


    // =========================
    // AUTH
    // =========================
    socket.on("auth", (user) => {

        usuarios = usuarios.filter(u => u.socketId !== socket.id);

        usuarios.push({
            socketId: socket.id,
            userId: user.id,
            nombre: user.nickname
        });

        io.emit("lista_usuarios", usuarios);
    });


    // =========================
    // CHAT GLOBAL
    // =========================
    socket.on("chat", (msg) => {

        const user = usuarios.find(u => u.socketId === socket.id);
        if (!user) return;

        io.emit("chat", {
            nombre: user.nombre,
            mensaje: msg.mensaje
        });
    });


    // =========================
    // CHAT PRIVADO (ARREGLADO)
    // =========================
    socket.on("mensaje_privado", async (data) => {

        const fromUser = usuarios.find(u => u.socketId === socket.id);
        if (!fromUser) return;

        const toUser = usuarios.find(u => u.socketId === data.toSocketId);
        if (!toUser) {
            console.log("Usuario destino no encontrado");
            return;
        }

        const payload = {
            from: {
                socketId: fromUser.socketId,
                userId: fromUser.userId,
                nombre: fromUser.nombre
            },
            to: toUser.socketId,
            mensaje: data.mensaje
        };

        // enviar al receptor
        io.to(toUser.socketId).emit("mensaje_privado", {
            ...payload,
            propio: false
        });

        // enviar al emisor
        socket.emit("mensaje_privado", {
            ...payload,
            propio: true
        });

        // guardar en DB (SIN CRASH)
        try {
            await db.execute(
                "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
                [fromUser.userId, toUser.userId, data.mensaje]
            );
        } catch (err) {
            console.log("Error guardando mensaje:", err.message);
        }
    });


    // =========================
    // DESCONECTAR
    // =========================
    socket.on("disconnect", () => {

        usuarios = usuarios.filter(u => u.socketId !== socket.id);

        io.emit("lista_usuarios", usuarios);
    });


    // =========================
    // MENSAJES LEIDOS
    // =========================
    socket.on("mensajes_leidos", ({ from, to }) => {

        // enviar al usuario original (el que mandó mensajes)
        io.to(to).emit("mensajes_leidos", {
            from
        });
    });


    // =========================
    // ESCRIBIENDO PRIVADO
    // =========================
    socket.on("escribiendo_privado", ({ to }) => {

        const user = usuarios.find(u => u.socketId === socket.id);
        if (!user) return;

        socket.to(to).emit("escribiendo_privado", {
            from: {
                socketId: socket.id,
                nombre: user.nombre
            }
        });
    });

    socket.on("dejo_escribir_privado", ({ to }) => {
        socket.to(to).emit("dejo_escribir_privado", {
            from: socket.id
        });
    });


    // =========================
    // ESCRIBIENDO GLOBAL
    // =========================
    socket.on("escribiendo_global", () => {

        const user = usuarios.find(u => u.socketId === socket.id);
        if (!user) return;

        console.log("Escribiendo global:", user.nombre);

        socket.broadcast.emit("escribiendo_global", {
            nombre: user.nombre
        });
    });

    socket.on("dejo_escribir_global", () => {
        socket.broadcast.emit("dejo_escribir_global");
    });
});


// =========================
// START
// =========================
server.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});


//? node app.js   ====> es para iniciar el programa 
//? npm run dev 