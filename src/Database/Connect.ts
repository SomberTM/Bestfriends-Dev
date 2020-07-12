require('dotenv').config();
import { 
    Keyv, 
    Bestfriends, 
    colors 
} from '../deps';

//Returns a new keyv instance with the mysql storage adapter
export function Connect(): Keyv<any> {
    const keyv_instance: Keyv<any> = new Keyv(process.env.MYSQL_URI, { namespace: 'database' });
    keyv_instance.on('error', error => {
        Bestfriends.error(`Database connection ${colors.red('failed')}: ${error}`);
    });
    Bestfriends.log(`Database connection ${colors.green('successful')}`);
    return keyv_instance;
}