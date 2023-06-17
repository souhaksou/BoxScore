const express = require("express");
require("dotenv").config();
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3030;
const boxscore = require('./services/app');

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    console.log('連線成功');
    res.status(200).json({
        message: 'success',
        data: '連線成功'
    });
});

app.post('/', async (req, res) => {
    try {
        const url = await req.body.url;
        const data = await boxscore(url);
        console.log('取得資料成功');
        res.status(200).json({
            message: 'success',
            data
        });
    }
    catch (err) {
        console.log('取得資料失敗');
        res.status(404).json({
            message: 'failed'
        });
    }
});

app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});