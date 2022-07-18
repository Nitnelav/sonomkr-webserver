import { Router, Request, Response } from "express";
import { logger } from "../services/logger";
import { default as ZmqService } from '../services/zmq-service';

export class SonoMKRController {

  router: Router;

  constructor( ) {
    this.router = Router({mergeParams: true});
    this.setupRoutes();
  }

  start(req: Request, res: Response) {
    let channel = req.params.channel;
    ZmqService.sendRequest(["START", channel], 2000)
    .then(msg => {
      res.status(msg[0]).send(msg[1])
    })
    .catch(err => {
      res.status(500).send(err)
    })
  }
  stop(req: Request, res: Response) {
    let channel = req.params.channel;
    ZmqService.sendRequest(["STOP", channel], 2000)
    .then(msg => {
      res.status(msg[0]).send(msg[1])
    })
    .catch(err => {
      res.status(500).send(err)
    })
  }
  
  load(req: Request, res: Response) {
    let config = decodeURI(req.params.config);
    ZmqService.sendRequest(["LOAD", config], 2000)
    .then(msg => {
      res.status(msg[0]).send(msg[1])
    })
    .catch(err => {
      res.status(500).send(err)
    })
  }

  get(req: Request, res: Response) {
    let channel = req.params.channel;
    let setting = req.params.setting.toUpperCase();
    ZmqService.sendRequest(["GET", channel, setting], 2000)
    .then(msg => {
      res.status(msg[0]).send(msg[2])
    })
    .catch(err => {
      res.status(500).send(err)
    })
  }

  set(req: Request, res: Response) {
    let channel = req.params.channel;
    let setting = req.params.setting.toUpperCase();
    let value = req.params.value;
    ZmqService.sendRequest(["SET", channel, setting, value], 2000)
    .then(msg => {
      res.status(msg[0]).send(msg[1])
    })
    .catch(err => {
      res.status(500).send(err)
    })
  }

  setupRoutes() {
    this.router.get('/START/:channel', this.start);
    this.router.get('/STOP/:channel', this.stop);

    this.router.get('/LOAD/:config', this.load);

    this.router.get('/GET/:channel/:setting', this.get);
    this.router.get('/SET/:channel/:setting/:value', this.set);
  }
}

let sonomkrController = new SonoMKRController();
const SonoMKRRouter = sonomkrController.router;

export { SonoMKRRouter };