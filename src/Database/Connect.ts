require('dotenv').config();
import { Bestfriends, Keyv } from '../deps';

export function Connect(Bestfriends: Bestfriends): Keyv<any> {
    const keyv_instance: Keyv<any> = new Keyv(process.env.MYSQL_URI, { namespace: 'database' });
    keyv_instance.on('error', error => {
        console.log(`[ERROR]: Keyv connection error: ${error}`);
    });
    console.log(`[INFO]: Database connection successful`);
    return keyv_instance;
}