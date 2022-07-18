import { default as express } from 'express';
import { default as cors } from 'cors';

import { logger, loggerMiddleware } from './services/logger';
import { SonoMKRRouter } from './controllers/sonomkr';

// import { UserRouter } from './controllers/user';

// Creates and configures an ExpressJS web server.
class App {

  // ref to Express instance
  public express: any;
  public server: any;

  //Run configuration methods on the Express instance.
  constructor() {
    this.express = express();
    this.express.disable('x-powered-by');
    this.middleware();
    this.routes();
  }

  // Configure Express middleware.
  private middleware(): void {
    if (process.env.NODE_ENV !== 'test') {
      this.express.use(loggerMiddleware);
    }
    this.express.use(cors({credentials: true, origin: true}));
  }

  // Configure API endpoints.
  private routes(): void {
    let router = express.Router();

    // placeholder route handler
    router.use('/', SonoMKRRouter);

    // this.express.use('/', express.static('documentation'));

    this.express.use('/', router);
    
    this.express.get('*', (req: any, res: any) => {
      res.status(404).send();
    });
  }

}

export default (new App()).express;
