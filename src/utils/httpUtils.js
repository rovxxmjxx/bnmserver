import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import expressSession from 'express-session';
import connRedis from 'connect-redis';

import { extendJson } from './utils.js';
import { COOKIE_SECRET, SECRET, ALLOW_HOSTS } from '../../config.js';

export const makeParam = (req, otherParams) => {
  const { body, query, params, headers } = req;
  return extendJson(
    { body, query, params, headers },
    extendJson(body, query, params, otherParams)
  );
};

export const allowHosts = (req, res, next) => {
  ALLOW_HOSTS.split(',');
  next();
};

export const setSessionAndCookie = (app, redis) => {
  app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
  app.use(
    cookieParser(COOKIE_SECRET, {
      singed: true,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 * 3,
    })
  );

  const RedisStore = connRedis(expressSession);
  app.use(
    expressSession({
      resave: false,
      saveUninitialized: false,
      secret: SECRET,
      // cookie: {
      //   maxAge: 24 * 60 * 60 * 1000,
      // },
      store: new RedisStore({ client: redis.getClient() }),
    })
  );

  app.get('/redis', async (req, res) => {
    try {
      // const k = 'key01';
      // const v = 'value11';
      // await redis.set(k, 'YYYYYYYY');
      // const v = await redis.get(k);

      // req.session.QQQ = 'PPP';

      // req.session.destroy();
      // req.session = null;

      res.cookie('cv', 'cookie-value');
      res.cookie('scv', 'signed-cookie-value', { signed: true });

      res.json({
        session: req.session,
        cookies: req.cookies,
        signedCookies: req.signedCookies,
      });
    } catch (error) {
      console.error(error);
    }
  });
};
