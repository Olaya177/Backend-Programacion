CREATE DATABASE motocross;
USE motocross;

CREATE TABLE eventos (
    id_evento INT PRIMARY KEY AUTO_INCREMENT,
    lugar VARCHAR(255),
    tipo_evento VARCHAR(100),
    descripcion_evento TEXT,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    capacidad_maxima INT,
    estado ENUM('activo', 'finalizado') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'gestor', 'visitante') DEFAULT 'visitante'
);

-- Insertar 5 usuarios con nombres
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Carlos Ramírez', 'admin@correo.com', 'admin123', 'admin'),
('María Torres', 'gestor1@correo.com', 'gestor123', 'gestor'),
('Juan Pérez', 'gestor2@correo.com', 'gestor456', 'gestor'),
('Ana Gómez', 'visitante1@correo.com', 'visitante123', 'visitante'),
('Luis Martínez', 'visitante2@correo.com', 'visitante456', 'visitante');

-- Insertar 5 eventos
INSERT INTO eventos (lugar, tipo_evento, descripcion_evento, fecha_inicio, fecha_fin, capacidad_maxima, estado) VALUES
('Bogotá', 'Carrera', 'Gran carrera nacional de motocross', '2025-07-10 09:00:00', '2025-07-10 17:00:00', 100, 'activo'),
('Medellín', 'Exhibición', 'Exhibición de motos y saltos extremos', '2025-08-15 10:00:00', '2025-08-15 16:00:00', 80, 'activo'),
('Cali', 'Campeonato', 'Campeonato regional de motocross', '2025-09-05 08:00:00', '2025-09-05 18:00:00', 120, 'finalizado'),
('Bucaramanga', 'Entrenamiento', 'Sesión de entrenamiento para principiantes', '2025-06-20 10:00:00', '2025-06-20 14:00:00', 50, 'activo'),
('Ibagué', 'Rally', 'Rally de motocross por la ciudad', '2025-10-12 07:00:00', '2025-10-12 15:00:00', 90, 'activo');
