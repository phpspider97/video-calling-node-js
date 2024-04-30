import { Router } from 'express';

// import all controllers
import userController from '../controllers/userController.js';

const routes = new Router();

routes.get('/', userController.loadIndex);

export default routes;
