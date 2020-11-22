const { Pool } = require('pg');
const pool = new Pool({
    user: "postgres",
    host: require('./config.json').ip,
    database: "manage_invite_six",
    password: "",
    port: 5432
});

const express = require('express');
const app = express();

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
    const { rows: results } = await pool.query(`
        with data as (
            select
            date_trunc('day', created_at) as day,
            count(1)
            from payments WHERE type = 'paypal_dash_pmnt_month'
            group by 1
        )
        
        select
            to_char(day,'DD-MM') as day,
            sum(count) over (order by day asc rows between unbounded preceding and current row)
        from data
    `);
    res.render('stats.ejs', {
        labels: results.map((e) => e.day),
        values: results.map((e) => e.sum)
    });
});

app.get('/by-day', async (req, res) => {
    const { rows: results } = await pool.query(`
        with data as (
            select
            date_trunc('day', created_at) as day,
            count(1)
            from payments WHERE type = 'trial_activation'
            group by 1
        )
        
        select day, sum(count)
        from data
        group by 1
        order by 1
        DESC
    `);
    res.render('by-day.ejs', {
        labels: results.map((e) => e.day),
        values: results.map((e) => e.sum)
    });
});

app.listen(8080);
console.log('8080 is the magic port');
