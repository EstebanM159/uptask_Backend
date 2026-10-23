import { CorsOptions} from 'cors'
export const corsConfig : CorsOptions= {
    origin: function (origin, callback) {
    const whitelist = [process.env.FRONTEND_URL]

    console.log({
        originRecibido: origin,
        frontendUrl: process.env.FRONTEND_URL,
        argumentos: process.argv
    })

    if (process.argv[2] === '--api') {
        whitelist.push(undefined)
    }

    if (whitelist.includes(origin)) {
        callback(null, true)
    } else {
        callback(new Error('Error de CORS'))
    }
}
}
