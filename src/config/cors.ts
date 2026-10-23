import { CorsOptions } from 'cors'

export const corsConfig: CorsOptions = {
    origin(origin, callback) {
        const whitelist = [
            process.env.FRONTEND_URL,
            'http://localhost:4200'
        ].filter(Boolean)

        console.log('Origin recibido:', origin)
        console.log('Whitelist:', whitelist)
        console.log(
            '¿Está permitido?',
            whitelist.includes(origin)
        )

        if (!origin || whitelist.includes(origin)) {
            return callback(null, true)
        }

        return callback(new Error('Error de CORS'))
    }
}
