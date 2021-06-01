import dotenv from 'dotenv';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

dotenv.config({ path: './.env.test.local' });
dotenv.config({ path: './.env.test' });
dotenv.config({ path: './.env' });

configure({ adapter: new Adapter() });
