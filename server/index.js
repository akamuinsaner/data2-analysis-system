const Koa = require('koa');
const Router = require('@koa/router');
const koaStatic = require('koa-static');
const bodyParser = require('koa-bodyparser');
const path = require('path');
const orderBy = require('lodash/orderBy');
const set = require('lodash/set');
const fs = require('fs');

const root = path.resolve(__dirname, '../resources');
const app = new Koa();
const router = new Router();
const dbRoot = path.resolve(__dirname, '../db/data.json')

router.get('/api/allData', (ctx, next) => {
    const db = require(dbRoot);
    ctx.response.body = db;
    next();
})

router.get('/api/dataBySeason', (ctx, next) => {
    const querys = ctx.request.query;
    const db = require(dbRoot);
    const s = db[querys['season']];
    const list = Object.keys(s).map(name => {
        const data = s[name];
        return {
            ...data,
            name,
            winRate: Number(data.win) / ((Number(data.win) + Number(data.lose) + Number(data.absence)) || 1),
            kda: (Number(data.kill) + Number(data.assist)) / (Number(data.death) || 1),
        }
    });
    ctx.response.body = orderBy(list, ['winRate', 'kda'], ['desc', 'desc']);
    next();
});

router.get('/api/seasons', (ctx, next) => {
    const db = require(dbRoot);
    ctx.response.body = Object.keys(db);
    next();
})

router.get('/api/seasonTotal', (ctx, next) => {
    const db = require(dbRoot);
    const querys = ctx.request.query;
    const s = db[querys['season']];
    let total = 0;
    const names = Object.keys(s);
    if (names.length) {
        const d = s[names[0]];
        total = Number(d.win) + Number(d.lose) + Number(d.absence);
    }
    ctx.response.body = total;
    next();
})

router.post('/api/createUser', (ctx, next) => {
    const body = ctx.request.body;
    const db = require(dbRoot);
    const data = set(db, `${body.season}.${body.name}`, {
        win: 0,
        lose: 0,
        absence: Number(body.total),
        kill: 0,
        death: 0,
        assist: 0,
    })
    fs.writeFileSync(path.resolve(__dirname, '../db/data.json'), JSON.stringify(data, null, 4))
    ctx.response.body = 'success'
    next();
})

router.post('/api/editUser', (ctx, next) => {
    const body = ctx.request.body;
    const db = require(dbRoot);
    const data = set(db, `${body.season}.${body.name}`, {
        win: body.win,
        lose: body.lose,
        absence: body.absence,
        kill: body.kill,
        death: body.death,
        assist: body.assist,
    })
    fs.writeFileSync(path.resolve(__dirname, '../db/data.json'), JSON.stringify(data, null, 4))
    ctx.response.body = 'success'
    next();
})

router.post('/api/createSeason', (ctx, next) => {
    const body = ctx.request.body;
    const db = require(dbRoot);
    const seasons = Object.keys(db);
    const lastSeason = seasons[seasons.length - 1];
    let data = {}
    if (!lastSeason) {
        data = set(data, body.name, {});
    } else {
        const members = Object.keys(db[lastSeason]);
        let d = {};
        members.map(name => Object.assign(d, { [name]: {
            win: 0,
            lose: 0,
            absence: 0,
            kill: 0,
            death: 0,
            assist: 0
        } }))
        data = set(db, body.name, d);
    }
    fs.writeFileSync(path.resolve(__dirname, '../db/data.json'), JSON.stringify(data, null, 4))
    ctx.response.body = 'success'
    next();
})

const static = koaStatic(root, { index: 'index.html' });

app.use(static);
app.use(bodyParser());
app.use(router.routes());

app.listen(8888, () => {
    console.log('server start at 3000');
})

