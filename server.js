const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

// Permitir conexiones de la APK de Volt.build
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Puerto dinámico que nos asigna el hosting gratuito
const PORT = process.env.PORT || 3000;

app.post('/api/create-server', (req, res) => {
    const { game, serverName } = req.body;
    const serverFolder = path.join(__dirname, serverName);

    console.log(`Creando servidor gratuito de ${game}: ${serverName}`);

    if (game === 'samp') {
        // 1. Crear carpeta para el servidor del usuario
        if (!fs.existsSync(serverFolder)){
            fs.mkdirSync(serverFolder);
        }

        // 2. Comando para descargar un servidor base de SAMP para Linux e iniciarlo
        // Nota: En hostings gratuitos compartidos, generalmente solo podemos usar el puerto asignado por el sistema
        const setupCommand = `
            cd ${serverFolder} && 
            curl -O http://files.sa-mp.com/samp037svr_R2-1.tar.gz && 
            tar -zxf samp037svr_R2-1.tar.gz && 
            cd samp03 && 
            chmod +x samp03svr &&
            ./samp03svr &
        `;

        exec(setupCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return res.status(500).json({ error: 'No se pudo iniciar en la nube.' });
            }

            res.json({
                status: 'success',
                message: `Servidor de SAMP "${serverName}" en línea.`,
                ip: `tu-app-url.onrender.com`, // Render te dará un enlace único
                port: PORT
            });
        });

    } else {
        res.status(400).json({ error: 'Por ahora, solo SAMP y MTA son soportados en la versión móvil sin PC.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor en la nube corriendo en el puerto ${PORT}`);
});
